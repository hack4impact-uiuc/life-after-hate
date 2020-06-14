import {
  ADD_TAG,
  REMOVE_TAG,
  REPLACE_TAGS,
  REFRESH_TAG_LIST,
} from "../actions/tags";

const tags = (state = { selected: [], all: [] }, action) => {
  switch (action.type) {
    case ADD_TAG:
      if (state.selected.indexOf(action.payload) !== -1) {
        return state;
      }
      return { ...state, selected: [...state.selected, action.payload] };
    case REMOVE_TAG:
      if (state.selected.indexOf(action.payload) !== -1) {
        const newState = [...state.selected];
        const ind = state.selected.indexOf(action.payload);
        newState.splice(ind, 1);
        return { ...state, selected: newState };
      }
      return state;
    case REPLACE_TAGS:
      return { ...state, selected: action.payload };
    case REFRESH_TAG_LIST:
      return { ...state, all: action.payload };
    default:
      return state;
  }
};

export default tags;
