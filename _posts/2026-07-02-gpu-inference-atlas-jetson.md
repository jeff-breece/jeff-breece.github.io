---
layout: post
date: 2026-07-02 07:00:00 -0400
last_modified_at: 2026-07-02 07:00:00 -0400
title: "1.7 Tokens Per Second: How the Lab Got Its GPUs"
description: "Three inference hosts, arrived at one bottleneck at a time — a CPU-only server, a 4 GB Jetson with no internet, and eventually a GPU desktop. On buying hardware only when something is actually broken, and the guard that stops my dev tools starving the assistant."
categories: [homelab, engineering, AI]
tags:
- homelab
- resonancelab
- ollama
- gpu
- jetson
- localai
- python
image:
  path: "/images/unsplash/gpu-inference-atlas-jetson.jpg"
  alt: "Close-up of a graphics card and cooling fans inside a desktop computer"
excerpt_separator: <!--more-->
series: "Resonance Lab"
---

**Summary:**
The lab now has three machines that can run models, and I want to be precise about how that happened, because "three inference hosts" sounds like a plan and it was nothing of the kind. Each one arrived because something specific was broken, and I could name what.

If you're running a small model on a laptop and wondering when you're supposed to buy a GPU: not yet. Probably not for a while. Here's how I'd know.

<!--more-->

# 1.7 Tokens Per Second

## The number that changed things

For most of the first year, everything ran on **lab-stt** — the little Minisforum box from the [previous post](/posts/testing-practices-load-bearing-docs/). It has an i9 and 32 GB of memory and no graphics card worth the name, and for a long time that was completely fine. Speech-to-text on a CPU is fine. Embedding text on a CPU is fine, if you're patient. Parsing journals, serving a vector index, running a dozen small HTTP services — all fine.

Then I asked it to generate text with a 20-billion-parameter model, and it did, at roughly **1.7 tokens per second**.

I want to sit with that number for a second, because it's the most useful measurement I've taken in this project. 1.7 tokens per second is about the speed of a slow typist. It is not *unusable* — I used it for months. You can ask a question, go make coffee, and come back to an answer. For a batch job that runs at 3 AM, it's completely acceptable and I still use CPU inference for exactly that.

What it can't do is hold a conversation. The moment I wanted to speak to the lab out loud and have it answer before I'd forgotten the question, 1.7 tok/s stopped being a quirk and became the wall. That's the difference that mattered, and I couldn't have known it in advance. I had to build the voice pipeline first and *then* discover which part of it was intolerable.

That's the honest sequence, and I'd recommend it. Build the thing badly on what you own. The bottleneck will introduce itself.

## The Jetson: small, strange, and deliberately deaf

Before the GPU desktop, there was an **NVIDIA Jetson Orin Nano** — an ARM board with 4 GB of RAM, roughly the size of a paperback.

4 GB is not a lot. You are not running a 14b model on it and you shouldn't try. What it *is* good at is the narrow, constant, unglamorous work: reading text out of images, watching a camera feed and telling you when something changed, running a small speech model close to where the microphone is. It does vision and OCR, and it does them without ever bothering the big machines.

The Jetson also has no route to the internet. None. This started as an accident of where it sat on the network and I've since kept it deliberately, which means every model it runs has to be side-loaded from another machine. That's genuinely annoying about twice a year. In exchange, the device with a camera attached to it cannot phone anywhere, and I don't have to think about it beyond that. For a box whose whole job is watching a room, I'll take the trade.

I'll flag something here that matters for anyone copying this: **the Jetson being air-gapped does not make the lab air-gapped.** Atlas, the GPU host, has a Wi-Fi route out through the lab's own segment, verified again just recently — it can reach model registries and pull weights, which is most of why it's usable. One machine being isolated is a property of that machine. It's an easy thing to overstate when you're describing your own setup, and I'd rather be accurate than sound more locked-down than I am.

There's a related finding I haven't resolved: that Wi-Fi route puts Atlas on the same segment as a pile of IoT devices. It works. It's convenient. It's also a GPU host sharing a broadcast domain with smart bulbs, and I'm recording it as an open question rather than a design.

