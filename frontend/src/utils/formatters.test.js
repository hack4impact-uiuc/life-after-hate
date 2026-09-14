import { websiteHref, distanceToString } from "./formatters";
it.each([
  [0, "0.00 miles away"],
  [1.234, "1.23 miles away"],
  [10, "10.00 miles away"],
])("formats distance %s", (input, expected) =>
  expect(distanceToString(input)).toBe(expected),
);
it.each([
  [null, null],
  [undefined, null],
  ["", null],
  ["   ", null],
  [" example.com ", "https://example.com/"],
  ["//example.com/path", "https://example.com/path"],
  ["http://example.com", "http://example.com/"],
  ["https://example.com?q=a&b=c", "https://example.com/?q=a&b=c"],
  ["javascript:alert(1)", null],
  ["data:text/html,hello", null],
  ["file:///etc/passwd", null],
  ["https://", null],
])("formats website link %j", (input, expected) =>
  expect(websiteHref(input)).toBe(expected),
);
