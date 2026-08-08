---
layout: post
date: 2026-07-16 07:00:00 -0400
last_modified_at: 2026-07-16 07:00:00 -0400
title: "A Dropped Log Is Worse Than an Ugly One"
description: "Collecting logs from four machines into one place, and the rule that shaped the whole design: ingest never rejects an event for its content. On hot and cold tiers, enriching at the aggregator, and why a schema quibble should never lose you data."
categories: [homelab, engineering]
tags:
- homelab
- resonancelab
- logging
- observability
- parquet
- python
image:
  path: "/images/unsplash/uls-unified-logging-system.jpg"
  alt: "Lines of code reflected on a dark screen"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The previous post ended with a request ID threaded through six services. That's only useful if you can read all six services' logs in one place, which is what this post is about.

The design turns on a single rule that I'd argue for in any logging system: **the ingest endpoint never rejects an event because of what's in it.**

<!--more-->

# A Dropped Log Is Worse Than an Ugly One

*On collecting logs, and on refusing to be picky about them*

## Four machines, twenty services, one question

By this point the lab had logs everywhere. Every service wrote its own, on whichever machine it happened to run on, in whatever format seemed reasonable at the time.

Answering "what happened when I asked that question" meant SSH to one machine, find the log, note the timestamp, SSH to another, find its log, try to line them up. It's tedious enough that you skip it, and skipping it means guessing — and I got quite good at confidently guessing wrong.

So: collectors on every machine, forwarding to one aggregator. The aggregator runs on the main server because that's the machine that owns the array and every backup tier, which means the logs land where the storage and the protection already are.

## The rule

Here's the decision everything else follows from.

The obvious way to build a log ingest endpoint is to validate. Define a schema, check incoming events against it, reject what doesn't conform. That's what you'd do for an API, and it's completely wrong here.

Think about when malformed events arrive. Not on a quiet Tuesday — they arrive when something is *broken*. A service crashing mid-write, a field that's null for the first time ever, an exception path that logs a different shape. The moments that produce weird log events are exactly the moments you most want the log.

A validating endpoint discards data precisely when the data is most valuable. It's a system that works beautifully when you don't need it.

So ingest never rejects for content. An event that doesn't fit gets *coerced* — made to fit as best it can — and **flagged** with a marker saying it was invalid on arrival. It's stored, it's queryable, and it's honest about being malformed.

That flag is what makes the compromise work. I'm not pretending the event was fine; I'm keeping it and labelling it. And searching for the flag turns out to be an excellent way to find bugs, because a service that suddenly starts emitting malformed events is usually a service that has started doing something else wrong too.

**A dropped log is worse than an ugly one.** It's the rule I'd take to any system that ingests observational data.

## Hot and cold, because logs have two lives

Logs get used in two completely different ways.

Something just broke and I want the last few minutes, right now, grepped. Or: I want to know how latency has moved over three months, which is analysis over a large amount of data I'll never read line by line.

Those want different storage. So there are two tiers.

**Hot** is line-delimited JSON, partitioned by date, kept for about a month. Appendable, greppable with ordinary tools, no special software to read at 2 AM when something's wrong. That last property is worth protecting — a debugging format that needs a working query engine is one more thing that can be broken when you need it.

**Cold** is Parquet — columnar, compressed, quick to aggregate over. Closed days roll from hot to cold, which compacts them enormously and makes the long-range questions fast.

Date-partitioning the hot tier means retention is a directory operation. Deleting a month means removing directories, not scanning and filtering. Making the expensive maintenance operation into `rm -rf` of a folder is the sort of small structural choice that keeps a system running unattended for a year.

## Enrich at the aggregator, not the collector

A design decision I got right by accident and would now defend on purpose.

Events get annotated with which network segment their host is on — useful context when you're trying to work out whether something is a connectivity problem.

That annotation happens at the aggregator, from a map it holds, rather than on each machine. Which means when the network changes — and in this lab it changes — I update one map in one place. If each collector enriched its own events, a network change would mean touching four machines' configuration and remembering that I had to.

The general principle: **derive context where the knowledge lives, not where the data originates.** The collector knows what it logged. The aggregator knows what the network looks like. Ask each for what it actually knows.

## The one that couldn't reach

A wrinkle that's specific to home networks and worth including because it's the kind of thing that never appears in a reference architecture.

The wall of light panels can't be reached from the main server — it's on a different segment. So alerts destined for it are routed through the workstation, which can see both.

That's inelegant. It's also correct, because the alternative is re-architecting a home network to make a diagram tidier. Home networks are constrained by what the landlord installed and where the router happens to be, and I've come to think the right instinct is to accept the shape and route around it, in one clearly-commented place, rather than pretend the constraint doesn't exist.

## What this gives me

The payoff is the one promised two posts ago: search for a request ID and see the whole path of a single spoken question, across four machines and six services, in order, with timing at each hop.

That capability changed how I debug more than any other single thing in the lab. Before it, investigating a slow response was thirty minutes of SSH and guessing. Now it's a search, and the answer is usually visible immediately — and usually not where I'd have looked.

It's also how I found several of the failures described elsewhere in this series. The half-empty index, the routing mistakes. Centralised logs don't fix anything by themselves, but they turn "something is wrong somewhere" into "this specific hop is doing this specific thing", and that's most of the work.

## If you're starting

You don't need collectors and tiers and Parquet. You need **one place**.

If you have three machines, a syslog target or even a shared directory that everything writes into is most of the value. The magic isn't the technology, it's that there's one place to look and the timestamps are comparable. I ran a version of that for a long time before any of the above existed.

Then add one field to every log line: something that identifies the request. That's the whole trick. Everything else here is refinement.

And when you write the ingest, be permissive. Take the ugly event, mark it ugly, and keep it. You'll want it.

Next: the moment a sentence arrives and something has to decide what kind of question it is.

---

## Credits

_Hero photo by [Ilya Pavlov](https://unsplash.com/@ilyapavlov?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