## Atlas, and the part where I finally bought something

**Atlas** is a desktop — Ryzen 9, and an RTX 5080 with **16 GB of VRAM**. It's the only piece of this lab that cost what I'd call real money, and it arrived years into the project.

It runs the language models and it runs image generation, and the difference between 1.7 tokens per second and what a 5080 does is the difference between correspondence and conversation. That's it. That's the whole justification. I didn't buy it to have a GPU; I bought it because I'd built something that a GPU fixed and I could point at the exact symptom.

Sixteen gigabytes is worth dwelling on, because it's not much by current standards and it constrains everything downstream. It's enough for a 14b model with room to spare, or image generation, or a training run — but not two of those at once, and that single constraint has shaped more design decisions in this lab than any other piece of hardware. Most of the interesting engineering below exists because 16 GB is a resource that has to be *allocated* rather than assumed.

It exposes metrics on `:9100` in a node-exporter-compatible format, so the dashboard and the wall of light panels can both see what it's doing, and a small spike detector watches the card so that when image generation claims most of the VRAM, the language-model traffic shifts to lab-stt instead of the two fighting over 16 GB.

## The bit I got wrong: VRAM is not a number, it's a reading

Here's a mistake worth your time.

I wrote a check that refused to start a training run unless enough VRAM was free. Sensible. Then I watched it measure **2.4 GB free**, and minutes later, with nothing having changed that I'd done, **13.4 GB free**.

Nothing was broken. A model had been sitting resident in memory with a keep-alive timer, and the timer expired. That's all. But it means "is there enough VRAM right now" is a question whose answer changes underneath you, and any code that reads it once and acts is going to be wrong a meaningful fraction of the time. A training run launched at the wrong moment doesn't fail fast — it fails *an hour in*, having written nothing, which is the worst shape a failure can have.

So the admission check doesn't trust a single reading. It asks the model server to unload, then polls, and it waits — for up to fifteen minutes — for the card to actually be free, rather than sampling once and hoping. And the floor it waits for is deliberately higher than what a run needs, because a job that starts with *exactly* enough memory will die the moment anything else touches the card.

This generalises past GPUs. Any measurement that can change between when you read it and when you act on it is a reading with an age, not a fact. It took me embarrassingly long to internalise that, and it comes up again later in this series in a much more serious context.

## The guard that stops me starving myself

The last piece is my favourite, because it protects the lab from *me*.

I use large coding models while I work. They're wonderful and they're enormous, and when one of them loads onto the same machine that's running the voice assistant, the assistant gets slow or stops answering. I did this to myself repeatedly — always while deep in something else, always taking a few minutes to work out why the room had gone quiet.

So there's a small guard process watching for it. It knows which models are *developer* models rather than lab services — currently a 30b coder and a small autocomplete model — and it watches three signals: load average per CPU, available memory percentage, and swap usage. If the machine is genuinely under pressure and one of those developer models is resident, it unloads it. Core services win. My editor loses.

Two details I'd defend. First, it only acts on an explicit list of developer models, so it can never decide the voice assistant itself is the problem — the blast radius is bounded by construction, not by tuning. Second, it has a fifteen-minute cooldown, because a guard that fires repeatedly in a tight loop is worse than no guard: it turns one degradation into a flapping system, and flapping systems teach you to ignore them.

## What I'd tell someone starting

Don't buy a GPU yet.

Run whatever you want to run on whatever you have, badly, and pay attention to which part of the badness actually stops you. Mine was conversational latency, and it took building an entire voice pipeline on a CPU to find that out. It might not be yours. If you're doing batch summarisation overnight, 1.7 tokens per second is *fine* and a graphics card would be a very expensive way to shorten a wait you're asleep for.

The three machines here didn't come from a plan. They came from three separate moments of being able to say precisely what was broken. A secondhand box and a small model will get you to the first of those moments, which is further than it sounds — and the moment itself is the valuable part, not the hardware you buy to answer it.

Next: how I found out whether any of this was actually running.

---

## Credits

_Hero photo by [Thomas Foster](https://unsplash.com/@thomasfos?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral)._
