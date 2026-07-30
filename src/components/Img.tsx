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
};

/**
 * Plain <img> with intrinsic dimensions baked in at build time.
 *
 * next/image optimization is disabled for the static export (CLAUDE.md), so
 * next/image would add machinery without benefit. What actually matters is
 * that every image carries width/height so the browser can reserve space and
 * avoid layout shift — that comes from src/lib/image-sizes.json, generated
 * from the real files rather than hand-written.
 */
export function Img({ src, alt, className, priority = false, width }: Props) {
  const dim = IMAGE_SIZES[src];

  if (!dim) {
    // Fail loudly at build time rather than shipping a dimensionless image.
    throw new Error(
      `Img: no dimensions for "${src}". Add the file to public/images and regenerate src/lib/image-sizes.json.`,
    );
  }

  const w = width ?? dim.w;
  const h = width ? Math.round((dim.h / dim.w) * width) : dim.h;

  /* next/image is deliberately unused: optimization is off for the static
     export (CLAUDE.md), so <Image> would ship extra runtime for no benefit.
     The LCP concern the rule targets is handled by the explicit width/height
     and eager/lazy loading below. */
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${src}`}
      alt={alt}
      width={w}
      height={h}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
