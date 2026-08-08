---
layout: post
date: 2026-07-30 07:00:00 -0400
last_modified_at: 2026-07-30 07:00:00 -0400
title: "The Coach That Doesn't Use a Model"
description: "Training plans generated from equipment and rules rather than by a language model — fast, available when the GPU is busy, and identical every time. On knowing which parts of a personal system should never be improvised."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- localai
- health
- fastapi
- python
image:
  path: "/images/unsplash/health-coach-deterministic-workouts.jpg"
  alt: "Dumbbells resting on a gym floor"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The lab has a service that plans training sessions. It's the one people assume is most obviously a job for a language model, and it's the one where I most deliberately didn't use one.

As with the journal post, I'll describe the machinery rather than the contents. What's here is the design argument, which I think is the transferable part.

<!--more-->

# The Coach That Doesn't Use a Model

*On the difference between advice and a plan*

## A note on scope

This service holds personal health information. So, as with the earlier post about my journals: this describes how the thing works, not what's in it. No data, no history, no specifics — the health database is one of the irreplaceable things from the backup post and it stays on my own machines.

The engineering argument is the interesting part anyway.

## What it does

I own a specific and slightly random set of equipment — some free weights, resistance bands, a bench, an indoor bike, a jump rope, a mat, and a nearby set of hills. That's the vocabulary.

The service knows what I have and generates sessions from it: strength days, conditioning days, restorative days, outdoor days. It knows what I did recently, so it varies things and doesn't hammer the same pattern.

And it does all of that **without calling a language model.**

## Why not a model

This is the post's argument, so let me make it properly.

A language model would be *good* at this. Ask a decent model for a session using dumbbells and bands and you'll get something sensible and nicely worded. This is squarely inside what these systems do well.

Three reasons I didn't.

**Availability.** The GPU is shared with everything else in the lab — generation, image work, the odd training run. When it's busy, a model-backed planner is slow or unavailable. And the moment I want a plan is when I'm dressed and about to start, which is exactly the wrong moment to wait thirty seconds for a model to load. A tool that's unavailable when you reach for it doesn't get reached for, and then it doesn't exist.

**Determinism.** The same inputs give the same plan. If something felt wrong, I can look at why — the rules are readable. When a model produces an odd session, the honest answer is "the model did that", which is unsatisfying for something you're going to physically do.

**Drift.** This is the real one. A model asked repeatedly for training sessions will drift toward whatever is most represented in its training data, which is *generic gym programming*. Slowly, plausibly, it stops planning for my actual equipment and starts planning for a commercial gym I don't have. Each individual session looks fine. The trend is that the plans stop being about my situation.

Rules don't drift. If a rule is wrong, it's wrong in the same way every time and I can find it.

## The general principle

I've ended up with a fairly clear line, and it's the same one that closes this whole series.

**A model is right for things where being approximately right is useful.** Summarising what I wrote, having a conversation, understanding a fuzzy question. Approximate is the whole value there.

**Code is right for things where the output is a specification.** A training plan is a set of instructions I'm going to follow with weights in my hands. That's not a domain where I want creative variation I can't audit.

The lab uses models heavily. It just doesn't use them for the parts that need to be the same tomorrow as they were today.

## Where the model does belong

Not zero, though — and the split is instructive.

The *plan* is generated. The *conversation about it* is a persona, and that's a model. Asking why a session is structured a particular way, or saying that something felt harder than expected, is a discussion, and models are excellent at discussion.

So there's a boundary: the plan is computed and the talk about it is generated. The persona can explain the plan and it cannot silently rewrite it — same shape as the report in the final post of this series, where the content is computed and the voice only delivers it.

The plans also write in handoffs to the other personas explicitly — noting where recovery is another persona's domain, or where attention and practice belong elsewhere. Those handoffs are part of the generated plan rather than something a model decides in the moment, which keeps the boundaries between the four voices from being renegotiated on every request.

## The interface

It's part of the same operator console from the earlier post — the control-panel aesthetic, a handful of workflows: what's today, what's the training block, a conversation, progress, and setup for the equipment list.

The equipment setup is the part that makes the whole thing work, and it's a lesson in itself. The generator is only useful because it knows precisely what I own. A coach that suggests exercises requiring a machine I don't have is worse than no coach, because every session becomes a translation exercise. Constraining the vocabulary to the real equipment is what makes the output directly usable, and it's why generic advice — from a model or a magazine — is less useful than something dumber that knows your actual garage.

## What I'd tell someone building for themselves

Be suspicious of the instinct to put a model in the middle of anything you'll rely on repeatedly.

It's the fun part, so it's tempting. But ask what happens on the four hundredth request rather than the first. Does it still know your constraints, or has it drifted to the average of its training data? Is it available at the moment you actually need it? If it produces something odd, can you find out why?

For a lot of personal tools, the answer points at a couple of hundred lines of rules — which you can read, which run instantly on anything, and which will behave identically next year.

Keep the model for the conversation. That part it's genuinely great at.

## If you're starting

You need a list of what you own and a few rules for combining it. That's a weekend, it runs on a laptop, and it will be more useful to you than any general advice — precisely because it's constrained to your actual situation.

And this generalises past training. Anywhere you're tempted to have a model generate a *plan* you'll follow repeatedly — meals, study, maintenance schedules — consider whether what you want is generation or a specification. Usually it's a specification, and specifications want code.

Next: the personalities, and where Helen comes from.

---

## Credits

_Hero photo by [Victor Freitas](https://unsplash.com/@victorfreitas?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
