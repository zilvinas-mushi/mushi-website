/**
 * The responsive pair for a creative's still.
 *
 * Every ad in the rail ships twice — `<name>.webp` at 900px for a 3x phone and
 * `<name>-sm.webp` at 512 for everything below that — because the card is a
 * fixed 280/300 CSS px and the Figma masters are 1320 wide. Sending the master
 * to every visitor was 1.26 MB of stills for a rail that is several screens
 * down the page, and all ten were in the document head as `<link rel=preload>`
 * (React emits one per eager image), competing with the stylesheet and the
 * fonts the hero's own headline waits on.
 *
 * The card and the film card have to agree on this: a film's poster IS the
 * still, so a mismatch would fetch the same ad twice at two sizes.
 *
 * See scripts/build-responsive-images.py for how the pair is produced.
 */
export const CARD_SIZES = "(min-width: 640px) 300px, 280px";

export function srcSet(image: string): string {
  const sm = image.replace(/\.webp$/, "-sm.webp");
  return `/images/${sm} 512w, /images/${image} 900w`;
}
