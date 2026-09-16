/**
 * Image delivery.
 *
 * Product photography is the entire argument this site makes — a tile is
 * bought on how its surface reads — so the showcase and the viewer are built
 * to serve the full-resolution file, up to 3840px wide, on displays that can
 * show it. Everything else gets a size that fits, because a 4K file pushed to
 * a phone is a slow first paint and nothing more.
 *
 * Two paths:
 *
 *   • Grid and card imagery goes through next/image, which picks a width from
 *     `images.deviceSizes` in next.config.mjs (extended to 3840 for this site)
 *     and re-encodes to AVIF or WebP.
 *
 *   • The full-screen viewer asks Cloudinary for the file directly, at
 *     `q_auto:best`, so the pixels the reader zooms into are the ones the
 *     manufacturer shot, not a second-generation re-encode.
 */

const CLOUDINARY_UPLOAD = '/image/upload/';

export type CloudinaryOptions = {
  /** Longest edge in pixels. Omit for the original. */
  width?: number;
  /**
   * `best` for the viewer, `good` for cards. Cloudinary picks the bytes; the
   * difference between the two is visible on a tile's surface texture.
   */
  quality?: 'best' | 'good' | 'eco';
  /** Serve a 2x file to a retina panel without asking for 2x the layout width. */
  dpr?: number;
};

/**
 * Rewrites a Cloudinary delivery URL with the transforms we want. Any other
 * URL — a local file, a placeholder, an asset from somewhere else — comes back
 * untouched, so callers never have to check first.
 */
export function cloudinaryUrl(url: string, options: CloudinaryOptions = {}): string {
  const marker = url.indexOf(CLOUDINARY_UPLOAD);
  if (!url.startsWith('https://res.cloudinary.com/') || marker === -1) return url;

  const transforms = ['f_auto', `q_auto:${options.quality ?? 'good'}`];
  if (options.width) {
    // c_limit never enlarges: a 2000px original stays 2000px when 3840 is asked
    // for, rather than being upscaled into mush.
    transforms.push(`c_limit,w_${options.width}`);
  }
  if (options.dpr && options.dpr !== 1) transforms.push(`dpr_${options.dpr}`);

  const head = url.slice(0, marker + CLOUDINARY_UPLOAD.length);
  const tail = url.slice(marker + CLOUDINARY_UPLOAD.length);
  return `${head}${transforms.join(',')}/${tail}`;
}

/** The file the full-screen viewer loads: as close to the original as we ship. */
export function viewerUrl(url: string): string {
  return cloudinaryUrl(url, { width: 3840, quality: 'best' });
}

/**
 * `sizes` strings. Getting these right is the whole game: the browser picks
 * its source from `sizes` before layout, so a wrong value either fetches a 4K
 * file for a thumbnail or a thumbnail for a 4K slot.
 */
export const imageSizes = {
  /** Three-up product grid inside the 1360px container. */
  productCard: '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw',
  /** The showcase's hero pane — half the viewport on desktop, all of it below. */
  showcase: '(max-width: 1024px) 100vw, 56vw',
  /** Gallery tiles in a two or three column masonry. */
  galleryTile: '(max-width: 640px) 94vw, (max-width: 1024px) 48vw, 32vw',
  /** Anything that spans the viewport. */
  full: '100vw',
} as const;
