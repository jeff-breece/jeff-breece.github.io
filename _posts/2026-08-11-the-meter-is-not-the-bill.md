---
layout: post
date: 2026-08-11 09:00:00 -0400
last_modified_at: 2026-08-11 09:00:00 -0400
title: "The Meter Is Not the Bill"
description: "How billing actually works across Anthropic's Claude Max, OpenAI's Codex, GitHub Copilot, and Microsoft Copilot — four meters, one wall, and the local tools that read them."
categories: [engineering, AI, tooling]
tags:
- ai-tooling
- billing
- claude
- codex
- copilot
- ccusage
- developer-experience
image:
  path: "/images/unsplash/the-meter-is-not-the-bill.jpg"
  alt: "Two rusted kilowatt-hour meters mounted on the same panel, each with its own register and its own row of porcelain fuses"
excerpt_separator: <!--more-->
---

**Summary:**
I ran a usage tool across my AI coding assistants and it told me four weeks of work was worth $2,941.30. It wasn't a bill. Working out *why* it wasn't a bill meant actually mapping how four vendors charge for this stuff — Anthropic, OpenAI, GitHub, and Microsoft — and the four systems have almost nothing in common. Here's the map, plus the local tools that read each meter.

<!--more-->

# The Meter Is Not the Bill

## Where this started

There's a community tool called [ccusage](https://github.com/ryoppippi/ccusage) that reads the session logs your coding agents leave on disk and prices the tokens at API list rates. I pointed it at my machine and it produced a tidy table: twenty sessions, $2,941.30.

The number is math based on token counts. It is also not money anyone is asking me for, above the two subscriptiions I red vs blue'd with through July-August as part of training toward understanding these kinds of things. About $2,771 of it is blue team Claude work covered by a flat subscription, and the rest is Codex work billed to my red team OpenAI account. What I actually owe personally is my monthly subscription fee, same as last month, same as next month.

But getting from "alarming table" to "same as last month" took an evening of checking environment variables and reading billing docs, because I was holding four different billing models in my head and they kept blurring together. So this post is the un-blurred version. Not a complaint, not a surprise story — just how each of these vendors charges you, as of August 2026, and how to tell which meter is spinning.

## Four names, four meters

The hero photo up top is the mental model. Several meters can hang on the same wall — the same machine, even the same terminal — and each one is wired to a different account. A usage tool that sums them into one total is describing the wall, not any bill you'll receive.

### Anthropic: you bought a rate limit, not tokens

Claude Max is a flat subscription. Underneath it there are still tokens being counted — every session, every model turn — but on a subscription those counts don't have a price for you. What you bought is a *rate limit*: a rolling five-hour window and a weekly cap. When you hit them, you wait. Dollars are simply the wrong unit for thinking about a Max plan; the right units are window consumption and weekly consumption.

There's an overage mechanism — usage credits — but it's a toggle, and with the toggle off there is no path from "used a lot" to "charged more." You get blocked and told to come back later. I keep mine off on purpose. A hard ceiling you occasionally bump into beats a soft one that bills you.

The one real trapdoor on this meter: if `ANTHROPIC_API_KEY` is set in your environment, Claude Code will offer to use it, and once approved it silently takes precedence over your subscription auth. Every token then bills per-token against a Console account — the pay-as-you-go side of Anthropic's house — while everything on screen looks identical. `/status` inside Claude Code names the active credential. It takes two seconds and it's the single highest-value check in this whole post.

Worth knowing for plan-shoppers: model coverage is a plan feature, not a model feature. Fable 5 became standard on Max plans in July, up to half of weekly limits at no extra cost, but on a Pro plan the same model runs on pay-as-you-go credits. Same model, different plan, different meter.

### OpenAI: whichever credential is in the box

Codex bills one of two ways: covered by a ChatGPT plan, or per-token against an API organization. Which one you're on is decided entirely by the credential sitting in `~/.codex/` — and that's the thing to actually go look at, because it's easy to log in once during setup and forget whose account you used.

Mine is signed into my red team's org, which means my Codex meter is wired to the "building." That's correct for how I use it, but it's worth stating the implication plainly: the spend is real, it's on the invoice, and the usage is visible to them.

One thing I confirmed and found genuinely reassuring: these toolchains cannot cross-bill. Claude Code and Codex keep separate credential stores, hit separate endpoints, and send separate auth headers. An OpenAI credential can't authenticate against `api.anthropic.com` any more than your neighbor's key opens your meter box. When ccusage shows them in one table, that's a reporting convenience, not a billing relationship.

### GitHub Copilot: the meter that just got installed

Copilot's billing changed on June 1st 2026. The old premium-request model is gone for monthly plans, replaced by usage-based billing in [GitHub AI Credits](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/) — one credit is a cent, metered on actual token consumption for chat, agents, code review, and the CLI. Plain code completions and next-edit suggestions stay unlimited on paid plans. Annual plans keep the old pricing until they renew.

So of the four vendors, GitHub is the one that moved *toward* metered billing while I've been moving toward flat. That makes budgets matter: on account types where the budget defaults to zero, overage is rejected outright, which is the safe default. Set one deliberately if you're on a plan that permits overage.

**The work/personal trap specific to Copilot:** If you hold an active
personal Copilot Pro or Pro+ plan and are then assigned a seat under your employer's Copilot Business or Enterprise plan, **your personal plan is automatically cancelled.** You get a prorated refund for the remainder of the current billing cycle and continue using Copilot under the policies your company sets.

