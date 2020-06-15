import { LOADER_START, LOADER_END } from "../actions/loader";

const INITIAL_STATE = false;

const loading = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOADER_START:
      return true;
    case LOADER_END:
      return false;
    default:
      return state;
  }
};

export default loading;
