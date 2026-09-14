import { csvCell, getCSV } from "./csv";
it("neutralizes formulas and preserves quoted multiline text", () => {
  for (const value of ["=SUM(1,1)", " +cmd", "@SUM(1)", "-10", "\t=cmd"])
    expect(csvCell(value)).toMatch(/^"'/);
  expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
});
it("excludes internal fields from exports", () => {
  const csv = getCSV([
    {
      contactName: "=formula",
      notes: "Private",
      _id: "secret-id",
      location: { coordinates: [1, 2] },
      allText: "search index",
    },
  ]);
  expect(csv).toContain("'=formula");
  expect(csv).not.toContain("secret-id");
  expect(csv).not.toContain("coordinates");
  expect(csv).not.toContain("search index");
});
it.each([null, undefined, ""])("exports empty cells for %s", (value) =>
  expect(csvCell(value)).toBe('""'),
);
it.each(["\uFEFF=cmd", " \t+cmd", "\rplain", "\nplain", "-1", "@cmd"])(
  "neutralizes spreadsheet prefix %j",
  (value) => expect(csvCell(value)).toBe(`"'${value}"`),
);
it("preserves non-formula numeric and boolean values", () => {
  expect(csvCell(0)).toBe('"0"');
  expect(csvCell(false)).toBe('"false"');
});
it("exports heterogeneous rows with aligned columns, arrays, and zero distance", () => {
  expect(
    getCSV([
      {
        notes: "First",
        companyName: "Org",
        type: "GROUP",
        contactName: "A",
        tags: ["Food", "Housing"],
        distanceFromSearchLoc: 0,
      },
      { contactName: "B", availability: "Weekdays" },
    ]),
  ).toBe(
    '"contactName","companyName","type","notes","tags","distanceFromSearchLoc","availability"\r\n"A","Org","GROUP","First","Food, Housing","0.00 miles away",""\r\n"B","","","","","","Weekdays"',
  );
});
it("handles empty exports", () => expect(getCSV([])).toBe(""));
