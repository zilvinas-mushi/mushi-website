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

function Verified() {
  return (
    // The design's own badge artwork, not a redrawn tick.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/creatives/icons/verified.svg"
      alt="Verified account"
      width={21}
      height={21}
      loading="lazy"
      decoding="async"
      className="size-[0.9375rem] shrink-0"
    />
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/creatives/icons/${name}.svg`}
      alt=""
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className="h-[2rem] w-auto"
      aria-hidden="true"
    />
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/creatives/${item.avatar}`}
            alt=""
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="size-8 shrink-0 rounded-full object-cover"
          />
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

        Lazy costs the rail nothing here because the rail is never in the first
        viewport at any width — the hero field is min-h-svh — and Chrome starts
        a lazy image 1250px before it arrives, 3000px on a slow connection.
        The rail sits inside that window, so the stills are already on the wire
        by the time anyone reaches them; they are simply no longer ahead of the
        CSS in the head.

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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/${item.image}`}
          srcSet={srcSet(item.image)}
          sizes={CARD_SIZES}
          alt={media}
          width={item.w}
          height={item.h}
          loading="lazy"
          decoding="async"
          // Creatives are portrait ads; a 4:5 crop cut the tops and bottoms off.
          // 9:16 matches the source material, so the whole ad stays visible.
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
