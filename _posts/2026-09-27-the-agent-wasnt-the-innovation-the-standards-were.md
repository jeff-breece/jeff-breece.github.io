---
layout: post
title: "The Agent Wasn't the Innovation. The Standards Were."
date: 2026-09-27 12:00:00 -0400
categories: [engineering, AI]
description: "Two years building a small cloud delivery platform, and what a coding agent did and did not change. The speed came from standards written down the year before; the agent mostly used them."
tags:
  - agentic-ai
  - architecture
  - devops
  - gitops
  - adr
  - delivery
  - leadership
excerpt_separator: <!--more-->
---

**Summary:**
A coding agent did not make our small delivery team faster on its own. Most of the speed came from the standards we had spent the previous year writing down. The agent used what was already there. Where a repository held its own architecture, rules, specs and pipeline, agent-built work usually came back tested and gated in days. Where the knowledge lived in people's heads, in a chat workspace, or in two documents that disagreed, the agent stalled, and so did we. And the debt that hurt most this year was not found by an agent at all. A person found it, in production, the old-fashioned way.

<!--more-->

This is the story of two years spent building a cloud delivery platform at a company that wants to be scrappy and excellent, with a handful of people. It covers what worked, what I got wrong, and what I would tell anyone about to turn agents loose in their delivery process.

## The constraint: scrappy, but excellent

We are a small IT organization inside a mid-sized manufacturer. The cloud extends a large ERP system, covering both integrations and custom user interfaces. There is no platform team. There is an architect, a few cloud engineers, a rotating cast of consulting partners, and a business that wants results this quarter.

"Scrappy" is a fine value right up until it becomes the excuse for everything. You skip the private networking pattern "for time." The backlog tool gets abandoned mid-project because the spreadsheet is faster (and it is, for about a month). The one person who knows how the pipeline works goes on vacation.

The goal, at the time, had nothing to do with AI. A small team can't afford to relearn the same lesson twice, so the lessons have to live somewhere other than our heads. For us, that somewhere became the Git repository.

## 2025: laying floorboards

Most of 2025 went into unglamorous work. None of it was about agents, or about AI at all.

**Scaffold before you build.** On our first major integration project of the year, a document-automation workflow between the cloud and the ERP, the infrastructure scaffold and the YAML pipeline were done before any feature work began. Even the training data for a document-recognition model went into Git, so a pipeline could retrain it and round-trip the results without anyone touching a portal.

**Write the decision down, even if you're the only one writing.** After that project's rougher moments, I wrote our first Architecture Decision Record. It came with a list of the ADRs we should have had and didn't. I also asked for some "rules of engagement," because a small team burns out fast on back-to-back fire drills. By year end there were about a dozen ADRs, stored as Markdown in a Git repo owned by our architecture review board. Every one of them had the same author: me. More on why that was a problem below.

**Make the standard boring and specific.** That project's solution standards required PR review for all infrastructure and workflow changes, one parameter file per environment, and a staged pipeline. Nothing clever, just the same shape every time, which turned out to be the useful part.

**Templates are how an architect's time scales.** When a consulting partner arrived to start a large new initiative, we didn't hand them a blank subscription. We gave them the existing pipeline with the project-specific pieces removed, plus a delivery project seeded with our developer standards and PR-based oversight. My phrase at the time was "a roomy box to build the things inside of." Their environment was ready within a week of onboarding.

**Coach first, mandate later.** We ran training on pipelines, infrastructure templates and Git, and demoed docs-as-code to the review board. I paired with engineers on classic versus modern release patterns, and I admitted when I was out of my own depth, which was more often than I would have liked. Our order of operations was internal house first, then a standard for our contractors.

**The corners we cut.** 2025 also left debt behind, and I'll own it. The integration project shipped to production without the private DNS pattern we had written into our own standards, because the timeline won. The Dev and Test environments drifted from Prod naming. The backlog tool was abandoned and work moved to spreadsheets. Our retrospective produced a solid Definition of Done (smoke tests, rollback plan, security scan, alert validation), and then nobody owned putting it into practice.

