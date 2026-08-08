---
layout: post
date: 2026-07-14 07:00:00 -0400
last_modified_at: 2026-07-14 07:00:00 -0400
title: "From Wake Word to Soundbar: The Whole Voice Pipeline"
description: "Six services, one sentence, and no cloud. Tracing a single spoken question through speech-to-text, routing, retrieval and back out to a speaker — and the two unglamorous details that made it feel like a conversation instead of a form."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- voice-ai
- whisper
- piper-tts
- localai
- python
image:
  path: "/images/unsplash/voice-pipeline-architecture-overview.jpg"
  alt: "A studio microphone in low light"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
This is the post the whole lab is really about. Everything up to now — the machines, the monitoring, the lights on the wall — was scaffolding for one thing: being able to say something out loud in my office and have the room answer, using models that run entirely on hardware I own.

Here's the whole path, and the two small details that made the difference between a demo and something I actually use.

<!--more-->

# From Wake Word to Soundbar

*One sentence, six services, no cloud*

## Why bother, when the phone already does this

Reasonable question, and I want to answer it honestly rather than reach for privacy as a slogan.

Privacy is part of it. Not because I'm doing anything interesting, but because the useful version of this assistant knows things about me — what I've been reading, how I've been sleeping, what I said I'd do this week — and the more useful it gets, the more the *arrangement* matters. There's a version of that which lives on someone's servers under a terms-of-service I don't control, and a version that lives on a box in my office. I wanted the second one, and I wanted to find out what it costs to build.

But the bigger reason is that I wanted to understand the thing. A commercial assistant is a sealed surface — when it does something odd, you shrug. When mine does something odd, I can trace a single sentence through six services, find the hop where it went wrong, and fix it. That has taught me more about how these systems actually behave than any amount of reading, and most of that learning came from the failures.

## The path

Here's what happens when I say something:

```
speech
  → speech-to-text          (:8000, Whisper, CPU)
  → gateway                 (:8003, where does this go?)
  → retrieval | skills | model
  → text-to-speech          (:8001, Piper)
  → soundbar
```

Six hops. Every one of them a small HTTP service on a machine in my office, every one of them individually restartable, none of them talking to anything outside the house.

The pieces are unremarkable on their own, and I think that's worth saying plainly: this is not clever. It's a handful of ordinary services wired together in an obvious order. What made it *work* was two details that I would have called implementation trivia when I started, and now consider the actual substance.

## Detail one: the cold start you never see

Whisper takes somewhere between five and fifteen seconds to load.

Load it lazily — on the first request, as most tutorials do — and the very first thing you ever say to your assistant times out. Not fails, exactly. Just sits there for ten seconds while you stand in your office feeling foolish, and then answers.

That first impression is disproportionately important, and not for sentimental reasons. It sets whether you *reach for the thing*. A tool that's unreliable in its first second gets used once a week; a tool that answers immediately gets used forty times a day and becomes something you build on. I have several projects in this lab that died at exactly this point, of nothing more serious than feeling slightly unreliable.

So the model loads eagerly, during service startup, before the port ever accepts a request. The service takes longer to come up and is never slow once it has. That's the correct trade for anything that a human waits on, and the general shape — *pay the cost at a moment nobody is watching* — is one I now look for everywhere.

The model itself is the `base` Whisper, running int8 on a CPU. Not the large one. It's less accurate on unusual words and completely fine for "what's on my calendar" or "restart the light display", and it's fast enough to feel instant. Choosing the smaller model was the single best latency decision in this pipeline, and I'd nudge anyone building this to start smaller than they think they need and only move up when a specific failure demands it.

## Detail two: one ID through the whole thing

Every utterance gets an ID at the moment it becomes audio, and that ID travels the entire path — passed as a header from service to service, included in request bodies, written into every log line at every hop, alongside how long that hop took.

This sounds like bookkeeping. It is the difference between a debuggable system and a haunted one.

Without it, "the assistant took eight seconds to answer" is the beginning of an investigation: you go host by host, guess which logs to read, try to match things up by timestamp, and hope nothing else was happening at the same moment. With it, you search for one string and get the whole story in order, with a number on each stage. The answer is usually immediate and usually surprising — the slow hop is almost never the one I'd have bet on.

If you take one thing from this post, take this one. It costs an afternoon to add and it pays that back the first time something is slow for a reason you can't guess. And it's completely independent of scale — the same trick works with two services and a shell script.

## Giving it a voice, and then four of them

Output goes through Piper, which turns text into speech locally and quickly. That was the whole requirement at first: say the words.

Then the assistant grew more than one personality — that's a later post, and it's where this series is heading — and they all sounded identical, which was quietly awful. Four different characters with four different jobs, one voice. It felt like a switchboard.

So voices are mapped per persona. The operations one has her own voice; the others have theirs. It took an afternoon and it changed the experience completely, because you know who's answering before you've parsed a word. That's an enormous amount of information delivered for free, in the first syllable, and it's the same principle as the light panels: use a channel the human already has, rather than making them read.

One small security note, because it's a nice example of a whole bug class avoided by construction. Selecting a voice means turning a name into a file on disk, and the naive version joins strings — which is how you end up with a request for a voice called `../../etc/something` doing something you did not intend. Instead, the service enumerates the voices actually installed on disk and looks the requested name up in that set. A name that isn't a real installed voice doesn't resolve, so there is no path to traverse. The lookup makes the attack unrepresentable rather than blocked, which is always the better version.

## What it's like to use

Honestly? Mostly ordinary, which is the highest compliment I can pay it.

I ask it things while doing something else. It answers in about the time a person would. Sometimes it mishears me, usually when I've mumbled, and I repeat myself the way you would with anyone. The failures are more interesting than the successes — the times it confidently answered from the wrong context, or wouldn't stop asking a clarifying question, are what several of the later posts in this series are about.

What surprised me is how much the *unremarkableness* is the achievement. The impressive-seeming parts — running your own speech recognition, your own language model, your own speech synthesis — turned out to be the easy parts, because that software is extraordinarily good now and mostly just works. The hard parts were latency, knowing which of six services broke, and the assistant having a personality that didn't grate. None of those are AI problems. They're ordinary engineering problems wearing a novel hat.

## If you're starting

Build it end to end before you make any part of it good.

My first version was a shell script: record audio, POST to Whisper, POST the text to a model, POST the answer to a TTS binary, play the file. Maybe forty lines, terrible in every way, and it taught me more than the next month of refinement — because it put a working loop in front of me, and the loop immediately started complaining about the right things. The cold start was obvious in an afternoon. Latency told me which model size to use. Nothing in that list came from planning.

You can write that script today with whatever machine you have. A small Whisper model runs on very modest hardware, a small language model will answer basic questions on a laptop, and Piper is light. It'll be slow and rough and yours, and the rough version will tell you exactly what to build next — which is knowledge you cannot get any other way.

Next: getting all six of those hops into one place, so a single request ID tells the whole story.

---

## Credits

_Hero photo by [Linpaul Rodney](https://unsplash.com/@linpaul?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
