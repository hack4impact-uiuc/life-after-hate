import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { vi, expect, test, beforeEach, afterEach } from "vitest";
import { CSVExporter } from "./CSVExporter";
import FileSaver from "file-saver";
vi.mock("file-saver", () => ({ default: { saveAs: vi.fn() } }));
vi.mock("../../utils/csv", () => ({ getCSV: () => "name\nExample" }));
let root, container;
beforeEach(() => {
  vi.useFakeTimers();
  FileSaver.saveAs.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<CSVExporter data={[{ name: "Example" }]} />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});
test("acknowledges only that download started and resets feedback", async () => {
  act(() => container.querySelector("button").click());
  expect(FileSaver.saveAs).toHaveBeenCalledWith(
    expect.any(Blob),
    "resources.csv",
  );
  expect(container.querySelector('[role="status"]').textContent).toBe(
    "Download started",
  );
  await act(async () => vi.advanceTimersByTimeAsync(4000));
  expect(container.querySelector('[role="status"]').textContent).toBe("");
});
test("shows an export failure rather than a successful acknowledgement", () => {
  FileSaver.saveAs.mockImplementation(() => {
    throw new Error("failed");
  });
  act(() => container.querySelector("button").click());
  expect(container.querySelector(".csv-export-error").textContent).toBe(
    "Export failed. Try again.",
  );
});
