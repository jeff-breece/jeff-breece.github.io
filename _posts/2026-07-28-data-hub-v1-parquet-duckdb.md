---
layout: post
date: 2026-07-28 07:00:00 -0400
last_modified_at: 2026-07-28 07:00:00 -0400
title: "Looking Outward: A Small Data Lake for Public Sources"
description: "Earthquakes, economic series, market data, river levels and weather alerts, collected into Parquet on a home server and queried with DuckDB. On why a file format and a query engine beat a database here, and the trap of collecting more than you ask."
categories: [homelab, engineering, data]
tags:
- homelab
- resonancelab
- duckdb
- parquet
- dataengineering
- python
image:
  path: "/images/unsplash/data-hub-v1-parquet-duckdb.jpg"
  alt: "Screens of data and charts in a dark room"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
Everything so far has been about the lab looking inward — its own health, my own notes. This post is the one place it looks outward: a small data lake of public sources, collected on a schedule, stored as files, and queried without a database server.

It's also where I made the most common mistake in personal data projects, which is collecting things nobody was ever going to ask about.

<!--more-->

# Looking Outward

## What it collects

A set of public feeds, each on its own schedule: earthquake activity, economic series, market data, census figures, weather alerts, river and flood levels, ocean buoys, news and web sources, and a general crawler.

They're wildly different in shape and cadence — some update every few minutes, some quarterly — so each is its own small module with one job: fetch, normalise, write. Adding a source means writing one module and registering it, which is deliberately the least clever architecture available. This is the part of a system that grows by accretion for years, and the cost of a new source being *boring* is the whole design goal.

## No database, and why

Everything lands as Parquet files on disk, organised by source and date. Queries run through DuckDB directly against those files.

That means there's no database server. Nothing to run, nothing to keep up, nothing to back up separately, no port, no user accounts, no daemon that can be down when I want to ask something.

I want to be clear about how good this is, because it's a genuinely recent shift in what's practical for personal-scale data. A columnar file format plus an embedded engine that reads it gives you most of what a data warehouse gives you, with none of the operational surface. You point a query at a directory of files and get an answer.

The properties that matter here:

**The files are the data.** No import step, no server owning them. Copy the directory and you've copied everything. Back it up like any other files — which, per the backup post, is exactly what happens.

**Storage is cheap and queries are fast.** Columnar compression on this kind of data is dramatic, and aggregations over a lot of rows are quick because the engine only reads the columns you asked for.

**It's boring in ten years.** Parquet is widely supported and will stay readable. A personal archive shouldn't depend on a specific server version I'd have to keep alive.

For anything at personal or small-team scale, I'd now reach for files-plus-engine before a database server, and I'd want a specific reason to move — concurrent writers, transactional guarantees, actual multi-user access. None of which describes one person asking questions about earthquakes.

## The mistake

Now the honest part.

I collected too much. Several of those sources went in because collecting them was *interesting* — a new API, a new shape of data, an afternoon of pleasant work — and I have never once asked a question of them. They accumulate quietly, on a schedule, forever.

That's not free. Each source is a scheduled job that can fail, a schema that can change upstream, a directory that grows, a thing that shows up in monitoring and needs attention when it breaks. I've spent real evenings fixing collectors for data I've never queried.

The lesson I'd pass on: **collect against a question you actually have.** Not one you can imagine having. The imagined future question is the enemy here, because it justifies anything and costs continuously.

I haven't removed the unused ones. I should. There's a lesson in that too — the same instinct that collects them makes them hard to delete, because deleting feels like losing something, even though what's actually being lost is a maintenance burden and some disk. I'm writing it down partly to make myself do it.

## Where it meets the assistant

The collected data gets embedded into the same vector store the personal memory uses, in its own separate collections. That's what lets me ask about it conversationally rather than by writing SQL.

This produced a routing quirk I like, mentioned back in the gateway post: the setting for where "data" questions go defaults to the retrieval service, because that's where the collections physically live. There is no separate data service. A comment in the config explains it, so nobody "fixes" the apparent copy-paste error.

The general point is that adding a whole new *domain* of knowledge to the assistant didn't require a new service. It required a new collection in a store that already existed and a route that already worked. That's the payoff for having drawn the boundaries between components reasonably: new capability arrives as configuration rather than architecture.

## The one in another language

A footnote that amuses me. One collector — the earthquake one, the first — is written in C#, as a background service, complete with its own notification path.

It's the odd one out and it's staying. It works, it's been running for a long time, and rewriting it in Python for consistency would cost an evening to produce exactly what I already have. Uniformity is not a goal, per the deployment post. It's a preference that sometimes coincides with good engineering and here plainly doesn't.

There's a small pleasure in a system with one component in a different language purely because that's what I felt like writing that month. Personal projects are allowed that.

## If you're starting

Pick one source and one question.

Not a platform, not a pipeline. One feed you're curious about, fetched on a schedule, written as Parquet, queried with an embedded engine. That's an evening, it runs on a laptop, and it'll tell you whether you actually want the data — which is the thing I skipped, to my cost.

If after a month you've asked a question of it, add a second source. If you haven't, delete the first and you've lost an evening rather than a year of quiet maintenance.

Next: something I built the opposite way, where the whole point was *not* letting a model decide.

{% include resonance-lab-series.html %}

---

## Credits

_Hero photo by [Kevin Ku](https://unsplash.com/@ikukevk?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
