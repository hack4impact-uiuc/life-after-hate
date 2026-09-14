import { distanceToString } from "./formatters";

// Quote every cell, and neutralize spreadsheet formula prefixes even after whitespace.
export const csvCell = (value) => {
  let text = value == null ? "" : String(value);
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};
export const getCSV = (resources) => {
  const excluded = new Set([
    "__v",
    "_id",
    "federalRegion",
    "location",
    "allText",
  ]);
  const fields = [...new Set(resources.flatMap(Object.keys))].filter(
    (key) => !excluded.has(key),
  );
  const first = ["contactName", "companyName", "type"].filter((key) =>
    fields.includes(key),
  );
  const ordered = [...first, ...fields.filter((key) => !first.includes(key))];
  const rows = resources.map((resource) =>
    ordered
      .map((field) => {
        const value = resource[field];
        if (field === "distanceFromSearchLoc" && value != null)
          return csvCell(distanceToString(value));
        if (Array.isArray(value)) return csvCell(value.join(", "));
        return csvCell(value);
      })
      .join(","),
  );
  return [ordered.map(csvCell).join(","), ...rows].join("\r\n");
};
