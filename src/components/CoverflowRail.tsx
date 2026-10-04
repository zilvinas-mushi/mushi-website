"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { VolumeOff, VolumeOn } from "./CreativeVideo";
import { Img } from "./Img";

/**
 * The /case-studies rails: Video Ads, Landing Pages, Static Ads.
 *
 * A cover-flow, per the artboards: the centre card at full size, its
 * neighbours stepping down in size and opacity, a #181818 plate behind the
 * centre, the title straddling the plate's top edge and two round arrows
 * straddling its bottom. See design/CASE-STUDIES.md for every number here.
 *
 * ## Slots, not a strip
 *
 * The cards are not a row that slides. Each one is absolutely placed in a
 * SLOT — a rectangle read off the frame — and moving the rail hands every
 * card the next slot along; the CSS transition does the travel. That is what
 * lets the rest state be the artboard exactly: the frame's slots are not a
 * progression (the two ±1 video cards are 311 x 506 and 311 x 508, the ±2
 * pair 264 x 432 and 263 x 428), so no scale factor reproduces them.
 *
 * Everything is measured from the stage's CENTRE LINE rather than its left
 * edge, so the rail is the same composition at any width: on a window wider
 * or narrower than the artboard the outer cards are simply cropped more or
 * less by the section's own overflow.
 *
 * ## Why a short list is doubled
 *
 * The rail is a ring, and a card leaving one end has to come back in at the
 * other. With no more cards than visible slots (Landing Pages: 3 in 3) that
 * return trip is a visible card flying across the whole stage. Rendering the
 * list twice puts a run of HIDDEN slots behind each end, so the wrap happens
 * between two invisible positions and what the visitor sees is one card
 * fading out at an edge and another fading in. A list with at least two
 * cards to spare (11 films, 13 statics) already has that run and is rendered
 * once.
 *
 * ## The films
 *
 * Only the CENTRE card plays, and only while the rail is on screen: muted,
 * looping, from the top, fading in over its poster — the home rail's
 * behaviour (CreativeVideo) on one card at a time. Nothing is fetched until
 * the rail is in view; the playing card then hands a head start to the next
 * one along. A card that leaves the centre goes back to its poster. The
 * centre card is the sound toggle, and the frame's mute badge is its state.
 *
 * ## It starts finished
 *
 * The slot each card gets is computed in render, so the server HTML already
 * carries the rest state — nothing assembles on hydration (CLAUDE.md).
 */

type Slot = {
  /** Left edge, measured from the stage's centre line. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Frame-to-image inset: [block, inline]. */
  p: [number, number];
  /** The image's opacity over the #343434 frame. */
  o: number;
  /** box-shadow spread, in the frame's `0 4px blur spread #000`. 0 = none. */
  s: string;
  /** Mute badge: [size, inset from the card's bottom-right]. */
  b?: [number, number];
};

type RailSpec = {
  /** Stage height, and the plate's. */
  height: number;
  plate: number;
  /** Arrow buttons' top edge. */
  arrows: number;
  /** slots[0] is the centre; slots[n] is [left, right] at distance n. */
  centre: Slot;
  sides: [Slot, Slot][];
  /** Where a card waits out of sight, [left, right]. */
  hidden: [Slot, Slot];
};

const SHADOW_21 = "0 4px 50px 21px #000";
const SHADOW_27 = "0 4px 50px 27px #000";
const NONE = "0 0 0 0 #0000";

