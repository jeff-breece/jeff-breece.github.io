---
layout: post
date: 2026-07-20 07:00:00 -0400
last_modified_at: 2026-07-20 07:00:00 -0400
title: "Mostly Arithmetic: Classifying Intent Without Training Anything"
description: "How the lab decides what kind of question you asked, using an embedding model, about forty example sentences, and some cosine similarity. On thresholds, the margin rule, and the guard that keeps personal questions from being answered generically."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- embeddings
- nlp
- python
image:
  path: "/images/unsplash/embedding-nearest-centroid-classifier.jpg"
  alt: "Points of light forming clustered patterns against a dark background"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The previous post left the gateway needing to sort sentences into categories. The good version of that turns out to require no training, no labelled dataset, and no fine-tuning — just an embedding model, a few dozen example sentences written by hand, and some arithmetic you could do on paper if you were patient.

This is my favourite piece of the lab, because it's the one where "AI" turns out to be averaging.

<!--more-->

# Mostly Arithmetic

## The trick

The entire idea is this simple.

An embedding model turns a sentence into a list of numbers — a point in a space with a lot of dimensions — arranged so that sentences meaning similar things land near each other. That's the one clever component and I didn't build it.

So: write out some example questions for each category. Eight or ten per intent, the kind of thing I'd actually say. Embed all of them. Average each group's vectors together to get a single point — the centre of mass for "personal question", the centre of mass for "house command", and so on.

Then, when a real question arrives, embed it and see which centre it's closest to.

That's it. There is no training. There is no dataset in any serious sense — it's a JSON file of sentences I typed. Adding a new intent means writing eight more examples and restarting the service. The whole classifier is a few dozen lines around one library call, and it works considerably better than the pile of regexes it replaced.

I want to be emphatic about this because it's the thing I most wish someone had told me earlier: **an enormous amount of practical AI work is nearest-neighbour search over embeddings.** It's not a compromise, and it's not the beginner version of something fancier. For a problem like this it *is* the right tool, it's fast, and you can reason about why it did what it did.

## The prefix that isn't decoration

One detail that looks like a superstition and isn't.

The embedding model I use wants to be told what kind of text it's looking at. Documents you're storing get one prefix; queries you're searching with get another. So the example sentences are embedded with a "document" prefix at startup, and the incoming question is embedded with a "query" prefix at classification time.

I skipped this at first because it looked like ceremony. Results were noticeably worse and I couldn't work out why — everything else was identical. The model was trained with those prefixes as part of how it distinguishes "this is a thing to be found" from "this is someone looking for something", and dropping them puts both into a shape the model wasn't optimised for.

The general lesson, which I paid for: **read the model card.** These models have usage conventions that aren't optional and aren't discoverable by experiment, because the failure isn't an error — it's slightly-worse output that you'll attribute to something else entirely.

## Two numbers that decide when not to answer

Nearest-centroid on its own is too eager. Every question has a nearest centre, including questions that belong to no category at all. So there are two guards.

**A similarity floor.** The nearest centre also has to be *close enough* — currently a cosine similarity of 0.50. Below that, the question isn't really like any of my examples and the classifier declines rather than guessing.

**A margin.** The best match has to beat the runner-up by a gap — currently 0.05. If two categories are nearly tied, the classifier is not choosing between them, it's tossing a coin with extra steps. Better to admit the ambiguity.

The margin rule is the one I'd recommend to anyone building something like this, because it targets a failure the floor can't see. A question can be *strongly* similar to two centres at once. High confidence, genuinely ambiguous. A threshold alone passes that straight through with a plausible-looking score attached; the margin catches it.

Both numbers are environment variables, which matters more than it sounds. Tuning a classifier means changing one number and asking a hundred questions, and if that's a code change you do it twice and stop. If it's a variable you do it properly.

## The guard for the failure that actually hurt

The general/personal boundary needed something extra, and this is the part where I stopped being clever and got specific.

Many of my questions about my own life carry no marker that they're personal. "How was my week?" contains nothing that identifies it as being about *me* rather than a general topic. Embedded, it sits uncomfortably close to a general-knowledge question, and the classifier would sometimes route it to the general model.

The result was the worst failure mode in the whole system. Not an error — a smooth, confident, well-written answer about weeks in general, delivered in the voice of something that's supposed to know me. It sounds fine. You have to be paying attention to catch that it's hollow. Once you do catch it, you trust the assistant less about everything, including the things it got right.

So there's a second, stricter pair of numbers that apply only when "personal" wins: a higher similarity requirement, and a wider margin it must hold over the general and reasoning categories. Personal has to win *convincingly* to reach my own data.

The asymmetry is deliberate and worth stating plainly, because it's a values decision rather than a technical one: **the two errors are not equally bad.** Routing a general question to my personal data returns nothing useful and the assistant says so — mildly annoying, obviously wrong, self-correcting. Routing a personal question to the general model returns something that *sounds* right and isn't. One failure is visible, the other is corrosive. So the thresholds are tuned to prefer the visible one, and I'd encourage anyone building this to write down which of their failures are quiet before tuning anything.

## Context, but only a little

Follow-up questions are a genuine problem. "What about last week?" means nothing standing alone.

So a couple of prior turns get prepended before embedding, which resolves most follow-ups. Only a couple, though — I tried more, and more was worse. A long history drags the embedding toward whatever the conversation has been *generally* about, and the classifier starts ignoring the sentence actually in front of it. Two turns is enough to resolve a pronoun and short enough not to drown the current question.

That's a tuning result rather than a principle, but the shape of it recurs: context helps until it dilutes.

## Testing something with no labels

The classifier needs an embedding model, which CI doesn't have. Same problem as the last post, different solution.

The embedding function is injectable. Tests pass in a stub — a deterministic fake that returns fixed vectors for known inputs — and the whole classification path runs offline. What's being tested isn't whether the model produces good embeddings, which is the model's business; it's whether the threshold logic, the margin rule and the personal guard behave correctly given embeddings. That's the code I wrote and the code that breaks.

There's a separate test that validates the examples file itself — schema, no duplicates, every intent present. It's caught more real problems than the logic tests, because the examples are the part that's edited casually. Adding an example is a two-second change with no obvious risk, which is exactly the kind of change that eventually breaks something quietly.

## What surprised me

How few examples it takes. I assumed I'd need hundreds per category and kept putting the project off for that reason. Eight to ten works well. Twenty is comfortable. The returns flatten fast, and what matters far more than quantity is that the examples are *phrased the way you actually talk* — the ones I wrote carefully, in complete sentences, were less useful than the ones I transcribed from things I'd genuinely said, mumbles and all.

And how debuggable it is. When a question routes wrong I can print the similarity to every centre and see precisely why: which category won, by how much, and which examples pulled it there. Compare that to a fine-tuned classifier being wrong, where the honest answer is a shrug and more data. Being able to *see* the decision has been worth more than a few points of accuracy would have been.

## If you're starting

This needs an embedding model and nothing else, and embedding models are small. Not language-model small — genuinely small. They run comfortably on a CPU, on a laptop, on hardware you'd otherwise call inadequate. The one here runs on every machine in the lab including the 4 GB ARM board.

If you have a few hours and a text editor: write out the categories you care about, write ten example sentences for each, embed them, average them, and compare. You'll have a working intent classifier before lunch, and it'll be one you can explain line by line to someone else — which is a thing you cannot say about most of what gets called AI.

Next: where the personal data comes from in the first place, and what it took to make the lab know anything about me at all.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Deng Xiang](https://unsplash.com/@dengxiangs?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
