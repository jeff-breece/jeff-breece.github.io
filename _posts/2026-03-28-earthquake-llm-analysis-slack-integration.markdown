---
layout: post
date:   2026-03-28 10:00:00 -0500
original_date: 2026-03-28 10:00:00 -0500
last_modified_at: 2026-03-28 10:00:00 -0500
title: "Resonance Lab: Building an Automated Seismic Monitoring + AI Analysis Pipeline in a Homelab"
description: "Taking the earthquake collector from a console demo to a fully automated systemd service with local LLM analysis and Slack Block Kit notifications, all running on a single homelab server."
tags:
  - dotnet
  - csharp
  - llm
  - ollama
  - slack
  - automation
  - systemd
  - usgs
  - earthquakes
  - homelab
excerpt_separator: <!--more-->
---
Every so often, a weekend project turns into something a little more *infrastructure-shaped* than you originally planned. Resonance Lab started that way for me: I wanted a clean, automated way to track global earthquake activity, archive the raw data, and then let a local LLM reason about what it actually *means*—without relying on cloud services.

The end result is a fully automated seismic monitoring and AI analysis pipeline running entirely inside my homelab, posting structured risk assessments straight to Slack. This post is a walkthrough of what I built, why I built it this way, and what I learned along the way.
<!--more-->

***

## The Lab Environment

Everything runs on a single machine:

*   **Host:** `lab-stt`
*   **OS:** Ubuntu Linux
*   **IP:** `10.0.100.10`
*   **Storage:** RAID array mounted at `/mnt/raid`
*   **Project name:** **Resonance Lab**

The goal was *edge-first*: local storage, local compute, local AI inference. Internet access is used only to pull public earthquake data from USGS.

***

## Overview of the Pipeline

At a high level, the system does this on a schedule:

1.  Pull multiple earthquake CSV feeds from the USGS
2.  Archive raw data to RAID-backed storage
3.  Compute summary statistics and persist them as JSON
4.  (Optionally) Send the dataset to a locally running LLM for analysis
5.  Save the AI-generated assessment as Markdown
6.  Post a rich Slack notification with stats + analysis

All of that logic lives in a single .NET worker service.

***

## The Collector Service

The heart of the project is a **.NET 9 worker service** called **`EarthquakeCollector`**.

### Why a Worker Service?

*   No HTTP surface area
*   Perfect fit for scheduled background work
*   Clean integration with `systemd`
*   First-class logging and dependency injection

The service runs continuously under `systemd`, waking up every **6 hours** to collect data.

### USGS Feeds

The collector pulls four CSV feeds from USGS:

*   `2.5_month`
*   `significant_week`
*   `4.5_week`
*   `all_day`

Each feed is treated independently, which keeps the logic simple and the outputs predictable.

***

## Data Storage Layout

Everything lives under the RAID mount:

```text
/mnt/raid/data/earthquakes/
├── raw/
│   ├── 2.5_month_2026-03-28.csv
│   ├── significant_week_2026-03-28.csv
│   └── ...
├── stats/
│   ├── 2.5_month_2026-03-28.json
│   └── ...
└── analysis/
    ├── 2.5_month_2026-03-28.md
    └── ...
```

### Raw Data

Raw CSVs are archived **unchanged**. This was a deliberate decision—if my parsing logic is ever wrong, I still have the original data.

### Computed Statistics

For each dataset, the service computes:

*   Total event count
*   Min / max / average magnitude
*   Significant earthquakes (M4+)
*   Major earthquakes (M6+)

These are saved as compact JSON files so they're easy to consume later (or feed into something like Grafana).

***

## Local AI Analysis with Ollama + Qwen

This is where the project got fun.

When AI analysis is enabled, the service sends the earthquake data to a **locally hosted Qwen LLM**, running via **Ollama** on the same machine.

No API keys. No rate limits. No data leaving the lab.

The model generates a **seismic risk assessment** in natural language—things like:

*   Whether recent activity is clustered or diffuse
*   Presence of high-magnitude outliers
*   Short-term risk signals worth monitoring

The result is saved as a Markdown file alongside the stats.

This setup hits a sweet spot for *edge AI*: heavyweight reasoning, but still entirely under your control.

***

## Slack Notifications (When You Want Them)

After a successful AI analysis, the service posts a notification to Slack using an **incoming webhook**.

### Design Principles

*   **Opt-in only**
    If the webhook URL is empty, Slack is disabled.
*   **AI-gated**
    No AI analysis → no Slack message.
*   **Failure-tolerant**
    Slack errors are logged as warnings. The service never crashes because Slack is down.

### Block Kit, Not Plain Text

Messages are built using **Slack Block Kit** and include:

*   A header with the dataset name
*   Structured fields for:
    *   Timestamp
    *   Total events
    *   Magnitude range (min / max / avg)
    *   Significant and major counts
*   A divider
*   The full AI assessment
*   A context footer identifying Resonance Lab and the service

Slack has block size limits, so the AI response is **truncated to 2,800 characters** to stay safely under the cap.

The result is readable, scannable, and actually useful on mobile.

***

## Deployment: Self-Contained .NET on Linux

One of my favorite parts of this setup is how boring deployment is—in the best way.

### Self-Contained Build

The service is published with:

```bash
dotnet publish \
  -c Release \
  -r linux-x64 \
  --self-contained true
```

That produces a single, self-contained binary. No .NET SDK. No runtime installation. Just copy it over and run.

Deployment is handled by a simple shell script that uses `rsync` to push the build to `lab-stt`.

### systemd Integration

The service runs under `systemd` with explicit resource controls:

*   **Memory limit:** 512 MB
*   **CPU quota:** 25%

That's plenty for CSV parsing and LLM calls, and it keeps the service from misbehaving if something goes wrong.

***

## Lessons Learned

This project packed more "real-world ops" lessons than I expected.

### 1. GitHub SSH Auth on Headless Servers

If you're cloning repos on a server without a GUI, set up SSH keys *early*. Debugging auth issues over a serial console at midnight is not a vibe.

### 2. Self-Contained .NET Is a Game Changer

Being able to deploy a .NET service to Linux without touching package managers or runtimes is huge—especially in homelab environments where you want minimal drift.

### 3. Slack Webhooks Are Easy… Until They Aren't

Incoming webhooks are simple, but:

*   Block Kit limits are real
*   Long AI responses need truncation
*   You *will* forget to secure the webhook URL at least once

Treat the webhook like a secret, and design for failure from day one.

***

## Why This Was Worth It

Resonance Lab isn't about predicting earthquakes. It's about building **trustworthy automation** at the edge:

*   Public data, locally archived
*   Deterministic stats you can verify
*   AI reasoning you can inspect
*   Notifications that respect your attention

And maybe most importantly—it's fun to wake up, check Slack, and see your homelab calmly summarizing seismic activity from the other side of the planet.

If you're into homelabs, .NET on Linux, or running AI models where *you* control the stack, I can't recommend this kind of project enough.

Happy building. 🌍⚙️

## References

- [Earthquake Data, .NET, and Local LLM Reasoning](/2026/03/08/Earthquake-Data-DOTNET-and-Local-LLM-Reasoning.html) — the earlier post covering the original console-based earthquake analysis demo
- [USGS Earthquake Hazards Program feeds and web services](https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [.NET Self-Contained Deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
