# LinkedIn Post Slugs — Resonance Lab Series

One entry per finished post, in publication order. Written to be pasted
directly; each opens on the story rather than the architecture, because the
architecture is what the link is for.

See `AUDIT-TRAIL.md` for status and fact-check notes.

---

## 1 — Load-Bearing Docs: How a Homelab Learns to Stop Lying to Itself
**2026-06-30** · `/posts/testing-practices-load-bearing-docs/`

> A wall of light panels in my office froze for an hour last week, and it took me embarrassingly long to work out why.
>
> The panels display the status of my home AI lab. They'd dropped their DHCP lease and come back holding a different address — one that used to belong to my main server, months ago, before I renumbered the network.
>
> My documentation still said that address was the server. It had been wrong since July. Nothing complained, because documentation never does. Code that goes stale throws an exception. A wrong sentence in a runbook just sits there, patiently, until you follow it as a recipe at 11 PM and walk into a wall.
>
> So I stopped treating it as a discipline problem — "I should be better about updating docs" is the same category of solution as "I should floss more." Technically true, empirically useless.
>
> Instead the facts became constants in a test file, and CI asserts those exact strings appear in every script, unit file and runbook that claims to know them. Change an IP in one place and the build goes red until you've changed it everywhere.
>
> First in a series about that lab. Starting with the least glamorous part on purpose.
>
> #homelab #localai #devops #testing #softwareengineering

---

## 2 — 1.7 Tokens Per Second: How the Lab Got Its GPUs
**2026-07-02** · `/posts/gpu-inference-atlas-jetson/`

> The most useful measurement I have ever taken in this project is 1.7 tokens per second.
>
> That's what a 20-billion-parameter model did on my CPU-only server. Roughly the speed of a slow typist. And it was *fine* — I used it for months. For a batch job at 3 AM it's still fine, and I still use CPU inference for exactly that.
>
> What it couldn't do was hold a conversation. The moment I wanted to speak to the lab out loud and get an answer before I'd forgotten the question, 1.7 tok/s stopped being a quirk and became the wall.
>
> That's the part I want to underline: I couldn't have known that in advance. I had to build the whole voice pipeline on hardware that was too slow, and *then* discover which specific part of the slowness was intolerable.
>
> So my advice on buying a GPU is: not yet. Build the thing badly on what you own. The bottleneck will introduce itself, and then you'll know exactly what you're buying and why.
>
> The three inference machines in my lab didn't come from a plan. They came from three separate moments of being able to name precisely what was broken.
>
> #homelab #localai #gpu #machinelearning #engineering

---

## 3 — Is Any of This Even Running?
**2026-07-04** · `/posts/heartbeat-service-single-pane/`

> There's a moment in every growing homelab where you quietly lose track. Nothing dramatic — you just genuinely cannot say whether all the things you built are currently running.
>
> Building the monitoring forced a question I'd been vague about: what does "up" actually mean?
>
> The naive answer is that the port accepts a connection. That's easy and nearly worthless. I've had a process wedge itself into a state where it accepted TCP connections and answered nothing — socket open, service dead, monitoring green.
>
> Two other things I'd pass on. Probe timeouts are a design decision, not a default: mine is three seconds, because a status page that takes 30 seconds to load is one you stop opening, at exactly the moment you need it.
>
> And every reading carries its age. A status page saying "healthy" makes an implicit claim about *when*. Four seconds old is a fact. Forty minutes old because the probe loop died is a lie in the shape of a fact — and it looks identical.
>
> #homelab #observability #monitoring #devops #sre

---

## 4 — Zero Redundancy: Backing Up a Striped Array I Chose On Purpose
**2026-07-06** · `/posts/backup-strategy-raid0-homelab/`

> My main server stores everything on two drives striped together with zero redundancy. Either one fails and all of it is gone at once.
>
> That's deliberate — it's mostly derived data I can rebuild, and I get speed and full capacity in exchange. RAID isn't backup anyway; a mirror doesn't protect you from deleting the wrong thing.
>
> So I had three backup tiers and felt good about them. Then I asked a different question. Not "is the backup running?" — it was — but **"if this array died right now, what could I not get back?"**
>
> Three things weren't covered. The retrieval index. Service credentials. And a 432 KB health database holding years of irreplaceable personal history.
>
> That last one keeps me honest. It was the single most irreplaceable thing on the machine and roughly five hundred times smaller than the noise in the directories I *was* backing up.
>
> Size is a terrible proxy for value. Any backup scoped by "the big folder" makes exactly this mistake.
>
> Do the audit before you build the backup. And restore something today — a backup you've never restored is a belief system.
>
> #homelab #backup #sysadmin #datastorage #devops

