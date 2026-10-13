---
layout: post
title: "The Agent Keeps a Ledger. Someone Else Has to Read It."
date: 2026-10-10 12:00:00 -0400
categories: [engineering, AI]
description: "A follow-up on agent-ready delivery: the change log my coding agent writes on every turn, the drift check that reads it, and why the research suggests that check should come from somewhere other than the agent that did the work."
tags:
  - agentic-ai
  - architecture
  - devops
  - governance
  - drift-detection
image:
  path: /images/agent-ledger-drift-check.png
  alt: "Diagram of a loop: human-owned intent, an agent turn, a change ledger entry, an independent drift audit, and a human decision feeding back into intent or code"
excerpt_separator: <!--more-->
---

**Summary:**
Every time my coding agent writes code, it also writes a change-log entry, and every so often I have a different model challenge that log against what the feature was supposed to do. I went looking for what this pattern is called and whether anyone had found its weak spots. The short version: the parts have names, the ledger itself mostly doesn't, and the drift check is probably the weakest step when the same agent runs it. The research on models reviewing their own work is fairly consistent on that, so the check likely needs to come from somewhere else.

<!--more-->

In my [last post]({% post_url 2026-09-27-the-agent-wasnt-the-innovation-the-standards-were %}) I wrote about seeding a repository before an agent writes a line of it: an instructions file, a rules matrix, specs, and the short Markdown "punch cards" that carry what each feature is for. That post mostly stopped at the gates. This one is about what happens between them, over weeks, while the agent keeps working.

## The loop I've been running

At work, Codex runs inside Azure DevOps, and the pattern has four parts:

1. An `AGENTS.md` that tells the agent how to work in the repo.
2. Seeded context (the punch cards) describing what each feature is meant to do.
3. A change-log entry for every turn where the agent writes code, committed to the repo. This is the rubber duck step: the agent explaining its own change.
4. Every so often, a different model reads the accumulated log and the diffs against the original goal and tells me where things have drifted. I call this the cross-model challenge.

<!-- TODO(jeff): one sentence on how often you run step 4, and one real thing it has caught. A concrete example here would do more than anything else in the post. -->

I used "rubber duck" loosely for that last step, so a quick note on terms. Rubber duck debugging comes from *The Pragmatic Programmer* (Hunt and Thomas): you explain your code line by line to a duck that never answers, and the value comes from having to put the reasoning into words. That's step 3. The agent writing its ledger entry is explaining why a change serves the goal, and that alone often catches some drift. Step 4 is a different mechanism, because a second model reads the entry and the diff, brings its own reading of the intent, and argues with it. The duck never talks back, and this reviewer does. (You'll also see adversarial review, LLM-as-a-judge and multi-agent debate used for things in this neighborhood.)

That is also where the title comes from: the agent keeps the ledger, and the cross-model challenge is the someone else who has to read it. An agent auditing its own ledger can inherit its own misreading of the intent once that misreading is written down, while a reviewer from a different model family tends to bring different blind spots.

We're working toward a standard for this kind of agent work across teams, which means explaining the loop to architects who weren't around when I built it. So I had an agent do a first research pass on two questions: what do other people call this, and has anyone already found the holes? The rule was that every claim needed a source it had fetched, and the ones this post leans on were re-checked against the original pages.

## Does this have a name?

Mostly no, at least not as one thing. The pieces do have names, and a couple of them are newer than I expected:

