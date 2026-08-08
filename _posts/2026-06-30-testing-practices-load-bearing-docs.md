---
layout: post
date: 2026-06-30 07:00:00 -0400
last_modified_at: 2026-06-30 07:00:00 -0400
title: "Load-Bearing Docs: How a Homelab Learns to Stop Lying to Itself"
description: "Four machines, three networks, and the day I discovered my own documentation was wrong. On writing tests that check claims rather than code — and why the cheapest thing in a homelab is a sentence nobody verified."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- testing
- ci
- documentation
- networking
- python
image:
  path: "/images/unsplash/testing-practices-load-bearing-docs.jpg"
  alt: "Laptop screen displaying colorful source code"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
This is the first post in a series about Resonance Lab — a home AI lab that grew, without much of a plan, from one small machine into four, three network segments, and a couple of dozen services that listen, index, route, and speak. I want to start at the least glamorous place I can think of: the moment I realized my own documentation had quietly become fiction, and what it took to make it tell the truth again.

If you're reading this with a secondhand laptop and a small model you downloaded last night, wondering whether that's enough to build anything real — it is. That's genuinely the whole thesis. Start with what's on the desk.

<!--more-->

# Load-Bearing Docs

*Or: the cheapest thing in a homelab is a sentence nobody checked*

## The lab, such as it is

Resonance Lab didn't get designed. It accumulated, the way a garage accumulates, one reasonable decision at a time until you look up and can't park in it.

It started with **lab-stt**, a Minisforum MS-01 — a small box with an i9, 32 GB of memory, and a pair of 18 TB drives striped together into something fast and, as I'd learn later, entirely unforgiving. The name is a fossil: it was going to run speech-to-text, that was the whole idea, and by the time it was also running the vector index, the journal parser, the health service, the logging aggregator and about fifteen other things, the hostname had set like concrete. Every lab has one of these. The machine named after the first job it ever did.

Then a **System76 Pangolin** became the operator console — the laptop I actually sit at, which turned out to matter more than I expected, because it's the only machine that can see both the wired lab and the Wi-Fi where half the smart devices live. Then an **NVIDIA Jetson Orin Nano**, 4 GB of RAM and an ARM chip, doing vision and OCR — small, strange, and completely without an internet route, which is a design decision I'll defend in a later post. And eventually **Atlas**, a desktop with a Ryzen 9 and an RTX 5080, because a 20-billion-parameter model on a CPU runs at about 1.7 tokens per second, which is roughly the speed of a patient man typing.

Four machines. Three networks: the AT&T segment the house lives on, a Netgear segment for the lab's own Wi-Fi, and a hardwired `10.0.100.0/24` for the machines that need to talk to each other without arguing with a smart bulb about airtime.

None of that is impressive kit. Atlas is the only piece that cost real money, and it came years into this. The MS-01 was chosen because it was small and quiet enough to live in a room I also sleep in. I mention the hardware not because it's the point but because it *isn't* the point, and I'd rather say so early. Most of what follows in this series would run on one machine. Some of it would run on a laptop from a dumpster.

## The problem with writing things down

Here's what happens when four machines and three networks accumulate over eighteen months: you write documentation. Of course you do. You write a network diagram, a hardware table, a runbook for each service. You are diligent. You feel good about it.

And then you change something.

You move a machine to a different segment because the Wi-Fi in that corner of the house is better. You renumber a subnet. A DHCP lease expires while you're on holiday and a device comes back with a different address. Each of these is a five-minute change, and each of them silently invalidates a paragraph you wrote four months ago and haven't read since.

The documentation doesn't complain. That's the whole problem. Code that goes stale throws an exception; a wrong sentence in a runbook just sits there being wrong, patiently, until 11 PM on a Sunday when you're following it as a recipe and it walks you into a wall.

I hit this hard enough that I stopped treating it as a discipline problem. I'd been telling myself I needed to be more careful about updating docs. That's the same category of solution as "I need to be better about flossing" — technically correct, empirically useless. The failure wasn't diligence. The failure was that nothing in my system could tell the difference between a true sentence and a false one.

