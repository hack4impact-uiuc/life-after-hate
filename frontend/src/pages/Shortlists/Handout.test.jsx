import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Handout } from "./index";
it("prints only explicit contact fields, excluding private and unexpected fields", () => {
  const html = renderToStaticMarkup(
    <Handout
      resources={[
        {
          _id: "a",
          type: "INDIVIDUAL",
          contactName: "Public Contact",
          contactPhone: "555-0100",
          contactEmail: "contact@example.com",
          address: "Public address",
          websiteURL: "https://example.com",
          notes: "PRIVATE_NOTES",
          volunteerReason: "PRIVATE_REASON",
          skills: "PRIVATE_SKILLS",
          howDiscovered: "PRIVATE_SOURCE",
          description: "PRIVATE_DESCRIPTION",
          customField: "PRIVATE_UNKNOWN",
        },
      ]}
    />,
  );
  expect(html).toContain("Public Contact");
  expect(html).toContain("555-0100");
  expect(html).toContain("contact@example.com");
  expect(html).not.toContain("PRIVATE_");
});
