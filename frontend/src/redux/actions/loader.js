export const LOADER_START = "LOADER_START";
export const LOADER_END = "LOADER_END";

export const startLoader = () => ({ type: LOADER_START });
export const endLoader = () => ({ type: LOADER_END });
