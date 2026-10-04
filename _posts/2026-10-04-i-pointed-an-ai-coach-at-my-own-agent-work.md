---
layout: post
date: 2026-10-04 07:00:00 -0400
title: "I Pointed an AI Coach at My Own Agent Work"
description: "I ran Microsoft's open-source AI Engineer Coach over 90 days of my own agent sessions. My prompts were mostly fine. The structure around them usually wasn't, some of the scoring rules were built for a different way of working, and the local half of my stack never showed up at all."
categories:
- engineering
- AI
tags:
- agentic-ai
- coding-agents
- local-ai
- developer-productivity
- standards
- homelab
- observability
image:
  path: /images/coach-hero-heatmap.png
  alt: "A heatmap of when I work with coding agents, by weekday and hour, brightest on Thursday evening"
excerpt_separator: <!--more-->
---

**Summary:**
I ran AI Engineer Coach, an open-source VS Code extension from Microsoft, over the past 90 days of my own agent sessions. The scan was humbling in a useful way. My prompts were usually detailed enough, but most of them gave the agent no constraints, no file list and no plan to start from, which is probably why my longest runs ran long. Some of the other findings didn't survive a second look, and a handful came from rules written for chat-style assistance that read delegated agent work as a defect. It also only saw the cloud-agent half of how I work. The rules are editable, though, so I can tune them to match the standards I want to hold myself to.

<!--more-->

## Why I pointed a coach at myself