/** Desktop, in design px at 1920 (rendered as rem). y is from the stage top. */
const DESKTOP: Record<string, RailSpec> = {
  video: {
    height: 735,
    plate: 678,
    arrows: 669,
    centre: { x: -177, y: 74, w: 354, h: 578, p: [7, 6], o: 1, s: SHADOW_21, b: [40, 26] },
    sides: [
      [
        { x: -502, y: 110, w: 311, h: 506, p: [6, 7], o: 0.75, s: SHADOW_27, b: [33, 24] },
        { x: 191, y: 109, w: 311, h: 508, p: [7, 7], o: 0.75, s: SHADOW_27, b: [33, 24] },
      ],
      [
        { x: -780, y: 147, w: 264, h: 432, p: [6, 5.5], o: 0.5, s: SHADOW_27, b: [27, 21] },
        { x: 516, y: 149, w: 263, h: 428, p: [6, 5.5], o: 0.5, s: SHADOW_27, b: [27, 21] },
      ],
      [
        { x: -1010, y: 186, w: 216, h: 354, p: [5, 4.5], o: 0.35, s: NONE, b: [24, 17.5] },
        { x: 793, y: 186, w: 216, h: 354, p: [5, 4.5], o: 0.35, s: NONE, b: [24, 17.5] },
      ],
    ],
    hidden: [
      { x: -1230, y: 216, w: 180, h: 295, p: [4, 4], o: 0.2, s: NONE, b: [20, 15] },
      { x: 1050, y: 216, w: 180, h: 295, p: [4, 4], o: 0.2, s: NONE, b: [20, 15] },
    ],
  },
  landing: {
    height: 582,
    plate: 525,
    arrows: 516,
    centre: { x: -385, y: 74, w: 752, h: 425, p: [6, 7], o: 1, s: SHADOW_21 },
    sides: [
      [
        { x: -1027, y: 109, w: 629, h: 355, p: [5, 5.5], o: 0.75, s: NONE },
        { x: 380, y: 109, w: 629, h: 355, p: [5, 5.5], o: 0.75, s: NONE },
      ],
    ],
    hidden: [
      { x: -1570, y: 139, w: 523, h: 295, p: [4, 4.5], o: 0.4, s: NONE },
      { x: 1047, y: 139, w: 523, h: 295, p: [4, 4.5], o: 0.4, s: NONE },
    ],
  },
  static: {
    height: 669,
    plate: 596,
    arrows: 587,
    centre: { x: -248, y: 74, w: 496, h: 496, p: [6, 6], o: 1, s: SHADOW_27 },
    sides: [
      [
        { x: -693, y: 106, w: 431, h: 431, p: [5, 5], o: 0.75, s: SHADOW_27 },
        { x: 262, y: 106, w: 431, h: 431, p: [5, 5], o: 0.75, s: SHADOW_27 },
      ],
      [
        { x: -1076, y: 137, w: 369, h: 369, p: [5, 5], o: 0.5, s: NONE },
        { x: 707, y: 137, w: 369, h: 369, p: [5, 5], o: 0.5, s: NONE },
      ],
    ],
    hidden: [
      { x: -1410, y: 164, w: 315, h: 315, p: [4, 4], o: 0.3, s: NONE },
      { x: 1095, y: 164, w: 315, h: 315, p: [4, 4], o: 0.3, s: NONE },
    ],
  },
};

const PHONE_SHADOW = "0 4px 30px 17px #000";
const PHONE_SIDE_SHADOW = "0 4px 25px 0 #000";

/** Phone, in px at 375. y is from the title's line top. */
const tall: RailSpec = {
  height: 515,
  plate: 478,
  arrows: 467,
  centre: { x: -124.5, y: 48, w: 250, h: 408, p: [5, 5], o: 1, s: PHONE_SHADOW },
  sides: [
    [
      { x: -356.5, y: 71, w: 222, h: 362, p: [4, 4], o: 0.75, s: PHONE_SIDE_SHADOW },
      { x: 135.5, y: 71, w: 222, h: 362, p: [4, 4], o: 0.75, s: PHONE_SIDE_SHADOW },
    ],
  ],
  hidden: [
    { x: -572, y: 92, w: 196, h: 320, p: [4, 4], o: 0.4, s: NONE },
    { x: 377, y: 92, w: 196, h: 320, p: [4, 4], o: 0.4, s: NONE },
  ],
};
const PHONE: Record<string, RailSpec> = {
  video: tall,
  landing: tall,
  static: {
    height: 357,
    plate: 320,
    arrows: 309,
    centre: { x: -124.5, y: 48, w: 250, h: 250, p: [5, 5], o: 1, s: PHONE_SHADOW },
    sides: [
      [
        { x: -356.5, y: 62, w: 222, h: 222, p: [4, 4], o: 0.75, s: PHONE_SIDE_SHADOW },
        { x: 135.5, y: 62, w: 222, h: 222, p: [4, 4], o: 0.75, s: PHONE_SIDE_SHADOW },
      ],
    ],
    hidden: [
      { x: -572, y: 75, w: 196, h: 196, p: [4, 4], o: 0.4, s: NONE },
      { x: 377, y: 75, w: 196, h: 196, p: [4, 4], o: 0.4, s: NONE },
    ],
  },
};

const rem = (px: number) => `${px / 16}rem`;
const px = (n: number) => `${n}px`;

