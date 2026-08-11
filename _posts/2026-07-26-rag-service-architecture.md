---
layout: post
date: 2026-07-26 07:00:00 -0400
last_modified_at: 2026-07-26 07:00:00 -0400
title: "Two Stages and a Refusal: Routing Inside the Memory"
description: "A second router, one layer down — deciding whether a question about my own life is arithmetic, recall, or both. On sub-millisecond regexes, a 1.5-billion-parameter tiebreaker, and why saying nothing is a valid answer."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- rag
- localai
- sqlite
- python
image:
  path: "/images/unsplash/rag-service-architecture.jpg"
  alt: "A signpost with arrows pointing in several directions"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
There are two routers in this lab. The gateway decides what *kind* of thing you're asking about. This one sits a layer down, inside the personal-memory service, and decides how to answer once we already know the question is about me.

Two routing layers sounds like over-engineering. It was one of the better decisions here, and this post is about why — plus the answer I had to teach it to give, which is no answer at all.

<!--more-->

# Two Stages and a Refusal

## Why a second router

The gateway from a few posts back has one job: work out that a question is personal, and hand it to the memory service. Good. But "personal" isn't a way of answering anything — it's a category, and inside it live several completely different mechanisms.

Recall from the indexing post that there are two stores: a database with structured columns, and a vector store with language. So a personal question could be:

- **Arithmetic.** "How many days did I exercise last month." A `COUNT` over a column, exactly correct, no model involved.
- **Recall.** "What was I preoccupied with in the spring." No column holds that. This is vector search over prose.
- **Both.** "How did I feel on the days I trained hard." Filter to a set of days with SQL, *then* search the language of only those days.
- **Documents.** A question about files I've deliberately fed in, which is a different corpus from my journal and shouldn't be mixed with it.
- **None of the above.** Something that isn't about me at all and arrived here by mistake.

That third one is the interesting case and the reason a second router exists. Neither store answers it alone. You need the database to narrow, and then the vectors to search inside the narrowing — and that's an execution plan, not a lookup.

## Regex first, model second

The router runs in two stages, and the ordering is the whole design.

**Stage one is patterns**, and it's fast enough not to matter — a sub-millisecond pass over the question looking for the things that give a query away. "How many", "last month", a date range, an aggregation word. A great many real questions are unambiguous, and this catches them without waking anything up.

**Stage two only runs when stage one is unsure.** Then a small language model looks at the question and returns a structured classification — which store, which tables, what date filter, what aggregation. That takes a second or three.

Most questions never reach stage two. The ones that do are genuinely ambiguous, and paying a couple of seconds on those is fine, because they're the minority and because the alternative is being wrong quickly.

I'd put this pattern in the same family as the regex router two posts ago, and I've stopped thinking of it as an optimisation. **Cheap-and-certain first, expensive-and-general as fallback** is a shape that keeps showing up whenever a system has to make a judgement, and its real benefit isn't speed — it's that the cheap path is *inspectable*. When routing goes wrong I can see immediately whether a pattern fired or a model decided, and those are very different bugs with very different fixes.

## A small model for a small job

Something worth flagging for anyone assembling one of these: the model that classifies is not the model that answers.

The classifier is a 1.5-billion-parameter coder model. Tiny by current standards. It isn't writing anything — it's reading a sentence and emitting structured JSON describing how to answer it, and small models are perfectly good at that when the output shape is constrained. The model that writes the actual answer is much larger.

They're separate settings on purpose, because it's tempting to point both at whichever model you have loaded and not think about it. That's a mistake in both directions: routing every classification through a 14b model costs seconds on every question for no gain, and having the small one write your prose is grim.

The general point: **match the model to the job, and make it a separate configuration knob so the choice stays visible.** Most of the work in an assistant is not generation, and most of it doesn't need a large model.

## The plan is data

Stage two doesn't return a label. It returns a small structured object — the intent, which tables are involved, a date filter, an aggregation, which columns matter.

Making the routing decision an inspectable *value* rather than a branch in code turned out to be one of those choices that pays back repeatedly. I can log it, so every routing decision is on record. I can test it without executing anything, because the plan is comparable. And when an answer comes out wrong I can look at the plan and immediately see whether the router misunderstood the question or the execution mishandled a correct plan — two failures that look identical from the outside and have nothing to do with each other.

There's a comment in that file about a question — something like "what did the 31st score" — that fell through to semantic search when it should have been arithmetic. Having the plan written down is how that got diagnosed rather than guessed at.

## Learning to say nothing

The last intent is the important one, and it took me longest to respect.

Some questions that arrive at the personal memory service aren't about me. They arrive because the gateway made a mistake, or because I phrased something oddly. And the natural behaviour of a retrieval system given an unrelated question is to search anyway, find the least-unrelated few entries, and hand them to a model — which will dutifully weave them into a plausible answer, because that is what these models do.

The result is confident nonsense sourced from real data, which is a genuinely bad failure. It's not obviously wrong. It has the texture of grounded truth, because it *is* built from things I actually wrote — just things that have nothing to do with what I asked.

So there's an explicit out-of-scope classification, and it produces a refusal rather than an attempt. The assistant says it doesn't have anything on that, and stops.

Getting comfortable with this took a while, because a refusal *feels* like a worse product. A system that always has something to say seems more capable. But the value of a memory is precisely that you can trust what it tells you, and a memory that produces an answer for every question — including the ones it has nothing on — is not trustworthy in the specific way that matters. **The willingness to return nothing is what makes the other answers worth anything.**

This is my favourite thing about the whole lab, and it's the thread running into the last posts in this series. Constraint as a feature. A system that knows the edge of what it knows.

## What I'd do differently

I'd write the out-of-scope path first.

I built it last, as a cleanup, after watching the assistant confabulate on questions it should have declined. Building it first would have forced me to define what this service is *for* before defining what it does, and the boundary is more useful than the capability. Everything about the design got clearer once "this isn't mine to answer" was a first-class outcome rather than a gap.

## If you're starting

You don't need two routers. You need to notice when you have two kinds of question.

The symptom is easy to spot in hindsight: you'll have a retrieval system that's good at one sort of query and mysteriously poor at another, and the poor one will usually be the one with an exact answer. That's the moment to split — not to make the vector search better, but to stop asking it questions it structurally cannot answer well.

And add the refusal early, whatever scale you're at. It costs an `if` and it's the difference between a tool you trust and a tool that's confidently wrong at unpredictable moments.

Next: the one place this lab looks outward instead of inward — a small data lake of public sources.

---

## Credits

_Hero photo by [Mika Baumeister](https://unsplash.com/@kommumikation?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
