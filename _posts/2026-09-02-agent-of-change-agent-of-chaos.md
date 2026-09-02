---
layout: post
date: 2026-09-02 07:00:00 -0400
last_modified_at: 2026-09-02 07:00:00 -0400
title: "Agent of Change, Agent of Chaos"
description: "Solution architecture is change delivery, one solution at a time. Which face of the coin people see often has little to do with the quality of the work, and the emotional cost tends to land on one person. Here's what I've found helps, and what I think has to be built at the org level instead."
categories: [architecture, leadership]
tags:
- architecture
- change-management
- leadership
- governance
- togaf
image:
  path: "/images/unsplash/agent-of-change-agent-of-chaos.jpg"
  alt: "A quarter balanced upright on a fingertip, one face turned to the camera and the other out of sight"
excerpt_separator: <!--more-->
---

**Summary:**
Every architect carries a coin. One face reads agent of change, the other reads agent of chaos, and which one people see often has less to do with the quality of your work than with how much change the receiving team can absorb that week. I got the chaos side recently and it flattened me for a weekend. This is what I think was going on underneath, using a few frameworks that helped me name it, and the argument that the fix belongs to the organization rather than to whoever happened to be holding the coin.

<!--more-->

# Agent of Change, Agent of Chaos

## Where this started

I asked not to be in a project meeting. Then I asked again. I'd stopped being useful in it, this was someone else's mic to hold for this particular leg of the journey, so stepping out was, and still is, the right call. It can still read, from the outside, like walking away from people mid-problem. That weekend I was not much use to anyone. I turned the same twenty minutes over and over and came out the other side with a question I hadn't been able to answer in the moment: why does doing the job correctly sometimes feel exactly like failing at it?

Don't get me wrong, nobody in this story did anything wrong. That turns out to be most of the point.

## The coin

Every architect carries a coin. Solution, data, security, cloud, enterprise, it doesn't matter which flavor. One face reads *agent of change*. The other reads *agent of chaos*. You don't get to choose which face is showing.

What I've come to think is that the face people see often has little to do with the quality of the work. It has more to do with the gap between the change you're introducing and the change the receiving teams can absorb right now. When that gap opens up, you get the chaos side, and you get it while doing the thing you were hired to do.

