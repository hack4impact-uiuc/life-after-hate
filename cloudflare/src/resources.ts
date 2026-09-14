import { z } from "zod";
import Fuse from "fuse.js";
import { HTTPException } from "hono/http-exception";
import type { Document, Env } from "./types";
import regions from "./regions.json";
export function safeURL(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  try {
    const u = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`,
    );
    return ["https:", "http:"].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : "";
  } catch {
    return "";
  }
}
const text = z.string().max(10000);
export const resourceSchema = z
  .object({
    type: z.enum(["GROUP", "INDIVIDUAL", "TANGIBLE"]).optional(),
    contactName: z.string().min(1).max(300).optional(),
    contactPhone: text.optional(),
    contactEmail: z.union([z.email().max(254), z.literal("")]).optional(),
    address: z.string().min(1).max(500).optional(),
    websiteURL: z
      .string()
      .max(2000)
      .refine((v) => !v || !!safeURL(v))
      .optional(),
    notes: text.optional(),
    tags: z.array(z.string().max(100)).max(50).optional(),
    availability: text.optional(),
    howDiscovered: text.optional(),
    volunteerReason: text.optional(),
    skills: text.optional(),
    volunteerRoles: text.optional(),
    description: text.optional(),
    companyName: z.string().min(1).max(300).optional(),
    quantity: text.optional(),
    resourceName: z.string().min(1).max(300).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0);
export const searchSchema = z
  .object({
    radius: z.coerce.number().min(0).max(12500).optional(),
    address: z.string().max(500).optional(),
    keyword: z.string().max(200).optional(),
    tag: z.string().max(100).optional(),
  })
  .strict();
export function present(doc: Document) {
  const address = doc.address;
  return {
    ...doc,
    websiteURL: safeURL(doc.websiteURL),
    ...(address && typeof address === "object"
      ? {
          address: [
            address.streetAddress,
            address.city,
            [address.state, address.postalCode].filter(Boolean).join(" "),
          ]
            .filter(Boolean)
            .join(", "),
        }
      : {}),
  };
}
export async function geocode(address: string, env: Env) {
  if (!env.MAPQUEST_KEY)
    throw new HTTPException(503, { message: "Geocoding is not configured" });
  const url = new URL("https://www.mapquestapi.com/geocoding/v1/address");
  url.search = new URLSearchParams({
    key: env.MAPQUEST_KEY,
    maxResults: "1",
    outFormat: "json",
    location: address,
  }).toString();
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error();
    const data = (await response.json()) as any,
      loc = data.results?.[0]?.locations?.[0];
    const lat = loc?.latLng?.lat,
      lng = loc?.latLng?.lng;
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    )
      throw Error();
    return {
      location: { type: "Point", coordinates: [lng, lat] },
      address: {
        streetAddress: loc.street || "",
        city: loc.adminArea5 || "",
        state: loc.adminArea3 || "",
        postalCode: loc.postalCode || "",
      },
      federalRegion: (regions as Record<string, number>)[loc.adminArea3] || 0,
    };
  } catch {
    throw new HTTPException(502, { message: "Geocoding failed" });
  }
}
export function filter(
  docs: Document[],
  query: z.infer<typeof searchSchema>,
  center?: number[],
) {
  let results = docs;
  if (center && query.radius !== undefined) {
    const rad = (n: number) => (n * Math.PI) / 180;
    results = results
      .flatMap((doc) => {
        const coord = doc.location?.coordinates;
        if (
          !Array.isArray(coord) ||
          coord.length < 2 ||
          !coord.every(Number.isFinite)
        )
          return [];
        const [lng, lat] = coord,
          [x, y] = center;
        const a =
          Math.sin(rad(lat - y) / 2) ** 2 +
          Math.cos(rad(lat)) *
            Math.cos(rad(y)) *
            Math.sin(rad(lng - x) / 2) ** 2;
        const distance = 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
        return distance < query.radius!
          ? [{ ...doc, distanceFromSearchLoc: distance }]
          : [];
      })
      .sort((a, b) => a.distanceFromSearchLoc - b.distanceFromSearchLoc);
  }
  if (query.keyword) {
    const excluded = new Set([
      "dateCreated",
      "_id",
      "type",
      "federalRegion",
      "__v",
      "address",
      "location",
      "dateLastModified",
      "lastModifiedUser",
    ]);
    results = new Fuse(
      results.map((doc) => ({
        ...doc,
        allText: Object.entries(doc)
          .filter(([k]) => !excluded.has(k))
          .map(([, v]) => v)
          .join(" "),
      })),
      {
        threshold: 0.2,
        distance: 10000000,
        findAllMatches: true,
        keys: ["allText"],
      },
    )
      .search(query.keyword)
      .map(({ item: { allText, ...doc } }) => doc);
  }
  if (query.tag)
    results = new Fuse(results, {
      threshold: 0.4,
      distance: 100,
      findAllMatches: true,
      keys: ["tags"],
    })
      .search(query.tag)
      .map(({ item }) => item);
  return results.map(present);
}
