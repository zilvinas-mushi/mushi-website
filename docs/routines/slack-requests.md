# Routine: Slack requests → production

A scheduled Claude Code routine (claude.ai/code/routines) runs this every
morning. It reads one Slack conversation in the Mushi workspace (a channel, or the
direct messages with one person), builds whatever
site change was asked for, opens a pull request with auto-merge, and reports
back in the thread. CI (`.github/workflows/ci.yml`) is the only thing that
puts it on `main`, and `main` is what Cloudflare deploys.

## Setup

The routine talks to Slack through `scripts/slack-requests.mjs` and a user
token, not a connector: Slack's MCP server would not take a connection from
an app of our own (2026-10-11), and a token cannot expire mid-run. The token
is the **User OAuth Token** of the "Claude" app in the Mushi workspace
(api.slack.com/apps/A0C8EAS6GN5 → Install App). It lives in the routine's
cloud environment as `SLACK_MUSHI_TOKEN`, and the environment's network
access allows `slack.com`. It is never committed.

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
bug, a performance complaint. Anything else is left alone:

- questions and chatter: no reaction, no reply;
- a request for the webapp (app.mushi.agency, accounts, login, the
  dashboard): reply in the thread that it belongs to the webapp repo, react
  with :arrow_right:, do not touch this repo;
- a price, a plan, a Stripe link, anything under Payments in CLAUDE.md:
  reply that pricing is changed by a person and point at
  `src/lib/pricing.ts`; react with :no_entry:.

## State lives in Slack reactions

The routine has no memory between runs. Reactions are the ledger:

| reaction | meaning |
| --- | --- |
| :eyes: | picked up this run, in progress |
| :white_check_mark: | PR opened with auto-merge, link in the thread |
| :question: | too ambiguous to build; a question was asked in the thread |
| :x: | tried and failed; the failure is explained in the thread |
| :arrow_right: / :no_entry: | out of scope, see above |

Every run:

1. `node scripts/slack-requests.mjs list "#CHANNEL" 7` prints the last 7
   days as JSON: every message with its reactions, its thread replies and
   its permalink, and `me`, the token's own user id. In a DM only the
   other person's messages are requests; anything from `me` is a reply. An
   answer in the thread of a :question: message turns the question into a
   request.
2. A message that already carries any reaction from the table is done. Skip
   it. Only unreacted messages, and :question: ones with a new answer, are
   work.
3. `node scripts/slack-requests.mjs react "#CHANNEL" <ts> eyes` before
   starting a request, so a second run cannot pick it up. Every reaction
   and reply below goes through the same script:
   `react "#CHANNEL" <ts> <emoji>` and `reply "#CHANNEL" <ts> <text>`.

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
7. React :white_check_mark: on the message. That is the signal; the thread
   gets one line, the PR link, nothing more.

If CI goes red on a PR from an earlier run (check `gh pr list --author @me`
first thing), fix it on that branch before taking new work; the routine in
`.claude/skills/fix-ci` is the procedure.

## When not to build

- The message could mean two materially different things: ask one question
  in the thread, react :question:, move on. Do not guess at a visible change.
- The request needs a server, an API route, a database, or anything
  CLAUDE.md forbids: reply that the site is static and say what the nearest
  possible version is; react :question:.
- The request needs an asset that is not in the message or the repo (a new
  photo, a logo, a video): ask for it in the thread; react :question:.
- Something went wrong and could not be fixed in the run: reply with what
  was tried and what failed, react :x:, leave the branch pushed.

## Never

- Push to `main`, lift branch protection, or merge without CI.
- Change `src/lib/pricing.ts`, anything under `stripe/`, or a payment link.
- Lower image quality or widen the paint gate to pass a check.
- Delete or rewrite content nobody asked about.
- Reply outside the request's thread, or message anyone directly.
