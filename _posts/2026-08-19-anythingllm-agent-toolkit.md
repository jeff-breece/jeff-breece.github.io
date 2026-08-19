---
layout: post
date: 2026-08-19 07:00:00 -0400
last_modified_at: 2026-08-19 07:00:00 -0400
title: "Putting the Lab in a Chat Window: Agent Skills, Flows, and CI/CD for AnythingLLM"
description: "Fifteen custom agent skills and five flows in AnythingLLM Desktop, the CI gate and pull-based sync that deploy them without me, and an honest accounting of the value I expect to get back."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- anythingllm
- automation
- ci-cd
image:
  path: "/images/unsplash/anythingllm-agent-toolkit.jpg"
  alt: "A dark workshop slat wall under neon light, every hand tool clipped into a holder of its own"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
My desktop copy of AnythingLLM now has fifteen custom agent skills and five flows. They answer the questions I actually ask about the lab: how it's doing, what's on the GPU, whether the backups ran, whether my push landed. All of them read. Three of them write, and each one's write surface fits in a single sentence.

This post is about what got built, how it now ships itself from git without me running anything, and what I expect all of it to be worth. That last part is a forecast, not a measurement, and I'd rather say so up front than pretend otherwise.

<!--more-->

# Putting the Lab in a Chat Window

## The gap I was actually filling

The lab already has [Helen for voice]({% post_url 2026-08-11-helen-voice-commands %}), [an operator console for glancing]({% post_url 2026-07-12-react-operator-ui-heartbeat-dashboard %}), and `make` targets for doing.

What it didn't have was a place to ask a question and then ask a second question about the answer.

That sounds small. In practice it's the whole cost of checking on this thing. Services means the heartbeat dashboard. Logs means SSH. Deploys means `gh run list`. The doc stager means a different SSH, because it has no HTTP API by design. Every one of those is fine on its own. The problem is that I have to pick the door before I know what I'm asking, and the follow-up question almost always lives behind a different door than the first one.

So the question I was answering wasn't "can local AI answer questions about my lab." It could already. The question was:

> Can I have one place where a question is cheap, and the second question is cheaper?

A chat window is good at exactly that. It's bad at other things, which is most of the rest of this post.

## What got built

Fifteen skills, one per question I actually ask. Every one of them is a folder in my repo with a `plugin.json` and a `handler.js`, installed into the app's storage directory by a script.

| Skill | The question | Where the evidence comes from |
|---|---|---|
| `resonance-lab-status` | How is the lab right now? | [Heartbeat]({% post_url 2026-07-04-heartbeat-service-single-pane %}) `:8087`, polled before anything else |
| `resonance-backup-status` | Are my backups healthy? | Heartbeat `/api/backup`, per-tier age against threshold |
| `resonance-atlas-gpu` | What's on the GPU? Is it thrashing? | [Atlas]({% post_url 2026-07-02-gpu-inference-atlas-jetson %}) Ollama `/api/ps` and `/api/tags` |
| `resonance-rag-ask` | What did my journals say about… | [rag-service]({% post_url 2026-07-26-rag-service-architecture %}) `/v1/ask`, reporting routing mode and sources |
| `resonance-lab-changelog` | What changed in the lab this week? | `git log --since` on the local checkout |
| `resonance-doc-stager` | Did the stager pick up my file? | SSH to lab-stt: timer schedule, `--status` counts, manifest grep |
| `resonance-deploy-watch` | Did my push land? | `gh run list` **and** heartbeat services |
| `resonance-service-logs` | Last 20 lines of rag-service? | SSH `journalctl`, against a hardcoded allowlist |
| `resonance-intent-probe` | Where would the [gateway]({% post_url 2026-07-18-gateway-service-architecture %}) route this? | Gateway `:8003`, running the full route |
| `resonance-board` | What's on the board? Move card 12. | Project Board API, the local tracker of record |
| `resonance-feature-to-card` | Make a card out of this spec. | A `.feature` or markdown file, drafted by `qwen3:14b` on Atlas |
| `resonance-blog-copyedit` | Fact check and copy edit this post. | Docs corpus plus deterministic grep |
| `resonance-food-log` | What have I logged today? | [health-coach]({% post_url 2026-07-30-health-coach-deterministic-workouts %}) daily summary through heartbeat's proxy |
| `resonance-calendar` | What's on my calendar this week? | Heartbeat `/api/appointments` |
| `resonance-campwatch` | Any campsites open? | CampWatch API `:8080` and the camply bridge status |