## Making the documentation testable

So the docs became tests.

There's a file in the repo called `tests/test_network_topology.py`. It's not a network test in the sense you might expect — it never touches the network. It runs in CI, on a GitHub runner in some data center, with no access to my house at all. What it does is much simpler and, I've come to think, much more useful: it declares the canonical facts about my lab as Python constants, and then asserts that the tooling which relies on those facts still spells them the same way.

```python
LAB_STT_WIRED    = "10.0.100.10"
LAB_STT_WIFI     = "192.168.1.148"
JETSON_WIRED     = "10.0.100.30"
HOME_ASSISTANT   = "192.168.1.138"
LAB_LAN_SUBNET   = "10.0.100.0/24"

# All service ports that smoke-test.sh must probe on lab-stt
REQUIRED_SMOKE_PORTS = [8000, 8001, 8002, 8087, 8005, 8010]

# Ports that must never be bound on 0.0.0.0 in any repo service unit
RESTRICTED_PORTS = [111, 2049]  # rpcbind, NFS
```

Then it reads the monitoring check, the smoke-test script, the service units and the network-hardening playbook, and checks that they line up: the canonical addresses and ports appear where they're needed, no service unit binds NFS on `0.0.0.0`, and the playbook scopes its exports to the wired lab subnet. Change an IP address in one place and the build goes red until the constant and the scripts agree again.

That last part is the bit I care about. The test doesn't just keep my configuration internally consistent. It anchors the canonical facts in one place the scripts can't quietly drift away from, and it guards the one document that would hurt most if it lied — the hardening playbook — the same mechanical way, so that file can't lose the lab subnet or grow a wildcard NFS export without turning the build red. It doesn't check every sentence I've ever written about the lab; I wish it could. But the facts most likely to walk me into a wall are now defended rather than merely recorded.

There's a second, meaner assertion in there too: no service unit in the repo may bind rpcbind or NFS on `0.0.0.0`. That's not documentation drift, that's a whole class of mistake I don't want to be able to make while tired.

<a href="/images/unsplash/testing-practices-load-bearing-docs-support.jpg" target="_blank" rel="noopener noreferrer">
  <img src="/images/unsplash/testing-practices-load-bearing-docs-support.jpg"
       alt="A printed checklist beside a laptop"
       style="max-width:100%;height:auto;border:1px solid #ccc;border-radius:6px;display:block;margin:auto;" />
</a>
<br />

## The one that proves it

Now, the story that made me a believer.

For a long stretch, lab-stt sat at `192.168.2.3` on the Netgear segment. It's in old diagrams. It's in old runbooks. It was true.

Then it stopped being true — I reconfigured the network and lab-stt moved off that segment entirely, taking `192.168.1.148` on the house network for its Wi-Fi address and `10.0.100.10` on the wire. Fine. Ordinary.

Except one evening the Nanoleaf controller — a wall of light panels that displays lab status, which is its own post — dropped its lease on `192.168.2.7` and came back up holding `192.168.2.3`. The address lab-stt used to have. And because that controller keeps streaming state until something tells it otherwise, it froze on the last frame it had received and sat there, glowing, for about an hour, while I worked through a mental model in which that address was a completely different machine.

The address was real. The address was in my documentation. The documentation was describing a host that had already moved.

So now the constant in the test file is named `NANOLEAF_NETGEAR`, and it carries a comment explaining exactly what it is and what it isn't:

```python
# 192.168.2.3 is a real host on the Netgear segment and the hardening script
# must still cover it — but it is the Nanoleaf controller, not lab-stt.
```

That comment exists so nobody — including me at 2 AM, including any AI assistant reading this repo — can re-derive "lab-stt is on .2.3" from a plausible-looking variable name. The naming *is* the safeguard. This is the difference between a fact being recorded and a fact being defended.

## Two conventions, and why I keep them apart

A practical note, because it confused me for a while and it'll confuse anyone reading the repo.

