"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CARD_SIZES, srcSet } from "./creative-media";

/**
 * Sound is exclusive across the whole rail: unmuting one creative mutes
 * whichever one was audible before. Two ads talking over each other is the
 * failure mode that makes a wall of autoplaying video unbearable, and it is
 * not something a per-card `muted` flag can prevent on its own — the cards
 * know nothing about each other.
 *
 * A module-level token plus a subscriber set rather than context: this is one
 * value shared by siblings that re-renders nothing above them, and routing it
 * through a provider would put the rail's whole card list back into React's
 * render path on every unmute — the exact thing CreativesRail is built to
 * avoid.
 */
type Token = symbol | null;

const listeners = new Set<(t: Token) => void>();
let audible: Token = null;

/**
 * The film cards in rail order, each entry its own `arm`. Effects run in tree
 * order, so pushing on mount produces the sequence the visitor walks through.
 *
 * This exists because the rail CLIPS. `rootMargin` on an IntersectionObserver
 * widens the root, but the spec still clips the intersection by every ancestor
 * overflow — and the rail is `overflow-hidden` — so a card parked off to the
 * right reports zero intersection no matter how generous the margin. Warming
 * the next card therefore cannot come from geometry; it has to come from the
 * sequence itself.
 */
const sequence: Array<() => void> = [];

/**
 * Whether the lookahead has already spent its one head start. The warm
 * observer fires for every film card inside the rail's clip box — three of
 * them on a desktop — and each `arm()` is a whole-file download plus a
 * decoder. One is a head start; three is the page's blocking time.
 */
let warmedAhead = false;

function claimAudio(next: Token) {
  audible = next;
  for (const notify of listeners) notify(next);
}

/**
 * A creative whose ad is a film.
 *
 * WHY IT AUTOPLAYS RATHER THAN WAITING FOR A CLICK. The two options cost the
 * same on page load, so the one that shows the work wins. Nothing here is
 * fetched until the card is actually on screen: the element carries
 * `preload="none"` and has no `src` at all until an IntersectionObserver
 * arms it. Initial page weight is therefore identical to a click-to-play
 * poster — zero video bytes — and a visitor who never scrolls to this section
 * never downloads a frame. Once armed, the files are `+faststart` H.264, so
 * the browser streams only the part it plays; watching four seconds costs
 * roughly four seconds of video, not the whole file.
 *
 * Playback is muted, which is what lets it start without a gesture, and the
 * speaker disc turns sound on. Off-screen cards are paused, so the rail is
 * never decoding more video than is visible — usually one or two, since the
 * film cards are spread through the sequence rather than adjacent.
 *
 * The click-to-play version still exists: it is what `prefers-reduced-motion`
 * gets. That setting is precisely about motion starting on its own, so those
 * visitors get the poster and a play control instead.
 */
