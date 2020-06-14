export const ADD_TAG = "ADD_TAG";
export const REMOVE_TAG = "REMOVE_TAG";
export const REPLACE_TAGS = "REPLACE_TAGS";

export const addTag = (payload) => ({
  type: ADD_TAG,
  payload,
});
export const removeTag = (payload) => ({
  type: REMOVE_TAG,
  payload,
});

export const replaceTags = (payload) => ({
  type: REPLACE_TAGS,
  payload,
});
