import json2csv from "json2csv";
import { distanceToString } from "../utils/formatters";
const R = require("ramda");

const getAllFields = (arr) =>
  arr.reduce((fields, item) => {
    Object.keys(item).forEach((field) => {
      if (!fields.includes(field)) {
        fields.push(field);
      }
    });

    return fields;
  }, []);

const moveItemToFront = (target, arr) =>
  arr.forEach((item, idx) => {
    if (item === target) {
      arr.splice(idx, 1);
      arr.unshift(item);
    }
  });

const moveItemsToFront = (targets, arr) =>
  targets.reverse().forEach((i) => moveItemToFront(i, arr));

export const getCSV = (resources) => {
  const allFields = getAllFields(resources);

  const filteredFields = R.without(
    ["__v", "_id", "federalRegion", "location"],
    allFields
  );
  // Move some of the items to the beginning in the CSV file
  moveItemsToFront(["contactName", "companyName", "type"], filteredFields);

  // Apply a function on a property if the property exists
  const applyFnOnProp = R.curry((prop, fn) =>
    R.map(R.when(R.has(prop))(R.over(R.lensProp(prop), fn)))
  );
  const formatTags = applyFnOnProp("tags", R.join(", "));

  const formatDate = applyFnOnProp("dateCreated", (date) =>
    new Date(date).toString()
  );
  const formatDistance = applyFnOnProp(
    "distanceFromSearchLoc",
    distanceToString
  );

  // const readableDate = R.map((r) => )
  const formattedResources = R.pipe(
    formatTags,
    formatDate,
    formatDistance
  )(resources);
  console.log(formattedResources);
  return json2csv.parse(formattedResources, {
    fields: filteredFields,
  });
};
