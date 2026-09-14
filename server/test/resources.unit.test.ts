import { describe, it, expect, vi, afterEach } from "vitest";
import {
  safeURL,
  present,
  resourceSchema,
  searchSchema,
  geocode,
  filter,
} from "../src/resources";

afterEach(() => vi.unstubAllGlobals());

describe("resource URLs", () => {
  it.each([
    ["example.com", "https://example.com/"],
    ["https://example.com/a?q=1#b", "https://example.com/a?q=1#b"],
    ["http://example.com", "http://example.com/"],
    ["HTTPS://EXAMPLE.COM", "https://example.com/"],
    ["", ""],
    [null, ""],
    [123, ""],
    ["https://", ""],
    ["javascript:alert(1)", ""],
    ["data:text/html,hello", ""],
    ["file:///tmp/file", ""],
    ["ftp://example.com", ""],
    ["https://user:password@example.com", ""],
    ["https://user@example.com", ""],
  ])("normalizes or rejects %j", (input, output) =>
    expect(safeURL(input)).toBe(output),
  );
});

describe("resource validation", () => {
  it.each(["GROUP", "INDIVIDUAL", "TANGIBLE"])("accepts %s", (type) => {
    expect(
      resourceSchema.safeParse({ type, contactEmail: "", websiteURL: "" })
        .success,
    ).toBe(true);
  });
  it.each([
    {},
    { type: "OTHER" },
    { contactName: "" },
    { address: "" },
    { _id: "injected" },
    { role: "ADMIN" },
    { contactEmail: "invalid" },
    { tags: "Housing" },
    { tags: Array(51).fill("a") },
    { tags: ["a".repeat(101)] },
    { notes: "a".repeat(10001) },
    { websiteURL: "javascript:alert(1)" },
    { contactName: "a".repeat(301) },
    { address: "a".repeat(501) },
    { companyName: "" },
    { resourceName: "" },
    { notes: null },
  ])("rejects invalid input %#", (input) =>
    expect(resourceSchema.safeParse(input).success).toBe(false),
  );
  it("accepts boundary lengths and partial edits", () => {
    expect(
      resourceSchema.safeParse({
        contactName: "a".repeat(300),
        address: "a".repeat(500),
        notes: "a".repeat(10000),
        tags: Array(50).fill("a".repeat(100)),
      }).success,
    ).toBe(true);
    expect(resourceSchema.parse({ notes: "" })).toEqual({ notes: "" });
  });
  it.each(["0", "12500", "12.5"])("coerces radius %s", (radius) => {
    expect(searchSchema.parse({ radius }).radius).toBe(Number(radius));
  });
  it.each([
    { radius: -1 },
    { radius: 12501 },
    { radius: "no" },
    { radius: Infinity },
    { keyword: "a".repeat(201) },
    { tag: "a".repeat(101) },
    { unexpected: "x" },
  ])("rejects invalid search %#", (input) =>
    expect(searchSchema.safeParse(input).success).toBe(false),
  );
  it("allows empty searches", () => expect(searchSchema.parse({})).toEqual({}));
});

describe("presentation", () => {
  it.each([
    [
      {
        streetAddress: "1 Main",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
      },
      "1 Main, Chicago, IL 60601",
    ],
    [{ city: "Chicago" }, "Chicago"],
    [{ postalCode: "60601" }, "60601"],
    [{}, ""],
    ["Free-form address", "Free-form address"],
    [null, null],
  ])("formats partial addresses %#", (address, formatted) => {
    const doc = {
      _id: "1",
      address,
      websiteURL: "example.com",
      custom: { keep: true },
    };
    const before = structuredClone(doc);
    expect(present(doc)).toEqual({
      ...doc,
      address: formatted,
      websiteURL: "https://example.com/",
    });
    expect(doc).toEqual(before);
  });
});