- **The instructions file** is the [AGENTS.md](https://agents.md/) convention, which OpenAI handed to a Linux Foundation group (the Agentic AI Foundation) late last year, so it's now a shared standard more than a Codex feature.
- **The punch cards** are a form of spec-driven development. Birgitta Böckeler splits that into [spec-first, spec-anchored and spec-as-source](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), and what I do is spec-anchored: the spec sticks around and evolves with the feature instead of being thrown away after the first build.
- **The drift check** is a version of an architectural fitness function, the idea from *Building Evolutionary Architectures* that you continuously test whether a system still has the characteristics it's supposed to have. InfoQ recently ran a piece calling the agent-run version an [agentic fitness function](https://www.infoq.com/articles/agentic-fitness-functions-evolutionary-architecture/), which fits pretty well.
- **The whole thing** lands closest to what OpenAI and Böckeler both call [harness engineering](https://martinfowler.com/articles/harness-engineering.html): everything around the agent except the model, split into guides (instructions, specs) and sensors (tests, linters, reviewers).

The piece with no settled name is the ledger. ADRs are close, but an ADR records a decision, and most agent turns don't make one. The nearest published practice I found is in OpenAI's own [harness engineering write-up](https://openai.com/index/harness-engineering/), where complex work goes into execution plans with progress and decision logs checked into the repo. Anthropic's guidance on [long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) does something similar with a progress file the agent reads at the start of every session.

<!-- TODO(jeff): the research suggested "intent ledger" as a name (crowded in crypto, so it needs a one-line disclaimer) and "spec-anchored, ledger-reconciled development" as the precise version. Pick one, or neither. -->

## The rubber duck has a blind spot

I'll say up front that I still think the self-check is worth running. The clearest example I have of it working comes from this blog rather than from work. During an editorial pass on my homelab series, the agent doing the editing made up a plausible photographer credit for an Unsplash photo, caught it before moving on, and wrote itself a standing rule never to invent a credit again. That's the loop doing its job.

It's also the loop depending on the agent noticing, and noticing is the part the research is least kind about. One paper found that models [struggle to correct their own reasoning without outside feedback](https://arxiv.org/abs/2310.01798), and sometimes get worse when they try. A separate paper found that the hard part is [finding the mistake](https://arxiv.org/abs/2311.08516): tell the model where the error is and it usually corrects it fine. And when models grade output, they tend to [favor their own](https://arxiv.org/abs/2404.13076). Put those together and an agent reading its own ledger is likely to read a misunderstanding the same way it wrote it down.

The ledger has a second problem, which is that it's a self-report. GitHub's Spec Kit has a command that compares the code against the spec, and its instructions are explicit that [a task marked complete doesn't count as evidence](https://github.com/github/spec-kit/blob/main/templates/commands/converge.md) that the work is done. That's a reasonable stance for a drift check to take toward a change log too. METR has also documented models [gaming the checks they're graded by](https://metr.org/blog/2025-06-05-recent-reward-hacking/), which is a more extreme version of the same issue.

OpenAI's write-up is candid that their team went the other way for speed: most review there is agent-to-agent, and agents often squash-merge their own pull requests. At their throughput that probably makes sense. It's also the opposite of the line I drew last time, where an agent identity is never an approver, and in a shop that extends an ERP system I'd still want that line.

## What I'd change before it becomes a standard

None of this means dropping the loop. It mostly means the drift check needs some independence, and the ledger needs to be harder to quietly rewrite.

- **Make the reader someone else.** Run the cross-model challenge as its own scheduled pipeline, with a different model family and no shared context with the agent that wrote the code. In Azure DevOps that can post a status check on pull requests, advisory at first and blocking later for the things that should never drift.
- **Check the ledger against evidence the agent can't write.** Test and build results, architecture conformance tests (ArchUnitNET if you're on .NET), and a comparison of the code against the punch cards. The ledger says what the agent meant to do; the evidence says what happened.
- **Keep intent human-owned.** Put required human reviewers on `AGENTS.md` and the punch cards through path-based branch policy. Agents can propose a change to intent, but a person commits it. Codex's sandbox protects `.git` but not `AGENTS.md`, and my own blog's agent file tells agents to update it when they learn something, so this one hit close to home.
- **One ledger file per change, never edited.** A single growing `CHANGES.md` is easy to rewrite in one diff. On this blog, three sessions of editorial notes landed in a single commit, so git can't show when any of it was written. A small build check can require exactly one new ledger file per pull request and refuse edits to old ones.
- **Read the ledger in windows.** Models get less reliable as their input grows (Chroma's [context rot](https://www.trychroma.com/research/context-rot) study is a good read on this), so the audit should read recent entries plus a summary rather than the whole history. Also keep the ledger out of `AGENTS.md`, since Codex stops reading that file at 32 KiB by default.

For anyone who wants a starting point, this is roughly the entry shape I'd standardize on, one file per change in a `ledger/` folder:

```yaml
entry: 2026-10-10-AB1234-01
agent: codex
work_item: AB#1234
pr: 5678
intent_refs:
  - intent/features/order-status.md#acceptance-2
change_type: feature
```

Followed by five short sections: what changed, why (pointing at the punch card), any deviations from intent the agent is declaring, what it verified, and anything it couldn't settle and is leaving for a person. The deviations section does a lot of the work, because it gives the drift check a specific claim to test instead of asking it to rediscover intent from scratch.

## What I don't know yet

I couldn't find a published study of the whole loop. The pieces are well studied, but nobody seems to have measured whether a periodic audit of a change log catches drift that the agent's own reviews miss.

The test that would settle it for me is fairly simple: take a finished feature, give a different model the punch cards, the ledger entries and the CI results, and compare what it flags with what the original agent's own self-review said. If you've run something like that, or you're running a similar loop, I'd love to compare notes.