## 2026: the agent arrives

By mid-2026 we had a coding agent in the delivery process. The early reaction from engineering leadership was roughly: this is a breakthrough, and we're going to have to govern it. Both halves turned out to be right.

We got the most out of the agent where we had already done the boring work on purpose. For a new internal application, I seeded the repository before the agent wrote a line. It had an agent-instructions file, a rules matrix, per-feature specs, and a factory pipeline. It also had several years of scattered design discussion condensed into short Markdown files I started calling "punch cards." The agent worked from cards on the board and produced a release candidate with dozens of unit tests, high line coverage, and automated end-to-end accessibility checks.

We reused that pattern for a small HR application. It went from plan to a handed-off, tested build within days. A third project used a generator to produce infrastructure from an approved intake file. The first run came back green and then refused to execute, because a handful of decisions only a human could make were still open. I count that as a success: the intake standard carried a list of things it would not decide on its own, and the generator honoured it.

One rule held all of this together, and I wrote it into our GitOps working standard:

> The agent changes nothing about the gates. It changes how fast we reach them.

Agent output goes through the same branch policy, the same PR review and the same pipeline stages as human output. There is no separate path for it.

We designed a demo for leadership around this. On a governed repo, the agent hit a conflict between a feature spec and the rules matrix, and it stopped and asked instead of guessing. We scripted that on purpose, and I say so when I show it. It is still the behavior I want: the agent fails early and cheaply, in a place a human will see it.

## What the agent exposed, and what it didn't

The clean version of this story says the agent revealed which repos were ready. The honest version has three parts.

**Drift is worse than absence.** The consulting-partner initiative from 2025 had standards in its repo from day one. Over a year, newer project decisions piled up beside them in a separate set of documents. Eventually a large pull request came up for review. The author and the reviewer were each applying a defensible but different source of truth. The review couldn't conclude, frustration boiled over on both sides, and I said something sharper than I should have. I apologized, then did what I should have done earlier: I drafted an ADR that says which document wins when two disagree. An agent working in that repo would have picked one of the two documents and produced work that half the team read as wrong.

**Tribal knowledge has an AI edition.** On that same initiative, a developer's working project memory lived in a personal chat workspace, not in the repo. It was useful to them and invisible to everyone else, including the agent. Our fix was to pull those memory files into the repository where the whole team could see them. "Silo'd conventions produce silo'd output" became one of my stock lines.

**The agent didn't find our worst debt. A person did, during a deploy.** The private-networking shortcut from 2025 came due in mid-2026. A sound refactor, done by people, failed in production because the environment still carried the old pattern. No agent was involved, and no agent could have caught it from the repo, because the shortcut had never been written down as a decision. It only existed in the environment.

The cleanup is where the standards earned their keep. We rebuilt the Dev environment on the correct private-networking pattern in days rather than weeks. We used agent-assisted scripts, with hard guardrails, behind evidence gates. Every time the evidence looked untrustworthy, the engineer running it stopped, including once when the agent-assisted verification script itself had a bug. That is what the gates are for. They apply the same evidence rule to a script an agent helped write as to one a person wrote.

Locking the environment down then broke our deployment path, because our hosted pipeline agents couldn't reach private endpoints. An engineer had flagged that gap months earlier. The fix was a small self-hosted agent pool inside the network, backed by an ADR our security team approved. It took most of a quarter to get a decision on something that costs about as much per month as a team lunch. The least glamorous prerequisite ended up gating everything else.

## Drawing the human-agent line

Our working model is short enough to fit on a slide:

> Humans own the entry points and the exit gate.

The entry points are the repo standard and the work items. A human decides what the repo says is true and what the card asks for. The exit gate is code review. A human decides what merges. In between, the agent is welcome to move as fast as it can.

A few rules make that line concrete:

