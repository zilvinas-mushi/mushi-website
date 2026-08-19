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

      // Threshold rather than any-sliver: a card half-clipped at the edge of
      // the rail is not something anyone is watching, and arming it would
      // spend bandwidth on a creative that is about to slide back out.
      io = new IntersectionObserver(
        ([entry]) => {
          const v = ref.current;
          if (!v) return;
          if (entry.isIntersecting) {
            arm();
            void v.play().catch(() => {});
          } else {
            v.pause();
            if (audible === token.current) claimAudio(null);
          }
        },
        { threshold: 0.55 },
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
    claimAudio(audible === token.current ? null : token.current);
    // Unmuting a card the observer has paused should also resume it.
    if (v.paused) void v.play().catch(() => {});
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

      {showPlay ? (
        <button
          type="button"
          onClick={start}
          aria-label={`Play ${alt}`}
          className="absolute inset-0 grid place-items-center focus-visible:outline-none"
        >
          <span className="grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition duration-200 ease-out hover:bg-black hover:scale-105 active:scale-95">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 translate-x-px" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={sound ? `Mute ${alt}` : `Unmute ${alt}`}
          aria-pressed={sound}
          className="absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition duration-200 ease-out hover:bg-black active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {sound ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
              <path strokeLinecap="round" d="M15 9.5a3.5 3.5 0 0 1 0 5M17.8 7a7 7 0 0 1 0 10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
              <path strokeLinecap="round" d="m15.5 9.5 5 5m0-5-5 5" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