---

## 5 — Two Platforms On Purpose
**2026-07-08** · `/posts/deployment-systemd-k3s-two-platform/`

> Half my lab runs as systemd units and half is moving to Kubernetes. That split is permanent, not a migration I haven't finished.
>
> The test that decides it: **if this service's process vanished right now, what would be lost?** Nothing — start another, it's a pod. Something physical — a GPU, a specific array, a USB device — it stays a systemd unit.
>
> The tempting move is to containerise the hardware-bound services anyway and pin them to the node with the hardware. But look at what you have then: a workload that can only run in one place, whose storage is a path on that machine, which can't be rescheduled because rescheduling breaks it.
>
> That's a systemd unit with a control plane underneath it. You've bought the complexity and declined the payoff.
>
> Also: my cluster has one node and I say so out loud. Kubernetes implies HA and one node has none. And going one-to-two is a *downgrade* — you need quorum, so the valid move is one to three.
>
> Uniformity isn't a goal. It's an aesthetic preference that sometimes coincides with good engineering.
>
> #kubernetes #devops #homelab #systemd #platformengineering

---

## 6 — Body Language: Giving the Lab a Face on the Wall
**2026-07-10** · `/posts/nanoleaf-lab-status-display/`

> Dashboards demand attention. That's not a flaw in any particular dashboard — it's what they are. You only look when you already suspect something, so everything you'd have noticed *incidentally* stays invisible.
>
> So six light panels on my wall, one per machine. White breathing for normal, violet pulse for inference, amber for degradation, red strobe for a node down. Motion is grammar; colour is vocabulary.
>
> Then it lied to me.
>
> The panels are driven by a UDP stream, and the controller holds the last frame it received — indefinitely. No timeout, no fallback. When its network address changed, the service kept streaming into the void, and the wall sat there for an hour displaying a calm white breath describing a lab that had moved on.
>
> It was showing *health*. That was the worst part. Not blank, not red — reassuring, and an hour out of date.
>
> A display that can't tell you it's stale will eventually lie to you, calmly. A frozen dashboard and a healthy dashboard must not look alike. Mine did.
>
> #homelab #observability #ux #ambientcomputing #iot

---

## 7 — An Operator Console, Not a Dashboard
**2026-07-12** · `/posts/react-operator-ui-heartbeat-dashboard/`

> My lab's web interface has fifteen pages and exactly one user, who built the thing. That changes every design decision.
>
> I don't need tooltips explaining what a probe is. Every pixel spent teaching me something I already know is a pixel not spent telling me something I don't. So it's dense, terse, and unapologetically a control panel.
>
> The most useful feature: **staleness is a visual property.** Readings brighten and dim with age; a failed probe leaves a gap rather than a stale value. You can see whether you're looking at something current without reading anything.
>
> Not a timestamp in the footer. Nobody reads the footer.
>
> And a bug that became a rule. The ambient layer has several animated components, and each one — quite naturally — got its own animation loop. With four running, the interface got janky and the fans came on for a page that's mostly text. One shared loop fixed it and the code got smaller.
>
> Every individual decision was correct. The sum was wrong. You can't catch that reviewing a single change.
>
> #react #typescript #ux #observability #frontend

---

## 8 — From Wake Word to Soundbar
**2026-07-14** · `/posts/voice-pipeline-architecture-overview/`

> Six services, one spoken sentence, no cloud. Speech-to-text, an orchestrator, a router, retrieval, text-to-speech, a speaker.
>
> The pieces are unremarkable, and that's the honest headline. What made it actually usable were two details I'd have called implementation trivia when I started.
>
> **The model loads eagerly, at startup.** Load Whisper lazily and the very first thing you ever say to your assistant times out while you stand in your office feeling foolish. That first impression decides whether you *reach for the thing* — a tool that's unreliable in its first second gets used weekly; one that answers instantly gets used forty times a day. I've had projects die of nothing worse than feeling slightly unreliable.
>
> **One request ID through all six hops.** Sounds like bookkeeping. It's the difference between a debuggable system and a haunted one. Without it, "why did that take eight seconds" is an investigation. With it, you search one string and get the whole story with a number on each stage — and the slow hop is almost never the one you'd have bet on.
>
> #localai #voiceai #whisper #homelab #privacy