export function CreativeVideo({
  video,
  image,
  alt,
  w,
  h,
}: {
  video: string;
  image: string;
  alt: string;
  w: number;
  h: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  /** Identity for the sound handshake — stable, and unique per card. */
  const token = useRef<symbol>(null as unknown as symbol);
  if (token.current === null) token.current = Symbol("creative");

  /** True once a frame has actually been painted, so the poster can hand over. */
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  /** Reduced motion: the card waits for a tap instead of starting itself. */
  const [manual, setManual] = useState(false);
  const [started, setStarted] = useState(false);

  /**
   * Attaches the source and starts buffering. Until this runs, nothing is
   * fetched at all — which is the whole reason `preload` starts at "none".
   *
   * It is lifted to "auto" HERE rather than left alone, because a src on a
   * preload="none" element still downloads nothing; the bytes only start
   * moving on play(). That is what made the cards late in the rail look
   * broken: each one began downloading at the exact moment you arrived at it,
   * so you sat watching a poster while it fetched from cold. Arming early
   * (see the warm observer) plus preload="auto" is what turns that into video
   * that is already playable when the card lands.
   */
  const arm = useCallback(() => {
    const v = ref.current;
    if (!v) return null;
    if (!v.getAttribute("src")) {
      v.setAttribute("src", `/videos/${video}`);
      v.preload = "auto";
      v.load();
    }
    return v;
  }, [video]);

  // Position in the rail, so this card can hand a head start to the next one.
  useEffect(() => {
    sequence.push(arm);
    return () => {
      const i = sequence.indexOf(arm);
      if (i >= 0) sequence.splice(i, 1);
    };
  }, [arm]);

  /**
   * Give the NEXT film card its bytes. Called when this one actually starts
   * playing — not when it merely arms — so the lookahead follows the visitor
   * one card at a time instead of chaining through the whole rail and
   * prefetching every film at once.
   */
  const warmNext = useCallback(() => {
    const i = sequence.indexOf(arm);
    if (i >= 0 && i + 1 < sequence.length) sequence[i + 1]();
  }, [arm]);

  // Sound subscription: one card holds the token, every other card mutes.
  useEffect(() => {
    const onChange = (t: Token) => {
      const on = t === token.current;
      setSound(on);
      const v = ref.current;
      if (v) v.muted = !on;
    };
    listeners.add(onChange);
    // Only sync when some card already holds sound — the usual case is `null`,
    // and calling through would be a setState in an effect body for nothing.
    if (audible !== null) onChange(audible);
    return () => {
      listeners.delete(onChange);
      // Leaving with the token held would mute the rail permanently.
      if (audible === token.current) claimAudio(null);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | undefined;
    let warm: IntersectionObserver | undefined;
    let offLoad: (() => void) | undefined;

    // Deferred a frame for the same reason CreativesRail defers its own
    // enhancement flag: setting state synchronously in an effect body trips
    // react-hooks/set-state-in-effect.
    const enable = requestAnimationFrame(() => {
      if (reduced) {
        setManual(true);
        return;
      }

      const el = ref.current;
      if (!el) return;

      // TWO thresholds, not one, and they are deliberately not the same number.
      //
      // Starting needs 0.35. It was 0.55, which meant a card scrolling up
      // from below the fold had to be more than half past it before anything
      // moved — you were already looking at a still. A third of the card is
      // enough to mean "this is on screen" while still excluding the slivers
      // at the rail's edges.
      //
      // STOPPING, though, waits until the card is completely gone. With a
      // single shared threshold the card stops the instant it dips below
      // it — so unmuting an ad and then nudging the page a little killed the
      // sound, which reads as "the sound button does not work" rather than as
      // a scroll side effect. These cards are ~530px tall; on a laptop a small
      // scroll crosses 55% easily. Hysteresis is the fix: loud and playing is
      // a state you have to scroll fully past to leave.
      // WARM: arm the card well before it arrives — but only after the
      // visitor has started moving down the page, and only ONE card at a time.
      //
      // The vertical margin is a viewport and a half, not a token 200px. The
      // rail sits far down the page, so the meaningful head start is measured
      // in SCREENS of scrolling, not pixels: at ~1 Mbps a card needs a second
      // or two of lead to have its opening buffered, and 200px of warning is
      // a fraction of one flick of the wheel. This is what makes the ads
      // already be moving when the section arrives rather than starting to
      // fetch as you land on it.
      //
      // THAT MARGIN IS WHY THIS WAITS FOR A SCROLL. A viewport and a half
      // reaches past the fold, so the film cards nearest the top of the rail
      // are inside the warm root from the moment the observer exists — at
      // scroll position zero, on a page nobody has touched yet. Measured on
      // the live site that was 3.2 MB on a phone and 16.5 MB on a desktop,
      // where the rail is wide enough to hold three film cards side by side
      // and all three armed at once: three simultaneous `preload="auto"`
      // fetches and three decoders starting, which is where the desktop run's
      // 850ms of blocking time came from. None of it is a head start, because
      // a visitor who has not scrolled is not on their way anywhere.
      //
      // One scroll event is all it takes to arm, and the rail is still two
      // screens below the fold at that point, so the lead time this exists to
      // buy is untouched. `scrollY > 0` covers a restored or deep-linked
      // position, where the scroll has already happened.
      //
      // The observer also cannot run away horizontally: the rail is
      // overflow-hidden, so the only cards it can reach are the two or three
      // actually inside the clip box.
      //
      // ...and not at all on a metered or slow connection. The lookahead is a
      // luxury paid for in megabytes. Save-Data is an explicit ask not to
      // spend them, and on 2g the file would not arrive before the visitor
      // had scrolled past anyway. The strict observer below still starts
      // playback on arrival; it just fetches then rather than ahead.
      const link = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (link?.saveData || /^(slow-)?2g$/.test(link?.effectiveType ?? "")) return;

      const install = () => {
        warm = new IntersectionObserver(
          (entries) => {
            if (!entries[entries.length - 1].isIntersecting) return;
            // ONE film gets the head start, not every film the clip box holds.
            // From here the lookahead travels by warmNext, one card per card
            // actually played — which is what the note on warmNext describes
            // and what this observer used to undo by arming its whole
            // neighbourhood in the same frame.
            if (warmedAhead) return;
            warmedAhead = true;
            arm();
          },
          { rootMargin: "150% 400px" },
        );
        warm.observe(el);
      };
      if (window.scrollY > 0) install();
      else window.addEventListener("scroll", install, { once: true, passive: true });
      offLoad = () => window.removeEventListener("scroll", install);

      io = new IntersectionObserver(
        (entries) => {
          const v = ref.current;
          if (!v) return;
          const ratio = entries[entries.length - 1].intersectionRatio;
          if (ratio >= 0.35) {
            arm();
            void v.play().catch(() => {});
          } else if (ratio <= 0) {
            v.pause();
            if (audible === token.current) claimAudio(null);
          }
        },
        { threshold: [0, 0.35] },
      );
      io.observe(el);
    });

    return () => {
      cancelAnimationFrame(enable);
      offLoad?.();
      io?.disconnect();
      warm?.disconnect();
    };
  }, [arm]);

  /** Reduced-motion start, and the poster's own play control. */
  const start = () => {
    const v = arm();
    if (!v) return;
    setStarted(true);
    claimAudio(token.current); // an explicit press means they want the ad
    void v.play().catch(() => {});
  };

  const toggleSound = () => {
    const v = arm();
    if (!v) return;
    const wantSound = audible !== token.current;
    claimAudio(wantSound ? token.current : null);
    if (!wantSound) return;

    // Order matters: unmute FIRST (done by claimAudio above), then play.
    // A browser that dislikes a muted-autoplay stream turning audible refuses
    // by PAUSING the element, so the resume has to come after the unmute, and
    // it has to happen inside this click — the click is the user activation
    // that makes it legal. Asking in the other order just gets paused again.
    //
    // If it is refused anyway, hand the token back rather than leaving a
    // speaker icon on a silent card. The play promise is the signal for that,
    // not a rAF probe: rAF callbacks are frozen in a background tab, which is
    // exactly a case where playback will not start.
    void v.play().then(
      () => {},
      (err: DOMException) => {
        // ONLY a refusal costs the card its sound. An AbortError means some
        // other play()/pause() overtook this one — the observer arming this
        // very element does exactly that — and treating it as a refusal would
        // silently undo the tap the visitor just made, which is worse than
        // the lying icon this guard exists to prevent.
        if (err?.name === "NotAllowedError" && audible === token.current) {
          claimAudio(null);
        }
      },
    );
  };

  const showPlay = manual && !started;

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-100">
      {/*
        The poster stays a real <img>, eager, exactly as on a still card — not
        the <video poster> attribute. The rail's cards must never show blank
        while the marquee is mid-glide, and an <img> is the only version of
        that guarantee that does not depend on how a given browser treats a
        poster under preload="none". The video fades over it once it is
        genuinely painting frames, so there is no flash of empty black.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${image}`}
        srcSet={srcSet(image)}
        sizes={CARD_SIZES}
        alt={alt}
        width={w}
        height={h}
        loading="eager"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />

      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        // No `controls`: this is an ad standing in for an Instagram post, and
        // a scrubber across the bottom would break that read.
        aria-label={alt}
        onPlaying={() => {
          setPlaying(true);
          warmNext();
        }}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/*
        ONE control, and it is the whole ad — not a disc in the corner.
        Tapping the video is how sound is turned on everywhere this card is
        pretending to be (Instagram, TikTok, Reels), so it is the gesture
        people actually try first. A 32px target in the corner was the entire
        control before, and missing it is indistinguishable from the sound
        being broken.

        The disc below is therefore an INDICATOR that happens to sit inside
        the button, not a button of its own — nesting a second button inside
        this one would be invalid markup, and giving it its own handler would
        leave two hit areas that disagree about what a tap means.
      */}
      <button
        type="button"
        onClick={showPlay ? start : toggleSound}
        aria-label={
          showPlay
            ? `Play ${alt}`
            : sound
              ? `Turn sound off — ${alt}`
              : `Turn sound on — ${alt}`
        }
        aria-pressed={showPlay ? undefined : sound}
        className="group absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        {showPlay ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition duration-200 ease-out hover:bg-black hover:scale-105">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 translate-x-px" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </span>
        ) : (
          // The design's control, both frames (Žilvinas 2026-08-25): 28 x 26,
          // radius 19.5 — past half the height, so it renders as a full pill
          // either way, but the number is the one from the file — on a flat
          // #4F4F4F at 50%. No ring, no shadow, no backdrop blur: those were
          // this component's own additions to hold a 32px disc against light
          // footage, and the design answers that with the grey fill instead.
          // Hover deepens the same grey rather than going black, so the
          // control never changes colour, only weight.
          <span
            aria-hidden="true"
            className="absolute bottom-2.5 right-2.5 grid h-[26px] w-[28px] place-items-center rounded-[19.5px] bg-[#4F4F4F]/50 text-white transition duration-200 ease-out group-hover:bg-[#4F4F4F]/80"
          >
            {sound ? <VolumeOn /> : <VolumeOff />}
          </span>
        )}
      </button>

    </div>
  );
}

