#!/usr/bin/env node
// The routine's only way into Slack: a user token for the Mushi workspace in
// SLACK_MUSHI_TOKEN. No MCP, no connector, nothing that can expire mid-run.
//
//   node scripts/slack-requests.mjs list  <where> [days]   messages + reactions + thread replies, as JSON
//   node scripts/slack-requests.mjs react <where> <ts> <emoji>
//   node scripts/slack-requests.mjs reply <where> <ts> <text…>
//   node scripts/slack-requests.mjs media <where> <ts> [outDir]   download the message's files; watch its videos
//   node scripts/slack-requests.mjs notify <text…>                 a DM to the token's own user
//
// <where> is "#channel", or "@name" for the direct messages with that person
// (their Slack handle or display name; the DM is opened if it does not exist
// yet). `list` prints "me", the token's own user id, so a DM's requests (the
// other person's messages) can be told from the replies.
// <ts> is a message's "ts" from `list`. <emoji> is a name without colons,
// e.g. white_check_mark, eyes, question, x, arrow_right, no_entry.
//
// `media` is how a request made on video gets read. It saves every file on
// the message and its thread, and for each video or voice note writes a
// transcript with timestamps and a dozen frames, through
// tools/slack-media/watch.mjs (Whisper on the CPU; `npm ci --prefix
// tools/slack-media` first). Screenshots come down as they are.

const token = process.env.SLACK_MUSHI_TOKEN;
if (!token) fail("SLACK_MUSHI_TOKEN is not set");

const [cmd, channelArg, ...rest] = process.argv.slice(2);
if (!cmd || !channelArg) fail("usage: list|react|reply <#channel> … | notify <text>");

// Form-encoded, not JSON: some methods (chat.getPermalink) take only that.
// A call with no arguments goes without a body: Slack sits on an empty form
// POST until it times out (408 after three minutes).
const api = async (method, params = {}) => {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) body.set(k, String(v));
  const t0 = Date.now();
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body.size ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body.size ? { body: body.toString() } : {}),
  });
  const text = await res.text();
  if (process.env.SLACK_DEBUG) console.error(`${method} ${res.status} ${Date.now() - t0}ms ${text.slice(0, 60)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    fail(`${method}: ${res.status} ${text.slice(0, 200)}`);
  }
  if (!json.ok) fail(`${method}: ${json.error}`);
  return json;
};

const dmWith = async (handle) => {
  const wanted = handle.replace(/^@/, "").toLowerCase();
  let cursor;
  do {
    const page = await api("users.list", { limit: 200, cursor });
    const hit = page.members.find(
      (u) =>
        !u.deleted &&
        [u.name, u.real_name, u.profile?.display_name]
          .filter(Boolean)
          .some((n) => n.toLowerCase() === wanted),
    );
    if (hit) return (await api("conversations.open", { users: hit.id })).channel.id;
    cursor = page.response_metadata?.next_cursor || undefined;
  } while (cursor);
  fail(`no one called ${handle} in this workspace`);
};

// What `list` says about a file: enough to know a video is there before
// `media` is asked to fetch it.
const fileInfo = (f) => ({ id: f.id, name: f.name, mimetype: f.mimetype, size: f.size });
const withFiles = (m, o) => ((m.files ?? []).length ? { ...o, files: m.files.map(fileInfo) } : o);

const channelId = async (name) => {
  if (/^[CGD][A-Z0-9]+$/.test(name)) return name;
  if (name.startsWith("@")) return dmWith(name);
  const wanted = name.replace(/^#/, "");
  let cursor;
  do {
    const page = await api("conversations.list", {
      types: "public_channel,private_channel",
      exclude_archived: true,
      limit: 200,
      cursor,
    });
    const hit = page.channels.find((c) => c.name === wanted);
    if (hit) return hit.id;
    cursor = page.response_metadata?.next_cursor || undefined;
  } while (cursor);
  fail(`no channel named #${wanted} (is the token's user a member?)`);
};

