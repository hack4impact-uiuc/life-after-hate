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
