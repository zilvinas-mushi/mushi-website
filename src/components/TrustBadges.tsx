/**
 * Social-proof badge row — ported from mushi-app's components/app/trust-badges.
 *
 * Only change from the original: next/image is swapped for a plain <img>, since
 * image optimization is off for the static export (CLAUDE.md) and the badge
 * artwork is a local SVG-wrapped PNG that the optimizer would skip anyway.
 * Dimensions stay explicit so the row reserves its space.
 */

type Badge = {
  title: string;
  meta: string;
  logo: string;
};

/**
 * Decorative laurel sprig flanking each badge's meta line. A black path with a
 * 50%-white path over it, so it reads as a soft grey sprig on the dark page.
 * `flip` mirrors it for the left side.
 */
function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="7"
      height="15"
      viewBox="0 0 7 15"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${flip ? "-scale-x-100" : ""}`}
    >
      <path
        d="M2.0054 2.62579C2.24039 3.73805 3.13463 4.45998 3.55238 4.6819C3.33699 5.19104 3.06285 6.44429 3.68948 7.38423C2.78087 8.12051 2.57983 9.25105 2.61246 9.71449C1.75086 9.71449 1.01327 10.2497 0.752173 10.5174C0.0472202 11.379 -0.0311079 12.1818 0.00805616 12.4756C0.027638 12.6518 0.156879 13.1962 0.908829 13.8855C1.21965 14.1704 1.46959 14.325 1.71169 14.2967C2.20171 14.2393 2.47772 13.6388 1.88793 13.298C1.18298 12.8907 1.0459 12.3189 1.06549 12.0839C2.77304 13.2588 4.4597 12.1427 5.06022 11.4181C5.13854 11.3333 5.25604 11.1087 5.09938 10.8894C4.94272 10.6701 4.44665 10.3411 4.21819 10.204C6.35263 9.75365 6.86176 7.89336 6.88135 7.59963C6.90093 7.3059 6.86176 7.20799 6.62678 7.07092C6.43879 6.96126 5.85655 6.88162 5.58892 6.85551C6.07847 6.42471 6.25472 6.01349 6.41137 5.60226C6.56803 5.19104 6.45053 3.62448 6.29387 3.40908C6.13721 3.19368 6.07847 3.19368 5.86307 3.17409C5.59333 3.14957 5.11242 3.37644 4.84479 3.48741C4.98839 3.31117 5.20902 2.75504 4.9427 1.94043C4.60981 0.922162 3.59154 0.197623 3.33698 0.0605486C3.13333 -0.0491107 2.95187 0.0148572 2.88659 0.0605486C2.49495 0.452189 1.77042 1.51353 2.0054 2.62579Z"
        fill="black"
      />
      <path
        d="M2.0054 2.62579C2.24039 3.73805 3.13463 4.45998 3.55238 4.6819C3.33699 5.19104 3.06285 6.44429 3.68948 7.38423C2.78087 8.12051 2.57983 9.25105 2.61246 9.71449C1.75086 9.71449 1.01327 10.2497 0.752173 10.5174C0.0472202 11.379 -0.0311079 12.1818 0.00805616 12.4756C0.027638 12.6518 0.156879 13.1962 0.908829 13.8855C1.21965 14.1704 1.46959 14.325 1.71169 14.2967C2.20171 14.2393 2.47772 13.6388 1.88793 13.298C1.18298 12.8907 1.0459 12.3189 1.06549 12.0839C2.77304 13.2588 4.4597 12.1427 5.06022 11.4181C5.13854 11.3333 5.25604 11.1087 5.09938 10.8894C4.94272 10.6701 4.44665 10.3411 4.21819 10.204C6.35263 9.75365 6.86176 7.89336 6.88135 7.59963C6.90093 7.3059 6.86176 7.20799 6.62678 7.07092C6.43879 6.96126 5.85655 6.88162 5.58892 6.85551C6.07847 6.42471 6.25472 6.01349 6.41137 5.60226C6.56803 5.19104 6.45053 3.62448 6.29387 3.40908C6.13721 3.19368 6.07847 3.19368 5.86307 3.17409C5.59333 3.14957 5.11242 3.37644 4.84479 3.48741C4.98839 3.31117 5.20902 2.75504 4.9427 1.94043C4.60981 0.922162 3.59154 0.197623 3.33698 0.0605486C3.13333 -0.0491107 2.95187 0.0148572 2.88659 0.0605486C2.49495 0.452189 1.77042 1.51353 2.0054 2.62579Z"
        fill="white"
        fillOpacity="0.5"
      />
    </svg>
  );
}

const BADGES: Badge[] = [
  {
    title: "Foreplay Best Ad Award",
    meta: "Winner 2025",
    logo: "/badges/firstpick.svg",
  },
  {
    title: "Trustpilot Reviews",
    meta: "Rated 4.9",
    logo: "/badges/trustpilot.svg",
  },
  {
    title: "FirstPick's VC Mentors",
    meta: "AI Accelerator",
    logo: "/badges/foreplay.svg",
  },
];

export function TrustBadges() {
  return (
    // This top margin IS the gap between the hero's two CTAs and the awards —
    // nothing sits between them — so the design's 50 lives here. Below md it
    // stays at 24 until the phone pass sets its own value.
    <ul className="mt-6 grid grid-cols-3 gap-2 md:mt-[calc(var(--hero-u)*0.5)] md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-8 md:gap-y-4">
      {BADGES.map(({ title, meta, logo }) => (
        <li key={title} className="flex flex-col items-center gap-2 text-center md:flex-row md:gap-3 md:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="size-16 shrink-0 object-contain md:size-[calc(var(--hero-u)*0.64)]"
          />
          {/* Both lines are Poppins 16 — the award name and the "Winner 2025"
              line under it are the same size, not a heading over smaller meta.
              Only the colour separates them. */}
          <span className="text-center md:text-left">
            <span className="block text-[16px] font-normal leading-snug text-white md:text-[length:calc(var(--hero-u)*0.16)]">
              {title}
            </span>
            <span className="flex items-center justify-center gap-1.5 text-[16px] text-zinc-500 md:justify-start md:text-[length:calc(var(--hero-u)*0.16)]">
              <Laurel flip />
              {meta}
              <Laurel />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