if (cmd === "notify") {
  const text = [channelArg, ...rest].join(" ");
  const me = (await api("auth.test")).user_id;
  const dm = (await api("conversations.open", { users: me })).channel.id;
  await api("chat.postMessage", { channel: dm, text, unfurl_links: false });
  process.exit(0);
}

const channel = await channelId(channelArg);

if (cmd === "list") {
  const days = Number(rest[0] ?? 7);
  const oldest = String(Date.now() / 1000 - days * 86400);
  const out = [];
  let cursor;
  do {
    const page = await api("conversations.history", { channel, oldest, limit: 200, cursor });
    for (const m of page.messages) {
      if (m.subtype && m.subtype !== "thread_broadcast") continue; // joins, pins, bots
      const msg = withFiles(m, {
        ts: m.ts,
        user: m.user,
        text: m.text,
        reactions: (m.reactions ?? []).map((r) => r.name),
        permalink: (await api("chat.getPermalink", { channel, message_ts: m.ts })).permalink,
        replies: [],
      });
      if (m.reply_count) {
        const t = await api("conversations.replies", { channel, ts: m.ts, limit: 200 });
        msg.replies = t.messages.slice(1).map((r) => withFiles(r, { ts: r.ts, user: r.user, text: r.text }));
      }
      out.push(msg);
    }
    cursor = page.response_metadata?.next_cursor || undefined;
  } while (cursor);
  out.sort((a, b) => Number(a.ts) - Number(b.ts));
  const me = (await api("auth.test")).user_id;
  console.log(JSON.stringify({ me, messages: out }, null, 2));
} else if (cmd === "react") {
  const [timestamp, name] = rest;
  if (!timestamp || !name) fail("react <#channel> <ts> <emoji>");
  await api("reactions.add", { channel, timestamp, name: name.replace(/:/g, "") });
} else if (cmd === "reply") {
  const [thread_ts, ...words] = rest;
  const text = words.join(" ");
  if (!thread_ts || !text) fail("reply <#channel> <ts> <text>");
  await api("chat.postMessage", { channel, thread_ts, text, unfurl_links: false });
} else if (cmd === "media") {
  const [ts, outArg] = rest;
  if (!ts) fail("media <#channel> <ts> [outDir]");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const outDir = outArg ?? join("/tmp/slack-media", ts.replace(".", "-"));
  await mkdir(outDir, { recursive: true });
  // The message and its whole thread: a video is as often a reply as a post.
  const thread = (await api("conversations.replies", { channel, ts, limit: 200 })).messages;
  const files = thread.flatMap((m) => (m.files ?? []).map((f) => ({ ...f, message_ts: m.ts })));
  if (!files.length) {
    console.log(JSON.stringify({ outDir, files: [] }));
    process.exit(0);
  }
  const { watch, isVideo, isAudio } = await import("../tools/slack-media/watch.mjs");
  const out = [];
  for (const f of files) {
    const url = f.url_private_download ?? f.url_private;
    if (!url) continue; // a file the token cannot see, or an external one
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok || (res.headers.get("content-type") ?? "").startsWith("text/html"))
      fail(`${f.name}: ${res.status} (does the token have files:read?)`);
    const path = join(outDir, `${f.id}-${f.name.replace(/[^\w.-]+/g, "_")}`);
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    const item = { ...fileInfo(f), message_ts: f.message_ts, path };
    if (isVideo(f.mimetype, f.name) || isAudio(f.mimetype, f.name)) {
      console.error(`watching ${f.name}…`);
      const w = await watch(path, join(outDir, f.id));
      item.transcript = w.transcript.path;
      item.text = w.transcript.text;
      item.frames = w.frames.map((x) => x.path);
    }
    out.push(item);
  }
  console.log(JSON.stringify({ outDir, files: out }, null, 2));
} else {
  fail(`unknown command ${cmd}`);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