---

## 9 — A Dropped Log Is Worse Than an Ugly One
**2026-07-16** · `/posts/uls-unified-logging-system/`

> My log ingest endpoint never rejects an event because of what's in it. That's the rule the whole design turns on, and I'd argue for it anywhere.
>
> The obvious approach is to validate — define a schema, reject what doesn't conform. That's right for an API and completely wrong here.
>
> Think about *when* malformed events arrive. Not on a quiet Tuesday. They arrive when something is broken: a service crashing mid-write, a field null for the first time, an exception path logging a different shape. The moments that produce weird events are exactly the moments you most want the log.
>
> A validating endpoint discards data precisely when the data is most valuable. It works beautifully when you don't need it.
>
> So malformed events get coerced and *flagged*, never dropped. And searching for that flag turns out to be a great way to find bugs — a service that starts emitting malformed events usually started doing something else wrong too.
>
> Two tiers: JSON lines for "grep it right now at 2 AM", Parquet for "how has this moved over three months."
>
> #observability #logging #dataengineering #sre #homelab

---

## 10 — Where Does This Sentence Go?
**2026-07-18** · `/posts/gateway-service-architecture/`

> The models are the easy part. Genuinely — they're extraordinary and they mostly work.
>
> The hard part is the 200 milliseconds *before* you call one, where you decide which model, with what context, from which data source. Get it wrong and the failure is quietly awful: ask about your own week, get a confident general answer that has nothing to do with you, phrased so plausibly you might not notice.
>
> My router has three interchangeable brains — embeddings, an LLM, and a pile of regexes. The regexes are the most important of the three, and it took me a while to believe that.
>
> They exist because CI cannot talk to my house. With only the embedding backend, none of my routing logic is testable without a live model server on the internet. Most projects quietly choose "don't test the router."
>
> The unplanned payoff: when the embedding model is unavailable, the gateway isn't dead. It's dumber. The lab keeps working at reduced quality instead of stopping.
>
> Build the sophisticated version and the trivial version of the same interface. The trivial one is your test harness, your degraded mode, and your explanation of what the clever one is doing.
>
> #softwarearchitecture #localai #testing #homelab

---

## 11 — Mostly Arithmetic
**2026-07-20** · `/posts/embedding-nearest-centroid-classifier/`

> My assistant's intent classifier required no training, no labelled dataset, and no fine-tuning. It's about forty example sentences I typed by hand, averaged into centre points, plus cosine similarity.
>
> That's it. Embed ten examples per category, average each group, and check which centre a new question is closest to. Adding an intent means writing eight more sentences.
>
> An enormous amount of practical AI work is nearest-neighbour search over embeddings. It's not a compromise or the beginner version of something fancier — for a problem like this it's the right tool, it's fast, and you can *see* why it decided what it decided.
>
> The guard I'd pass on: a margin rule. The best match must beat the runner-up by a gap. A threshold alone can't see the case where a question is strongly similar to two categories at once — high confidence, genuinely ambiguous. That's a coin toss with extra steps, and the margin catches it.
>
> And I weighted the thresholds asymmetrically on purpose, because my two failure modes aren't equally bad. A general question hitting personal data returns nothing and says so. A personal question hitting the general model returns something that *sounds* right and isn't. One failure is visible; the other is corrosive.
>
> #machinelearning #embeddings #nlp #localai #homelab

---

## 12 — Teaching the Lab to Know Me
**2026-07-22** · `/posts/journal-analytics-obsidian-to-csv/`