[Virginia Satir's change model](https://thinkinsights.net/consulting/satir-change-model) describes this reasonably well. A stable system takes in a *foreign element*, resists it, drops into a chaos phase, and eventually finds a *transforming idea* that lets it re-stabilize at a higher level. Performance dips before it recovers. That dip is expected. The part worth sitting with is that the architect is, structurally, the foreign element. The system isn't reacting to something happening near you, it's reacting to you.

## Change has always been the job

Solution architecture has generally meant delivering change, one solution at a time. SOA, then cloud, then DevOps, then platform engineering, now agentic AI. Each wave crossed more boundaries than the last, and connected ecosystems threaten more mental models than isolated ones do.

This isn't a new complaint. TOGAF has a whole phase for it ([Phase H, Architecture Change Management](https://togaf.visual-paradigm.com/2025/01/20/comprehensive-guide-to-phase-h-architecture-change-management-in-togaf-adm/)), which assumes architecture is never finished and that governance has to handle ongoing change rather than just initial design. I find that oddly comforting. If the discipline has a named phase for the thing that's making you miserable, the misery is probably structural rather than a personal failing.

## When the coin flipped

Here's a version of it. The particulars have been moved around, the shape hasn't.

A security standard came down covering how things were allowed to connect to each other. Not optional, not negotiable, and correct. Meanwhile something that had started life as a pilot, and had quietly become a thing people depended on, was built before that standard existed and did not meet it. The fix had to land before new work shipped on top of it, because every feature added to the old foundation widened the gap and made the remediation bigger.

What the project team saw: a working product, real pressure from the business to keep shipping, and a wall of "no" from people who don't have to hit their delivery dates.

What the architects saw: a live exposure, risk we were accountable for and would be asked about, and a fix with a sequencing constraint that wasn't ours to waive.

Neither side was wrong about their own reality. The gap was a shared understanding of the risk, and that gap was ours to close before it became an argument in a project meeting. It didn't get closed in time. So the conversation turned into "you're blocking us" against "you built something insecure," which is a conversation nobody wins.

I want to be careful here, because it would be easy to write this as a story about people being out of alignment with enterprise architecture standards. The project team was under real pressure and had a pilot that worked. From where they sat, a security requirement showing up late in the game does look like an obstacle rather than a shared problem. They weren't evaluating my architecture. They were being asked to absorb one more thing.

## Why it hurt more than it should have

I went looking for language for the weekend afterward, and found it in [*Difficult Conversations*](https://www.beyondintractability.org/bksum/stone-difficult) (Stone, Patton, and Heen, out of the Harvard Negotiation Project). Their framing is that every difficult conversation is three conversations at once: **what happened** (facts, intent, blame), **feelings** (what each side feels, and whether those feelings are legitimate), and **identity** (what the situation says about who I am).

The identity one is the one that does the damage. They describe an *identity quake*, where a challenge to your sense of self produces a response that's closer to physiological than rational. You lose your balance and stop being able to communicate clearly. The three questions underneath most of these, in their account, are roughly: am I competent, am I a good person, and am I worthy of respect.

Being called a blocker hits all three at once. Competent? They think I'm slowing delivery. Good person? I'm the source of frustration and fear for a team that's already stretched. Worthy of respect? I stepped out of a room because I couldn't be useful in it. No wonder the sequence went anger, then guilt, then shame, then just shutting down. That's a fairly ordinary response to an identity challenge, and it was described in a book from 1999, which I found weirdly reassuring.

There's a small irony worth naming. Change management literature, including the Satir material, tends to warn leaders to normalize resistance and avoid labeling people as blockers. That advice is written for change leaders, about the people resisting. In this story the label pointed the other way.

## The org was saturated, not hostile

This is the reframe that helped most, and it took me a while to get to.

[Prosci's model for this](https://www.prosci.com/change-fatigue) splits it into *change disruption* (the cumulative impact of everything landing on a group) and *change capacity* (how much that group can absorb, shaped by culture, history, structure, and how much change management competency exists around them). Saturation is what you call it when disruption exceeds capacity. Change *fatigue* is the individual-level symptom: apathy, anxiety, retreat, burnout. Their benchmarking puts something in the neighborhood of three-quarters of organizations at, near, or past saturation, and their more recent writing argues the AI era makes it worse because organizations no longer fully control *when* change shows up.

Applied to my own situation: the pushback probably wasn't an assessment of the networking design. That team was likely one change past capacity, and my change was the one that happened to arrive. That's a portfolio problem rather than a personal one.

Which points at something most architects don't have and probably should: portfolio-level visibility into what else is landing on the teams you're about to change. I can tell you the technical dependencies of my design in detail. I usually can't tell you what other three initiatives are hitting the same six people that month, and that second thing might be the better predictor of how the conversation goes.

## Build the thing that carries the change

The seed of this post was a note I sent to a few colleagues, and it came down to one idea: change pushed by an individual tends to create chaos, while change carried collectively, with agreed boundaries and a way to give feedback, has a better shot at becoming transformation. The architect's job is to build that carrying system rather than to be it.

Some of what makes that concrete already exists.

**Agree the boundaries before you need them.** TOGAF's Architecture Contracts are formal agreements between the architecture function and stakeholders about commitments and responsibilities. Pair those with compliance assessments and a real, time-bound waiver process, and a system that predates the standard stops being a surprise "no" at stand-up. It becomes a documented deviation with a remediation date that somebody signed. The technical outcome is the same either way, but one version is a decision the team was part of and the other is a decision that happens to them.

**Give objections a legitimate home before implementation.** The RFC to ADR loop is the cheapest version of this. An RFC proposes and invites argument, with a stated feedback window (a week or two). An [ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html) records what was decided, why, what the consequences are, and how it gets enforced. The point is that people who disagree get a real place to say so *before* the decision, rather than at a stand-up after it. I already work this way personally. The thing I'd change is making it the organization's habit instead of mine.

**[Disagree and commit](https://en.wikipedia.org/wiki/Disagree_and_commit), in both directions.** Once the window closes and the decision is recorded, everyone implements, including the people who argued against it. This one only works if you say out loud that it cuts both ways. Architects commit when they lose too, and if that part is unstated it reads as a one-way ratchet.

**Prefer guardrails to gates.** This is the platform engineering idea of a paved road, and I think it's the highest-leverage item here. Encode the boundary as a default in the pipeline and the IaC, so teams inherit it rather than meeting it for the first time at review. The coin flips a lot less often when the "no" is automatic, impersonal, and arrives at commit time rather than from a person in a meeting.

**Make the mandate visible before the friction.** Change proposed by an architecture function with leadership sponsorship lands differently than the same change proposed by one architect in a stand-up. Get that established early, not after the first argument.

**Then actually ask.** Structured check-ins with the teams you're changing: what's colliding, where are they struggling, what's already on their plate. Prosci frames this as proactive load management, which mostly means being willing to re-sequence, phase, or defer the non-essential things. That's hard to do if you never asked.

## When it lands on you anyway

Systems reduce how often the coin flips. They don't stop it. So it's worth having something personal for the days it lands badly.

Running the three conversations before walking in has helped me the most. Name what happened, name what you're feeling, and name what this is touching in your sense of yourself, for your own benefit, before you're in the room. Then prepare what Stone and company call the Third Story, which is the neutral narrator's version that both sides would accept. Then decide what you actually want out of the conversation: a decision, or to be understood, or a boundary.

The contribution question is the other one I keep coming back to. Not whose fault it was, but how each of us contributed. In my case the honest answer is that the risk wasn't made legible to the project team early enough, and the "no" arrived without a "here's the path to yes" attached to it. Both of those were mine to fix and I didn't.

The book's *and* stance is what keeps this from turning into a weekend. I am competent AND this rollout caused fear. I am careful AND I missed the moment to explain the risk. The all-or-nothing version of identity is what makes a piece of feedback feel like a verdict on the whole person.

The Stoics get at the same thing from a different direction. Epictetus opens the [*Enchiridion*](https://classics.mit.edu/Epictetus/epicench.html) by separating what's up to us (our judgments, choices, and responses) from what isn't (other people's opinions, the pressure the business is under, whether a team feels blocked today). I control the quality of the reasoning, how clearly I explain the risk, and whether I offer a path forward. I don't control which face of the coin is showing when it lands.

Worth a periodic self-check too. Maslach's burnout model has three dimensions: emotional exhaustion, cynicism toward the people you serve, and a reduced sense of accomplishment. The middle one is the useful early warning for this job specifically. If you notice yourself starting to think of the project team as "them," that's a signal about your own load rather than a moral failing, and it's easier to act on early.

And asking not to be in the room is allowed. Stepping out of a meeting you can't be useful in is usually a reasonable boundary to set. The thing I'd do differently is pair it with a written Third Story summary sent afterward, so the absence doesn't read as silence.

## This is every architect

Data architects change where the truth lives. Security architects change what's allowed. Cloud architects change where things run. Enterprise architects change how decisions get made. All of that work generally makes the organization more secure, more capable, more competitive, etc., and all of it flips the same coin.

Since the cost is a shared occupational hazard, the system for carrying it should be shared too. The coin doesn't stop flipping, and the goal was never to land on "change" every time. What you can build is an arrangement where a bad landing hits a function with contracts, decision records, and a feedback loop, instead of hitting one person's weekend.

So: be the agent of change. Just try not to be the only one carrying it.

---

## Sources

- Stone, Patton, and Heen, *Difficult Conversations: How to Discuss What Matters Most* (Viking Penguin, 1999; 10th anniversary edition 2010). [Summary of the three conversations and the identity conversation](https://www.beyondintractability.org/bksum/stone-difficult).
- [The Satir change model](https://thinkinsights.net/consulting/satir-change-model), for the foreign element, the chaos phase, and the transforming idea.
- Prosci on [change fatigue and saturation](https://www.prosci.com/change-fatigue), and their [tips for avoiding change saturation](https://blog.prosci.com/Managing-change-saturation).
- [TOGAF Phase H: Architecture Change Management](https://togaf.visual-paradigm.com/2025/01/20/comprehensive-guide-to-phase-h-architecture-change-management-in-togaf-adm/), including Architecture Contracts as both an input and an output. (The Open Group's own publication of the standard now sits behind a login, so this is a public walkthrough instead.)
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html) (2011), the origin of the ADR.
- [Disagree and commit](https://en.wikipedia.org/wiki/Disagree_and_commit), on the principle and where it came from.
- Epictetus, [*Enchiridion*](https://classics.mit.edu/Epictetus/epicench.html) §1, on what is and isn't in our control.
- Maslach's three-dimension burnout model: emotional exhaustion, depersonalization, and reduced personal accomplishment. A recent [summary in a software engineering context](https://arxiv.org/pdf/2502.10249).
- On the RFC to ADR loop specifically, Milan Milanović's [walkthrough of driving architectural decisions with RFCs and ADRs](https://newsletter.techworld-with-milan.com/p/driving-architectural-decisions-with).
