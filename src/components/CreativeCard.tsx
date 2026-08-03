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
 * Action-row icons. One shared 24x24 viewBox and stroke weight so the four
 * render as a set — the previous hand-written paths had lumpy curves and a
 * crooked send plane, which read as stretched pictures rather than icons.
 * These are proven Feather-geometry outlines, the same visual family as the
 * icon set used across the mushi-app desktop UI.
 */
function Icon({ d, extra }: { d: string; extra?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      className="size-[22px] stroke-black"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      {extra && <path strokeLinecap="round" strokeLinejoin="round" d={extra} />}
    </svg>
  );
}

function Heart() {
  return (
    <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  );
}

function Comment() {
  return (
    <Icon d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  );
}

function Share() {
  return <Icon d="M22 2L11 13" extra="M22 2l-7 20-4-9-9-4 22-7z" />;
}

function Bookmark() {
  return <Icon d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />;
}

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
