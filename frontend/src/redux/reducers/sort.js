import { SET_SORT_FIELD } from "../actions/sort";

const INITIAL_STATE = {
  field: null,
  order: null,
};

const sort = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_SORT_FIELD:
      if (state.field === action.payload) {
        if (state.order === "asc") {
          return { ...state, order: "desc" };
        }
        return INITIAL_STATE;
      }
      return {
        field: action.payload,
        order: "asc",
      };
    default:
      return state;
  }
};

export default sort;
