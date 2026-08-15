export const showListTotal = (total: number | null, loaded: number): total is number =>
  total !== null && total >= loaded;
