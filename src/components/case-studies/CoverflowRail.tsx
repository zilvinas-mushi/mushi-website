"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { VolumeOff, VolumeOn } from "@/components/shared/VolumeIcons";
import { Img } from "@/components/shared/Img";

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
 * cards to spare (11 films, 11 statics) already has that run and is rendered
 * once.
 *
 * ## The films
 *
 * Only the CENTRE card plays, and only while the rail is on screen: muted,
 * looping, fading in over its poster — the home rail's behaviour
 * (CreativeVideo) on one card at a time. It starts AT THE POSTER'S FRAME
 * (`at`, content.ts), not at 0: the poster is a still from later in the
 * film, and a film that opened on a different picture looked like a card
 * that had broken (Žilvinas 2026-10-17, red-x: 2.5 s of a beige infographic
 * where the poster was a red cross). Now the first frame that fades in is
 * the one already there, and the loop runs on from it through the hook.
 * Nothing is fetched until the rail is in view; the playing card then hands
 * a head start to BOTH its neighbours, since an arrow goes either way and a
 * film fetched only on arrival started late on a real line. A card that
 * leaves the centre goes back to its poster. The centre card is the sound
 * toggle, and the frame's mute badge is its state.
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

/**
 * EVERY CARD IS THE CENTRE CARD'S BOX, MOVED AND SCALED INTO ITS SLOT
 * (Žilvinas 2026-10-11, from his phone: "scrolling through the videos in
 * case study causes jitter or lag. it has to be smooth"). The cards used
 * to glide by transitioning left, top, width, height, padding and
 * box-shadow — a layout of every card, and a re-raster of its picture or
 * film at a new size, on every frame of the 600ms, which on a 4x CPU was
 * a 155ms frame and a 200ms stall of the compositor at each swipe. Now a
 * card is laid out ONCE, in the centre slot's box (`--Xc*`, set on the
 * section), and reaches its slot by `translate` and a `scale` of
 * (w / centre w, h / centre h) from its top-left corner — two properties
 * the compositor animates by itself. The slots are not a uniform
 * progression (311 x 506 beside 311 x 508), so the scale is taken per axis
 * and the frame's own rectangles still come out to the pixel; the inset
 * and the radius scale with the card, a fraction of a pixel off the
 * frame's, which is beneath seeing. The shadow is not transitioned: it is
 * swapped at the move, one repaint of that card.
 *
 * One breakpoint's custom properties for a card; `k` is the prefix, `u`
 * the unit, `c` the centre slot.
 */
function slotVars(k: "d" | "p", u: (n: number) => string, s: Slot, c: Slot, shown: boolean) {
  return {
    [`--${k}x`]: u(s.x - c.x),
    [`--${k}y`]: u(s.y - c.y),
    [`--${k}sx`]: s.w / c.w,
    [`--${k}sy`]: s.h / c.h,
    [`--${k}o`]: s.o,
    [`--${k}s`]: s.s,
    [`--${k}v`]: shown ? 1 : 0,
  };
}

/** The centre slot's box, once per breakpoint on the section: where every card is laid out. */
function centreVars(k: "d" | "p", u: (n: number) => string, c: Slot) {
  return {
    [`--${k}cx`]: u(c.x),
    [`--${k}cy`]: u(c.y),
    [`--${k}cw`]: u(c.w),
    [`--${k}ch`]: u(c.h),
    [`--${k}cp`]: `${u(c.p[0])} ${u(c.p[1])}`,
    // The same inset again, split: the film is a replaced element, so it
    // needs a width and height spelled out rather than an `inset`.
    [`--${k}cpy`]: u(c.p[0]),
    [`--${k}cpx`]: u(c.p[1]),
    ...(c.b ? { [`--${k}bs`]: u(c.b[0]), [`--${k}bi`]: u(c.b[1]) } : {}),
  };
}

/** The order the films beyond the centre are fetched in, by distance from it. */
const WARM_ORDER: readonly number[] = [1, -1, 2, -2];

/**
 * Gives a card's <video> its file, once. Called from the effect that plays a
 * card AND from inside a tap or an arrow press (see go/press): a browser that
 * only starts media on a gesture needs the file in place within that gesture.
 *
 * EVERY FILM STARTS AT ITS BEGINNING (Noah 2026-10-20, "daug video prasideda
 * ne nuo pradžios"): it used to be seeked to its poster's moment so that the
 * first frame drawn was the picture already on screen. Now the poster is the
 * frame's own still and the film cross-fades in from frame 0 over it.
 */
function prime(v: HTMLVideoElement): void {
  if (v.getAttribute("src")) return;
  v.setAttribute("src", `/videos/${v.dataset.file}`);
  v.preload = "auto";
  v.load();
}

/**
 * How long the centre waits for the browser to say it can play the film
 * through before starting it anyway. The gate's rule: shows early, never
 * never-shows — a browser that never says so (a line throttled below the
 * film's bitrate, a preload the device ignores) still gets its film.
 */
