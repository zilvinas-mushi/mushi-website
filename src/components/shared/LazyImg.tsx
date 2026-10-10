/**
 * A DEFERRED <img>: the URL rides in data-src (and data-srcset)
 * and the inline paint-gate script moves it across as the card comes within
 * range, with a <noscript> twin for visitors and crawlers without JavaScript
 * — the same contract Img keeps (CLAUDE.md, "below the fold, nothing is
 * fetched until it is nearly in view").
 *
 * WHY NOT `loading="lazy"` ALONE (2026-09-25): Chrome starts a lazy image
 * 1250px ahead of the viewport, 3000 on a slow link, and the rail sits inside
 * that window on every phone — so the stills, avatars and the five action
 * icons (some 90 KB together) were on the wire before the first screen had
 * painted, sharing the pipe with the fonts and the hero the paint gate was
 * waiting on. PageSpeed counted every byte of it against the hero's Largest
 * Contentful Paint. The rail's own arming (CreativesRail) already calls the
 * group loader, so nothing about the marquee changes: the cards are still
 * fully painted two viewports before anyone reaches them.
 */
export function LazyImg({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  className,
  ariaHidden,
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  ariaHidden?: boolean;
}) {
  const shared = { width, height, className, decoding: "async" as const, ...(ariaHidden ? { "aria-hidden": true as const } : {}) };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-src={src} data-srcset={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading="lazy" {...shared} />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading="lazy" {...shared} />
      </noscript>
    </>
  );
}