> I've kept a daily journal for years. This is about turning it into something a machine can reason over — and about the line I drew before writing a line of code.
>
> Two rules shaped the whole design.
>
> **Crisp things become booleans.** Anything with a clean yes/no answer goes in a table, one row per day. No model involved. "How many days did I exercise last month" is arithmetic over a column and it's exactly right every time.
>
> **The model's output never mixes with the measured data.** Mood analysis lives in its own file, never as another column beside the facts. One is what happened; the other is a model's opinion about what I wrote. Put them in one table and six months later you'll build a chart that mixes measurement with inference while looking equally confident about both.
>
> It runs entirely locally, which means accepting worse analysis than a cloud model would give. That was never a real trade — it's a diary.
>
> And a bug worth learning from: one section silently stopped being extracted after I changed how I write. Nothing errored. The column was just quietly empty for weeks. The failure that reports nothing is the expensive one.
>
> #personalknowledge #localai #privacy #obsidian #datascience

---

## 13 — The Index That Was Quietly Empty
**2026-07-24** · `/posts/rag-indexing-sqlite-chromadb/`

> My retrieval index was broken for months in two separate ways, and both bugs had the same shape: they made the system quieter rather than louder.
>
> The indexer opened the vector store one way; the retrieval service opened it another — same directory, slightly different client config. That was enough. Rebuilds *silently skipped work*. No error, no warning, plausible runtime, successful report, and a large fraction of my data never indexed.
>
> I didn't find it by seeing a failure. I found it by counting.
>
> The second one was dumber. The document indexer had a list of file extensions it processes. It didn't include `.md`. I'd been dropping markdown in for weeks — markdown is *most* of what I write — and every run walked the directory, skipped every file, and reported success.
>
> Two lessons. Count what you indexed, not whether it succeeded: how many chunks, from how many files, how many skipped and why. And query your store directly before building three layers on top of it.
>
> A crash is a gift by comparison. It's specific, immediate, and you fix it that afternoon.
>
> #rag #vectordatabase #localai #debugging #dataengineering

---

## 14 — Two Stages and a Refusal
**2026-07-26** · `/posts/rag-service-architecture/`

> The most important thing my personal-memory service does is decline to answer.
>
> Some questions arrive that aren't about me — the router upstream made a mistake, or I phrased something oddly. The natural behaviour of a retrieval system given an unrelated question is to search anyway, find the least-unrelated few entries, and hand them to a model, which will dutifully weave them into a plausible answer.
>
> That's confident nonsense sourced from real data. Not obviously wrong. It has the *texture* of grounded truth, because it is built from things I actually wrote — just things with nothing to do with what I asked.
>
> So there's an explicit out-of-scope classification that produces a refusal instead of an attempt.
>
> Getting comfortable with that took a while, because refusing feels like a worse product. But the value of a memory is that you can trust what it tells you, and one that produces an answer for every question — including the ones it has nothing on — isn't trustworthy in the way that matters.
>
> The willingness to return nothing is what makes the other answers worth anything.
>
> #rag #localai #softwarearchitecture #ai

---

## 15 — Looking Outward: A Small Data Lake for Public Sources
**2026-07-28** · `/posts/data-hub-v1-parquet-duckdb/`

> Earthquakes, economic series, market data, river levels, weather alerts — collected on a schedule onto a home server. No database. Parquet files on disk, queried with DuckDB.
>
> No server to run, no port, no daemon that can be down when I want to ask something. The files *are* the data — copy the directory and you've copied everything.
>
> For anything at personal scale I'd now reach for files-plus-engine before a database server, and want a specific reason to move.
>
> But here's the honest part: **I collected too much.** Several sources went in because collecting them was interesting — a new API, a pleasant afternoon — and I have never once asked a question of them.
>
> That isn't free. Each is a scheduled job that can fail, a schema that can change upstream, a thing that needs attention when it breaks. I've spent real evenings fixing collectors for data I've never queried.
>
> Collect against a question you actually have. Not one you can imagine having — the imagined future question justifies anything and costs continuously.
>
> #dataengineering #duckdb #parquet #homelab #python

---

## 16 — The Coach That Doesn't Use a Model
**2026-07-30** · `/posts/health-coach-deterministic-workouts/`

