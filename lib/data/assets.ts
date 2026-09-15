/**
 * Image registry.
 *
 * Photography is supplied by the showroom. Until a file is dropped into
 * `public/assets/`, `src` stays null and <AssetImage> renders a warm neutral
 * gradient at the correct aspect ratio — never a broken image, never a grey
 * box with text in it. `expected` names the exact file each slot is waiting
 * for, including the size it should be exported at.
 */
export type Asset = {
  /** Path under /public. Null until the real photograph is supplied. */
  src: string | null;
  /** Describes the subject, not the file. Used verbatim as alt text. */
  alt: string;
  width: number;
  height: number;
  /** The exact file this slot expects. */
  expected: string;
};

export const heroImage: Asset = {
  src: null,
  alt: 'Marble-clad bathroom with a freestanding tub and brushed brass fittings',
  width: 2400,
  height: 1600,
  // TODO: supply public/assets/hero/marble-bathroom.jpg — 2400x1600, JPG, under 400KB
  expected: 'public/assets/hero/marble-bathroom.jpg',
};

export const showroomPoster: Asset = {
  src: null,
  alt: 'The Elegance Bath Decor display floor, looking down the sanitaryware aisle',
  width: 1600,
  height: 840,
  // TODO: supply public/assets/showroom/poster.jpg — 1600x840, JPG
  expected: 'public/assets/showroom/poster.jpg',
};

/**
 * TODO: supply public/assets/showroom/walkthrough.mp4 — 16:8.4, H.264, under 12MB.
 * While this is null the frame renders the poster alone, with no play control,
 * rather than a button that does nothing.
 */
export const showroomVideoSrc: string | null = null;