I've been lucky recently to have access to some pretty good AI platforms, including one I built myself, and they're helping me to *amplify* (yes, this year's AI buzzword right there) what I'm capable of producing. So I spend a good part of my time preparing work and then handing it to coding agents. In my last post I argued that [the standards mattered more than the agent]({% post_url 2026-09-27-the-agent-wasnt-the-innovation-the-standards-were %}). It seemed fair to check whether my own habits held up to that, so in September I installed [AI Engineer Coach](https://github.com/microsoft/ai-engineering-coach) and let it read my session logs.

A few things about the tool, since they shape how far I trust the results:

- It reads local session logs from VS Code, Xcode, Claude Code, Codex and OpenCode, and it does the analysis on the machine. Nothing leaves it, which matters to me because enough of our data is already exposed as it stands.
- It scores practice against 45 rules (prompt quality, session hygiene, code review, tool mastery, context management, etc.) and draws a 7×24 heatmap of when you work.
- The rules are plain markdown files with a small DSL behind them, and there's an editor and a playground for changing them. That turned out to be the most important feature, as you'll see below.

I built it from source and installed the VSIX. A few of its features call VS Code's built-in Copilot model, and I don't run GitHub Copilot anymore (for me it got too expensive, and there are better options for the way I work). So I used the Export Summary instead, both as research for this post and as a baseline I can measure against over a defined period, to track how efficiently I work with the AI platform I've built out over the last year.

The coach came back with 19 findings across 154 sessions.

![The coach's four practice scores: prompt quality 65, session hygiene 55, code review 100, tool mastery 86](/images/coach-scorecards.png)
_The four practice scores_

## What it got right about me

My prompts were usually long enough. About 91% cleared the tool's length bar, and only 3 of 154 sessions started vague. If you'd asked me beforehand, I would have guessed that was my weak spot, so that was a pleasant surprise.

Structure was another story. About 72% of my prompts carried no constraints, 77% named no files, and almost none started from a spec or a plan. I was describing the problem well and then leaving the agent to work out the scope and go find the code on its own.

That shows up in the long runs. The tool counted 208 of them, averaging around 70 tool calls each. Seventy tool calls isn't alarming for a delegated agent task, but I suspect a fair share of those calls were the agent rediscovering things a short file list would have told it, at high effort, every time. The fix is small enough to be a little embarrassing. I'm trying a three-line opener on anything non-trivial:

```
Goal: <one sentence>
Acceptance criteria: <tests or behaviors that prove it's done>
Scope: work in <files/dirs>; don't touch <X>; ask before <Y>
```

For anything that spans several files, the agent writes a plan first and I approve it before any edits happen. That's my standing rule for working with AI, with test and validation stages wrapped around it as QA.

A couple of things were already in decent shape. My model choices were disciplined: no lookup questions went to a premium model, and only four simple requests did. And only about 2.6% of runs got cancelled, so the long runs mostly finished rather than spun.

## Findings I didn't trust yet

Some numbers contradicted each other, which usually means the tool couldn't see something.

**Instructions.** One rule said 0 of 507 requests used custom instructions. Another said three of my workspaces had bloated instruction files, the biggest at 11.5 KB. Those can't both be true in the plain reading, so I went and looked at the tool's source (it's open, which helps). The two findings come from different places. The "used custom instructions" field is filled in by the parsers for some harnesses, and the parser for one of the agents I use most (Claude Code) doesn't set it at all, so for those sessions it would read zero no matter what. The bloat check is separate: it scans instruction files on disk (`CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`, etc.) and recommends keeping a `CLAUDE.md` under 200 lines. So the first finding is a blind spot, and the second one is probably fair. If you want to confirm your own instructions load, a canary works well: add a line like "if asked for the canary word, reply 'pineapple'" and ask in a fresh session. Long instruction files usually cost more in how well the agent follows them than in tokens, and the rationale can live in linked docs rather than in the rules themselves.

**Cache misses.** The tool reported a 100% cache miss rate across 478 requests. I'd want a second source before believing that. If it's real, the likely cause is that prompt caches expire after a few idle minutes, so resuming a session after a meeting re-sends the whole context. On a seat or subscription plan that usually shows up as rate limits and slow runs rather than dollars, which I dug into in [The Meter Is Not the Bill]({% post_url 2026-08-11-the-meter-is-not-the-bill %}).

**The 72-minute average.** My slow runs averaged about 72 minutes. Some of that is probably the same idle pattern: an agent sitting on an approval prompt while I'm away from the desk. The change I'm making is to allow read-only and test commands without asking, and keep approval on anything that writes outside the repo or touches my cloud account.

**A perfect code review score.** The tool scored my code review practice at 100. That reflects thin data rather than rigor. Those checks saw a handful of terminal commands and 35 tool actions, against roughly 14,500 tool calls in the long runs alone. The one review check with real events, a "speed accept" rule, flagged 4 of 8. With around 23,000 AI-written lines in the window and almost none removed, I'd rather schedule a deliberate review pass than take the 100 at face value.

![Monthly net AI-written code: nearly all added, almost nothing removed](/images/coach-net-output.png)
_Net AI-written code by month_

## Rules built for a different kind of work

Several findings described my normal working pattern as a problem:

- a "runaway loop" flag at 15 or more tool calls,
- one-message sessions counted as "abandoned",
- verbose output, model overreliance, automatic model routing, built-in slash commands, etc.

Those rules make sense for chat-style assistance, where a person and a model trade short turns and a long chain of tool calls usually means something went wrong. Delegated agent work runs the other way on purpose. I write one message, the agent makes dozens of tool calls, and I come back to review the result. Scored with chat rules, the pattern I'm trying to get good at reads as a defect.

The verbose output flag probably has a second cause too. Of the 63 requests that reported an effort level, 92% ran at high or max, and thinking tokens count as output. So I'm defaulting to medium effort and escalating per task. If tool calls or retries climb after that, the savings weren't real, and I'll go back.

## What the coach can't see

The 154 sessions are the cloud-agent half of how I work. The other half runs on hardware I own: local models on one GPU in my [home lab]({% post_url 2026-09-20-taking-the-home-ai-lab-hybrid-on-a-leash %}), [agent skills in AnythingLLM]({% post_url 2026-08-19-anythingllm-agent-toolkit %}) that answer questions about the lab, and Aider for some editing. None of that is in the coach's parser list, so none of it is in the scores.

Aider is the clearest gap, and I'd call it out to anyone running this tool: if a good share of your editing happens there, the coach is scoring you on the rest. The funny part is that Aider already nudges you toward most of what the coach told me I was missing:

- **Naming files is the normal way in.** You `/add` the files the change touches before you ask for anything, which is the file list 77% of my other prompts left out.
- **Conventions load as read-only context.** A `CONVENTIONS.md` passed with `--read` rides along with every request, which covers a lot of the "constraints" gap.
- **Plan, then edit.** `/ask` (or architect mode) lets you work the approach out before a single line changes.
- **Every change is a commit.** Aider commits as it goes, so each edit lands as a small, reviewable diff rather than 23,000 lines to read later.
- **`.aiderignore`** keeps it out of the places it has no business being.

Its chat history also lives in the repo as markdown (`.aider.chat.history.md`), so the raw material for a coach-style read is already there. Until a parser exists, I treat those habits as the standard on the Aider side, and borrow them for the agents the coach can see.

That gap matters more than it might sound. A fair amount of the bulk reading in my setup (long logs, transcripts, card dumps) goes through a local model first, and the cloud agent works from the summary rather than the source. Done well, that should mean fewer tokens and shorter runs on the metered side, but it also means the coach is grading the half of the work that's already had some of its load taken off. If I want a full picture, the local lane needs its own logs in a shape the coach (or something like it) can read. That's on my list.

## My calendar, read honestly

The tool scored my "flow" at 14 out of 100. The heatmap told a different story: the focus is there, it just happens after hours.

- The two brightest cells are Thursday at 8 PM and Sunday at 5 PM.
- 8 PM is my busiest weekday hour.
- Thursday alone is about 30% of all requests, and half of those come after 6 PM.
- About half of everything lands outside weekday 8 to 6.

![Requests by weekday and hour, with the brightest cells at Thursday 8 PM and Sunday 5 PM](/images/coach-heatmap.png)
_The heatmap_

![Hourly activity peaking at 8 PM on weekdays, and the weekly trend from mid-August on](/images/coach-hourly-and-weekly.png)
_Hourly vs weekly_

The tool's suggested fix is to block two-hour focus slots, which rarely survives an architect's calendar (mine included). What seems more realistic is work that survives interruption: write the spec before a meeting block, let the agent run without stalling on approvals, and review in a set window afterwards.

## Three cheap changes

- **Default effort to medium,** and escalate per task (covered above).
- **Turn repeated prompts into commands.** The tool found 11 prompts I keep typing, e.g. "continue", "run the tests", "commit". Those can become custom commands or skills, which live as files in the repo, so they're versioned with everything else.
- **A two-strike rule for retries.** If the same ask fails twice, I start a fresh session with a rewritten spec. That, plus "new task, new session", probably covers the frustration, mega-session and drift findings in one go.

## What this says about standards

This scan was my last post's argument, pointed at me. The prompts were mostly fine. What was missing was the structure around them: the scope, the file list, the plan and the acceptance criteria, which are the same things a team standard is supposed to supply so each person doesn't have to remember them at 8 PM on a Thursday.

It also changed how I'd use a tool like this with a team. I wouldn't put the default dashboard in front of engineers as-is, because it would score a well-run delegated workflow as runaway loops and abandoned sessions, and people would reasonably optimize for the score. Because the rules are editable, though, they can be tuned to match the standard you want: flag sessions that don't start from a spec, check whether constraints are present, and track review time per hundred AI-written lines rather than counting tool calls.

One more detail stuck with me. Most of my output came from one vendor's family of models, with a smaller share from another, and the work held up either way.

![Monthly AI-written code by model, from two vendors' model families](/images/coach-output-by-model.png)
_Output by model_

That's a good reason to keep specs, instruction files and commands as plain files that any agent can read, local or hosted, so the practice doesn't depend on one vendor's harness or one vendor's models. The same `AGENTS.md`-style rules should steer a model on my own GPU as well as one behind an API.

The world has changed, and so must we. Remember to hang your expert hat on the door and stay willing to be the student. In this case, that means looking hard at how you work with your tool set, and improving your skills while you work toward your goals.
