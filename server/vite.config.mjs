export default {
  test: {
    environment: "node",
    include: ["test/**/*.unit.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/types.ts"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        perFile: true,
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 90,
      },
    },
  },
};