const THROUGH_WAIT_MS = 3000;

/** A film paused under its poster, waiting to be able to play through (RailVideo's onPlaying). */
type Hold = { ear: AbortController; timer: number; forced: boolean };
function release(held: { current: Hold | null }): void {
  const h = held.current;
  if (!h) return;
  window.clearTimeout(h.timer);
  h.ear.abort();
  held.current = null;
}

export type RailItem = {
  src: string;
  phoneSrc?: string;
  alt: string;
  video?: string;
};

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
  onThrough,
  onRefused,
  slot,
  index,
}: {
  file: string;
  /** This card's distance from the centre, handed back with onThrough. */
  slot: number;
  on: boolean;
  warm: boolean;
  sound: boolean;
  /** The browser refused to play with sound; the rail drops back to muted. */
  onBlocked: () => void;
  /** This film has buffered enough to play through — the rail's cue to fetch the next one. */
  onThrough: (slot: number) => void;
  /** The browser would not play this film at all, even muted: the rail hands the start to a tap. */
  onRefused: () => void;
  /** The card's index in the ring, for the rail to find this film inside a gesture. */
  index?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // A film held under its poster until it can play through — see onPlaying.
  const held = useRef<Hold | null>(null);
  useEffect(() => () => release(held), []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (on || warm) prime(v);
    // A film fetched on an earlier visit is through already and will not
    // say so again — the rail asks each time it is centre or warm, so the
    // chain of downloads moves on past it.
    if ((on || warm) && v.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) onThrough(slot);
    if (!on) {
      release(held);
      v.pause();
      v.muted = true;
      return;
    }
    v.muted = !sound;
    // EVERY REFUSAL IS ANSWERED (Žilvinas 2026-10-18, "why this video still
    // sometimes doesn't play"): a play() the browser turns down used to be
    // handled only when it was unmuted — the muted retry, and a muted film
    // refused outright (iOS Low Power Mode, a card that arrived while the
    // page was being scrolled), were swallowed, and the film sat on its
    // poster looking stuck. Now: refused with sound → muted, told, retried;
    // refused muted → the rail is told, the badge becomes Play, and the
    // next tap starts it inside the gesture. An AbortError is not a
    // refusal — another change of state took the element over — and is
    // left alone.
    void v
      .play()
      .catch((err: DOMException) => {
        if (err?.name === "AbortError") return;
        if (!v.muted) {
          v.muted = true;
          onBlocked();
          return v.play();
        }
        throw err;
      })
      .catch((err: DOMException) => {
        if (err?.name !== "AbortError") onRefused();
      });
  }, [on, warm, sound, file, onBlocked, onThrough, onRefused, slot]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      // THE FILM IS SHOWN ONCE IT CAN PLAY THROUGH, NOT AT ITS FIRST FRAME
      // (Noah 2026-10-20, "dar vis sustoja kai kurie videkai"): shown the
      // moment it had a frame, it ran straight into the download's edge on
      // any line slower than its bitrate — a second of film, a second of
      // frozen frame, over and over (live at 1.6 Mbit/s: waiting/playing
      // every 1.1s). play() is still called at once, so that every browser
      // starts fetching (iOS fetches nothing for a film nobody has asked to
      // play); but when the first frames come and the browser does NOT yet
      // say it has enough buffered to run (readyState 4, its own estimate
      // from the rate it is downloading at), the film is paused back to 0
      // under its poster, unseen, and resumed on canplaythrough. The poster
      // stays a little longer; the film then runs. THROUGH_WAIT_MS is the
      // ceiling, for a browser that never says so (a line below the film's
      // bitrate, a device that will not preload): shows early, never
      // never-shows. On a good line canplaythrough is a few hundred ms
      // behind the first frame.
      onPlaying={() => {
        const v = ref.current;
        if (!v) return;
        // Already on screen and running again after a mid-film stall: it
        // stays — the hold is for a film's start only. (Held on a stall it
        // was sent back to 0: 4 Mbit/s replay, "playing t=0.0" at 18.8s.)
        if (playing) return;
        const h = held.current;
        if (h?.forced || v.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          release(held);
          setPlaying(true);
          return;
        }
        // Held, and something else (a sound toggle's play()) set it going:
        // back under the poster until it is through.
        if (h) {
          v.pause();
          v.currentTime = 0;
          return;
        }
        v.pause();
        v.currentTime = 0;
        const resume = () =>
          v.play().catch((err: DOMException) => {
            if (err?.name !== "AbortError") onRefused();
          });
        const ear = new AbortController();
        const timer = window.setTimeout(() => {
          ear.abort();
          held.current = { ear, timer, forced: true };
          void resume();
        }, THROUGH_WAIT_MS);
        v.addEventListener(
          "canplaythrough",
          () => {
            release(held);
            void resume();
          },
          { once: true, signal: ear.signal },
        );
        held.current = { ear, timer, forced: false };
      }}
      onPause={() => {
        setPlaying(false);
        // Back to the start, so the next visit begins at the beginning —
        // but only once the film has faded out (400ms, globals.css):
        // seeking while it is still showing snapped the picture as the card
        // slid away.
        const v = ref.current;
        if (v) window.setTimeout(() => { if (v.paused) v.currentTime = 0; }, 450);
      }}
      // The word that the next film in the line may start downloading.
      onCanPlayThrough={() => onThrough(slot)}
      data-file={file}
      data-rail-film={index}
      data-playing={playing || undefined}
      className="cf-film"
    />
  );
}

