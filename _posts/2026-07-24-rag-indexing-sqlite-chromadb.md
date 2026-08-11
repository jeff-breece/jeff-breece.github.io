---
layout: post
date: 2026-07-24 07:00:00 -0400
last_modified_at: 2026-07-24 07:00:00 -0400
title: "The Index That Was Quietly Empty"
description: "Building the lab's memory with SQLite and a vector store — and the two silent bugs that meant it spent months confidently retrieving from a fraction of what I'd given it."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- rag
- embeddings
- chromadb
- sqlite
- python
image:
  path: "/images/unsplash/rag-indexing-sqlite-chromadb.jpg"
  alt: "Abstract visualisation of connected data nodes"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The previous post produced tidy tables from my daily notes. This one turns them into something searchable — a database for the crisp parts, a vector store for the language, and a nightly rebuild.

It's also the post where I have to admit that this thing was subtly broken for a long time, in two separate ways, and that both bugs shared the same shape: **they made the system quieter rather than louder.**

<!--more-->

# The Index That Was Quietly Empty

## Two stores, because there are two kinds of question

"How many days did I exercise last month" and "what was I worried about in March" are not the same question, and pretending otherwise makes both worse.

The first has an exact answer that lives in a column. It's `COUNT` with a `WHERE` clause — arithmetic, no model, correct every time. Ask a vector store and you'll get a handful of entries that are *semantically near* the idea of exercise, from which something will approximate a number. That's a worse answer to a question that had a right one.

The second has no exact answer at all. There's no `worried` column. What you want is the entries that were *about* that feeling, which is precisely what embeddings are for and precisely what SQL cannot do.

So there are two stores. A SQLite database holding the structured columns, and a vector store holding the text — my journal prose, and separately, documents I've fed in on purpose. Which one answers a given question is a routing decision, and that's the next post.

The lesson underneath is one I'd generalise hard: **if part of your data has exact answers, do not put that part in a vector store.** Vector search is a wonderful tool for the genuinely fuzzy and a poor substitute for a database. A lot of "RAG doesn't work for me" is a question with a crisp answer being asked of an index that can only do resemblance.

## The rule about the embedder

Everything in the vector store was embedded by one specific model, and it must stay that way.

This is more absolute than it sounds, so let me be precise about why. An embedding model defines a space. Vectors from a *different* model are not slightly-off in that space — they're meaningless in it. Distances between them and the existing contents are garbage that looks exactly like similarity, and the threshold gets applied to that garbage and cheerfully returns neighbours. You don't get "no results" — you get **confident, wrong results**.

So the model is fixed, and there's a comment in the code saying so in about the same tone I'm using here.

Which creates a problem, because the machine that runs it isn't always available — the GPU box gets busy, or I unload models to free memory for something else. Early on, that meant retrieval simply died while the *generation* path failed over happily and kept answering. The assistant would keep talking, having quietly lost the ability to remember anything.

That state is worse than being down. A companion that still speaks but can no longer recall who you are looks completely healthy from the outside. Nothing errors. The answers just get generic, in a way you might attribute to the model having an off day.

The fix draws a line I've come to like a great deal: **the host may fail over; the model may not.** Every machine in the lab runs the identical embedding model, so retrieval can move between hosts freely — and if a fallback host can't offer that exact model, it refuses rather than substituting. Falling back is safe here *only* because the thing being fallen back to is genuinely identical, and the code checks rather than assuming.

Note that this is the opposite of the rule for generation, where swapping to a different model is a perfectly reasonable degradation. Same lab, two components, opposite policies — because in one case the model is an interchangeable answerer and in the other it's the definition of the coordinate system.

## Silent failure one: the settings that didn't match

The bug I'm least proud of:

The indexer opened the vector store one way. The retrieval service opened it another way — same directory, slightly different client configuration. One of them passed a settings object; the other took the defaults.

That is enough. The two ended up not agreeing about the store they were both pointed at, and the practical result was that **rebuilds silently skipped work.** Not an error. Not a warning. The index rebuild would run, report success, take a plausible amount of time, and leave a substantial fraction of what I'd given it unindexed.

I didn't find this by seeing a failure. I found it by counting. I'd fed in a folder of documents, asked about one of them, got nothing useful, and assumed my question was badly phrased. It took actually querying the store for its contents — expecting a number in the thousands and getting one — to realise the ingestion had never happened at all.

Both sites now build their configuration from one shared function, so they cannot drift. That's the real fix; making the two calls match by hand would have lasted until the next edit.

## Silent failure two: the file type nobody added

The same investigation turned up a second one, smaller and dumber.

The document indexer has a set of file extensions it will process. PDFs, Word documents, presentations, spreadsheets. Perfectly sensible list.

It did not include `.md`.

I had been dropping markdown into the staging folder for weeks. The indexer walked the directory, checked each file against the set, silently skipped every one, and reported a successful run. Markdown is *most* of what I write.

Nothing was broken, exactly. The code did what it said. But "file with an extension I don't handle" was treated as "file that isn't there", when it should have been at minimum a line in a log saying *I skipped 47 files*. Now it is.

Two bugs, one shape, and it's the shape I keep meeting in this lab: **the system silently doing less than you asked, while reporting success.** A crash is a gift by comparison. It's specific and it's immediate and you fix it that afternoon.

## Rebuilds and the file that gets deleted

The whole thing rebuilds nightly, which is the right cadence for data that changes once a day.

The structured database is rebuilt from scratch each time — deleted and recreated. That's fine, because it's derived state and the CSVs are the source of truth. But it's a fact with a sharp edge, and I ran into it recently while adding a second index: anything else you put in that database file will be destroyed by a routine rebuild, silently, and you'll be left with a system that's quietly worse rather than obviously broken.

So new derived state gets its own file. Same principle as the settings: don't rely on remembering a hazard, arrange for it not to exist.

There's also a write-back path in the other direction — I can dictate a journal entry by voice, and it gets written into my notes as a draft, confirmed or discarded, and picked up by the next morning's parse and re-index. The loop closes: speak, it's written, it's parsed, it's indexed, I can ask about it. That took a while to get right and it's the piece that made the whole thing feel less like a database and more like something that's paying attention.

## If you're starting

Two things I'd do differently, and both are free.

**Count what you indexed.** Not "did it succeed" — how many chunks went in, from how many files, and how many were skipped and why. My index was wrong for months and every log line said it was fine. A single number printed at the end of a run would have caught both bugs immediately.

**Query your store directly, early.** Before you build retrieval on top, before you wire in a model, just open it and ask what's in there. I'd built three layers on an index I'd never actually inspected, which meant every symptom appeared somewhere far away from its cause, in a component I then spent time debugging.

And the small version of this is very small: a folder of text, a local embedding model, a vector store, and a script that puts one into the other. That runs on a laptop. Get that working and *look at what it contains* — the discipline is worth more than the scale.

Next: the service that decides which of these two stores a question belongs to, and what it does when it can't tell.

---

## Credits

_Hero photo by [Growtika](https://unsplash.com/@growtika?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