/**
 * The two states of the sound control, as SOLID glyphs — a filled speaker with
 * two waves, and the same speaker with a slash knocked through it.
 *
 * `VolumeOff` is the artwork Žilvinas supplied on 2026-08-25 ("sound close"),
 * traced to a path rather than kept as it arrived: the export was a 16 x 16
 * <svg> wrapping a 3000 x 3000 PNG, 1.3 MB of raster for an 18px icon, which
 * is the whole page's image budget spent on one control and still blurry on a
 * retina screen. The trace is within 1.5% of the original's coverage and is
 * about a kilobyte.
 *
 * Note the slash is a knockout — the gap around the bar is what the disc's
 * grey shows through — so the two subpaths are the glyph exactly as drawn, not
 * a speaker with a line laid over it.
 *
 * `VolumeOn` IS THE SAME ARTWORK WITH THE SLASH LIFTED OUT — not a glyph from
 * some other set. It was briefly Material Symbols' `volume_up`, which is the
 * wrong drawing: measured against the supplied glyph it fills 88% of its box
 * against 76%, its speaker is 45% of the width against 52%, and its waves are
 * half again as thick. Side by side the two states read as two different
 * icons, which is exactly how it looked (Žilvinas 2026-08-25).
 *
 * Recovering it is possible because of two properties of the supplied file:
 * the slash is a white BAR with a knockout gap either side (not a line drawn
 * over the speaker), and the speaker with its waves is symmetric about the
 * horizontal centre line. So: delete the bar, mirror what is left about that
 * centre line, and union the two — the mirrored copy covers the diagonal gap,
 * because the gap runs one way and its mirror runs the other. The only place
 * that leaves is where the two gaps cross, a diamond in the middle of the
 * cone, which is filled from the solid speaker around it and clipped at the
 * cone's own right edge so nothing spills past it.
 *
 * The result is within a hundredth of a unit of the muted glyph's bounding box
 * on all four sides, which is what makes the two states swap without the
 * control appearing to change size. Both are traced the same way, so they
 * carry the same corner rounding and the same wave thickness.
 */
