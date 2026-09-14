import resources from "./resources";
import map from "./map";
import sort from "./sort";
import tags from "./tags";
import users from "./users";
import modal from "./modal";
import search from "./search";
import loading from "./loading";
import auth from "./auth";
import * as resourceActions from "../actions/resources";
import * as mapActions from "../actions/map";
import * as tagActions from "../actions/tags";
import { SET_SORT_FIELD } from "../actions/sort";
import { UPDATE_USERS, CHANGE_USER_FILTER } from "../actions/users";
import { MODAL_OPEN, MODAL_CLOSE } from "../actions/modal";
import { UPDATE_SEARCH_PARAMS, RESET_SEARCH } from "../actions/search";
import { LOADER_START, LOADER_END } from "../actions/loader";
import { AUTH_UPDATE, AUTH_PURGE } from "../actions/auth";
import { API_ACCESS_DENIED } from "../actions/api";
import { CHANGE_PAGE } from "../actions/nav";

it.each(
  Object.entries({
    resources,
    map,
    sort,
    tags,
    users,
    modal,
    search,
    loading,
    auth,
  }),
)(
  "initializes %s and preserves state for unknown actions",
  (_name, reducer) => {
    const initial = reducer(undefined, { type: "INIT" });
    expect(initial).toBeDefined();
    expect(reducer(initial, { type: "UNKNOWN" })).toBe(initial);
  },
);
it("adds, updates, and deletes resources by ID without mutating originals", () => {
  const original = Object.freeze([
    Object.freeze({ _id: "a", notes: "old" }),
    Object.freeze({ _id: "b" }),
  ]);
  const updated = { _id: "a", notes: "new" };
  expect(
    resources(original, {
      type: resourceActions.ADD_RESOURCE,
      payload: updated,
    }),
  ).toEqual([updated, ...original]);
  expect(
    resources(original, {
      type: resourceActions.UPDATE_RESOURCE,
      payload: updated,
    }),
  ).toEqual([updated, original[1]]);
  expect(
    resources(original, {
      type: resourceActions.DELETE_RESOURCE,
      payload: updated,
    }),
  ).toEqual([original[1]]);
  expect(
    resources(original, {
      type: resourceActions.UPDATE_RESOURCE,
      payload: { _id: "missing" },
    }),
  ).toEqual(original);
  expect(
    resources(original, {
      type: resourceActions.DELETE_RESOURCE,
      payload: { _id: "missing" },
    }),
  ).toEqual(original);
});
it("replaces resources with an empty search result", () =>
  expect(
    resources([{ _id: "a" }], {
      type: resourceActions.REPLACE_ALL_RESOURCES,
      payload: [],
    }),
  ).toEqual([]));
