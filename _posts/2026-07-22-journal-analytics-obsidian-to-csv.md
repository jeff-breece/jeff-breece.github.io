---
layout: post
date: 2026-07-22 07:00:00 -0400
last_modified_at: 2026-07-22 07:00:00 -0400
title: "Teaching the Lab to Know Me: Journals Into Structured Data"
description: "Turning years of daily notes into something a machine can reason over — booleans where the data is crisp, language models where it isn't, and a hard line about what never leaves the house."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- obsidian
- localai
- personal-knowledge
- python
image:
  path: "/images/unsplash/journal-analytics-obsidian-to-csv.jpg"
  alt: "An open notebook and pen on a desk beside a laptop"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Everything so far has been infrastructure — machines, monitoring, a voice, a router. Useful, and none of it knows anything about me. This post is where that changes: a parser that reads my daily notes and turns them into data the rest of the lab can actually reason over.

It's also where I have to be careful, so let me be direct about that up front.

<!--more-->

# Teaching the Lab to Know Me

## A note about what's in this post

I keep a daily journal, and have for years. It's the most personal thing in this lab by a wide margin — health information, relationships, worries, the ordinary private material of a life.

So: this post describes the *machinery*. What it extracts, how it decides, what it does when it isn't sure. It contains no journal content, no excerpts, and no examples drawn from real entries. The people in my notes are real people who didn't sign up to appear in a blog post, so they're not here either — the only names in this series are machines and mine.

The file with the diary text in it is gitignored, and the ignore rule carries a comment explaining that a private repository is still not the right place for a diary, because private repositories have commit histories and commit histories are forever. I'd encourage anyone building something like this to make that decision once, early, in writing — before you have anything worth protecting, when it costs nothing.

That's the last I'll say about it. The engineering is genuinely interesting.

## Why bother

The pitch is straightforward: I write things down every day, and the accumulated result is a record of how I've actually been living. Sleep, exercise, mood, work, the shape of a week. Somewhere in several years of notes is the answer to "what do I do differently in the weeks that go well", and I am never going to find it by reading back through them.

What I wanted was to *ask*. Out loud, to the assistant from the earlier posts, and get an answer grounded in what I actually wrote rather than a generically encouraging one.

That last distinction is the whole project. An assistant that responds to "how have I been sleeping?" with warm, plausible, general advice about sleep is worse than useless — it's the shape of help without the substance, and it's the default behaviour you get for free. Getting past it requires the machine to have read my notes, and that requires the notes to be in a form it can use.

## Crisp things become booleans

The daily notes have a loose structure — I fill in a few sections most days. Some of what's in there is genuinely binary: did the thing happen or not. Exercise, sleep, various small daily routines I track for my own reasons.

Those become columns. A row per day, a column per tracked item, true or false. Dull, and dull is correct — for anything with a clean answer, a boolean in a table beats every cleverer representation. It's queryable with SQL, it aggregates trivially, it can't be misinterpreted, and no model is involved at any point. If the question is "how many days did I exercise last month", that's arithmetic over a column and it's exactly right every time.

The output is a set of CSV files, one per domain — health and fitness, workouts in more detail, daily routine, the journal text itself, work, social. Boring formats on purpose. CSV is readable in an editor, loadable by anything, and still parseable in ten years, which is a real consideration for data about your own life.

## Fuzzy things get a model, carefully

Then there's the freeform text, which is most of the value and none of the structure.

You can't regex a mood. So for the prose sections there's a second pass: a local language model reads the entry and produces a structured judgement about it — an assessment of mood, a summary of the work described, a read on the social content. Those go into their own files, separate from the booleans.

Two things about that separation matter, and they're the same point made twice.

**The model's output is never mixed with the measured data.** Mood analysis lives in its own file, not as another column beside the exercise booleans. One of those is a fact about what happened; the other is a model's opinion about what I wrote. Put them in the same table and six months later you'll aggregate across both and produce a chart that mixes measurement with inference while looking equally confident about all of it. Keeping them apart is a filing decision that prevents a category error.

**It runs locally.** The journal never leaves the house. This is the single hardest constraint in the whole lab and it rules out the obvious approach — the big cloud models are better at this than anything I can run locally, and it isn't close. I use the local one anyway, and accept somewhat worse analysis, because the alternative is uploading my diary to a company. That was never a real option, so the constraint is hard, not a preference.

## The cache that made it usable

An implementation detail that turned this from a batch job into something I run casually.

Analysis is cached, keyed on a hash of the content being analysed. Re-run the parser and any entry whose text hasn't changed since last time skips the model entirely and reads the previous result.

The first full run over years of notes took a long while. Every run since takes seconds, because only new or edited days need work. That difference is the difference between a thing you run on a schedule and cross your fingers about, and a thing you run whenever you like without thinking.

Content-hash caching is one of those techniques with an absurd effort-to-payoff ratio — a few lines, and it makes expensive idempotent work effectively free on repeat. It shows up three more times in this lab. Anywhere you're feeding stable input to a slow deterministic-ish process, it's probably the right move.

There's also a flag to skip the model entirely, which exists so the parser can run in environments with no model server — CI, or a machine that's busy. Same instinct as the regex router two posts ago: **have a version that works when the clever part is unavailable.**

## Where the data goes

The CSVs are the handoff point. Downstream, they get indexed into the retrieval system — a database for the structured columns, a vector store for the text — and that's what lets me ask questions out loud and get answers grounded in my own record. That's the next two posts.

The important property of this design is that the parser doesn't know or care about any of that. It reads notes and writes tables. Everything downstream is replaceable without touching it, and I've replaced most of the downstream twice while this stayed exactly as it was. Boring interfaces between components age extremely well.

## What I got wrong

I over-structured it at first. My original version tried to extract far more fields, with a rigid schema, and it broke constantly — because I don't write my notes to a schema. I write them like a person, differently on different days, and any parser demanding consistency I don't provide will spend its life throwing errors at me about my own diary.

The version that works is permissive. Missing sections are fine. Unexpected content is fine. It extracts what it can find and shrugs at the rest. The daily note is written for *me*, and the parser's job is to accommodate that, not to impose on it. The moment journalling becomes data entry, I'll stop doing it, and then there's no data at all.

I also had a bug for a stretch where one section silently stopped being extracted after I changed how I write it. Nothing errored. The column was just quietly empty for weeks, and the assistant got worse at that topic in a way I noticed long before I understood. Now the parser reports what it found per run, and a section going to zero is visible rather than silent. Same lesson as the frozen light wall, in a different costume: **the failure that reports nothing is the expensive one.**

## If you're starting

You almost certainly have something like this already. Notes, a journal, task lists, a folder of markdown, years of anything.

The move is not to build the analysis first. It's to get whatever you have into a *boring tabular format* — one row per day, columns for whatever is crisp — and then look at it. That step alone taught me things, before any model was involved. A CSV and a spreadsheet is a legitimate stopping point, and a small local model will happily do the fuzzy pass on top when you want it.

And decide about privacy on day one, while the stakes are still theoretical. It's much easier to keep something out of a repository than to remove it from a history.

Next: turning these tables into something the assistant can actually search — and the mistake that made every rebuild silently skip half the work.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Christin Hume](https://unsplash.com/@christinhumephoto?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
