import type { CSSProperties } from "react";
import sizes from "@/lib/image-sizes.json";

type Sizes = Record<string, { w: number; h: number }>;
const IMAGE_SIZES = sizes as Sizes;

type Props = {
  /** Filename inside /public/images, e.g. "iphone21.webp". */
  src: string;
  alt: string;
  className?: string;
  /**
   * On the first screen, so it loads with the page and the paint gate waits
   * for it instead of the observer deferring it.
   *
   *   true    — the screen's ONE lead image: fetchpriority=high and a
   *             synchronous decode, so it is in the frame the gate reveals.
   *   "gate"  — everything else up there. Eager and gated, but at normal
   *             priority and decoded off-thread: the hero's tile field is 90
   *             <img> elements over five files, and 90 synchronous decodes at
   *             high priority is main-thread time PageSpeed counts as Total
   *             Blocking Time while the one image that matters queues behind
   *             them. The gate awaits decode() either way, so nothing can
   *             paint half-decoded.
   */
  priority?: boolean | "gate";
  /** Override the intrinsic width; height scales to preserve aspect ratio. */
  width?: number;
  /**
   * The CSS width this renders at, as a `sizes` list. Supply it whenever a
   * `-sm` companion exists: without it the browser assumes the image fills
   * the viewport and picks the master every time, which is the whole cost
   * the pair exists to avoid.
   */
  sizes?: string;
  /**
   * Inline styles that have no Tailwind literal — currently only mask-image,
   * which needs its vendor-prefixed twin and so cannot be an arbitrary class.
   */
  style?: CSSProperties;
  /**
   * A SECOND FILE FOR A SECOND BREAKPOINT, chosen by the browser rather than
   * by CSS — `{ src, media, width? }`, emitted as the <source> of a <picture>
   * whose <img> is the `src` above.
   *
   * This exists because `hidden md:block` does NOT save the bytes. An eager
   * <img> that a breakpoint hides is still fetched, at high priority, and the
   * paint gate then waits for it: the phone was spending 397 KB on the
   * desktop hero's MacBook before it was allowed to show the phone hero. A
   * <picture> fetches the matching entry ONLY, so each device pays for its
   * own artwork and the gate waits for exactly what it will paint.
   *
   * Both entries carry width/height, so whichever the browser takes brings
   * its own aspect ratio and neither can shift the layout.
   */
  alternate?: { src: string; media: string; width?: number };
  /**
   * Turn off the browser's native image drag. Artwork that is PART OF A
   * SURFACE rather than content in its own right — the team cards' cut-out
   * portraits, where the picture and the card behind it read as one object —
   * looks broken when a drag peels the photo off its card as a ghost.
   */
  draggable?: boolean;
};

/**
 * Plain <img> with intrinsic dimensions baked in at build time.
 *
 * next/image optimization is disabled for the static export (CLAUDE.md), so
 * next/image would add machinery without benefit. What actually matters is
 * that every image carries width/height so the browser can reserve space and
 * avoid layout shift — that comes from src/lib/image-sizes.json, generated
 * from the real files rather than hand-written.
 *
 * RESPONSIVE PAIRS. If `<name>-sm.webp` is in the table, this emits a two-entry
 * srcset automatically — the convention is the whole configuration. There is no
 * server to resize on the fly here, so the alternative was shipping one retina
 * master to every phone: the case-study mockups are 1200px squares that a phone
 * draws at 343 CSS px, and sending the master cost about 600 KB across the four
 * of them for pixels no phone can show. See scripts/build-responsive-images.py.
 */
