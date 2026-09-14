import { test, expect } from "@playwright/test";

test("map markers stay visible throughout drawer opening and closing", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await request.post("http://127.0.0.1:4176/__test/reset", {
    data: { role: "ADMIN" },
  });
  const { token } = await response.json();
  await page.context().addCookies([
    {
      name: "lah.sid",
      value: token,
      url: "http://127.0.0.1:4174",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.route("https://api.mapbox.com/**", (route) =>
    route.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
  );
  await page.addInitScript(() => {
    // Keep rendered pixels readable between frames; resizing still clears them.
    // Only inspect Deck's transparent marker canvas, not the base map.
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, options) {
      return getContext.call(
        this,
        type,
        type.includes("webgl")
          ? { ...options, preserveDrawingBuffer: true }
          : options,
      );
    };
    window.markersVisible = () => {
      const canvas = document.getElementById("deckgl-overlay");
      if (!canvas) return false;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) return false;
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(
        0,
        0,
        canvas.width,
        canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
      );
      return pixels.some((value, index) => index % 4 === 3 && value > 0);
    };
  });
  await page.goto("/");
  await expect(page.locator(".card-title")).toHaveCount(3);
  await expect
    .poll(() => page.evaluate(() => window.markersVisible()))
    .toBe(true);

  for (const selector of [
    ".resource-select",
    '[aria-label="Close resource details"]',
  ]) {
    const frames = await page.evaluate(async (selector) => {
      const frames = [];
      document.querySelector(selector).click();
      await new Promise((resolve) => {
        const start = performance.now();
        const sample = () => {
          frames.push({
            width: document.getElementById("deckgl-overlay").width,
            visible: window.markersVisible(),
          });
          if (performance.now() - start < 500) requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      return frames;
    }, selector);
    expect(new Set(frames.map((frame) => frame.width)).size).toBeGreaterThan(1);
    expect(frames.filter((frame) => !frame.visible)).toEqual([]);
  }
});
