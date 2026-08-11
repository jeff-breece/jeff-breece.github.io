---
layout: post
date: 2026-07-08 07:00:00 -0400
last_modified_at: 2026-07-08 07:00:00 -0400
title: "Two Platforms On Purpose: systemd, k3s, and Refusing to Migrate"
description: "Half the lab runs as systemd units and half is heading for Kubernetes, and that split is a design decision rather than a backlog. On what actually makes a service portable, and the one-node cluster I'm not pretending is highly available."
categories: [homelab, engineering]
tags:
- homelab
- resonancelab
- kubernetes
- systemd
- gitops
- devops
image:
  path: "/images/unsplash/deployment-systemd-k3s-two-platform.jpg"
  alt: "Shipping containers stacked in a port"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Some services in this lab run as plain systemd units. Others are moving to a small Kubernetes cluster. That split is permanent and deliberate, and I want to explain why — because the natural assumption is that it's a migration I haven't finished.

It isn't. Some of these services are never moving, and knowing which is the useful part.

<!--more-->

# Two Platforms On Purpose

## The question that decides it

The test I settled on took embarrassingly long to arrive at, given how short it is:

**If this service's process vanished right now, what would be lost?**

If the answer is "nothing — start another one and it carries on", it belongs in the cluster. It's stateless, it's replaceable, and orchestration is genuinely good at managing that kind of thing.

If the answer names something physical — a graphics card, a specific array of disks, a device on a USB port — then it doesn't belong in a cluster, and putting it in one gains nothing while costing quite a lot.

That's it. That's the whole rule.

## Why pinning a pod is worse than a systemd unit

The tempting move with a service that needs specific hardware is to containerise it anyway and pin it to the node that has the hardware. Kubernetes will happily let you: a node selector, a host path mount, done. Now everything's in the cluster and the diagram is tidy.

But think about what you actually have. A workload that can only ever run in one place, whose storage is a path on that machine's filesystem, which cannot be rescheduled because rescheduling it breaks it.

That's a systemd unit. It's a systemd unit with a container runtime, a control plane, and an orchestrator underneath it — all of which are additional things that can fail, in exchange for none of the benefits orchestration exists to provide. You can't reschedule it. You can't scale it. You've bought the complexity and declined the payoff.

So the services holding hardware stay as systemd units: the model servers on the GPU box, the retrieval service that reads a specific array, the speech services, the vision work on the small ARM board. Not because they're legacy. Because that's what they are.

The stateless HTTP services — the router, the skill service, the interfaces — are the ones where a pod is genuinely better, and those are the ones moving.

## The cluster is one node and I'm honest about it

The cluster has a single server node.

I'm explicit about that, including in the docs, because it's the kind of thing that quietly grows into a lie. Kubernetes carries an implication of high availability, and a one-node cluster has none. If that machine goes down, everything on it goes down. It's an orchestrator and a deployment model, not resilience.

There's a specific trap here worth flagging for anyone with a small cluster. The control plane's data store wants an *odd* number of members and a real quorum — three, realistically. Going from one node to two doesn't improve availability; it makes things worse, because now two machines must agree and either failing breaks you. **One to two is a downgrade.** The valid move is one to three, and I don't have three machines I'd trust to be stable, so the cluster stays at one and I stop telling myself a story about resilience.

Naming that constraint out loud has been worth more than the cluster has.

And I'll be just as honest about where this stands: today it's more design than deployment. The stateless services run as systemd units right now, and they move only once I've stood a pod up beside a unit, compared the same request against both, and switched the route on purpose — bootstrapping k3s rewrites the firewall on the machine that carries the room's audio, which isn't a change I make as a side effect.

## Ports don't change, so a rollback is a route change

The migration rule that made this safe: **a service keeps its port when it moves.**

The router listens on the same port whether it's a systemd unit or a pod. Everything upstream keeps pointing at the same place. The cutover is a routing change — send traffic to the new thing — and the rollback is that same change, reversed.

This sounds mundane. It's the difference between a migration you're willing to attempt on a Tuesday evening and one you keep putting off. If a rollback means redeploying the old thing, reconfiguring everything that talks to it, and hoping you remembered all of it, you'll do the migration once, badly, at the worst possible moment. If a rollback is flipping a route back, you'll try it on a weeknight and revert without drama if it's odd.

Reversibility is what makes people willing to change things.

## Deploy scripts that can be run twice

Everything not in the cluster gets a deploy script, and they're all shaped the same: copy files, create or update the virtual environment, install the systemd unit, restart, health-check.

The property that matters is that they're **idempotent**. Run one twice and the second run is harmless. Run one against a machine in an unknown state and you get a known state.

That's the whole point. When something's broken at 11 PM I don't want to reason about whether it's safe to re-run the deploy. Re-running the deploy should be the *first* thing I try, not a thing I think carefully about first.

They also health-check at the end. A deploy that copies files and restarts a unit and reports success without confirming the service is answering has told you it did some file operations, which is not what you asked.

## Secrets in the repository, which is fine

For the cluster half, configuration lives in git — including secrets, encrypted.

The encrypted values are committed. The key that decrypts them is not, and never will be. So the repository is a complete description of how the cluster should look, including its configuration, and it's safe to have that history because the ciphertext is worthless without a key that exists in exactly one place.

This is much nicer than the alternative, which is a repo that's *almost* a complete description plus a set of values you keep somewhere else and hope you remember to update. Half-declarative is worse than either extreme, because it looks complete.

## What I got wrong

I planned a migration when I should have made a decision.

For a while I had a list of services to move to the cluster — a backlog, implicitly ordered, everything on it eventually. That framing meant every service *not yet moved* felt like debt, which is a low-grade pressure to move things that shouldn't move, and I nearly containerised the GPU services for tidiness.

Reframing it as a permanent split fixed that. There is no backlog. There's a rule, each service is on the correct side of it, and services that will never move are not behind — they're *placed*. The only thing that changes is if a service's relationship to hardware changes.

Uniformity is not a goal. It's an aesthetic preference that sometimes coincides with good engineering, and this was a case where it didn't.

## If you're starting

You don't need Kubernetes. Genuinely, for a homelab, you may never need it — systemd units and a deploy script will run twenty services on one machine perfectly well, and that's most of what this lab did for a year.

If you're curious about it, learn it because you want to, and be honest that you're learning rather than solving. That's a completely legitimate reason. Just don't let it make you migrate the things that shouldn't move.

And write the idempotent deploy script whatever platform you're on. That's the piece that pays for itself immediately, at any scale, on any machine.

Next: putting the lab's state in the room instead of on a screen.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Growtika](https://unsplash.com/@growtika?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