export function Img({
  src,
  alt,
  className,
  priority = false,
  width,
  sizes: sizesAttr,
  style,
  draggable,
  alternate,
}: Props) {
  const dim = IMAGE_SIZES[src];

  if (!dim) {
    // Fail loudly at build time rather than shipping a dimensionless image.
    throw new Error(
      `Img: no dimensions for "${src}". Add the file to public/images and regenerate src/lib/image-sizes.json.`,
    );
  }

  const w = width ?? dim.w;
  const h = width ? Math.round((dim.h / dim.w) * width) : dim.h;

  // The `-sm` name has to actually BE a different name: on a .png the replace
  // is a no-op, so this looked itself up and emitted a srcset listing the same
  // file twice at the same width (emoji-sunglasses.png did exactly that).
  const smallSrc = src.replace(/\.webp$/, "-sm.webp");
  const small = smallSrc !== src ? IMAGE_SIZES[smallSrc] : undefined;
  const srcSet = small
    ? `/images/${smallSrc} ${small.w}w, /images/${src} ${dim.w}w`
    : undefined;

  const alt2 = alternate ? IMAGE_SIZES[alternate.src] : undefined;
  if (alternate && !alt2) {
    throw new Error(
      `Img: no dimensions for "${alternate.src}". Add the file to public/images and regenerate src/lib/image-sizes.json.`,
    );
  }

  /* next/image is deliberately unused: optimization is off for the static
     export (CLAUDE.md), so <Image> would ship extra runtime for no benefit.
     The LCP concern the rule targets is handled by the explicit width/height
     and eager/lazy loading below. */
  const url = `/images/${src}`;

  /* BELOW THE FOLD, THE URL IS NOT AN ATTRIBUTE THE BROWSER READS.
     `loading="lazy"` asks Chrome to wait and Chrome mostly does not: its
     threshold runs to ~8000px on a slow connection, so /templates put 1.8 MB
     on the wire before the first screen was allowed to paint. The real URL
     rides in `data-src` and the inline script (src/lib/paint-gate-script.ts)
     moves it across when the image comes within a screen and a half. The
     <noscript> twin below is the same image with a real src, so a visitor or
     a crawler without JavaScript still gets every picture. */
  const deferred = !priority;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...(deferred ? { "data-src": url, "data-srcset": srcSet } : { src: url, srcSet })}
      sizes={srcSet ? sizesAttr : undefined}
      alt={alt}
      width={w}
      height={h}
      className={className}
      style={style}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      decoding={priority === true ? "sync" : "async"}
      {...(priority === true ? { fetchPriority: "high" as const } : {})}
    />
  );

  const withFallback = deferred ? (
    <>
      {img}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          srcSet={srcSet}
          sizes={srcSet ? sizesAttr : undefined}
          alt={alt}
          width={w}
          height={h}
          className={className}
          style={style}
          draggable={draggable}
          loading="lazy"
          decoding="async"
        />
      </noscript>
    </>
  ) : (
    img
  );

  if (!alternate || !alt2) return withFallback;

  const aw = alternate.width ?? alt2.w;
  const ah = alternate.width
    ? Math.round((alt2.h / alt2.w) * alternate.width)
    : alt2.h;

  /* `contents`: the <picture> box itself must not exist. The two files it
     chooses between sit in flex and flow contexts that were written for a
     bare <img>, and an inline wrapper around a block image changes where both
     land. With display:contents the <img> stays the parent's own child and
     nothing about the layout moves. */
  return (
    <picture className="contents">
      <source
        media={alternate.media}
        srcSet={`/images/${alternate.src}`}
        width={aw}
        height={ah}
      />
      {withFallback}
    </picture>
  );
}

/**
 * The no-JavaScript twin of a DEFERRED CSS BACKGROUND.
 *
 * Artwork that is a background rather than an <img> keeps its URL in
 * `data-bg`, out of anything the browser will fetch, until the inline script
 * (src/lib/paint-gate-script.ts) puts it into `--bg` as the element comes into
 * range. With JavaScript off that never happens, so this renders the one rule
 * that does it unconditionally — matched on the data attribute, so it needs no
 * id and cannot drift from the element it belongs to.
 *
 * Drop it beside (or inside) the element. It renders nothing at all when
 * JavaScript is on.
 */
export function BgFallback({
  bg,
  md,
  mask,
}: {
  bg: string;
  md?: string;
  /** The artwork is a mask rather than a fill (the laurel on /templates). */
  mask?: boolean;
}) {
  const prop = mask ? "-webkit-mask-image:VAL;mask-image:VAL" : "background-image:VAL";
  const rule = (v: string) => prop.replaceAll("VAL", v);
  const rules =
    (bg ? `[data-bg="${bg}"]{${rule(bg)}}` : "") +
    (md ? `@media (min-width:768px){[data-bg-md="${md}"]{${rule(md)}}}` : "");
  return (
    <noscript>
      {/* Build-time constants only — no user input reaches this. */}
      <style dangerouslySetInnerHTML={{ __html: rules }} />
    </noscript>
  );
}
