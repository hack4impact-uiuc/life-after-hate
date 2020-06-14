import { ADD_TAG, REMOVE_TAG, REPLACE_TAGS } from "../actions/tags";

const tags = (state = [], action) => {
  switch (action.type) {
    case ADD_TAG:
      if (state.indexOf(action.payload) !== -1) {
        return state;
      }
      return [...state, action.payload];
    case REMOVE_TAG:
      if (state.indexOf(action.payload) !== -1) {
        const newState = [...state];
        const ind = state.indexOf(action.payload);
        newState.splice(ind, 1);
        return newState;
      }
      return state;
    case REPLACE_TAGS:
      return action.payload;
    default:
      return state;
  }
};

export default tags;