function VolumeOff() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={SOUND_ICON} aria-hidden="true">
      <path d="M14.31 14.17 L13.83 14.19 L13.63 14.1 L3.56 4.04 L2.5 2.9 L2.45 2.75 L2.45 2.43 L2.55 2.22 L2.66 2.14 L2.79 2.11 L3.16 2.11 L3.3 2.16 L5.6 4.49 L5.83 4.63 L5.96 4.57 L8.23 2.29 L8.49 2.14 L8.68 2.22 L8.76 2.33 L8.78 2.46 L8.78 7.42 L8.81 7.65 L8.92 7.8 L10.31 9.19 L10.44 9.25 L10.55 9.2 L10.7 8.93 L10.75 8.75 L10.77 8.0 L10.75 7.48 L10.55 7.01 L10.1 6.36 L10.07 6.12 L10.13 5.92 L10.55 5.54 L10.76 5.52 L10.94 5.65 L11.25 6.02 L11.63 6.66 L11.81 7.12 L11.91 7.85 L11.81 9.13 L11.62 9.63 L11.37 10.07 L11.37 10.21 L11.47 10.37 L12.15 11.03 L12.29 11.11 L12.43 11.07 L12.56 10.91 L12.75 10.62 L13.1 9.89 L13.29 9.31 L13.42 8.44 L13.43 7.81 L13.28 6.9 L13.09 6.38 L12.73 5.68 L12.39 5.17 L11.96 4.63 L11.85 4.45 L11.84 4.33 L11.99 4.07 L12.3 3.8 L12.59 3.78 L12.76 3.84 L12.86 3.93 L13.46 4.64 L14.0 5.64 L14.35 6.62 L14.4 7.09 L14.51 7.55 L14.53 8.66 L14.35 9.72 L14.0 10.65 L13.65 11.3 L13.22 11.97 L13.36 12.22 L14.51 13.38 L14.53 13.91 L14.46 14.06Z M8.59 14.17 L8.43 14.15 L8.16 13.94 L5.05 10.84 L4.83 10.8 L2.82 10.8 L2.67 10.75 L2.5 10.6 L2.45 10.34 L2.45 5.92 L2.49 5.73 L2.65 5.57 L2.8 5.51 L2.98 5.52 L3.31 5.76 L8.73 11.19 L8.78 11.46 L8.78 13.89 L8.73 14.06Z" />
    </svg>
  );
}

