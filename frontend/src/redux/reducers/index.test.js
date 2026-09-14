import rootReducer from "./index";
it.each(["AUTH_PURGE", "API_ACCESS_DENIED"])(
  "purges sensitive state on %s",
  (type) => {
    let state = rootReducer(undefined, { type: "INIT" });
    state = {
      ...state,
      resources: [{ notes: "private" }],
      users: [{ email: "private@example.com" }],
      modal: { privateData: "private" },
    };
    const cleared = rootReducer(state, { type });
    expect(JSON.stringify(cleared)).not.toContain("private");
    expect(cleared.auth.authenticated).toBe(false);
  },
);
