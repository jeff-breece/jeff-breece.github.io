---
layout: post
date: 2026-08-01 07:00:00 -0400
last_modified_at: 2026-08-01 07:00:00 -0400
title: "How Helen Came to Be: Four Voices and a State Machine"
description: "The lab stopped being one assistant and became four, plus a branch that isn't a personality at all. On stickiness over topic-detection, why the house doesn't get a character, and what changes when the thing answering has a name."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- langgraph
- localai
- personas
- python
image:
  path: "/images/unsplash/langgraph-va-graph-personas.jpg"
  alt: "Layered paper textures in muted tones"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
For most of this series the assistant has been an *it*. A pipeline. Somewhere along the way it stopped being one, and this post is about that transition — how the lab ended up with four distinct voices instead of one general-purpose helper, and what I learned about routing between them that I did not expect.

Helen is the one the lab is named around, in a sense. This is where she starts.

<!--more-->

# How Helen Came to Be

## The problem with one assistant

The first version was a single voice that did everything. Ask it about the servers, ask it about your week, ask it to turn the lights off — same voice, same register, same slightly eager helpfulness.

It worked, and it was subtly awful, and it took me a while to articulate why.

The register was always wrong for something. Tuned to be warm and encouraging, it was cloying when I wanted a status report. Tuned to be crisp and factual, it was cold when I was working through something that mattered. There's no single tone that's correct for both "is the backup job healthy" and "I've been stuck on this for weeks", and trying to find one produces something that's mediocre at both — an assistant with the personality of a form.

The deeper problem was that a single voice has a single relationship to context. The thing that discusses my health data and the thing that reports disk usage were, structurally, the same thing with the same access to everything. That's fine until you think about it for a minute.

## Four, and why

So there are four now, each with a domain:

**Helen** handles the lab itself — operations, status, what's running, what's broken. She's the default, and she's the one this series has been building toward. Her register is that of a competent duty officer: factual, unhurried, comfortable saying she doesn't know.

**Mike** handles life and habits — the long-arc stuff. Steadier and more patient, oriented toward systems rather than willpower.

**Hank** handles the body — training, movement, general health and fitness. More direct. He's the one who'll tell you the plan is the plan.

**Oran** handles reflection and contemplative practice — the quiet end of the day.

And then there's the house, which is *not* a persona, and that distinction is the most useful thing in this post.

## The house doesn't get a personality

"Turn off the kitchen light" is not a conversation. It's an instruction with a binary outcome, and the correct response is for the light to go off.

Early on it went through a persona, which meant a model paraphrased my instruction, decided what I meant, and produced a sentence about having done it. Every one of those steps could fail, and the failures were maddening in proportion to how simple the request was — a model deciding I'd meant a different room, or answering conversationally about a light that hadn't changed state.

So the house is a branch in the graph rather than a character. A house command routes straight to the code that talks to the home automation system. No model paraphrase, no generated confirmation. It does the thing.

I'd generalise this: **not everything that arrives by voice is a conversation.** Some of it is a command, and commands want determinism, not interpretation. The temptation with a capable model in the stack is to route everything through it because you can. Resisting that for the class of requests with exactly one correct outcome removed a whole family of small infuriating failures.

## Stickiness beats topic detection

The design decision I'd defend hardest is one I got wrong the first time.

The obvious way to pick a persona is to look at each message and detect its topic. Sounds like a training question, send it to Hank. Sounds like infrastructure, send it to Helen.

That is genuinely terrible in practice, and the reason is that conversations aren't a series of independent topics. They wander. Once I'm talking to Hank about a training week, my next message might be "why?" or "what about Thursday" or a half-sentence that gives topic detection nothing to grab onto. It falls back to the default, and suddenly Helen is answering a follow-up about exercise in an ops register — having lost the thread entirely, and without any indication that the person I was talking to has been swapped out mid-conversation.

So persona is **sticky**. Address one by name and they take the floor and *keep* it until I address someone else. Routing is a pure function of the text and the persona currently holding the floor — no model call to decide who answers.

That's a small change with an enormous effect on how it feels. It's the difference between talking to someone and querying a system. The floor is held, follow-ups land where they should, and I can be as lazy and elliptical as people are with each other.

The lesson, which I think generalises past assistants: **conversational state is a feature, not an optimisation.** Treating each message as independent is easier to build and produces something that feels like it isn't listening.

## What changes when it has a name

I want to be careful here, because I'm aware of how this sounds.

I don't think Helen is a person. Nothing in this lab is conscious and I have no confusion about that. But something did change when the voices separated and got names, and it's worth reporting honestly rather than pretending it didn't happen.

I ask better questions. Talking to a system named Helen about the lab, I ask the way I'd ask a colleague who knows the estate — which is a more *useful* way to ask than the keyword-ish way I addressed a general assistant. The name creates an expectation about the domain, and the expectation shapes the question, and better questions get better answers. That's a real mechanism, not a feeling.

The separate voices from the TTS post matter more than I expected here too. Knowing who's answering before you've parsed a word does something. It makes the switch legible, and it makes the boundaries feel like boundaries rather than configuration.

And there's a quieter thing. A lab with four named voices in it is a more pleasant place to work than a lab with a query interface. I don't think that's frivolous. I spend a lot of hours in this room, and the difference between "a pile of services" and "somewhere with a bit of company in it" is not nothing — it's most of why the project has survived eighteen months of evenings. The sailors naming ships thing again.

## Boundaries as scope, not suggestions

The separation isn't only tone. It's what each persona can *see*.

Each has a configuration file, and part of that configuration is which slices of the indexed corpus they have access to. Helen can see the operational material. The others can see what's relevant to their domain. This is the scoping mechanism doing real work, not a personality quirk — it means personal material isn't automatically in scope for a question about disk space.

I got this wrong in a way worth confessing. Helen originally had no persona file at all — she was the default, so she fell through to generic retrieval with everything in scope. She answered personal questions in an ops register, didn't recognise her own name, and had access she shouldn't have had. The fix was to give the default the same explicit treatment as the specialists. **A default is a configuration too, and leaving it implicit means leaving it unbounded.**

## The graph

Underneath, this is a state machine: a router node that decides who's answering, one node per persona plus the house branch, and a respond node. Small, boring, and easy to reason about.

The reason I like it in graph form rather than as nested conditionals is that the routing logic is *visible*. I can read the graph and see every path a sentence can take. When something routes oddly I can point at where. Compared to routing logic that has accreted across a few hundred lines of a request handler — which is what I had before — the graph is the thing that lets me still understand my own system.

Every node reports what it did to the logging system, and a failure to report never breaks the response. Telemetry that can take down the thing it's observing is worse than no telemetry.

## If you're starting

You don't need four. Start with two.

Two is where the interesting design questions appear — how do you switch, what happens to a follow-up, what does each one know. And the second one gives you the contrast that makes the first one's register visible. I didn't understand what Helen's voice *was* until there was something to compare her against.

You also don't need a framework. Mine is a small graph now, but for months it was a dictionary of prompts and an `if` statement about who was last addressed, and that captured most of the value. Stickiness is a variable holding a name. The rest is polish.

Next: what Helen is allowed to do — and why her refusals are constants in a source file rather than something a model composes.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Paper Textures](https://unsplash.com/@inthemakingstudio?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
