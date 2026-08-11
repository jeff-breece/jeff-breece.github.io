---
layout: post
date: 2026-07-18 07:00:00 -0400
last_modified_at: 2026-07-18 07:00:00 -0400
title: "Where Does This Sentence Go? The Gateway Problem"
description: "One assistant, seven kinds of question, and no obvious way to tell them apart. On building a router with three interchangeable brains — and why the dumbest one is the one that runs in CI."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- api-gateway
- fastapi
- python
image:
  path: "/images/unsplash/gateway-service-architecture.jpg"
  alt: "A row of illuminated fibre-optic strands separating into paths"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Once the lab could hear me, it had a new problem: it had no idea what I was talking about. "What did I write about last Tuesday" and "what's the capital of Peru" and "turn the office lights off" are three completely different requests that arrive as identical-looking strings of text.

This post is about the service that decides, and about a design choice I keep coming back to — building the same capability three times, at three levels of sophistication, and letting the situation pick.

<!--more-->

# Where Does This Sentence Go?

## Seven doors

By the time the voice pipeline worked, the lab had accumulated several different things it could do with a sentence. It could search my own writing. It could ask a general-purpose model. It could run a coaching conversation, or a reasoning-heavy one, or a code-focused one. It could control the house. It could query a pile of public data I'd been collecting.

Seven doors, and the sentence arrives with no label on it.

This is the part of building an assistant that nobody warns you about. The models are the easy bit — genuinely, they are extraordinary and they mostly work. The hard bit is the two hundred milliseconds *before* you call a model, where you have to decide which model, with what context, from which data source. Get it wrong and the failure is quietly awful: ask about your own week and get a confident general answer that has nothing to do with you, phrased so plausibly you might not notice.

That specific failure — personal question answered from general knowledge — is the one I care most about, and it shaped everything below.

## Three brains, one socket

The gateway does the deciding, and it can do it three different ways, chosen by a single environment variable.

**Embedding** is the default and the good one. It converts the sentence into a vector and compares it against reference points built from example questions — the next post is entirely about how that works. It's accurate, it handles phrasings nobody anticipated, and it needs a live embedding model to function.

**LLM** hands the question to a small language model and asks it to classify. Slower, sometimes smarter about genuinely ambiguous input, and it needs a live model server too.

**Regex** is a pile of patterns. If the sentence contains "turn on" or "lights", it's a house command. It's crude, it fails on anything phrased unusually, and it is the most important of the three.

That last claim needs defending, because it took me a while to believe it.

## In praise of the stupid option

The regex backend exists because **CI cannot talk to my house.**

Every test of the routing logic — does a personal question reach the retrieval service, does a house command reach the skill service, does adding a new intent break an existing one — has to run on a GitHub runner with no access to any of my machines. With only the embedding backend, none of that is testable. You'd need a live model server on the internet, which means either paying someone or not testing your router. Most projects quietly choose the second.

With a regex backend, the entire routing surface becomes testable offline. CI sets the variable and runs the same code paths with a classifier that needs nothing. The assertions are about *routing*, which is the logic I actually wrote and the logic that actually breaks.

There's a second payoff I didn't design for and now rely on. When the embedding model is unavailable — Atlas busy with a long job, or a model unloaded to free memory — the gateway isn't dead. It's dumber. It routes obvious things correctly and unusual things badly, and the lab keeps working at reduced quality instead of stopping.

I've come to think of this as a pattern worth reaching for deliberately: **build the sophisticated version and the trivial version of the same interface.** The trivial one is your test harness, your degraded mode, and your explanation of what the sophisticated one is doing when it surprises you. It costs an afternoon.

## The retry that stops it from lying

A small, specific thing that fixed a class of failure I found maddening.

Large models don't stay loaded forever. Ask a question after a quiet spell and the model server has to load the thing from disk — which, for a 14-billion-parameter model on a machine under memory pressure, can take around thirty seconds. The first request times out. The model finishes loading. Everything after that is fast.

So the first thing you ask after a break fails, and the second thing works. Which is, from the user's chair, indistinguishable from an assistant that's simply unreliable — and unreliable is the adjective that kills a tool, because you stop reaching for it.

The gateway retries a couple of times with a delay between attempts, specifically to cover a cold model load. That's it. It's a handful of lines and it removed the single most common complaint I had about my own system. The delay is deliberately generous rather than snappy, because the thing being waited on is not a network blip — it's a genuinely slow operation with a predictable duration, and pretending otherwise just means retrying too early and failing twice.

## Prompts written for a speaker, not a screen

Each route has its own system prompt, and they're all shaped by a constraint I didn't have when this was a text interface: **the answer is going to be read aloud.**

That rules out a lot. No markdown — asterisks and hash symbols either get pronounced or produce strange pauses. No bulleted lists, which sound like an inventory when spoken. No long preambles restating the question, because in text you skim past that and in speech you sit through every syllable.

Short, direct, and structured for the ear. Writing these taught me more about prompt design than anything else in the project, because speech is unforgiving in a way text isn't. A written answer that's 20% padding reads as thorough. The same answer spoken aloud is just *long*, and you find yourself talking over your own assistant to make it stop.

## The default that documents a design decision

One detail I'm fond of, because it's a comment that earns its place.

The gateway needs to know where to send data questions. That's configurable, and its default points at the retrieval service — which looks like a copy-paste error until you read the line above it explaining why: the public-data collections live inside the same vector store the retrieval service owns. There is no separate data service. Sending data questions to the retrieval service isn't a fallback, it's the correct destination.

Without that comment, the next person to look — including me in six months — files a bug about a wrong default and "fixes" it. It's two lines. This whole series is, in a sense, about the accumulated value of two-line comments like that one.

## What I'd do differently

I built the regex backend last, as a testing afterthought, and I should have built it first.

Starting there would have forced me to enumerate the intents concretely before reaching for anything clever, and enumerating them is most of the work. What are the actual categories? What's a representative question for each? Where are the boundaries genuinely fuzzy? I answered those questions late, by watching the embedding classifier make mistakes, and I'd have got better answers by writing thirty patterns down on purpose.

There's a general version of this: the sophisticated implementation lets you skip the specification, and skipping the specification is what makes it hard to tell whether the sophisticated thing is working. A dumb version forces you to say what you meant.

## If you're starting

You do not need an embedding classifier to route an assistant. You need an `if` statement.

Genuinely — start with keyword matching. Route three intents. Get the plumbing right: something that takes a sentence, picks a destination, forwards it, and returns the answer with the timing recorded. That skeleton is the valuable part, and it runs on anything.

The classifier is a component you swap in later, behind an interface you already proved. Mine went regex → LLM → embedding over several months, and every one of those swaps was a contained change because the interface never moved. If I'd started with embeddings I'd have built the whole thing around a component I didn't yet understand.

Next: how the good classifier actually works — and why it's mostly arithmetic rather than a model.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Lightsaber Collection](https://unsplash.com/@lightsabercollection?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
