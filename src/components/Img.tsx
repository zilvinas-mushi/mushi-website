import type { CSSProperties } from "react";
import sizes from "@/lib/image-sizes.json";

type Sizes = Record<string, { w: number; h: number }>;
const IMAGE_SIZES = sizes as Sizes;

type Props = {
  /** Filename inside /public/images, e.g. "iphone21.webp". */
  src: string;
  alt: string;
  className?: string;
  /** Hero imagery only — everything below the fold stays lazy. */
  priority?: boolean;
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
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${src}`}
      srcSet={srcSet}
      sizes={srcSet ? sizesAttr : undefined}
      alt={alt}
      width={w}
      height={h}
      className={className}
      style={style}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );

  if (!alternate || !alt2) return img;

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
      {img}
    </picture>
  );
}