- **An agent identity is never an approver.** Branch policies require group-based human approval.
- **Generated code that an engineer can't read and explain doesn't merge.** This is from our team's operational standards guide, and it is aimed as much at people as at agents.
- **Review skill has to keep up with generation volume.** Automated review helps, but it can't be the only review. If the team can produce code faster than it can understand it, that is a staffing problem, whatever the tooling numbers say.
- **Destructive or irreversible changes stay human.** Our agent tasks for infrastructure repair were explicitly non-destructive, with named things the agent could not touch.
- **Roll out in waves, gated on training.** We didn't hand every engineer an agent on day one. Each wave came after the training, because the goal was "a mature pattern, not a slop factory."

## What I got wrong

If I only told the wins, this would be a vendor talk. Here is what I would do differently.

- **I let a written standard slip for a deadline.** The networking pattern was in our own standards document, and I built around it under time pressure anyway. The engineers who came after me paid for it a year later.
- **I stayed the only author too long.** A decision record that one person writes and nobody reviews is a diary. It became institutional memory only in 2026, when about two dozen ADRs went through structured peer review, each read through a different domain lens, with no verbal-only approvals. I should have forced that a year earlier.
- **I let delivery push training aside.** I rescheduled the pipeline training more than once because go-live won every time. Some of the knowledge gaps we flagged in 2025 were still open months later.
- **I became the bottleneck I was trying to remove.** For a stretch I was reviewing most PRs myself, and a single large review could eat most of a day. This fall I stepped out of routine review and told the team, "You have the wheel now." I should have said it sooner.
- **Some of the speed was my own long hours.** Part of the 2026 acceleration came from me working late, not from the standards alone. That isn't repeatable, and a talk that hides it would be selling something false.
- **I didn't measure enough.** I can show test counts, rebuild times, drift counts and dates. I can't yet show PR throughput, cycle time or rework rates for agent output. Without them, the "accelerated" claim is an anecdote I believe, and not yet proof.

One correction to my own pitch: I used to say repos with good standards "accelerated immediately." The evidence supports that for new repos we seeded on purpose. It does not yet support it for older repos we retrofitted.

## A framework for agent-ready delivery

If you're about to bring agents into your delivery process, this is the order I would do things in. None of it needs a particular AI product.

1. **Put the brain in the repo.** Architecture, standards, runbooks, decisions and project memory go in the repository as plain text. If it lives in a wiki nobody updates, a chat workspace or someone's head, the agent can't see it, and neither can your next hire.
2. **Declare one source of truth.** Write down which document wins when two disagree. Drift between competing standards is worse than having no standard, because both sides can be right.
3. **Make decisions reviewable, then review them.** ADRs are only institutional memory once someone other than the author has read them and signed off.
4. **Build the gates before the speed.** Branch policy, PR review, staged pipelines, a Definition of Done. Agents should hit the same gates as people, just sooner.
5. **Template everything you'll do twice.** A seeded repo with standards, pipeline and agent instructions is how a small team multiplies capability without multiplying headcount.
6. **Draw the human-agent line explicitly.** Humans own the entry points and the exit gate. Agents are never approvers, and code nobody can explain doesn't merge.
7. **Fix the unglamorous platform prerequisites.** Networking, identity, and pipeline agents inside your network. They gate everything, and nobody wants to fund them.
8. **Measure from day one.** Pick throughput, cycle time and rework before the first agent PR, so you can prove what you believe.

## The agent is a mirror

Two years ago, I would have told you we were doing DevOps modernization. Today I would call it preparing for Agentic Ops, but the work was the same. We wrote things down, put them in Git, made the gates boring and reused what worked.

The agent didn't create that discipline. It showed us, quickly and with no diplomacy, where we had it and where we didn't. Where we had it, a small team moved like a much larger one. Where we didn't, we got the same problems we always had, only faster. In my experience so far, AI amplifies whatever engineering discipline is already there, and it amplifies the gaps just as faithfully.

I'll be going deeper on this in my talk, "The Agent Wasn't the Innovation. The Standards Were." It covers the repos, the ADRs, the change management, and the human side of asking a small team to work differently.
