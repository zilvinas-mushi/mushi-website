import type { Creative } from "@/lib/content";
import { CreativeVideo } from "./CreativeVideo";
import { CARD_SIZES, srcSet } from "./creative-media";

/**
 * Instagram-post card used in the creatives rail.
 *
 * The design frames every ad creative as a real IG post: white card, account
 * header with avatar + handle + verified tick + caption, the media, then the
 * action bar. Keeping that chrome in one component means adding a creative is
 * a data entry in content.ts, not new markup.
 *
 * Icons are inline SVG rather than an icon package — the site is a static
 * export and this avoids shipping a dependency for six glyphs.
 */

/**
 * A DEFERRED <img> for this card: the URL rides in data-src (and data-srcset)
 * and the inline paint-gate script moves it across as the card comes within
 * range, with a <noscript> twin for visitors and crawlers without JavaScript
 * — the same contract Img keeps (CLAUDE.md, "below the fold, nothing is
 * fetched until it is nearly in view").
 *
 * WHY NOT `loading="lazy"` ALONE (2026-09-25): Chrome starts a lazy image
 * 1250px ahead of the viewport, 3000 on a slow link, and the rail sits inside
 * that window on every phone — so the stills, avatars and the five action
 * icons (some 90 KB together) were on the wire before the first screen had
 * painted, sharing the pipe with the fonts and the hero the paint gate was
 * waiting on. PageSpeed counted every byte of it against the hero's Largest
 * Contentful Paint. The rail's own arming (CreativesRail) already calls the
 * group loader, so nothing about the marquee changes: the cards are still
 * fully painted two viewports before anyone reaches them.
 */
export function LazyImg({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  className,
  ariaHidden,
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  ariaHidden?: boolean;
}) {
  const shared = { width, height, className, decoding: "async" as const, ...(ariaHidden ? { "aria-hidden": true as const } : {}) };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-src={src} data-srcset={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading="lazy" {...shared} />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading="lazy" {...shared} />
      </noscript>
    </>
  );
}

function Verified() {
  return (
    // The design's own badge artwork, not a redrawn tick.
    <LazyImg src="/creatives/icons/verified.svg" alt="Verified account" width={21} height={21} className="size-[0.9375rem] shrink-0" />
  );
}

/**
 * Action-row icons — the design's own exported artwork from
 * /public/creatives/icons, not redrawn approximations. Each keeps its native
 * aspect ratio (they are not square: 45x41, 43x39, 45x41, 46x42) and renders
 * at a fixed 21px height; forcing them square is what made earlier versions
 * look stretched. The browser fetches each file once and reuses it across all
 * twenty cards.
 */
function ActionIcon({ name, w, h }: { name: string; w: number; h: number }) {
  return (
    <LazyImg src={`/creatives/icons/${name}.svg`} alt="" width={w} height={h} className="h-[2rem] w-auto" ariaHidden />
  );
}

const Heart = () => <ActionIcon name="like" w={45} h={41} />;
const Comment = () => <ActionIcon name="comment" w={43} h={39} />;
const Share = () => <ActionIcon name="send" w={45} h={41} />;
const Bookmark = () => <ActionIcon name="save" w={46} h={42} />;

export function CreativeCard({ item }: { item: Creative }) {
  // One description for the media whichever way it renders, so a film card
  // and a still card read identically to a screen reader.
  const media = `${item.caption} — ad creative for ${item.handle}`;

  return (
    <article className="w-[17.5rem] shrink-0 snap-start overflow-hidden rounded-[0.9375rem] bg-white sm:w-[18.75rem]">
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        {item.avatar ? (
          <LazyImg src={`/creatives/${item.avatar}`} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full object-cover" />
        ) : (
          // Placeholder until account avatars are supplied — a neutral disc
          // with the handle's initial, never a stand-in photo.
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[0.8125rem] font-semibold text-zinc-600"
          >
            {item.handle.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[0.8125rem] font-semibold leading-tight text-black">
            <span className="truncate">{item.handle}</span>
            {item.verified && <Verified />}
          </p>
          {/* Solid #000 at full opacity, per Figma — NOT a muted black. It was
              black/70, an eyeballed step down from the handle above it. In the
              design the two lines differ by weight and size only, so the
              caption reads as the same ink as the handle, not a faded one. */}
          <h3 className="truncate text-[0.75rem] leading-tight text-black">
            {item.caption}
          </h3>
        </div>
      </header>

      {/*
        Lazy, and that is not a retreat from the marquee guarantee.

        These were eager on the reasoning that a card is ALWAYS just entering
        the viewport, so lazy would mean watching stills pop in blank for the
        whole first loop. What that missed is where React puts an eager image:
        it emits a `<link rel="preload" as="image">` into the document HEAD
        for each one. Twenty-three of them — ten stills, ten avatars, the icon
        set — sat above the stylesheet, and the stylesheet is what the hero's
        headline (the LCP element) is blocked on.

        Lazy alone was still too early, though: Chrome starts a lazy image
        1250px before it arrives, 3000px on a slow connection, and the rail
        sits inside that window — so the stills were on the wire before the
        first screen had painted. They are DEFERRED now (LazyImg): the URL
        sits in data-src until the paint gate has opened and the rail is
        within range, which the rail's own arming guarantees is still two
        viewports early.

        Film cards carry the same still as their poster and layer the video
        over it, so this holds for every card in the rail regardless of which
        kind it is. Only the poster is on the critical path — see CreativeVideo
        for why the film itself costs nothing until the card is on screen.
      */}
      {item.video ? (
        <CreativeVideo
          video={item.video}
          image={item.image}
          alt={media}
          w={item.w}
          h={item.h}
        />
      ) : (
        // Creatives are portrait ads; a 4:5 crop cut the tops and bottoms off.
        // 9:16 matches the source material, so the whole ad stays visible.
        // Deferred, not merely lazy — see LazyImg.
        <LazyImg
          src={`/images/${item.image}`}
          srcSet={srcSet(item.image)}
          sizes={CARD_SIZES}
          alt={media}
          width={item.w}
          height={item.h}
          className="aspect-[9/16] w-full bg-zinc-100 object-cover"
        />
      )}

      <footer className="flex items-center justify-between px-3 py-2.5">
        <span className="flex items-center gap-1.5">
          <Heart />
          <Comment />
          <Share />
        </span>
        <Bookmark />
      </footer>
    </article>
  );
}
