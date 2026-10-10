"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CARD_SIZES, srcSet } from "@/components/home/creative-media";
import { VolumeOff, VolumeOn } from "@/components/shared/VolumeIcons";

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
        The poster stays a real <img> — not
        the <video poster> attribute. The rail's cards must never show blank
        while the marquee is mid-glide, and an <img> is the only version of
        that guarantee that does not depend on how a given browser treats a
        poster under preload="none". The video fades over it once it is
        genuinely painting frames, so there is no flash of empty black.
      */}
      {/* DEFERRED, not merely lazy (2026-09-25): the URL rides in data-src
          until the paint gate has opened and the rail is within range, with a
          <noscript> twin. Chrome's lazy lookahead had the first poster on the
          wire before the first screen painted, sharing the pipe with the
          fonts and the hero — see LazyImg in CreativeCard. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-src={`/images/${image}`}
        data-srcset={srcSet(image)}
        sizes={CARD_SIZES}
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/${image}`}
          srcSet={srcSet(image)}
          sizes={CARD_SIZES}
          alt={alt}
          width={w}
          height={h}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </noscript>

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