This is usually what you want financially — but it means personal work is now running on the company account. What that exposes is **usage, not content**: org admins can pull a usage report showing per-user consumption and who is running over their allowance. They do not see your prompts. Treat it as a budgeting-visibility question, not a privacy breach, but do keep side projects off the work seat.

**Multiple seats — narrower than it first appears.** Two different
situations, with opposite behaviour:

- *Several orgs inside one enterprise.* GitHub picks one organization at random each billing cycle to bill the seat, so your spend can land against a different org's budget month to month. The consequence is that **org-level budgets stop enforcing predictably** — not that billing is arbitrary. GitHub's remedy is either one license through one organization, or cost center budgets with direct user assignment if consolidating isn't practical.
- *Licenses from separate enterprises or standalone organizations.* Here **you** select the billing entity rather than having one picked for you. This is the case most likely to describe a personal account plus an employer seat, and nothing about it is random.

### Action items

1. Open **GitHub → Settings → Billing** and confirm whether your Copilot access is a personal plan or an org-assigned seat.
2. If it is an org seat, assume your consumption is visible to admins and keep personal projects off it.
3. If you hold both, cancel one — the overlap is pure waste. If you genuinely need both, check which billing entity is selected.
4. Set a spending budget if you are on a plan that permits overage. Budgets default to zero on some account types, which rejects overage outright; that is the safe default.

### Microsoft Copilot: mostly here for disambiguation

The fourth meter earns its spot on the wall mainly because of the name. Microsoft Copilot — the M365 one — is obviously a different product line billed as a per-seat add-on through your Microsoft 365 subscription. Microsoft owns GitHub, the products share a name, and the bills still never merge: an M365 Copilot seat lives on a Microsoft invoice and has nothing to do with your GitHub AI Credits. If your employer gives you both, you're on two meters that happen to share a logo. I have nothing to track locally for this one, and that's rather the point of including it: knowing a meter *isn't* yours is as useful as reading the ones that are.

>Note: M365 Co Pilot is actually pretty decent, for what it currently does, but the competition is wicked fierce and even with Work IQ through the Office platform, well, it makes me wonder about if it's the new Xbox or if it will be allowed to evolve.

## Reading your own meters

The tools, since that's probably why you're here:

- **Claude Code:** [ccusage](https://github.com/ryoppippi/ccusage) ([docs](https://ccusage.com/)). Reads the JSONL logs under `~/.claude/projects/`. `npx ccusage blocks --active` shows the current five-hour window with projections, `npx ccusage monthly` shows the trend. On a subscription, ignore the dollar column and watch the windows.
- **Codex:** [@ccusage/codex](https://ccusage.com/guide/codex/), a companion CLI from the same project. Reads the per-turn token counts Codex writes under `~/.codex/sessions/`. I run a fork that merges both agents into one table; the `Agent` column keeps them straight, and so do the session IDs — Claude sessions are bare UUIDs, Codex sessions are date paths.
- **GitHub Copilot:** there isn't one, and structurally there can't be — Copilot keeps no comparable local logs. What exists is the [usage dashboard in billing settings](https://docs.github.com/copilot/how-tos/monitoring-your-copilot-usage-and-entitlements) and, for orgs, a usage API that reports per-user daily credit totals. It won't tell you which model or which project burned the credits. The meter is readable; the itemization isn't.

And one reading note that applies to all of them: the ccusage cost column is a *counterfactual*, not an invoice. It answers "what would this work have cost at API list rates," which is genuinely useful — it's how I know a Max plan at a few hundred dollars a month is covering thousands of dollars of list-rate consumption, and it's how I can see that one heavy session consumed seven hundred times what a light one did. Just don't read it as a bill. The meter is not the bill.

## Keeping the wires from crossing

The whole system stays legible with a few good hygiene habits, none of them posh:

- **No global API keys.** Not `ANTHROPIC_API_KEY`, not `OPENAI_API_KEY`, not in `~/.bashrc`, **ever** - and this is a case for a local secure or cloud provider based key store or API gateway, to be honest. A key in your shell profile is a key in every session you'll ever open. If a specific project needs one, scope it to that directory with `direnv` and a `.envrc` so it can't leak.
- **Separate parent directories for work and personal repos.** Claude Code keys its logs by working directory, so attribution later is trivial — but only if the paths differ.
- **`/status` after any environment change.** New machine, new key experiment, weird behavior: check which credential is live before a long session, not after.
- **Five minutes on the first of the month.** Echo the key variables and expect empty. Confirm the overage toggle is still off. Skim `npx ccusage monthly` for the trend. Glance at the GitHub billing page and confirm the Copilot seat source hasn't changed under you.

None of this is about spending less. It's about knowing, at any moment, which meters are wired to your account, which to your red team's, and which number on the wall is just a number. This can also become a measure of becoming efficient with AI and using it where you, __the human__, wants to.

Questions about any of it, drop me a [note](mailto:jeffbreece@outlook.com).

---

## Credits

_Hero photo by [Francesco Ungaro](https://unsplash.com/@francesco_ungaro?utm_source=jeffbreece.com&utm_medium=referral) on [Unsplash](https://unsplash.com/?utm_source=jeffbreece.com&utm_medium=referral) — two kilowatt-hour meters sharing one panel, each with its own register and its own fuses. Same wall, different accounts, which is this entire post in rusted metal._
