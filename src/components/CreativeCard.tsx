import type { Creative } from "@/lib/content";

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
    <svg
      viewBox="0 0 24 24"
      className="size-[13px] shrink-0"
      aria-label="Verified account"
      role="img"
    >
      <path
        fill="#0095F6"
        d="M12 1.5l2.6 2.1 3.3-.3.9 3.2 2.9 1.7-1.3 3.1 1.3 3.1-2.9 1.7-.9 3.2-3.3-.3L12 22.5l-2.6-2.1-3.3.3-.9-3.2-2.9-1.7 1.3-3.1-1.3-3.1 2.9-1.7.9-3.2 3.3.3L12 1.5z"
      />
      <path
        fill="#fff"
        d="M10.8 15.3l-3-3 1.1-1.1 1.9 1.9 4.3-4.3 1.1 1.1-5.4 5.4z"
      />
    </svg>
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
      loading="eager"
      decoding="async"
      className="h-[21px] w-auto"
      aria-hidden="true"
    />
  );
}

const Heart = () => <ActionIcon name="like" w={45} h={41} />;
const Comment = () => <ActionIcon name="comment" w={43} h={39} />;
const Share = () => <ActionIcon name="send" w={45} h={41} />;
const Bookmark = () => <ActionIcon name="save" w={46} h={42} />;

export function CreativeCard({ item }: { item: Creative }) {
  return (
    <article className="w-[280px] shrink-0 snap-start overflow-hidden rounded-[15px] bg-white sm:w-[300px]">
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        {item.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/creatives/${item.avatar}`}
            alt=""
            width={32}
            height={32}
            loading="eager"
            decoding="async"
            className="size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          // Placeholder until account avatars are supplied — a neutral disc
          // with the handle's initial, never a stand-in photo.
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[13px] font-semibold text-zinc-600"
          >
            {item.handle.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[13px] font-semibold leading-tight text-black">
            <span className="truncate">{item.handle}</span>
            {item.verified && <Verified />}
          </p>
          <h3 className="truncate text-[12px] leading-tight text-black/70">
            {item.caption}
          </h3>
        </div>
      </header>

      {/*
        Eager, not lazy — deliberately. These cards live in an auto-scrolling
        marquee, so something is ALWAYS just entering the viewport; lazy
        loading guarantees the visitor watches images pop in blank for the
        whole first loop. Everything loads up front instead, and the neutral
        backing only shows for the brief moment before that finishes.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/${item.image}`}
        alt={`${item.caption} — ad creative for ${item.handle}`}
        width={item.w}
        height={item.h}
        loading="eager"
        decoding="async"
        // Creatives are portrait ads; a 4:5 crop cut the tops and bottoms off.
        // 9:16 matches the source material, so the whole ad stays visible.
        className="aspect-[9/16] w-full bg-zinc-100 object-cover"
      />

      <footer className="flex items-center justify-between px-3 py-2.5">
        <span className="flex items-center gap-3.5">
          <Heart />
          <Comment />
          <Share />
        </span>
        <Bookmark />
      </footer>
    </article>
  );
}
