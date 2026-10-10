import { HERO_CELL, HERO_CELLS, HERO_STOPS } from "@/lib/legal-hero-data";

/**
 * THE LEGAL HERO'S ARTWORK, AS VECTOR. The Figma frames draw a 2816 x 1584
 * raster (a violet panel with a grid of faint squares) stretched
 * non-uniformly into the 1920 x 392 band, and the squares came out soft
 * (Žilvinas 2026-10-10: "make this quality max … or remake it, as clear as
 * possible"; then, of the live page, "tragic!!!"). So it is remade: the
 * gradient sampled from the master down a square-free column, the two edge
 * glows measured from its side profiles, and the 1px grid at the squares'
 * own positions — read off the master, see legal-hero-data.ts and
 * design/LEGAL.md ("The hero, remade"). Crisp at any width and pixel
 * density, ~6 KB inline, no request, nothing for the paint gate to wait for.
 *
 * Two windows on one scene, as the frames have two crops of one picture:
 * desktop is the whole band; the phone is the band's left 684 x 388,
 * mirrored, as the mobile frame mirrors its crop. Both stretch to their box
 * (preserveAspectRatio none) exactly as the frames stretch the raster; the
 * strokes do not stretch with them (vector-effect), so a line is a line.
 *
 * Gradient ids are per variant (the two windows share a document), so the
 * phone's defs cannot shadow the desktop's.
 */
export function LegalHero({ variant, className }: { variant: "desktop" | "phone"; className?: string }) {
  const id = variant === "phone" ? "lhp" : "lhd";
  const u = (name: string) => `url(#${id}-${name})`;
  const [cw, ch] = HERO_CELL;
  // The glow's falloff, 99 design px in from each edge (measured at mid
  // height on the master, in steps of 15 of its pixels).
  const fall: readonly (readonly [number, number])[] = [
    [0, 1], [11, 0.62], [22, 0.38], [33, 0.24], [44, 0.16], [55, 0.09], [66, 0.055], [77, 0.03], [99, 0],
  ];
  const glow = (color: string, scale: number) =>
    fall.map(([x, a]) => <stop key={x} offset={x / 99} stopColor={color} stopOpacity={a * scale} />);
  const scene = (
    <>
      <rect width="1920" height="392" fill={u("v")} />
      {/* The violet glow, strongest low; and a whiter one over the foot. */}
      <g mask={u("mask")}>
        <rect width="99" height="392" fill={u("gl")} />
        <rect x="1821" width="99" height="392" fill={u("gr")} />
      </g>
      <g mask={u("maskw")}>
        <rect width="99" height="392" fill={u("wl")} />
        <rect x="1821" width="99" height="392" fill={u("wr")} />
      </g>
      <g fill="#fff" fillOpacity="0.07" stroke="#fff" strokeOpacity="0.2" strokeWidth="1">
        {HERO_CELLS.map(([x, y]) => (
          <rect key={`${x},${y}`} x={x} y={y} width={cw} height={ch} style={{ vectorEffect: "non-scaling-stroke" }} />
        ))}
      </g>
    </>
  );
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={variant === "phone" ? "-2 0 684 388" : "0 0 1920 392"}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1">
          {HERO_STOPS.map(([t, c]) => (
            <stop key={t} offset={t} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-gl`} x1="0" y1="0" x2="1" y2="0">{glow("#a580ff", 1)}</linearGradient>
        <linearGradient id={`${id}-gr`} x1="1" y1="0" x2="0" y2="0">{glow("#a580ff", 1)}</linearGradient>
        <linearGradient id={`${id}-wl`} x1="0" y1="0" x2="1" y2="0">{glow("#f1e9ff", 0.55)}</linearGradient>
        <linearGradient id={`${id}-wr`} x1="1" y1="0" x2="0" y2="0">{glow("#f1e9ff", 0.55)}</linearGradient>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id={`${id}-mw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="392">
          <rect width="1920" height="392" fill={u("m")} />
        </mask>
        <mask id={`${id}-maskw`} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="392">
          <rect width="1920" height="392" fill={u("mw")} />
        </mask>
      </defs>
      {variant === "phone" ? <g transform="translate(680 0) scale(-1 1)">{scene}</g> : scene}
    </svg>
  );
}