/** The slot a card sits in at distance `d` from the centre (negative = left). */
function slotAt(spec: RailSpec, d: number): { slot: Slot; shown: boolean } {
  if (d === 0) return { slot: spec.centre, shown: true };
  const side = d < 0 ? 0 : 1;
  const pair = spec.sides[Math.abs(d) - 1];
  return pair ? { slot: pair[side], shown: true } : { slot: spec.hidden[side], shown: false };
}

/** One breakpoint's custom properties for a card; `k` is the prefix, `u` the unit. */
function slotVars(k: "d" | "p", u: (n: number) => string, s: Slot, shown: boolean) {
  return {
    [`--${k}x`]: u(s.x),
    [`--${k}y`]: u(s.y),
    [`--${k}w`]: u(s.w),
    [`--${k}h`]: u(s.h),
    [`--${k}p`]: `${u(s.p[0])} ${u(s.p[1])}`,
    // The same inset again, split: the film is a replaced element, so it
    // needs a width and height spelled out rather than an `inset`.
    [`--${k}py`]: u(s.p[0]),
    [`--${k}px`]: u(s.p[1]),
    [`--${k}o`]: s.o,
    [`--${k}s`]: s.s,
    [`--${k}v`]: shown ? 1 : 0,
    ...(s.b ? { [`--${k}bs`]: u(s.b[0]), [`--${k}bi`]: u(s.b[1]) } : {}),
  };
}

export type RailItem = { src: string; phoneSrc?: string; alt: string; video?: string };

/**
 * One card's film. `on` plays it, `warm` only starts its download. Everything
 * here answers to those two props — the rail decides who is centre and
 * whether it is on screen.
 */