export function CoverflowRail({
  kind,
  title,
  headingId,
  items,
  start,
}: {
  kind: "video" | "landing" | "static";
  title: string;
  headingId: string;
  items: readonly RailItem[];
  /** The card at rest in the centre; the middle of the list unless the content says otherwise. */
  start?: number;
}) {
  const desktop = DESKTOP[kind];
  const phone = PHONE[kind];
  // Twice over when the list is short — see "Why a short list is doubled".
  const spare = items.length - (2 * desktop.sides.length + 1);
  const cards = spare >= 2 ? items : [...items, ...items];
  const n = cards.length;
  // The design's centre card is the middle of the supplied list.
  const [active, setActive] = useState(start ?? Math.floor(items.length / 2));
  const touchX = useRef<number | null>(null);
  // THE FILMS ARE FETCHED ONE AT A TIME, THE PLAYING ONE FIRST (Žilvinas
  // 2026-10-17, from a phone: "the ads just sometimes gets stuck", then
  // "don't do any second from picture static to video — immediately play
  // video"). The centre downloads alone until it can play through — three
  // films at once on a phone's line starved the one playing and froze it
  // mid-frame — then the next card to the right, then the left, then the
  // two beyond, each once the one before is through (WARM_ORDER). So an
  // arrow pressed a moment later lands on a film that is already in hand
  // and starts on the spot. `stage` is how far down that list the line has
  // got; it starts over on every move, and a film fetched earlier reports
  // itself through at once (RailVideo), so the chain skips it.
  const [stage, setStage] = useState(0);
  const onThrough = useCallback((d: number) => {
    const k = d === 0 ? 0 : WARM_ORDER.indexOf(d) + 1;
    // ONLY THE FILM WHOSE TURN IT IS MOVES THE LINE ON. A film still
    // downloading from before a press (the old centre, now a side card)
    // says it is through in its own time; taken as "max", that opened the
    // next TWO downloads at once beside the one playing (live, 2026-10-23:
    // +1 and +2 started together 17s after a press, the centre still
    // stalling). It is ignored now, and reports again when its turn comes
    // (the effect re-asks a film each time it becomes warm).
    if (k >= 0) setStage((s) => (k === s ? s + 1 : s));
  }, []);
  const go = (by: number) => {
    setStage(0);
    const next = (((active + by) % n) + n) % n;
    // The film that is about to be centre is started HERE, inside the
    // press — with its file set if it has none yet — for the browsers that
    // only start media within a gesture (iOS, Low Power Mode). The effect
    // that follows the state change plays it too; a second play() on a
    // playing film is a no-op.
    const v = root.current?.querySelector<HTMLVideoElement>(`video[data-rail-film="${next}"]`);
    if (v && live) {
      prime(v);
      v.muted = !sound;
      void v.play().catch(() => {});
    }
    setActive(next);
  };

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
  // The browser would not play the centre film even muted: the rail steps
  // back to "not playing", so the badge reads Play and the tap that follows
  // starts the film inside its own gesture (press).
  const refused = useCallback(() => {
    setLive(false);
    setSound(false);
  }, []);
  const press = (e: React.MouseEvent<HTMLButtonElement>) => {
    // The film is told to play HERE, inside the tap, not from the effect
    // that follows the state change: a browser that will only start media
    // on a gesture (iOS, Low Power Mode) accepts a play() in the handler
    // and may not accept one a render later — which left a film that had
    // never started showing its poster, i.e. its own first frame, stuck.
    const v = e.currentTarget.parentElement?.querySelector("video");
    const wantSound = !live || !sound;
    if (v) {
      prime(v);
      v.muted = !wantSound;
      void v.play().catch(() => {});
    }
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
          ...centreVars("p", px, phone.centre),
          ...centreVars("d", rem, desktop.centre),
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
                  ...slotVars("d", rem, D.slot, desktop.centre, D.shown),
                  ...slotVars("p", px, P.slot, phone.centre, P.shown),
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
                    warm={live && WARM_ORDER.indexOf(d) !== -1 && WARM_ORDER.indexOf(d) < stage}
                    sound={d === 0 && sound}
                    onBlocked={blocked}
                    onThrough={onThrough}
                    onRefused={refused}
                    slot={d}
                    index={clone ? undefined : i}
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
