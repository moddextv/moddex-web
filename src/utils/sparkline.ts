export const W = 240;
export const H = 48;

export const buildPath = (values: (number | null)[]): string => {
  const known = values.filter((value): value is number => value !== null);

  if (known.length < 2) return '';

  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min || 1;
  const step = values.length > 1 ? W / (values.length - 1) : W;

  let path = '';
  let open = false;

  values.forEach((value, index) => {
    if (value === null) {
      open = false;
      return;
    }

    const x = index * step;
    const y = H - ((value - min) / span) * H;

    path += `${open ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
    open = true;
  });

  return path.trim();
};
