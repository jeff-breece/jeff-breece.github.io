---
layout: post
date: 2026-08-03 07:00:00 -0400
last_modified_at: 2026-08-03 07:00:00 -0400
title: "A Refusal a Model Can't Be Talked Out Of"
description: "Giving an assistant real authority over real machines, and then bounding it in code rather than in a prompt. On tiers enforced at the tool level, a two-attempt rule, and readings that cannot be reported without their age."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- safety
- automation
- python
image:
  path: "/images/unsplash/helen-tier-system.jpg"
  alt: "A closed padlock resting on a circuit board"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Helen can restart services on my machines. That made me uneasy enough to spend more time on the boundaries than on the capability itself.

This post is about where the limits live, and they do not live in the prompt. A limit written in a prompt is a suggestion, and a model can be argued out of a suggestion at two in the morning by someone tired enough to try.

<!--more-->

# A Refusal a Model Can't Be Talked Out Of

## The point where this got serious

For most of this series the assistant has been reading things. Answering questions, retrieving from my notes, reporting status. The worst case for all of that is a wrong answer, which is annoying and recoverable.

Then I wanted to say "restart the light display" and have it happen.

That's a different category. Now the assistant is doing things to machines — and the machines run backups, hold the only copy of some data, and sit on a striped array with no redundancy whatsoever. The gap between "answers questions" and "executes commands" is the whole gap between a toy and a thing that can ruin your evening.

I could have skipped it. Plenty of people build the read-only version and stop, sensibly. But the ability to say "re-run the journal ingestion" while walking out of the room is genuinely useful, and I wanted to find out what it takes to do that responsibly rather than assume it can't be done.

## Four tiers

Every action Helen might take is classified into one of four levels:

- **T0** — read-only. Status, health, what's running. No side effects at all.
- **T1** — safe actions. Things that can be undone or that change nothing durable.
- **T2** — actions needing confirmation. Restarting a service, re-running a job.
- **T3** — never. Not "requires extra approval". Not available.

The classification is a pure function of the *action*. Not of the conversation, not of who's asking, not of how the request was phrased. The same action gets the same tier every single time, and nothing in the dialogue can change it.

That last property is the one that matters. If tier depended on context, then context becomes an attack surface — and the attacker is usually me, tired, phrasing things insistently until something gives.

## The bit that matters: where the fence is

This is the design decision the post exists for.

The obvious way to do this is to tell the model about the tiers. Put them in the system prompt: *here are your levels, T3 actions are forbidden, ask before doing anything T2.* Models are good at following instructions like that, and it would mostly work. The problem is that a prompt-level limit is enforced by the model's judgement in the moment, and that judgement is subject to everything else in the context — including a long conversation, including me being insistent, including phrasings that make an exception sound reasonable. Prompt instructions are *strong suggestions to a very agreeable system*.

So the enforcement isn't there. T3 tools **do not exist in the toolset Helen is given.** There is no capability to refuse, because there's no capability. And the refusal text isn't generated — it's emitted by the router as a constant string, the same words every time, produced by a function that does no model call at all.

I want to spell out why the constant matters, because it seemed fussy when I wrote it and now seems essential. **A refusal a model composes is a refusal a model can be argued out of.** If Helen generates "I can't do that", she can also generate a slightly softer version next turn, and a version that suggests a workaround, and eventually a version that does the thing. Each step looks reasonable on its own. Constant text gives her nothing to soften one step at a time — nothing is deciding, so there is nothing to negotiate with.

If there is one idea worth taking from this series, it is this: **put the constraint where the model isn't.** Not in the instructions it reads — in the code that decides what it can reach.

## Two attempts, and then say so

A smaller rule that came from watching it misbehave.

If something fails, Helen may try twice. A third attempt on the same fault is a loop, and she stops.

But the stopping is *reported*. She doesn't quietly give up — a silent stop is indistinguishable from a system that's still working on it, and I'd sit there waiting. She says she's stopped trying and why.

The state to make that work is small: attempts keyed by the unit involved, the signature of the fault, and a time window. Beyond the window it's a new incident and the count resets, because a service failing today and the same service failing next week are not the same event and shouldn't be treated as one.

Failing loudly after a bounded number of attempts is the useful behaviour, and it's a category of design I'd only ever seen described in retry libraries rather than applied to something conversational.

## A reading you cannot report without its age

This is the strictest thing in the lab and I'm fond of it.

Back in the monitoring post I said every reading has an age. Here that stops being a convention and becomes a type.

Helen reports on machine state, and state readings come from probes, and probes have a time. A reading and its age travel together in one structure, and the function that renders a reading for speech **refuses to emit one without its age**. Not discouraged. It won't produce output.

The rule this enforces: *never report a state you have not verified recently.* Making that structural rather than cultural means I cannot accidentally write code that reports a stale value confidently, because there's no way to express it. The unaged reading isn't disallowed — it's unrepresentable.

Every serious failure in this lab has been a system confidently reporting something that used to be true. The light wall frozen on an hour-old frame. The documentation describing a host that had moved. An index reporting success while skipping half its input. This is the same failure, met with a type instead of a resolution to be careful.

## Channels, because a wall of light can't say "the"

Helen speaks through several channels and they have genuinely different constraints.

**Telemetry** is terse — the register drops articles and verbs, because it's a glance, not a sentence. **Advisory** is full sentences and short, because spoken audio has to fit in the gap before I stop listening. **Alerts** go to a message channel and are a few lines. **Commands** are text-only and are *never spoken aloud* — if there's a shell command in the output it appears on screen, because a machine reading a command out loud is an invitation to a mistake.

Same information, four shapes. What made this work was treating the channel as part of the output contract rather than formatting applied afterwards.

There's also a set of standing phrases held as constants — exact wording for particular recurring situations. Not templates for a model to fill, the literal text. When Helen distinguishes a computed value from a measured one, she says the same words every time. Consistent phrasing for a recurring meaning is how you learn to hear the distinction without parsing it, and a model paraphrasing it "helpfully" each time destroys exactly that.

## The failures that taught me this

Three of them, briefly, because every rule above came out of an actual failure.

The personal-habits persona kept quoting my journal back at me in situations where the context said not to. The health persona once speculated about a specific physical cause in a way that read as diagnosis, with safety guidance sitting right there in its context. And Helen once read a *worked example from her own system prompt* — an illustration with plausible numbers in it — and reported those numbers as the current state of the lab.

That last one is the sharpest. The prompt contained an example demonstrating a format, and the example had numbers, and she reported them as fact. The rule that came out: **describe the rule, never demonstrate it with numbers.** An illustration with concrete values in a prompt will eventually be reported as data.

All three are the same failure at different addresses. A model given an instruction will comply with it approximately, in a way that depends on everything else in its context. That's not a flaw to be prompted around; it's what these systems are. The engineering response is to move anything that must hold out of the context and into the code.

## If you're starting

Give your assistant a capability that can actually do something. It's a completely different exercise from a chatbot and you'll learn more in an afternoon than in a month of read-only work.

But do the tiers first — before the capability, while the list is short and the stakes are hypothetical. Write down what it may never do, and then arrange for those things to be *absent* rather than forbidden. That is the difference between a fence and a sign asking nicely.

And make one refusal a constant string. Just one, as an experiment. Then try to talk your assistant out of it, and notice that you can't, and notice how different that feels from every other guardrail you've built.

Next, and last in this series: what Helen actually says at seven in the morning — and why the report is assembled without a model at all.

---

## Credits

_Hero photo by [FlyD](https://unsplash.com/@flyd2069?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
