import { LOADER_START, LOADER_END } from "../actions/loader";

const loading = (state = false, action) => {
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
