"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  /** Attaches the source on first use. Until this runs, nothing is fetched. */
  const arm = useCallback(() => {
    const v = ref.current;
    if (!v) return null;
    if (!v.getAttribute("src")) v.setAttribute("src", `/videos/${video}`);
    return v;
  }, [video]);

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
      // Starting needs 0.55: a card half-clipped at the edge of the rail is
      // not something anyone is watching, and arming it would spend bandwidth
      // on a creative that is about to slide back out.
      //
      // STOPPING, though, waits until the card is completely gone. With a
      // single 0.55 threshold the card stops the instant it dips below
      // 55% — so unmuting an ad and then nudging the page a little killed the
      // sound, which reads as "the sound button does not work" rather than as
      // a scroll side effect. These cards are ~530px tall; on a laptop a small
      // scroll crosses 55% easily. Hysteresis is the fix: loud and playing is
      // a state you have to scroll fully past to leave.
      io = new IntersectionObserver(
        (entries) => {
          const v = ref.current;
          if (!v) return;
          const ratio = entries[entries.length - 1].intersectionRatio;
          if (ratio >= 0.55) {
            arm();
            void v.play().catch(() => {});
          } else if (ratio <= 0) {
            v.pause();
            if (audible === token.current) claimAudio(null);
          }
        },
        { threshold: [0, 0.55] },
      );
      io.observe(el);
    });

    return () => {
      cancelAnimationFrame(enable);
      io?.disconnect();
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
        onPlaying={() => setPlaying(true)}
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
          // Bigger and darker than the first pass: this sits over ad footage
          // that is frequently light, and at 32px on black/45 it disappeared
          // into whatever was behind it.
          <span
            aria-hidden="true"
            className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-black/60 text-white shadow-sm ring-1 ring-white/20 backdrop-blur-sm transition duration-200 ease-out group-hover:bg-black"
          >
            {sound ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[1.125rem]" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
                <path strokeLinecap="round" d="M15 9.5a3.5 3.5 0 0 1 0 5M17.8 7a7 7 0 0 1 0 10" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[1.125rem]" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
                <path strokeLinecap="round" d="m15.5 9.5 5 5m0-5-5 5" />
              </svg>
            )}
          </span>
        )}
      </button>

    </div>
  );
}
