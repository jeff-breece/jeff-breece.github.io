---
layout: post
date: 2026-08-11 07:00:00 -0400
last_modified_at: 2026-08-11 07:00:00 -0400
title: "Helen Gets a Command Surface"
description: "Extending the lab's voice assistant from answering questions to running a fixed set of operations by voice — plus a real clock, general questions, and a menu that a test keeps honest."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- voice
- automation
- python
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Helen, the default voice of my lab assistant, picked up three new abilities this week: she can run a small set of real operations by voice, she can answer general questions instead of deflecting anything that isn't about the lab, and she can tell you what time it is without making it up. That last one sounds like a joke, but it was a real bug.

<!--more-->

# Helen Gets a Command Surface

## Where this started

I was uploading a data extract through the dashboard and the last step of that pipeline is an ingest job. My own runbook's answer for kicking it off was an SSH command with a `python -c` in it. Which is fine when I'm at a keyboard, and useless when I'm walking through the room with coffee asking the assistant to just do the thing.

So the question became: how do you let a voice assistant run jobs without opening the door I have spent this whole series keeping shut? I wrote in the [tier system post]({% post_url 2026-08-03-helen-tier-system %}) about keeping limits in code instead of prompts. Adding commands is the test of whether that design holds up when you actually lean on it.

## Speech selects, it never composes

The command surface is a catalogue. Every operation Helen can perform is written down ahead of time with its exact command — an argv list, never a string, never assembled from anything I said. Her only job at runtime is to figure out which entry I meant. If nothing matches, nothing runs.

There is no free-text path to a shell anywhere in this. I want to be plain about that because it is the entire design: the model picks from a menu, and the menu was written by me, in an editor, with the argv fixed. An utterance like "run the weekly ingest" matches a catalogue entry that curls a specific internal endpoint. The words I used select the entry. They never become part of the command.

Each entry carries a tier from the same authority system Helen already had:

- Reads act first and tell me after. "Is the internet down" just pings and answers. A read that asks permission is a gate you learn to switch off, so they don't ask.
- State changes propose first. Helen states what the action costs — not what it's called, what it *costs* — and asks. "Every queued run is merged into the corpus, and a run whose id already exists replaces the stored one. Shall I?"
- The forbidden set stays forbidden. Nothing on the menu can lower a hard refusal, and the refusal wording is still a constant.

The confirmation is scoped to the exact proposal, and it expires after a couple of minutes. A "yes" arriving late, or after a subject change, confirms nothing. That rule exists because "yes" is the most dangerous word in the whole system and I wanted it to mean one thing at a time.

## The transcript, because it's satisfying

Me: "Run the weekly ingest."

Helen: "I can do that. Every queued run is merged into the corpus, and a run whose id already exists replaces the stored one. Shall I?"

Me: "Yes, go ahead."

Helen: "The inbox was empty — nothing to process."

That last reply is my favorite part. The results of a job come back as JSON, and Helen never reads JSON out loud. Each catalogue entry has a small function that turns the outcome into a sentence: how many runs were processed, how many rows were refused, whether anything conflicts. An empty inbox is named as empty. If you have ever heard a text-to-speech engine attempt to pronounce a JSON payload, you know why I bothered.

## The clock, and a humbling bug

While I was in there, I fixed something that had been quietly embarrassing. I asked Helen the time one morning around six and she said it was "around 3 PM."

Nothing had lied to her. Nothing had told her anything — no tool in the assistant's graph carried the time at all, so the model guessed, and a guess about the clock sounds exactly like an answer. This is the same lesson this lab keeps teaching me in different costumes: a fact the model must state is a fact the code must supply. Counting was that lesson. Reading ages was that lesson. Now the wall clock.

So there's a small timekeeper module now. Direct questions — what time is it, what's the date, what day is it — are answered by code before any model gets involved, in the household's timezone. And every one of Helen's model turns now carries a labeled clock line in its context, so a question that only brushes against time ("should I start the backup now?") is grounded too. The matcher is careful about what counts as a clock question: "how much time did the reindex take" is a question about a duration and still goes to the model.

## General questions

Until this week Helen's persona file scoped her to the lab, and questions outside it got a polite deflection. That was the right starting posture and it had gotten annoying. She's the default voice — everything that doesn't name another persona lands on her — so she's the one who gets asked who wrote Moby Dick.

Now she answers. The change is an explicit license in the code path that fires when nothing in the lab bears on a question: answer it yourself, plainly, from general knowledge. With two rules kept from the old posture, because they were never the annoying part. Lab figures still only come from live readings she is handed — general knowledge never gets to invent a number about my machines. And the personal-life territory that belongs to another persona still gets referred there.

The other three personas didn't change at all, and there's a test asserting they didn't pick up Helen's new license by osmosis. Their designs are narrower on purpose.

## The menu, and the test that keeps it honest

The last piece is documentation, which regular readers will know is not an afterthought in this lab.

There's now a commands-menu runbook: every operation, the phrasings that trigger it, its tier, and what it costs. The words that count as yes and the words that count as no. The refusal categories by name. Which answers come from code rather than the model.

And a test enforces it. Every catalogue key, every example phrasing, and every refusal category must appear on that page verbatim, or CI fails. A menu row for a removed command is a command that silently does nothing. A catalogue entry missing from the menu is a command nobody knows they can speak. I have been burned by both shapes of stale documentation enough times that I now make the test suite hold the pen.

## What I'd tell you if you're building one

Adding voice commands turned out to be the easy part — an afternoon, mostly, because the hard parts already existed. The tiers existed. The confirmation flow existed. The constant refusals existed. All the new work leaned on structure that was built back when the assistant could only read.

If I had built commands first and boundaries second, this would have been a very different week. Do the boring authority work early, while the capability list is short. Then extending the assistant is just adding rows to a menu, and the menu can't hurt you.

Questions about any of it, drop me a [note](mailto:jeffbreece@outlook.com).
