import { ADD_TAG, REMOVE_TAG } from "../actions/tags";

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
    default:
      return state;
  }
};

export default tags;