Start a message with `@agent` and ask. The skills hot-reload per invocation, so there's no app restart in the loop.

Two of those entries deserve a note, because they're the ones where the design decision is visible.

`resonance-deploy-watch` checks two sources and refuses to trust either alone. A green workflow with red services is reported as *not landed*, because that's the state I actually care about, and the workflow badge doesn't know it.

`resonance-intent-probe` says out loud that it can't do what you'd want. There's no classify-only endpoint on the gateway, so probing an utterance runs the full route, inference and all. The skill tells you that, then points at the `hop=classifier` log line if you want the cheap answer. I'd rather have a tool that admits its side effects than one that hides them.

## The rules all fifteen follow

I wrote the doctrine before I wrote the first skill. It fits on an index card:

```text
Read-only by default.
Fail closed.
Exceptions named, with a write surface I can state in one sentence.
Local endpoints only.
Every handler returns a string, including on failure. Never a raw throw.
```

**Fail closed** is the one that matters most. An unreachable service is reported red, or unknown-treated-as-red. It is never guessed healthy. A skill that can't gather evidence says so and points at the runbook.

That rule exists because the alternative is worse than useless. A plausible answer with nothing under it is the confident stale reading in a new outfit, and I've already written [a whole post]({% post_url 2026-08-05-captain-awareness-reports %}) about why I don't accept those from Helen. I'm not going to accept them here because the surface is friendlier.

**Local endpoints only** is the other one worth defending. No skill calls a cloud model. Escalating to a bigger model buys reasoning, not knowledge of my lab, and it's a choice I make by name in the editor tiers, never something a skill does quietly on my behalf.

## The three that write

Read-only as a default invites quiet exceptions, so I made the exceptions loud.

**`resonance-blog-copyedit`** writes `report.md` and `edited.md` into its own artifact directory. It never writes into `_posts/`. Publishing an edit stays a human decision.

**`resonance-board`** writes to the project board API and nothing else. A board that can't be written to isn't a board. Its comments are stamped with the tool that made them, so threads stay attributable.

**`resonance-feature-to-card`** creates one card from a spec file. It has a `dry_run` mode that shows the card without making it, and if the drafting model is dead it produces no card rather than a plausible one.

There used to be a fourth. The calendar skill could write until mid-August, and then the lab adopted a one-writer-per-source rule: work imports arrive by script, the personal calendar syncs itself, and the skill went read-only. Taking a capability away from an agent tool felt strange for about a day and correct ever since.

## The copy editor is the interesting one

It's a pipeline, not a prompt. Six steps per invocation:

1. Resolve the post URL to its source markdown.
2. Extract checkable claims, in chunks.
3. Gather evidence for each claim two ways at once.
4. Render verdicts strictly from that evidence.
5. Prose pass, preserving voice, markdown and code blocks.
6. Deterministic structure check on the Jekyll front matter.

Step three is the part I'd reuse anywhere. Semantic retrieval from the docs corpus gives recall. A deterministic grep gives exact identifiers: ports, IPs, model names. You need both, because an embedding smears precisely the tokens that matter. `10.0.100.10` and `10.0.100.11` are neighbors in vector space and completely different machines in my house.

