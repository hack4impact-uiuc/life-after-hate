import {
  resourceSelector,
  tagFilteredResourceSelector,
  resourceName,
  resourceDescription,
  resourceLogo,
} from "./resource";
import {
  mappableResourceSelector,
  currentResourceSelector as mapResource,
  searchQuerySelector,
  searchLocationSelector,
} from "./map";
import {
  currentResourceSelector,
  currentUserSelector,
  titleSelector,
  isAddingResourceSelector,
} from "./modal";
import { filteredUserSelector } from "./users";
import { globalTagListSelector } from "./tags";
import { sortFieldEnum } from "../../utils/enums";

const state = (overrides = {}) => ({
  resources: [],
  sort: { field: null, order: null },
  tags: { selected: [], all: [] },
  map: { search: { query: "query", location: "Chicago" } },
  modal: { modalType: "RESOURCE", editable: true },
  users: { userList: [], userFilterType: "ALL" },
  ...overrides,
});
const docs = [
  {
    _id: "g",
    type: "GROUP",
    companyName: "Beta",
    description: "Beta",
    availability: "Beta",
    volunteerRoles: "Beta",
    distanceFromSearchLoc: 2,
    tags: ["Food", "Housing"],
  },
  {
    _id: "i",
    type: "INDIVIDUAL",
    contactName: "Alpha",
    skills: "Alpha",
    availability: "Alpha",
    volunteerRoles: "Alpha",
    distanceFromSearchLoc: 0,
    tags: ["Housing"],
  },
  {
    _id: "t",
    type: "TANGIBLE",
    resourceName: "Gamma",
    description: "Gamma",
    availability: "Gamma",
    volunteerRoles: "Gamma",
    tags: [],
  },
];
it.each([
  ["g", "Beta", "Beta"],
  ["i", "Alpha", "Alpha"],
  ["t", "Gamma", "Gamma"],
])("selects display fields for %s", (id, name, description) => {
  const doc = docs.find((d) => d._id === id);
  expect(resourceName(doc)).toBe(name);
  expect(resourceDescription(doc)).toBe(description);
  expect(resourceLogo(doc.type)).toMatch(/\.svg|^data:image\/svg\+xml/);
});
it("handles unknown resource types", () => {
  expect(resourceName({})).toBe("");
  expect(resourceLogo("other")).toBe(resourceLogo("GROUP"));
});
it.each(Object.values(sortFieldEnum))(
  "sorts %s both ways without mutating source",
  (field) => {
    const original = structuredClone(docs);
    expect(
      resourceSelector(
        state({ resources: docs, sort: { field, order: "asc" } }),
      ).map((d) => d._id),
    ).toEqual(["i", "g", "t"]);
    expect(
      resourceSelector(
        state({ resources: docs, sort: { field, order: "desc" } }),
      ).map((d) => d._id),
    ).toEqual(["t", "g", "i"]);
    expect(docs).toEqual(original);
  },
);
it("preserves source identity without a sort and memoizes sorted output", () => {
  expect(resourceSelector(state({ resources: docs }))).toBe(docs);
  const s = state({
    resources: docs,
    sort: { field: sortFieldEnum.LOCATION, order: "asc" },
  });
  expect(resourceSelector(s)).toBe(resourceSelector(s));
});
it("sorts missing text values after populated values", () => {
  const resources = [
    { _id: "a" },
    { _id: "b", availability: "Open" },
    { _id: "c", availability: "" },
  ];
  expect(
    resourceSelector(
      state({
        resources,
        sort: { field: sortFieldEnum.AVAILABILITY, order: "asc" },
      }),
    ).map((d) => d._id),
  ).toEqual(["b", "a", "c"]);
});
it("matches all selected tags and tolerates legacy resources without tags", () => {
  expect(
    tagFilteredResourceSelector(
      state({ resources: docs, tags: { selected: ["Food", "Housing"] } }),
    ),
  ).toEqual([docs[0]]);
  expect(
    tagFilteredResourceSelector(
      state({
        resources: [{ _id: "legacy" }, { _id: "null", tags: null }, ...docs],
        tags: { selected: ["Housing"] },
      }),
    ),
  ).toEqual(docs.slice(0, 2));
  expect(tagFilteredResourceSelector(state({ resources: undefined }))).toEqual(
    [],
  );
  expect(tagFilteredResourceSelector(state({ resources: docs }))).toEqual(docs);
});
it("only maps valid geographic coordinate pairs, including zero and boundaries", () => {
  const valid = [
    [0, 0],
    [-180, -90],
    [180, 90],
  ];
  const invalid = [
    undefined,
    null,
    [],
    [0],
    [0, 0, 0],
    [NaN, 0],
    [Infinity, 0],
    ["0", 0],
    [181, 0],
    [0, 91],
    [-181, 0],
    [0, -91],
  ];
  const resources = [...valid, ...invalid].map((coordinates, i) => ({
    _id: String(i),
    location: { coordinates },
  }));
  expect(mappableResourceSelector(state({ resources }))).toEqual(
    resources.slice(0, valid.length),
  );
});
it("resolves selected records and handles stale resource IDs", () => {
  expect(currentResourceSelector(state())).toEqual({});
  expect(mapResource(state())).toEqual({});
  expect(
    currentResourceSelector(
      state({ resources: docs, modal: { resourceId: "g" } }),
    ),
  ).toBe(docs[0]);
  expect(
    mapResource(state({ resources: docs, map: { selectedId: "g" } })),
  ).toBe(docs[0]);
  expect(
    currentResourceSelector(state({ modal: { resourceId: "deleted" } })),
  ).toEqual({});
  expect(mapResource(state({ map: { selectedId: "deleted" } }))).toEqual({});
});
it("resolves users and handles stale user IDs", () => {
  const user = { id: "u", firstName: "Ada" };
  expect(currentUserSelector(state())).toEqual({});
  expect(
    currentUserSelector(
      state({ users: { userList: [user] }, modal: { userId: "u" } }),
    ),
  ).toBe(user);
  expect(currentUserSelector(state({ modal: { userId: "deleted" } }))).toEqual(
    {},
  );
});
it.each([
  [{ modalType: "RESOURCE" }, "Add Resource"],
  [{ modalType: "RESOURCE", resourceId: "g", editable: true }, "Edit Resource"],
  [{ modalType: "RESOURCE", resourceId: "g", editable: false }, "Beta"],
  [{ modalType: "RESOURCE", resourceId: "deleted" }, "Add Resource"],
  [{ modalType: "USER", userId: "u", editable: true }, "Edit User"],
  [{ modalType: "USER", userId: "u", editable: false }, "Ada Lovelace"],
  [{ modalType: "USER", userId: "deleted" }, ""],
  [{ modalType: "USER" }, ""],
  [{ modalType: "UNKNOWN" }, undefined],
])("derives modal title %#", (modal, title) => {
  expect(
    titleSelector(
      state({
        resources: docs,
        users: {
          userList: [{ id: "u", firstName: "Ada", lastName: "Lovelace" }],
        },
        modal,
      }),
    ),
  ).toBe(title);
});
it("selects search, tags, and add-resource mode", () => {
  expect(searchQuerySelector(state())).toBe("query");
  expect(searchLocationSelector(state())).toBe("Chicago");
  expect(globalTagListSelector(state())).toEqual([]);
  expect(isAddingResourceSelector(state())).toBe(true);
  expect(isAddingResourceSelector(state({ modal: { resourceId: "g" } }))).toBe(
    false,
  );
});
it.each([
  ["ALL", ["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"]],
  ["ACTIVE", ["ADMIN", "VOLUNTEER"]],
  ["PENDING", ["PENDING"]],
  ["REJECTED", ["REJECTED"]],
])("filters users by %s", (userFilterType, expected) => {
  const userList = ["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"].map(
    (role) => ({ role }),
  );
  expect(
    filteredUserSelector(state({ users: { userList, userFilterType } })).map(
      (u) => u.role,
    ),
  ).toEqual(expected);
});
it("handles an unloaded user list", () =>
  expect(filteredUserSelector(state({ users: {} }))).toEqual([]));
it.each([sortFieldEnum.AVAILABILITY, sortFieldEnum.LOCATION])(
  "preserves input order for equal %s values",
  (field) => {
    const resources = [
      { _id: "a", availability: "Open", distanceFromSearchLoc: 1 },
      { _id: "b", availability: "Open", distanceFromSearchLoc: 1 },
    ];
    for (const order of ["asc", "desc"])
      expect(
        resourceSelector(state({ resources, sort: { field, order } })),
      ).toEqual(resources);
  },
);
