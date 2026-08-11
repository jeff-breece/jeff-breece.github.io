---
layout: post
date: 2026-07-10 07:00:00 -0400
last_modified_at: 2026-07-10 07:00:00 -0400
title: "Body Language: Giving the Lab a Face on the Wall"
description: "Six light panels, one per machine, translating system state into colour and rhythm. On ambient observability, why motion is grammar, and the hour I spent debugging a wall that had frozen on its last good frame."
categories: [homelab, engineering, AI, UX]
tags:
- homelab
- resonancelab
- observability
- ambient-computing
- nanoleaf
- ux
- python
image:
  path: "/images/unsplash/nanoleaf-lab-status-display.jpg"
  alt: "Glowing geometric light panels mounted on a dark wall"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The previous post ended with a dashboard that could tell me what was running. This one is about not having to look at it. Six light panels on the wall, one per machine, turning system state into something I can read from across the room while doing something else entirely.

It's the least necessary thing in the lab and I'd rebuild it first.

<!--more-->

# Body Language

## The problem with dashboards

Dashboards demand attention. That's not a flaw in any particular dashboard — it's what they are. To learn anything from one you have to stop, go to a screen, open a page, and read it. Which means you only do it when you already suspect something, and the whole class of things you'd notice *incidentally* stays invisible.

Alerts have the opposite problem. They interrupt, which means they have to be reserved for things worth interrupting over, which means the vast middle ground — "the lab is working unusually hard right now", "something has been retrying for ten minutes" — has nowhere to live. It's not worth a Slack message. It's genuinely interesting.

What I wanted was closer to how you know a car is running. You don't check a gauge. You hear it. When it changes, you notice without having decided to pay attention, and you can tell the difference between idling and labouring without knowing anything about engines.

I wanted the lab to have that. Body language.

## Six panels, one per machine

So there are six light panels on the wall arranged in a row, and each one belongs to something:

```
 jetson   gateway   lab_stt   alert   services   pangolin
```

The vision box, overall connectivity, the main server, an alert beacon, the aggregate health of all the services, and the workstation. Physical left-to-right, which sounds obvious and took a surprising amount of care — the panels have internal IDs that have nothing to do with where they ended up on the wall, so there's a mapping in the config from *role* to *panel ID* with a little ASCII diagram above it showing the physical layout. Future me will move a panel eventually and that comment is the only thing that will save him.

The vocabulary is deliberately small, because a language you have to look up is not ambient:

- **White breathing** — normal. Everything is fine. This is the baseline you stop consciously seeing, which is the point.
- **Violet pulse** — inference. Something is thinking. On the vision panel it beats faster when the GPU is genuinely loaded.
- **Cyan** — API traffic, the system doing ordinary work.
- **Gold, slow** — the workstation capturing radio.
- **Amber** — degradation. Something's struggling but alive.
- **Red, hard strobe** — a node is down. This is the only thing that gets to be aggressive.

Motion is grammar; colour is vocabulary. A slow breath and a hard strobe mean different *kinds* of thing before you've registered the colour at all, and that's what lets it work in peripheral vision. Stillness is the anomaly — if the wall is completely static, something has gone wrong with the wall.

## The part where it lies to you

This is the story I promised at the start of this series.

The panels are driven over the network. For steady states the service sets colours through a REST call, but for anything that moves — pulses, breathing — it streams frames continuously over UDP. That's the only way to get smooth motion; you can't REST your way to a 10 Hz pulse.

Streaming has a property I hadn't thought about. The controller holds the last frame it received. It doesn't time out, it doesn't fall back, it doesn't decide that a stream which stopped ten minutes ago is stale. It sits there displaying whatever it was told last, indefinitely, with total confidence.

Then one evening the controller dropped its DHCP lease and came back with a different address. The service kept streaming to the old one. Nothing errored — UDP doesn't care whether anyone's listening. And the wall sat there for about an hour, glowing steadily, showing a snapshot of a lab that had moved on.

It was *displaying health*. That was the worst part. Not blank, not red — a calm white breath, describing a state that was an hour out of date, while I looked at it periodically and took reassurance from it.

I want to draw the line back to the first post explicitly. The address it grabbed, `192.168.2.3`, used to belong to the main server. My documentation still said so. So I spent the first stretch of that hour with a mental model in which that address was a completely different machine, which is exactly the kind of small fiction that costs you an evening.

Two fixes came out of it. The service now discovers the controller by name rather than trusting an address, so a lease change is survivable. And in the test file, the constant for that address is named for what it actually is — `NANOLEAF_NETGEAR` — with a comment explaining what it is *not*, so nobody re-derives the wrong fact from a plausible variable name.

The deeper lesson is the same one as the last post, in a more embarrassing costume: **a display that can't tell you it's stale will eventually lie to you, calmly.** Anything showing a state should be able to show that it has lost touch with the thing it's describing. A frozen dashboard and a healthy dashboard must not look alike. Mine did.

## Small decisions that mattered

**It never sleeps.** There's a night mode setting and it's off. The lab works at night — batch jobs, index rebuilds, backups — and a status display that switches itself off during the hours when nobody's watching is a status display that misses everything interesting. It's dim, not absent.

**It polls on a modest interval.** Every fifteen seconds for state; the streaming layer handles anything that needs to move faster. Nothing here needs to be more real-time than that, and I'd rather the panels lag by a few seconds than have the monitoring become a load source of its own.

**It runs from the workstation, not the server.** This one's a network constraint rather than a preference. The main server can't reach the segment the controller lives on. The workstation can see both, so it's the bridge. Home networks are usually a bit odd like this, and I've come to think the right move is to accept the shape of the network you have rather than re-architect the house to make a diagram cleaner.

## Why bother

I've had people ask, kindly, what this is *for*, given I already had monitoring that worked.

The honest answer is that it changed my relationship with the lab. I notice things now that I would previously have discovered hours later — a job that's still running when it shouldn't be, a machine that's quiet when it should be busy. Not because I'm watching, but because a shape in my peripheral vision changed while I was doing something else. That's a category of awareness a dashboard structurally cannot give you, and it turns out to be worth quite a lot.

There's a less defensible reason too, which is that it's *delightful*. It makes the room feel like a place where something is happening. A wall that breathes when the lab is idle and pulses violet when it's thinking gives an otherwise abstract pile of processes a presence, and I find I'm fonder of the whole system for it. That's not nothing. It's why sailors named ships.

## If you're starting

You don't need light panels. The panels are the expensive version.

The cheap version is a single LED on a microcontroller, or a coloured square in the corner of a screen you already have open, or a terminal you keep in a spare workspace that changes colour. The idea isn't the hardware — it's giving one piece of system state a *physical or peripheral* presence, so that noticing it doesn't cost attention.

Pick the one thing you most often wish you'd noticed sooner. Give it a colour. That's the whole project, and it works with whatever you've got on the desk.

Next: the screen version of all this — an operator console built for exactly one user.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Greg Rosenke](https://unsplash.com/@greg_rosenke?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