Step four is fail-closed applied to language. Silence is `unverified`, never support. `contradicted` requires a quoted line. The documentation is the ground truth in that pipeline, not the model, and if retrieval is down the skill says so and degrades to grep-only instead of letting the model fill in the gap.

Step two taught me something dumb and useful: one call over a whole post made the model return an empty list. Chunk it and the same model does fine. Half of this work is finding the size at which a thing stops working.

## The flows, and why they're not skills

AnythingLLM flows have exactly four step types, run linearly, and cannot read local files, loop, or write output. That constraint decides the split cleanly:

```text
Flow  = linear, fetch then reason, answer in chat, nothing written
Skill = anything that needs a file, a loop, a branch, or an output
```

There are five:

- **`lab-morning-briefing`** and **`lab-evening-briefing`** — heartbeat, then backups, then under 120 words with the worst news first. The evening one is framed differently: what's wrong going into the night, and whether it can wait until morning.
- **`pre-push-gate`** — services, then backups, then one line: `CLEAR TO PUSH` or `HOLD THE PUSH`. Every push to `main` restarts the entire voice pipeline, so pushing into an already-degraded lab compounds an outage I already have. It informs the human holding the push. It gates nothing mechanically, and I want it that way.
- **`blog-quick-review`** — scrape a URL, one inline review pass, nothing written.
- **`draft-post-with-fact-check`** — five fixed turns: fact ledger, draft with per-claim markers, adversarial fact-check against the ledger, correction pass, final gate.

Four of them start by fetching evidence and hand it to an LLM step that is forbidden from claiming anything the JSON doesn't show. A failed fetch aborts the flow instead of letting the model improvise. The drafting one is the exception, LLM-only from end to end.

That last flow exists because of a specific incident. An agent draft invented a saying, invented version numbers, and quietly renamed a snapshot-gated rebuild into something automatic. Three different failure classes in one document, all of them fluent. The flow now hunts for exactly those classes, and a run that doesn't end in its verdict block didn't go through the flow. That block is the signature.

One thing I want stated plainly, because the briefing flows sit near her territory: Helen's captain-awareness reports remain deterministic and model-free. These flows are desktop conveniences. They must never be mistaken for that path, or wired into it.

## Shipping it: the part I finished yesterday

Until yesterday, getting a changed skill from the repo into the app's storage directory meant me, running an idempotent install script.

That bothered me the way every human-shaped gap in this lab eventually does. The repo moves, the desktop quietly falls behind, and I find out when a tool does something the code says it stopped doing two weeks ago.

The obvious fix doesn't work here. My push-triggered deploy runs on the lab-stt runner, which cannot reach this desktop's storage directory. And this desktop sleeps, so standing up a second runner on it would just queue Actions jobs against a host that's off.

So the toolkit ships the way [the cluster does]({% post_url 2026-07-08-deployment-systemd-k3s-two-platform %}): **the target reconciles itself from git.**

| Layer | What it does | Where it runs |
|---|---|---|
| **Gate** | Folder name equals `hubId`. Every declared parameter is actually read by its handler. Every handler loads under node. No cloud-AI hosts, no retired addresses. Every flow has a pinned UUID and only legal step types. `install.sh` deletes nothing. The docs name every skill and agree with the code about who may write | CI, on every push |
| **Sync** | Fetches `origin/main` into a disposable sparse checkout, compares the git tree hash of the toolkit directory against the last install, runs `install.sh` only when it changed, records commit, tree, timestamp and check result to a state file | This desktop, every 15 minutes |
| **Smoke** | `install.sh --check` after each install: app up, reranker off. Recorded, but informative only | Same tick |

```bash
make anythingllm-sync-install   # once: bootstrap, install and enable the timer
make anythingllm-sync           # reconcile now; ARGS=--force reinstalls regardless
make anythingllm-sync-status    # timer state, last deploy record, recent journal
```

Four details I'd carry into any pull-based deploy:

