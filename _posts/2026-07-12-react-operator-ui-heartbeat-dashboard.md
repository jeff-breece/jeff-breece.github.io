---
layout: post
date: 2026-07-12 07:00:00 -0400
last_modified_at: 2026-07-12 07:00:00 -0400
title: "An Operator Console, Not a Dashboard"
description: "Fifteen pages of React for a lab with one user. On building an interface for the person who already knows the system, why the UI renders staleness as a visual property, and the rule about giving every component its own animation loop."
categories: [homelab, engineering, UX]
tags:
- homelab
- resonancelab
- react
- typescript
- ux
- observability
image:
  path: "/images/unsplash/react-operator-ui-heartbeat-dashboard.jpg"
  alt: "A laptop displaying lines of React code"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The lab has a web interface with about fifteen pages, and exactly one user. That combination produces different design decisions than anything I've built professionally, and the differences turned out to be the interesting part.

This is about building for someone who already knows the system — and about the one bug that made me write a rule down.

<!--more-->

# An Operator Console, Not a Dashboard

## One user changes everything

Almost every interface I've built professionally was for people who didn't know the system. That shapes everything: onboarding, progressive disclosure, labels that explain themselves, guard rails, tooltips.

This one has one user, and he built the thing. I don't need to be told what a probe is. I don't need a tooltip explaining the vector index. Every pixel spent teaching me something I already know is a pixel not spent telling me something I don't.

So the density is high, the labels are terse, and the aesthetic is unapologetically a control panel — a bit of Star Trek in the styling, which is not incidental. It's a room I spend a lot of hours in, and I'd rather it felt like somewhere I wanted to be.

The trade is that it's near-useless to anyone else, and I've made my peace with that. Software for one person is allowed to be shaped like that person. It's one of the genuine freedoms of building for yourself, and I think people give it up too readily by imitating the conventions of products built for strangers.

## Staleness is a visual property

The most useful thing in this interface is that it shows how old its information is, everywhere, as part of how things *look* rather than as a number in the corner.

Readings brighten and dim with age. A probe that failed leaves a gap rather than a stale value. You can see, without reading anything, whether you're looking at something current or something the system last knew about a while ago.

This is the same idea from the monitoring post, made visual. A status display that shows "healthy" is making a claim about *when*, and if that claim is old, the display is lying in a way that looks exactly like telling the truth. Rendering age as brightness makes freshness perceptible instead of something you have to go and check.

I'd push anyone building an operator interface toward this. Not a timestamp in the footer — nobody reads the footer. Make it a property of the thing itself, so that stale and fresh are visibly different at a glance.

## One origin, and mock data

Two structural decisions worth stealing.

**Everything goes through one origin.** The interface talks only to the monitoring service, which proxies to everything else. No cross-origin configuration on a dozen services, no mixed-content problems, no maintaining a list of allowed origins in several places. When I added the model-training tool recently I pointed its page directly at the machine with the GPU, got blocked immediately by exactly the isolation that ought to block it, and fixed it by adding one proxy route. Pointing at a second host was the mistake, not the network.

**There's mock data for when nothing is reachable.** If the backend is down, the interface renders with sample data rather than an error page. That sounds like a strange choice — surely you want to know it's down? — but the point is that I can develop the interface on a train, and it means a backend outage produces a UI that still frames what's missing rather than a blank screen.

The critical detail: mock mode is *visibly* mock. It never quietly substitutes. Fake data that looks real is exactly the lying-display failure this whole series keeps circling, and I'd rather have no interface than a convincing one showing invented numbers.

## The rule I had to write down

One bug from this build produced a rule I still follow.

The interface has an ambient layer — the presence surface, the thing that responds to the assistant speaking and listening, with animation that reacts to audio. Several components participate in it: a level indicator, an activity ring, a thinking indicator.

I built them one at a time, and each one, quite naturally, got its own animation loop. Each requested its own animation frames, ran its own timing, drove its own state.

With three or four of those running, the interface got noticeably worse. Not broken — janky. Animations drifted out of sync with each other, and the whole thing got heavy enough that the machine's fans came on for a page that is mostly text.

The fix was a single shared loop that ticks once per frame and distributes to everything that needs it, plus a small event bus so components can react to the same event instead of each polling for it. Everything got smoother immediately, and the code got smaller.

The rule, written in the repository where the next person will hit it: **do not give each component its own animation loop.** It's obvious once you've been bitten. It is completely non-obvious while you're building the third component, because in isolation each one is perfectly reasonable, and the problem only exists in aggregate.

That's a category of bug I've come to watch for — where every individual decision is correct and the sum is wrong. You can't catch those in review of a single change.

## Types, because I forget things

TypeScript throughout, and I want to defend it for a single-person hobby project, because "it's just me" is the usual argument against.

The reason is that I come back to this code after months away. The shape of the monitoring document — a nested structure with several service types and optional fields — is something I understood perfectly when I wrote it and not at all a season later. The types are how I ask my own code what it returns without going and reading the service that produces it.

They're notes to my future self that the compiler checks. For a project touched in bursts with long gaps, that's worth more than it is on something you work on daily.

## If you're starting

You don't need fifteen pages. You need one.

Mine started as a single page listing services and their status, and honestly that page is still the one I open most. Everything else accumulated because I wanted a specific thing while looking at the simple version — which is a much better way to arrive at features than deciding up front what an interface should have.

And build for yourself. Deliberately. Make it dense if you like dense, make it look like a spaceship if that pleases you. The conventions of software built for strangers are solving a problem you don't have, and the freedom to ignore them is one of the better perks of a lab with one user.

Next: the thing all of this was actually built for — talking to it out loud.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Lautaro Andreani](https://unsplash.com/@lautaroandreani?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