function RailVideo({
  file,
  on,
  warm,
  sound,
  onBlocked,
}: {
  file: string;
  on: boolean;
  warm: boolean;
  sound: boolean;
  /** The browser refused to play with sound; the rail drops back to muted. */
  onBlocked: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if ((on || warm) && !v.getAttribute("src")) {
      v.setAttribute("src", `/videos/${file}`);
      v.preload = "auto";
      v.load();
    }
    if (!on) {
      v.pause();
      v.muted = true;
      return;
    }
    v.muted = !sound;
    void v.play().catch((err: DOMException) => {
      // Sound without a gesture the browser will accept (Safari, after the
      // rail has moved on its own): keep the film, lose the sound.
      if (err?.name === "NotAllowedError" && !v.muted) {
        v.muted = true;
        onBlocked();
        void v.play().catch(() => {});
      }
    });
  }, [on, warm, sound, file, onBlocked]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      onPause={() => {
        setPlaying(false);
        // Back to the top, so the next visit starts the ad from its hook.
        const v = ref.current;
        if (v) v.currentTime = 0;
      }}
      className={`cf-film ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}

export function CoverflowRail({
  kind,
  title,
  headingId,
  items,
}: {
  kind: "video" | "landing" | "static";
  title: string;
  headingId: string;
  items: readonly RailItem[];
}) {
  const desktop = DESKTOP[kind];
  const phone = PHONE[kind];
  // Twice over when the list is short — see "Why a short list is doubled".
  const spare = items.length - (2 * desktop.sides.length + 1);
  const cards = spare >= 2 ? items : [...items, ...items];
  const n = cards.length;
  // The design's centre card is the middle of the supplied list.
  const [active, setActive] = useState(Math.floor(items.length / 2));
  const touchX = useRef<number | null>(null);
  const go = (by: number) => setActive((a) => (((a + by) % n) + n) % n);

  // The films: `live` is "the rail is on screen and may play".
  const root = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [sound, setSound] = useState(false);
  // Set when autoplay is off (reduced motion, Save-Data, 2G) and the visitor
  // has pressed the card themselves.
  const asked = useRef(false);
  const auto = useRef(true);
  useEffect(() => {
    const el = root.current;
    if (kind !== "video" || !el) return;
    const link = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    auto.current = !(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      link?.saveData ||
      /^(slow-)?2g$/.test(link?.effectiveType ?? "")
    );
    const io = new IntersectionObserver(
      (entries) => {
        const ratio = entries[entries.length - 1].intersectionRatio;
        if (ratio >= 0.35) setLive(auto.current || asked.current);
        else if (ratio <= 0) {
          setLive(false);
          setSound(false);
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [kind]);
  const blocked = useCallback(() => setSound(false), []);
  const press = () => {
    // Autoplay off: the first press starts the film, with its sound — an
    // explicit press means they want the ad. After that it toggles sound.
    if (!live) {
      asked.current = true;
      setLive(true);
      setSound(true);
    } else setSound((s) => !s);
  };

  return (
    <section
      ref={root}
      // THE RAIL'S PICTURES LOAD AS A GROUP (paint-gate-script's
      // data-defer-group), the moment the rail nears the viewport — not one
      // by one. Per-image deferral cannot work here: a card waiting off the
      // edge is clipped by this section's overflow, so it never counts as
      // "near", and when a press brings it in it arrived as an empty grey
      // frame and stayed one (live, 2026-10-04: three blank cards on a phone
      // after three presses).
      data-defer-group=""
      aria-labelledby={headingId}
      className={`cf cf-${kind} relative overflow-hidden`}
      style={
        {
          "--ph": px(phone.height),
          "--dh": rem(desktop.height),
          "--pplate": px(phone.plate),
          "--dplate": rem(desktop.plate),
          "--parrows": px(phone.arrows),
          "--darrows": rem(desktop.arrows),
        } as CSSProperties
      }
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        // 40px: past a tap's wobble, short of a deliberate page scroll's drift.
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <div aria-hidden="true" className="cf-plate" />
      <h2 id={headingId} className="cf-title">
        {title}
      </h2>

      <ul role="list" className="cf-stage">
        {cards.map((item, i) => {
          // Distance from the centre, wrapped to the nearer way round the ring.
          let d = (((i - active) % n) + n) % n;
          if (d >= n / 2) d -= n;
          const D = slotAt(desktop, d);
          const P = slotAt(phone, d);
          const clone = i >= items.length;
          return (
            <li
              key={i}
              className="cf-card"
              // The copy is there for the ring, not for the reader.
              aria-hidden={clone || undefined}
              // Any card but the centre one is a control: a click brings it in.
              data-side={d === 0 ? undefined : ""}
              style={
                {
                  ...slotVars("d", rem, D.slot, D.shown),
                  ...slotVars("p", px, P.slot, P.shown),
                  zIndex: 10 - Math.min(Math.abs(d), 9),
                } as CSSProperties
              }
              onClick={d === 0 ? undefined : () => go(d)}
            >
              <Img
                src={item.src}
                alt={clone ? "" : item.alt}
                className="cf-img"
                // Fetched when the rail's group loads, not when Chrome
                // decides the card is near — see Img's gateOnly.
                gateOnly
                // The -sm half of a pair is for a phone's 240px card.
                sizes="(min-width: 768px) 30vw, 64vw"
                draggable={false}
                alternate={
                  item.phoneSrc
                    ? { src: item.phoneSrc, media: "(max-width: 767px)" }
                    : undefined
                }
              />
              {item.video ? (
                <>
                  <RailVideo
                    file={item.video}
                    on={d === 0 && live}
                    warm={d === 1 && live}
                    sound={d === 0 && sound}
                    onBlocked={blocked}
                  />
                  {d === 0 ? (
                    // The whole centre card is the sound toggle, as on the
                    // home rail; the badge is its state.
                    <button
                      type="button"
                      onClick={press}
                      aria-label={`${sound ? "Turn sound off" : live ? "Turn sound on" : "Play"} — ${item.alt}`}
                      aria-pressed={live ? sound : undefined}
                      className="group absolute inset-0 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                    >
                      <span aria-hidden="true" className="cf-badge">
                        {sound ? <VolumeOn /> : <VolumeOff />}
                      </span>
                    </button>
                  ) : (
                    <span aria-hidden="true" className="cf-badge">
                      <VolumeOff />
                    </span>
                  )}
                </>
              ) : null}
            </li>
          );
        })}
      </ul>

      {(["prev", "next"] as const).map((dir) => (
        <button
          key={dir}
          type="button"
          aria-label={`${dir === "prev" ? "Previous" : "Next"} — ${title}`}
          onClick={() => go(dir === "prev" ? -1 : 1)}
          className={`cf-arrow cf-arrow-${dir}`}
        >
          {/* The file's own chevron: 10 x 20 drawn in a 14 x 24 box, stroke 4. */}
          <svg
            viewBox="0 0 14 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={dir === "prev" ? "-scale-x-100" : undefined}
          >
            <path d="M2 2L12 12L2 22" />
          </svg>
        </button>
      ))}
    </section>
  );
}
