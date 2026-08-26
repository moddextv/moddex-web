interface Latch {
  current: boolean;
}

export const acquire = (latch: Latch): boolean => {
  if (latch.current) return false;

  latch.current = true;

  return true;
};

export const release = (latch: Latch): void => {
  latch.current = false;
};