describe("directory search", () => {
  const docs = [
    {
      _id: "near",
      contactName: "Alpha",
      notes: "Counseling",
      tags: ["Housing"],
      location: { coordinates: [0, 0] },
    },
    {
      _id: "far",
      companyName: "Bravo",
      tags: ["Food"],
      location: { coordinates: [0, 1] },
    },
    { _id: "missing", description: "Counseling", address: "Secretville" },
  ];
  it("supports radius-only searches without a center", () =>
    expect(filter(docs, { radius: 10 }).map((d) => d._id)).toEqual([
      "near",
      "far",
      "missing",
    ]));
  it("measures miles, includes zero coordinates, sorts without mutation", () => {
    const input = structuredClone([...docs].reverse());
    const before = structuredClone(input);
    const result = filter(input, { radius: 100 }, [0, 0]);
    expect(result.map((d) => d._id)).toEqual(["near", "far"]);
    expect(result[0].distanceFromSearchLoc).toBe(0);
    expect(result[1].distanceFromSearchLoc).toBeCloseTo(69.0934, 3);
    expect(input).toEqual(before);
  });
  it("excludes resources outside the radius", () =>
    expect(filter(docs, { radius: 50 }, [0, 0]).map((d) => d._id)).toEqual([
      "near",
    ]));
  it.each([
    undefined,
    [],
    [0],
    [NaN, 0],
    [Infinity, 0],
    ["0", 0],
    [181, 0],
    [0, 91],
    [0, 0, 0],
  ])("ignores invalid coordinates %j", (coordinates) => {
    expect(
      filter(
        [{ _id: "bad", location: { coordinates } }],
        { radius: 12500 },
        [0, 0],
      ),
    ).toEqual([]);
  });
  it("searches resource content but excludes metadata and addresses", () => {
    expect(
      filter(docs, { keyword: "Counseling" })
        .map((d) => d._id)
        .sort(),
    ).toEqual(["missing", "near"]);
    expect(filter(docs, { keyword: "Secretville" })).toEqual([]);
    expect(
      filter([{ _id: "UniqueInternalIdentifier", type: "GROUP" }], {
        keyword: "UniqueInternalIdentifier",
      }),
    ).toEqual([]);
  });
  it("combines tag, text, and geographic filters without leaking the index", () => {
    const result = filter(
      docs,
      { keyword: "Counseling", tag: "Housing", radius: 50 },
      [0, 0],
    );
    expect(result.map((d) => d._id)).toEqual(["near"]);
    expect(result[0]).not.toHaveProperty("allText");
    expect(filter(docs, { tag: "Nonexistent" })).toEqual([]);
  });
  it("handles empty collections", () =>
    expect(filter([], { keyword: "x", tag: "y", radius: 1 }, [0, 0])).toEqual(
      [],
    ));
});

describe("geocoding", () => {
  const env = { MAPQUEST_KEY: "test-key" } as any;
  const location = {
    latLng: { lng: -87.6, lat: 41.8 },
    street: "1 Main",
    adminArea5: "Chicago",
    adminArea3: "IL",
    postalCode: "60601",
  };
  it("requires configuration before calling the provider", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(geocode("Chicago", {} as any)).rejects.toMatchObject({
      status: 503,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("encodes the address and preserves longitude/latitude ordering", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json({ results: [{ locations: [location] }] }),
      );
    vi.stubGlobal("fetch", fetch);
    expect(await geocode("1 Main & State #2", env)).toEqual({
      location: { type: "Point", coordinates: [-87.6, 41.8] },
      address: {
        streetAddress: "1 Main",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
      },
      federalRegion: 5,
    });
    const [url, options] = fetch.mock.calls[0];
    expect(url.searchParams.get("location")).toBe("1 Main & State #2");
    expect(options.redirect).toBe("manual");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it("preserves zero coordinates and defaults missing address fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            results: [{ locations: [{ latLng: { lat: 0, lng: 0 } }] }],
          }),
        ),
    );
    expect(await geocode("Origin", env)).toEqual({
      location: { type: "Point", coordinates: [0, 0] },
      address: { streetAddress: "", city: "", state: "", postalCode: "" },
      federalRegion: 0,
    });
  });
  it.each([
    {},
    { results: [] },
    { results: [{ locations: [] }] },
    ...[
      { lat: 91, lng: 0 },
      { lat: 0, lng: 181 },
      { lat: "0", lng: 0 },
      { lat: null, lng: 0 },
    ].map((latLng) => ({ results: [{ locations: [{ latLng }] }] })),
  ])("rejects malformed provider data %#", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
    await expect(geocode("Example", env)).rejects.toMatchObject({
      status: 502,
    });
  });
  it.each([302, 429, 500])("rejects provider HTTP %s", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status })),
    );
    await expect(geocode("Example", env)).rejects.toMatchObject({
      status: 502,
    });
  });
  it("converts network errors into a safe error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("secret provider details")),
    );
    await expect(geocode("Example", env)).rejects.toMatchObject({
      status: 502,
      message: "Geocoding failed",
    });
  });
});