**Never sync from the dev tree.** The checkout is disposable and sparse, and it tracks `origin/main` only. A half-finished handler edit sitting in my working copy must not become a live tool because a timer fired at the wrong moment.

**Compare tree hashes, not timestamps.** The sync asks git one question: is the toolkit directory the same object it was at the last install? That's cheap, exact, and immune to touched files.

**The timer is persistent, and offline is not an error.** A tick missed while the machine was asleep fires on wake. A failed fetch is logged and the run continues with what's already on disk, which also means a previous run that fetched but failed to install still gets its retry.

**The sync script can replace itself mid-run.** Its whole body is one `main()` function, and bash parses a function before executing it. A run that overwrites its own file finishes on the old text. That one made me happy out of proportion to its importance.

The sync also knows what it doesn't own. Per-skill enable toggles, user-edited host addresses, and the reranker setting live in the app's database and environment, not in files my repo ships. The reranker gets *checked* every tick. Flipping it stays a human step, with the app closed.

There's a second layer of testing under all of that, and it's the layer I trust:

| | What it proves |
|---|---|
| Handler unit tests | The real handler under node against a fake Atlas and a fake board: attachment resolution, dead model produces no card, context settings pinned |
| `make anythingllm-check` | App up, reranker off. Seconds |
| `make anythingllm-e2e` | One real `@agent` turn through the app: the model picks the skill, passes the right argument, the board is untouched on a dry run |

The middle column is the point. A test that only proves my JSON is well-formed proves nothing about whether a 14B model will pick the right tool.

## Two constraints the app handed me

Both of these were features working exactly as designed, at a scale the design hadn't met.

**The tool reranker crashes the backend.** Past fifteen attached tools, and this lab clears forty-one counting the app's built-ins, AnythingLLM reranks them with a native cross-encoder before every agent turn. On this machine that step killed the node backend outright: a kernel `int3` trap, "Failed to fetch" in the UI, the API port silent while the window sits there looking perfectly fine. Two out of three attached-document runs. It's off, and the installer warns if it ever comes back on. A feature that decides which tools the model sees turned out to be less reliable than the model just seeing all of them.

**Attachments reach a skill by name, not by content.** The app injects an uploaded document into the prompt, which means the tool call only sees what the model retypes, and a 14B model does not retype 25 KB. The fix was to stop pretending otherwise. The skill takes the attachment's filename, finds the upload on disk itself, and prefers the original file the upload came from. Any future skill that accepts a file does the same.

A usage rule fell out of the same investigation: ask for a card in a fresh thread, with one attachment. Parsed files persist per thread and get injected into every later agent turn. Forty-one tool schemas already eat about six thousand tokens of every prompt, so two stale READMEs push a 16k agent window past the point where the model still calls a tool. It summarizes instead, politely, which is somehow worse than an error.

## What I expect this to be worth

Everything above is built and running. This section is a forecast. I've been wrong about this kind of forecast before, so I'm writing down what I expect and how I'll know.

**The questions I don't currently ask.** This is the one I care about most. Checking the doc stager means an SSH session and remembering a flag, so I don't check it. I find out it missed a file later, indirectly, usually because something downstream is empty. Making a question cheap enough to ask casually means it gets asked, and the value isn't the answer. It's the check I would otherwise have skipped.

**Fewer trips through the wrong door.** Not new capability. Cheaper follow-ups. If "how is the lab, and is that the right model on the GPU, and did my push land" costs one thread instead of three tools, that's ten minutes a day that were pure navigation.

**Work that gets tracked instead of remembered.** The gap between writing a spec and having a card is exactly where things fall out of my system. If drafting a card costs one sentence in a chat window, more of the work I actually do ends up on the board, where I can see it a month later.

**Catching my own bad drafts.** The copy editor and the drafting flow both target one failure class: fluent, confident, wrong. Specifically wrong identifiers, wrong version numbers, and quiet reframings of how something works. A human reviewer catches those on a good day. Grep catches them every day.