function VolumeOn() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={SOUND_ICON} aria-hidden="true">
      <path d="M8.57 14.17 L8.42 14.16 L8.18 13.98 L6.0 11.79 L5.78 11.64 L5.64 11.43 L5.16 10.96 L5.05 10.91 L4.88 10.94 L4.72 10.83 L4.58 10.8 L2.76 10.8 L2.64 10.75 L2.51 10.62 L2.45 10.37 L2.45 5.95 L2.51 5.7 L2.64 5.57 L2.79 5.51 L4.58 5.52 L4.72 5.49 L4.88 5.38 L5.05 5.41 L5.16 5.36 L5.64 4.89 L5.78 4.68 L6.0 4.53 L8.18 2.34 L8.39 2.17 L8.49 2.14 L8.7 2.22 L8.78 2.4 L8.78 6.56 L8.82 6.74 L8.92 6.9 L8.81 7.11 L8.78 7.36 L8.79 9.09 L8.83 9.26 L8.92 9.41 L8.82 9.58 L8.78 9.76 L8.78 13.89 L8.73 14.06Z M12.31 12.75 L11.73 12.21 L11.66 12.09 L12.22 11.37 L12.3 11.15 L12.45 11.03 L12.71 10.67 L13.08 9.93 L13.28 9.31 L13.41 8.48 L13.42 8.03 L13.28 6.98 L13.09 6.42 L12.92 6.03 L12.53 5.38 L12.3 5.17 L12.22 4.95 L11.66 4.23 L11.73 4.11 L12.3 3.57 L12.44 3.72 L12.79 3.87 L13.09 4.15 L13.29 4.16 L13.29 4.39 L13.83 5.3 L14.17 6.08 L14.36 6.66 L14.41 7.07 L14.51 7.46 L14.54 7.9 L14.53 8.74 L14.4 9.28 L14.36 9.66 L13.99 10.68 L13.64 11.37 L13.3 11.9 L13.27 12.0 L13.29 12.16 L13.09 12.17 L12.79 12.45 L12.44 12.6Z M10.54 10.97 L10.38 10.86 L9.89 10.35 L10.02 10.21 L10.12 9.92 L10.38 9.58 L10.44 9.3 L10.63 9.07 L10.74 8.77 L10.77 8.03 L10.72 7.46 L10.6 7.21 L10.44 7.02 L10.36 6.72 L10.12 6.4 L10.02 6.11 L9.89 5.98 L10.53 5.35 L10.94 5.65 L11.36 6.15 L11.8 7.11 L11.91 7.9 L11.91 8.48 L11.83 9.12 L11.62 9.65 L11.3 10.28 L10.92 10.68Z" />
    </svg>
  );
}

/** One size for both states, so the disc's contents cannot drift apart. */
const SOUND_ICON = "size-5";
