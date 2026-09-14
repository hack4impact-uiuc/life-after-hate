import React from "react";
import { vi, afterEach, beforeEach } from "vitest";
import { mount, click } from "../../../test/render";
vi.mock("file-saver", () => ({ default: { saveAs: vi.fn() } }));
import FileSaver from "file-saver";
import { CSVExporter } from "./CSVExporter";
let view;
beforeEach(() => vi.clearAllMocks());
afterEach(() => view?.unmount());
it("hides export for an empty resource list", () => {
  view = mount(<CSVExporter data={[]} />);
  expect(view.container.querySelector("button")).toBeNull();
});
it.each([undefined, "selected.csv"])(
  "exports the selected data as a CSV blob with name %s",
  async (name) => {
    view = mount(
      <CSVExporter
        data={[{ contactName: "=formula", _id: "private-id" }]}
        name={name}
      />,
    );
    click(view.container.querySelector("button"));
    const [blob, filename] = FileSaver.saveAs.mock.calls[0];
    expect(blob.type).toBe("text/csv;charset=utf-8;");
    expect(filename).toBe(name || "resources.csv");
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(blob);
    });
    expect(text).toContain("'=formula");
    expect(text).not.toContain("private-id");
  },
);