There are two kinds of test in this project and they're invoked differently. The first is ordinary pytest: files under `tests/`, collected and run the way you'd expect. The second is a set of standalone scripts that live next to the services they test — `gateway-service/test_gateway_service.py` and friends — which have a `__main__` block, print their own pass/fail table, and exit non-zero on failure. You run those directly, with `python3`.

I didn't plan this split so much as arrive at it, but I've kept it deliberately. The per-service scripts can be run on the host that's actually running the service, over SSH, without pytest installed and without the repo's test dependencies. When something's broken at 11 PM, the diagnostic runs where the problem is. That's worth the inconsistency.

The cost is that pytest won't meaningfully collect them, and anyone who assumes it does will think they have coverage they don't have. So it's written down — and, being written down in this project, it's asserted.

## Tests that can't fail aren't tests

Two rules I hold to, both learned the hard way.

**Never delete a failing test to make the suite green.** This sounds obvious written down. It is not obvious at 11 PM when one assertion stands between you and going to bed. The failing test is the only part of the system still telling you the truth; deleting it doesn't fix anything, it just stops the conversation.

**Never weaken a test until it cannot fail.** This one is subtler and I've violated it without noticing. I had a test checking my editor config kept separate models for chat and autocomplete. It asserted a literal model name — `qwen2.5-coder:7b` — and so it failed every single time I upgraded a model, for a reason that had nothing to do with what it was protecting. Classic brittle assertion. I rewrote it to assert the *split* rather than the name, which is what I actually cared about.

But the version before that was worse, and it's the more interesting failure. It parsed a YAML config with a regular expression, and the expression was wrong in a way that merged every model block into one. Which meant it passed. It passed every time, including in exactly the situation it had been written to catch. A test that always passes looks identical to a test that's working, right up until you need it.

I only found it because I broke the config on purpose to see the test fail, and it didn't. I'd recommend that as a habit. A test you've never seen fail is a hypothesis, not a safeguard.

The same principle showed up again just this week, in a test asserting a literal `"20000"` appeared in the truncation logic. I'd since replaced that magic number with a named constant. Behaviour identical, intent identical, test red — for the crime of the number having a name now. A test that fails because a literal moved teaches people to ignore test failures, which is the most expensive thing a test can do.

## Keeping CI honest and offline

Two more things worth stealing.

The gateway's routing tests run in CI with `INTENT_ROUTER_BACKEND=regex`. The gateway normally classifies intent using embeddings, which means it needs a live model server — fine at home, impossible on a GitHub runner. So the regex backend exists partly as a fallback and partly as the CI-safe path: it makes the routing logic testable without anything to talk to. If a test needs my house to be online, it isn't a test, it's a phone call.

And gitleaks runs over the whole working tree on every push. Not the diff — the tree. Secrets don't only arrive in the commit that adds them; they arrive in the file you forgot was there. The one secret-shaped false positive in `.gitleaks.toml` — a model UUID that only looks like a key — is allowlisted by *value*, not by path, because "ignore this whole file" is how a real credential eventually walks in behind a fake one. There are a couple of path exemptions too, but only for files with nothing to hide: a content-hash cache and some built vendor bundles.

## What this is really about

I've come to think of the tests as the part of the lab that remembers accurately, because I don't. Not reliably. Not across eighteen months and four machines and a network I've renumbered twice.

That's the honest version. It isn't rigor for its own sake. It's that I'm building something with more moving parts than I can hold in my head, and the alternative to writing down what's true and defending it mechanically is a slow accumulation of small fictions that eventually costs you an hour staring at a frozen wall of lights.

If you're starting your own version of this — and I hope you are — you don't need four machines to begin. You need one. You need something you're curious about. The discipline scales down perfectly: a single file that says "these are the facts" and a single test that says "and here's where they must appear" works exactly as well with one host as with four. I wish I'd written mine on day one instead of month fourteen.

Next in this series: the measurement that decided every piece of hardware I've bought.

---

## Credits

_Hero photo by [Mohammad Rahmani](https://unsplash.com/@afgprogrammer?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._

_Supporting photo by [Markus Winkler](https://unsplash.com/@markuswinkler?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