> My lab has a service that plans training sessions. It's the one people assume is most obviously a job for a language model, and it's the one where I most deliberately didn't use one.
>
> A model would be good at this. That's not the issue. Three things are:
>
> **Availability** — the moment I want a plan is when I'm dressed and about to start, which is the worst moment to wait for a model to load onto a busy GPU.
>
> **Determinism** — same inputs, same plan, and I can read why.
>
> **Drift** — and this is the real one. A model asked repeatedly for sessions drifts toward what's most represented in its training data: generic gym programming. Slowly, plausibly, it stops planning for my actual equipment. Each session looks fine. The trend is that they stop being about my situation.
>
> Rules don't drift.
>
> The line I've settled on: models for things where being approximately right is useful; code for things where the output is a specification. A training plan is instructions I'll follow with weights in my hands.
>
> The plan is computed. The conversation about it is a model. That boundary holds.
>
> #localai #ai #softwarearchitecture #homelab

---

## 17 — How Helen Came to Be
**2026-08-01** · `/posts/langgraph-va-graph-personas/`

> My lab's assistant used to be one voice that did everything. It worked, and it was subtly awful, and it took me a while to say why.
>
> There is no single tone that's correct for both "is the backup job healthy" and "I've been stuck on this for weeks." Trying to find one produces something mediocre at both — an assistant with the personality of a form.
>
> So there are four now, each with a domain and its own voice. And one thing that is deliberately *not* a personality: the house. "Turn off the kitchen light" isn't a conversation, it's an instruction with a binary outcome, and routing it through a model that paraphrases and confirms just adds ways to fail.
>
> The design decision I'd defend hardest: persona is **sticky**, not topic-detected. Once you're talking to one, they hold the floor until you address someone else.
>
> Topic detection sounds smarter and is terrible, because conversations wander. Your next message is "why?" or "what about Thursday" — no topical signal at all. Topic detection falls back to the default and swaps out the person you were talking to, mid-conversation, silently.
>
> Conversational state is a feature, not an optimisation.
>
> #ai #conversationaldesign #localai #homelab

---

## 18 — A Refusal a Model Can't Be Talked Out Of
**2026-08-03** · `/posts/helen-tier-system/`

> My assistant can restart services on my machines. That sentence should make you slightly uneasy. It made me uneasy enough to spend more time on the boundaries than on the capability.
>
> The obvious approach is to tell the model about its limits in the system prompt. Models are good at following instructions like that. It would mostly work.
>
> Mostly.
>
> A prompt-level limit is enforced by the model's judgement in the moment, and that judgement is subject to everything else in context — including a long conversation, including me being insistent at 2 AM. Prompt instructions are strong suggestions to a very agreeable system.
>
> So the forbidden actions aren't forbidden. They *don't exist* in the toolset it's given. And the refusal text isn't generated — it's a constant string, the same words every time, from a function that makes no model call.
>
> That last bit seemed fussy when I wrote it and now seems essential. A refusal a model composes is a refusal a model can be argued out of. It can generate a softer version next turn, then one that suggests a workaround, then one that does the thing. Each step locally reasonable. **Constant text has no gradient to walk down.**
>
> Put the constraint where the model isn't.
>
> #aisafety #localai #softwarearchitecture #homelab

---

## 19 — Seven in the Morning
**2026-08-05** · `/posts/captain-awareness-reports/`

> Last post in this series, and it's about the piece I trust most: a twice-daily report on my lab's health, with no language model anywhere in it.
>
> After eighteen posts of enthusiasm about local AI, that deserves an explanation.
>
> This is the report I need to trust *without checking*. Its whole value is that when it says the backups ran, I don't verify. The moment I have to verify, it's worse than useless — a second chore rather than one saved.
>
> A model in that path adds a small probability of a fluent, plausible, wrong summary. Small. But it runs twice a day forever, a small probability per run is a certainty eventually, and I won't know which run it was.
>
> So: **models for things where being approximately right is useful, code for things where being wrong is invisible.**
>
> It's also fail-closed. Can't reach the monitoring? Red — not "unknown", not a cheerful summary with a caveat. The natural implementation gathers what it can and skips what fails, which produces a report that gets *more* optimistic as more things break.
>
> And it says "nothing changed" out loud, because silence can't distinguish that from "the report didn't run."
>
> None of this needed good hardware. The most valuable measurement in the whole project was 1.7 tokens per second on a machine with no GPU — valuable precisely because it was bad. If you have a laptop someone threw away and a small model, you have a lab.
>
> #localai #homelab #observability #aisafety #engineering
