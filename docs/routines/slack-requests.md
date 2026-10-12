# Routine: Slack requests → production

A scheduled Claude Code routine (claude.ai/code/routines) runs this every
morning. It reads one Slack conversation in the Mushi workspace (a channel, or the
direct messages with one person), builds whatever
site change was asked for, opens a pull request with auto-merge, and tells
Žilvinas. The requester only ever sees reactions. CI (`.github/workflows/ci.yml`) is the only thing that
puts it on `main`, and `main` is what Cloudflare deploys.

## Setup

The routine talks to Slack through `scripts/slack-requests.mjs` and a user
token, not a connector: Slack's MCP server would not take a connection from
an app of our own (2026-10-11), and a token cannot expire mid-run. The token
is the **User OAuth Token** of the "Claude" app in the Mushi workspace
(api.slack.com/apps/A0C8EAS6GN5 → Install App). It lives in the routine's
cloud environment as `SLACK_MUSHI_TOKEN`, and the environment's network
access allows `slack.com`. It is never committed.

A request is often a video. The script watches them itself, for free:
`media` downloads the message's files and, for each video or voice note,
writes a transcript with timestamps and a dozen frames
(`tools/slack-media/watch.mjs`: ffmpeg and Whisper, on the CPU, no key).
For that the token needs the `files:read` scope, the environment's network
access allows `files.slack.com` and `huggingface.co` (the model, ~250 MB,
fetched once and cached), and the run starts with
`npm ci --prefix tools/slack-media`. Chrome's own speech recognition is no
use here: it needs a live microphone and cannot take a file.

The routine's prompt on claude.ai is one line:

> Follow docs/routines/slack-requests.md in this repository. The channel is
> #CHANNEL.

or, for direct messages, `The channel is @name.` Wherever `#CHANNEL`
appears below, the prompt's value goes, `@name` included: the script takes
both.

Everything else is here, so it is versioned and reviewed like code.

## What counts as a request

A message in the channel, or a thread reply, that asks for a change to the
marketing site (mushi.agency): copy, layout, a new section, an image swap, a
bug, a performance complaint. It may be typed, or it may be a screen
recording, a voice note or a screenshot with a line of text: those are
requests too, and the words in them count as much as typed ones. Anything
else is left alone:

- questions and chatter: no reaction, nothing;
- a request for the webapp (app.mushi.agency, accounts, login, the
  dashboard): react :arrow_right:, do not touch this repo;
- a price, a plan, a Stripe link, anything under Payments in CLAUDE.md:
  react :no_entry: and `notify` Žilvinas with the permalink; a person
  changes those in `src/lib/pricing.ts`.

## State lives in Slack reactions

The routine has no memory between runs. Reactions are the ledger:

| reaction | meaning |
| --- | --- |
| :eyes: | picked up this run, in progress |
| :white_check_mark: | PR opened with auto-merge, link sent to Žilvinas |
| :question: | too ambiguous to build; the question went to Žilvinas |
| :x: | tried and failed; the failure went to Žilvinas |
| :arrow_right: / :no_entry: | out of scope, see above |

Every run:

1. `node scripts/slack-requests.mjs list "#CHANNEL" 7` prints the last 7
   days as JSON: every message with its reactions, its thread replies and
   its permalink, and `me`, the token's own user id (Žilvinas). In a DM
   only the other person's messages are requests. A thread reply from `me`
   under a :question: message is Žilvinas's answer: it turns the question
   into a request, built as he says.
2. A message that already carries any reaction from the table is done. Skip
   it. Only unreacted messages, and :question: ones with a new answer, are
   work.
   A message with `files` on it (or on a reply) is read with
   `node scripts/slack-requests.mjs media "#CHANNEL" <ts>` before deciding
   anything: it prints, per file, where it was saved and, for a video, its
   transcript and frames. Read the transcript and look at every frame and
   screenshot (the Read tool shows an image) — the request is usually in
   the pictures as much as in the words, and the frames show which page and
   which element is meant. A video of the webapp (app.mushi.agency) is the
   webapp's, as below.
3. `node scripts/slack-requests.mjs react "#CHANNEL" <ts> eyes` before
   starting a request, so a second run cannot pick it up. Everything the
   routine says goes to Žilvinas, in his own DM, through the same script:
   `notify <text>`. Every such message starts with the request's permalink.
   Nothing is ever written to the requester; `reply` exists but is not used.

## Building a request

One request is one branch, one PR, one green check mark. Several requests in one
morning are several PRs, built one after another from a fresh `main`.

1. `git checkout -b claude/slack-<short-slug>` from `origin/main`.
2. Read `CLAUDE.md` and `design/README.md` first; they are the rules of this
   repo and they are strict (paint gate, image loading, where files live,
   button hover, SEO). A change that breaks one of them is not done.
3. Build it. Keep to what was asked; do not redesign around it.
4. Check before pushing, in this order, and fix what goes red:
   - `npm run lint`
   - `npx next build`
   - `npm run pages:check` when images, loading, or the paint gate changed
     (first `npm ci --prefix tools/page-quality`)
   - `npm run checkout:check` when anything under `src/components/checkout`
     or `src/lib/checkout.ts` changed
   `npm test` needs a Stripe key the routine does not have; CI runs it.
5. Commit with a message that says what changed and why, in a sentence; quote
   the Slack request in the body.
6. Push, then:
   ```
   gh pr create --fill --title "<one line>" --body "<what, why, Slack permalink>"
   gh pr merge --auto --squash
   ```
   CI takes about five minutes. It merges itself when green and Cloudflare
   deploys `main`. Do not wait for it.
7. React :white_check_mark: on the message. That is the signal. `notify`
   Žilvinas one line: the permalink, the PR link.

If CI goes red on a PR from an earlier run (check `gh pr list --author @me`
first thing), fix it on that branch before taking new work; the routine in
`.claude/skills/fix-ci` is the procedure.

## When not to build

- The message could mean two materially different things: `notify`
  Žilvinas the question, react :question:, move on. Do not guess at a
  visible change. He answers in the request's thread.
- The request needs a server, an API route, a database, or anything
  CLAUDE.md forbids: `notify` Žilvinas that the site is static and what the
  nearest possible version is; react :question:.
- The request needs an asset that is not in the message or the repo (a new
  photo, a logo, a video): `notify` Žilvinas what is missing; react
  :question:.
- Something went wrong and could not be fixed in the run: `notify` Žilvinas
  what was tried and what failed, react :x:, leave the branch pushed.

## Never

- Push to `main`, lift branch protection, or merge without CI.
- Change `src/lib/pricing.ts`, anything under `stripe/`, or a payment link.
- Lower image quality or widen the paint gate to pass a check.
- Delete or rewrite content nobody asked about.
- Write to the requester or to anyone but Žilvinas. The requester sees
  reactions, nothing else.
