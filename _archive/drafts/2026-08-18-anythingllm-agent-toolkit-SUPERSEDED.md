---
layout: post
date: 2026-08-18 21:00:00 -0400
last_modified_at: 2026-08-18 21:00:00 -0400
title: "Fifteen Ways to Ask, Three Ways to Touch"
description: "Fifteen custom agent skills and five flows in AnythingLLM Desktop — read-only by default, three named exceptions that write, two failures the app taught me, and a deploy that reconciles itself from git."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- anythingllm
- automation
- safety
image:
  path: "/images/unsplash/anythingllm-agent-toolkit.jpg"
  alt: "A dark workshop slat wall under neon light, every hand tool clipped into a holder of its own"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
AnythingLLM Desktop on my workstation now has a toolbelt: fifteen custom agent skills and five flows that let me ask a chat window how the lab is doing, what's on the GPU, what the board says, whether my backups are healthy. All of them may look, and none of them may guess. Three of them may write, each inside a fence I can describe in one sentence.

This post is about the toolbelt, the two failures that shaped how it gets used, and the part I finished tonight — the deploy that happens without me.

<!--more-->

# Fifteen Ways to Ask, Three Ways to Touch

## Why a chat window at all

The lab already has [Helen for voice]({% post_url 2026-08-11-helen-voice-commands %}), [an operator console for glancing]({% post_url 2026-07-12-react-operator-ui-heartbeat-dashboard %}), and `make` targets for doing. What it didn't have was a place to *ask questions with follow-ups*. "How is the lab right now — okay, and is that model on the GPU the one that should be? — and did my push actually land?" is a conversation, and conversations happen in a chat window.

So the desktop copy of AnythingLLM grew a set of custom agent skills, one per question I actually ask. Lab status from [the heartbeat service]({% post_url 2026-07-04-heartbeat-service-single-pane %}). GPU occupancy from Atlas, including a check for the too-big model set that once had Atlas loading models 529 times in an hour. RAG queries against my journals, with the routing mode and sources reported so an ungrounded answer is visible as one. Backup age per tier. The project board — read it, move a card, comment, with every comment stamped by the tool that made it so threads stay attributable. Recent deploy runs, service logs, the git changelog, the food log, the calendar, campsite availability. Start a message with `@agent` and ask.

Every one of them follows the same doctrine the rest of the lab does: **fail closed**. An unreachable service is reported red, or unknown-treated-as-red. It is never guessed healthy. A skill that can't gather evidence says so and points at the runbook, because a plausible answer with no evidence under it is worse than no answer — it's the confident stale reading again, wearing a different hat.

I'll admit something here: I've never warmed to the ChatGPT shape of this technology — the hosted assistant, someone else's orchestration, capabilities that appear and vanish with a product release, a system whose limits I can neither read nor set. The tools I actually reach for are the other kind: Aider, [AnythingLLM]({% post_url 2026-06-15-adr-anythingllm %}), VS Code, a model called directly by a script I wrote. Same models underneath. The difference is who holds the orchestration. This toolbelt is a chat window, but every capability in it is a file in my repo — gated in CI, synced by hash, revocable by deleting it. The conversation is just the surface. The brain is under version control.

## The three exceptions, named out loud

Read-only is the default, and defaults invite quiet exceptions, so the exceptions are loud instead. There are exactly three skills that write, and each has a write surface I can state in one sentence.

The **copy editor** writes a report and an edited draft into its own artifact directory, and never into the blog's `_posts/` — publishing stays a human act. The **board skill** writes to the project board API, because a board that can't be written to isn't a board; it can touch nothing else. And **feature-to-card** creates one card from a spec file, with a `dry_run` mode that shows the card without making it — and if the drafting model is dead, it produces no card rather than a plausible one.

There used to be a fourth. The calendar skill could write until mid-August, and then the lab adopted a one-writer-per-source rule: work imports arrive by script, the personal calendar syncs itself, and the skill went read-only. Taking a capability *away* from an agent tool felt strange for about a day and correct ever since.

## The copy editor, briefly, because it's the interesting one

The copy editor is a pipeline, not a prompt. It resolves a post URL to its source markdown, extracts checkable claims in chunks (one call over a whole post made the model return an empty list — a lesson in itself), then gathers evidence per claim two ways at once: semantic retrieval from the docs corpus for recall, and a deterministic grep for exact identifiers — ports, IPs, model names — because an embedding smears exactly the tokens that matter. Verdicts come strictly from that evidence. Silence is `unverified`, never support, and `contradicted` requires a quoted line. Then a prose pass, then a structural check on the Jekyll front matter.

The documentation is the ground truth in that pipeline, not the model. If retrieval is down, the skill says so and degrades to grep-only rather than letting the model fill in.