**Being told instead of checking.** The briefings continue the shift the captain-awareness reports started. That change did more for my relationship with this lab than any single service in it.

**The compounding one.** Every capability in that chat window is a file in a repo. It's gated in CI, synced by hash, and revocable by deleting it. That changes what I'm willing to add. A capability I can take back is a capability I can experiment with, and I've been noticeably braver about adding skills since the sync went in than I was when adding one meant remembering to install it.

And one I didn't expect until I wrote the gate. The CI check that forces my docs to name every skill and agree with the code about who may write is *load-bearing for the copy editor*, because the docs are the retrieval corpus. Stale documentation doesn't just mislead me. It poisons the evidence that the fact-checking skill runs on. That's a tighter version of an argument I made about [load-bearing docs]({% post_url 2026-06-30-testing-practices-load-bearing-docs %}) back in June, and it's the first time I've had a test enforce it.

## Where I expect to be wrong

**Tool sprawl, which I flagged in [the original ADR]({% post_url 2026-06-15-adr-anythingllm %}) and then did anyway.** Fifteen skills is a lot of surface for one person. Some of these are going to turn out to be things I built because they were easy, not because I ask them. The honest test is sixty days from now: which ones have I actually invoked?

**The chat window may lose to the terminal.** For anything I do more than twice a week, a `make` target is faster than typing a sentence. If the skills only win on rare questions, that's still fine, but it's a smaller win than the one I'm describing here.

**Model quality is the ceiling.** All of this depends on a 14B model reliably picking the right tool and passing the right arguments. I've already watched it summarize instead of calling a tool when the context got crowded. The doctrine protects me from wrong *answers*. It does nothing about no answer at all.

**Fifteen minutes of drift is still drift.** The sync closes the gap between repo and desktop. It doesn't close it to zero, and there's a window where the thing in front of me isn't the thing in the repo. That's an acceptable trade, but it's a trade.

## Closing thoughts

I've never warmed to the hosted-assistant shape of this technology. Someone else's orchestration, capabilities that appear and vanish with a product release, limits I can neither read nor set. The tools I actually reach for are the other kind: Aider, AnythingLLM, VS Code, a model called directly by a script I wrote. Same models underneath. The difference is who holds the orchestration.

This toolbelt is a chat window, which is the friendliest surface in the lab. Underneath it, every capability is a file under version control, tested in CI, and installed by a timer that compares hashes. The conversation is the surface. The brain is in the repo.

That's the part I'd recommend to anyone building one of these. Write the doctrine before the first skill. Mine fits on an index card, and every skill since has been a fill-in-the-blanks exercise against it. The two that write got argued about, out loud, precisely because the card made writing an event instead of a default.

Questions about any of it, drop me a [note](mailto:jeffbreece@outlook.com).

## Terms I used

- **Agent skill** — A custom tool in AnythingLLM: a folder with a manifest and a JavaScript handler, invoked by the model during an `@agent` turn.
- **Flow** — AnythingLLM's linear, no-code chain of steps. Four step types, no file access, no loops, no output.
- **`hubId`** — The identifier in a skill's manifest. My CI gate requires the folder name to match it.
- **Fail closed** — Treating missing evidence as bad news rather than good news. Unknown is reported as red.
- **Tree hash** — Git's content hash for a directory. Comparing two of them answers "did anything in here change" exactly, without touching timestamps.
- **Sparse checkout** — A git working copy containing only the paths you asked for, rather than the whole repo.
- **Atlas** — The lab's GPU inference node.
- **Pangolin** — The workstation running AnythingLLM Desktop.
- **lab-stt** — The primary AI service host.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Jakub Żerdzicki](https://unsplash.com/@jakubzerdzicki?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral) — a wall of hand tools, each one clipped into a holder cut for it and nothing else. Which is the whole argument of this post: a tool you can see, reach for, and take back down._
