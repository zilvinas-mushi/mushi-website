import { HERO_FLOATERS } from "@/lib/content";

/**
 * Platform marks floating around the hero artwork.
 *
 * Three nested layers, all to measured sizes:
 *
 *   outer  100 x 100, radius 20, #181818, 2px #222222 stroke
 *   inner   75 x  75, radius 15, #222222
 *   logo    50 x  50
 *
 * Every layer is FLAT. An earlier version faked a bevel out of stacked
 * translucent white fills, a backdrop blur, an inset highlight and a cast
 * shadow; the design uses two solid tones, and the same lesson as the stat
 * panels applies — anything tinting or blurring a fill stops it reading as the
 * colour it is.
 *
 * The logos need no radius of their own: all four assets carry alpha, so their
 * shapes are already baked in, and all four are square, so nothing is
 * stretched.
 *
 * ## Placement
 *
 * This mounts against the whole violet field rather than inside the hero
 * SECTION, because the lower two tiles sit below the section's bottom edge —
 * positioning them there would have needed percentages past 100% that drift
 * with the copy. `x`/`y` in the data are the tile's CENTRE, hence the
 * translate(-50%,-50%): `left`/`top` alone would anchor the top-left corner
 * and put every tile half a tile off.
 *
 * Sizes come from --hero-u, shared with the stat panels, so the tiles and the
 * cards stay in proportion to each other at every width.
 *
 * z-[3] puts these above the stat panels: in the design the Instagram mark
 * overlaps the left-hand panel, so the icons win.
 *
 * Decorative, so aria-hidden with empty alt. Hidden below lg, where there is no
 * room beside the headline.
 */
export function HeroFloaters() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
    >
      {HERO_FLOATERS.map((f) => (
        <span
          key={f.name}
          className="absolute flex items-center justify-center rounded-[calc(var(--hero-u)*0.2)] border-solid border-[#222222] bg-[#181818]"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: `translate(-50%, -50%) rotate(${f.rotate})`,
            width: "var(--hero-u)",
            height: "var(--hero-u)",
            borderWidth: "calc(var(--hero-u) * 0.02)",
          }}
        >
          <span
            className="flex items-center justify-center rounded-[calc(var(--hero-u)*0.15)] bg-[#222222]"
            style={{
              width: "calc(var(--hero-u) * 0.75)",
              height: "calc(var(--hero-u) * 0.75)",
            }}
          >
            {/* Sized so the artwork's INK is 50, not its canvas — see the
                `ink` note in content.ts. Google's and TikTok's assets carry
                ~25% transparent padding, so a flat 50 box rendered their marks
                at ~37 and they read as smaller and dimmer than the others. */}
            <span
              className="block"
              style={{
                width: `calc(var(--hero-u) * ${0.5 / f.ink})`,
                height: `calc(var(--hero-u) * ${0.5 / f.ink})`,
              }}
            >
              {/*
                A BACKGROUND, not an <img>, and that is a mobile decision.

                These four marks are `hidden lg:block` — the phone never shows
                them — but as eager <img> elements React emitted a
                `<link rel="preload" as="image" fetchPriority="high">` for each
                one into the document head, ahead of the stylesheet. That is
                77 KB of high-priority artwork a phone downloads and never
                paints, arriving before the 16 KB of CSS the hero's headline
                (the LCP element) is blocked on. Measured on the live site it
                was most of what stood between the CSS and the wire.

                A background-image inside a display:none subtree is not
                fetched at all, so the phone now spends nothing here, and
                desktop still loads all four the moment the stylesheet
                applies — eagerly, which is what the previous note was really
                asking for. What it must NOT become is a lazy <img>: nothing
                here is offscreen on a desktop, so lazy would buy no bytes and
                only bring back the flicker.
              */}
              <span
                className="block size-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(/images/${f.image})` }}
              />
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