Why is this a skill and not one of the flows? Because AnythingLLM flows have exactly four step types, run linearly, and cannot read files, loop, or write output. The flows are for the linear things — morning and evening briefings, a pre-push gate that answers `CLEAR TO PUSH` or `HOLD THE PUSH` before I restart the whole voice pipeline by pushing to `main`, a quick inline review, and a drafting flow with an adversarial fact-check baked into its five turns. That last one exists because an agent draft once invented a saying, invented version numbers, and quietly renamed a snapshot-gated rebuild into something automatic. The flow now hunts specifically for those failure classes, and a run that doesn't end in its verdict block didn't go through the flow.

And to say it plainly, because the briefing flows sit near her territory: Helen's [captain-awareness reports]({% post_url 2026-08-05-captain-awareness-reports %}) remain deterministic and model-free. The flows are desktop conveniences. They must never be mistaken for that path, or wired into it.

## Two things the app taught me the hard way

**The tool reranker crashes the backend.** Past fifteen attached tools — a line the lab clears easily at forty-one, counting the app's own built-ins — AnythingLLM's *Intelligent Skill Selection* reranks them with a native cross-encoder before every agent turn, and on this machine that step killed the node backend outright: a kernel `int3` trap, "Failed to fetch" in the UI, the API port gone silent while the window sits there looking fine. Two out of three attached-document runs. It's off now, set in the environment with the app closed, and the installer warns if it ever finds it back on. A feature that decides *which* tools the model sees turned out to be less reliable than the model just seeing all of them.

**Attachments reach a skill by name, not by content.** The app injects an uploaded document into the prompt, which means the tool call sees only what the model retypes — and a 14B model does not retype 25 KB. The fix is to stop pretending otherwise: the skill takes the attachment's *filename*, finds the upload on disk itself, and prefers the original file the upload came from, so a spec attached from the repo gets carded under its repo path. Any future skill that accepts a file does the same.

There's a usage rule that fell out of the same investigation: **ask for a card in a fresh thread, with one attachment.** Parsed files persist per thread and are injected into every later agent turn, so a retry in an old thread carries every copy ever attached — and with forty-one tool schemas already eating six thousand tokens of every prompt, two stale READMEs push a 16k agent window past the point where the model still calls a tool. It summarizes instead, politely, which is somehow worse than an error.

## The deploy that happens without me

Until tonight, getting a changed skill from the repo into the app's storage directory meant me, running an idempotent install script. The gap bothered me the way every human-shaped gap in this lab eventually does: the repo would move and the desktop would quietly fall behind it.

The push-triggered deploy can't fix this — the runner lives on another machine and can't reach this desktop's storage, and this desktop sleeps, so a second runner here would just queue jobs against a host that's off. The answer is the same one the cluster uses: **the target reconciles itself from git.**

A CI gate runs on every push and checks the things a human reviewer would eventually miss — every declared parameter is actually read by its handler, every handler loads, no cloud-AI hosts, no retired addresses, the docs name every skill and agree with the code about who may write. Then a systemd user timer on this machine fetches `origin/main` into a disposable sparse checkout every fifteen minutes — never the dev tree, because a half-finished handler edit must not become a live tool — compares the git *tree hash* of the toolkit directory with the last install, and reinstalls only on change, recording what it did to a state file.

The details I'm fond of: the timer is persistent, so a tick missed asleep fires on wake. Offline is not an error — a failed fetch logs and the run continues with what's on disk, which also means a run that fetched but failed to install gets its retry. And the sync script can safely replace *itself* mid-run, because its whole body is one function and bash parses a function before executing it.

The sync also knows what it doesn't own. Per-skill toggles, user-edited host addresses, the reranker setting — those live in the app's database and environment, not in files the repo ships. The reranker is *checked* every tick; flipping it stays a human step, with the app closed.

## If you're building one of these

Write the doctrine before the first skill. Mine fits on an index card: read-only by default, fail closed, exceptions named with a bounded write surface, local endpoints only, and every handler returns a string — an explanatory one on failure, never a raw throw. Every skill since has been a fill-in-the-blanks exercise against that card, and the two that write got argued about *because the card made writing an event*.

And when the platform hands you a convenience — a reranker, an attachment injector — test it against your actual tool count and your actual file sizes before trusting it. Both of my hard lessons were features working exactly as designed, at a scale the design hadn't met.

Questions about any of it, drop me a [note](mailto:jeffbreece@outlook.com).

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Jakub Żerdzicki](https://unsplash.com/@jakubzerdzicki?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral) — a wall of hand tools, each one clipped into a holder cut for it and nothing else. Which is the whole argument of this post: a tool you can see, reach for, and take back down._