it.each([resourceActions.CLEAR_RESOURCES, CHANGE_PAGE])(
  "clears resources on %s",
  (type) => expect(resources([{ _id: "a" }], { type })).toEqual([]),
);
it("cycles sort ascending, descending, unsorted and resets on field change", () => {
  const action = { type: SET_SORT_FIELD, payload: "name" };
  const asc = sort(undefined, action);
  expect(asc).toEqual({ field: "name", order: "asc" });
  const desc = sort(asc, action);
  expect(desc.order).toBe("desc");
  expect(sort(desc, action)).toEqual({ field: null, order: null });
  expect(sort(desc, { ...action, payload: "location" })).toEqual({
    field: "location",
    order: "asc",
  });
  expect(sort(desc, { type: CHANGE_PAGE })).toEqual({
    field: null,
    order: null,
  });
});
it("deduplicates selected tags, removes one, and preserves global tags on navigation", () => {
  const initial = { selected: ["Food"], all: ["Food", "Housing"] };
  expect(tags(initial, { type: tagActions.ADD_TAG, payload: "Food" })).toBe(
    initial,
  );
  const added = tags(initial, { type: tagActions.ADD_TAG, payload: "Housing" });
  expect(added.selected).toEqual(["Food", "Housing"]);
  expect(
    tags(added, { type: tagActions.REMOVE_TAG, payload: "Food" }).selected,
  ).toEqual(["Housing"]);
  expect(
    tags(initial, { type: tagActions.REMOVE_TAG, payload: "missing" }),
  ).toBe(initial);
  expect(
    tags(initial, { type: tagActions.REPLACE_TAGS, payload: [] }).selected,
  ).toEqual([]);
  expect(
    tags(initial, { type: tagActions.REFRESH_TAG_LIST, payload: ["New"] }),
  ).toEqual({ selected: ["Food"], all: ["New"] });
  expect(tags(initial, { type: CHANGE_PAGE })).toEqual({
    selected: [],
    all: initial.all,
  });
});
it("updates map location and query independently", () => {
  const original = {
    search: { location: "Chicago", query: "Food" },
    selectedId: "a",
  };
  expect(
    map(original, { type: mapActions.UPDATE_SEARCH_QUERY, payload: "Housing" }),
  ).toEqual({ ...original, search: { location: "Chicago", query: "Housing" } });
  expect(
    map(original, {
      type: mapActions.UPDATE_SEARCH_LOCATION,
      payload: "Boston",
    }),
  ).toEqual({ ...original, search: { location: "Boston", query: "Food" } });
  expect(
    map(original, { type: mapActions.UPDATE_MAP_CENTER, payload: [0, 0] })
      .center,
  ).toEqual([0, 0]);
  expect(
    map({ ...original, center: [0, 0] }, { type: mapActions.CLEAR_MAP_CENTER }),
  ).toEqual(original);
  expect(
    map(original, { type: mapActions.SELECT_MAP_RESOURCE, payload: "b" })
      .selectedId,
  ).toBe("b");
});
it.each([
  mapActions.CLEAR_MAP_RESOURCE,
  resourceActions.CLEAR_RESOURCES,
  resourceActions.DELETE_RESOURCE,
  resourceActions.UPDATE_RESOURCE,
])("clears map selection on %s", (type) => {
  expect(map({ selectedId: "a", center: [0, 0] }, { type })).toEqual({
    center: [0, 0],
  });
});
it("keeps map selection only when the refreshed collection contains it", () => {
  const original = { selectedId: "a", search: { location: "", query: "" } };
  expect(
    map(original, {
      type: resourceActions.REPLACE_ALL_RESOURCES,
      payload: [{ _id: "a" }],
    }),
  ).toBe(original);
  expect(
    map(original, {
      type: resourceActions.REPLACE_ALL_RESOURCES,
      payload: [{ _id: "b" }],
    }),
  ).not.toHaveProperty("selectedId");
  expect(map(original, { type: CHANGE_PAGE })).toEqual({
    search: { location: "", query: "" },
  });
});
it("resets user filtering on navigation while retaining the list", () => {
  const userList = [{ id: "u" }];
  const loaded = users(undefined, { type: UPDATE_USERS, payload: userList });
  const filtered = users(loaded, {
    type: CHANGE_USER_FILTER,
    payload: "PENDING",
  });
  expect(filtered).toEqual({ userList, userFilterType: "PENDING" });
  expect(users(filtered, { type: CHANGE_PAGE })).toEqual({
    userList,
    userFilterType: "ALL",
  });
});
it.each([MODAL_CLOSE, CHANGE_PAGE])(
  "clears modal record IDs and editable state on %s",
  (type) => {
    const opened = modal(undefined, {
      type: MODAL_OPEN,
      modalType: "USER",
      payload: { userId: "u", editable: false },
    });
    expect(opened).toEqual({
      isOpen: true,
      editable: false,
      modalType: "USER",
      userId: "u",
    });
    expect(modal(opened, { type })).toEqual({
      isOpen: false,
      editable: true,
      modalType: "RESOURCE",
    });
  },
);
it("replaces search params so removed filters do not persist", () => {
  expect(
    search(
      { radius: 10, keyword: "Food" },
      { type: UPDATE_SEARCH_PARAMS, payload: { keyword: "Housing" } },
    ),
  ).toEqual({ keyword: "Housing" });
});
it.each([RESET_SEARCH, CHANGE_PAGE])("resets search on %s", (type) =>
  expect(search({ keyword: "private" }, { type })).toEqual({}),
);
it("toggles the loader", () => {
  expect(loading(false, { type: LOADER_START })).toBe(true);
  expect(loading(true, { type: LOADER_END })).toBe(false);
});
it.each([AUTH_PURGE, API_ACCESS_DENIED])(
  "clears authenticated user details on %s",
  (type) => {
    const signedIn = auth(undefined, {
      type: AUTH_UPDATE,
      payload: { email: "private@example.com", role: "ADMIN" },
    });
    expect(signedIn).toEqual({
      email: "private@example.com",
      role: "ADMIN",
      authenticated: true,
      isFetchingAuth: false,
    });
    expect(auth(signedIn, { type })).toEqual({
      authenticated: false,
      isFetchingAuth: false,
    });
  },
);
