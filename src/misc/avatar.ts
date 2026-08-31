// twitch serves squares at these widths; any other size 404s
const VARIANTS = [70, 150, 300];

// the default pictures exist at 150 alone, so only this host may be resized
const RESIZABLE = '/jtv_user_pictures/';

export const avatarVariant = (src: string, size: number): string => {
  if (!src.includes(RESIZABLE)) return src;

  // 1.9 rather than 2 so a 36px slot takes 70 and not 150
  const width = VARIANTS.find((variant) => variant >= size * 1.9) ?? VARIANTS[VARIANTS.length - 1];

  // the size ends the path: a hashed url carries it after the hash, a uuid one
  // straight after profile_image, so anchor on the end and not on what precedes
  return src.replace(/-\d+x\d+(\.\w+)$/, `-${width}x${width}$1`);
};
