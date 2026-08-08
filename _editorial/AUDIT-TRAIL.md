# Final Draft Editor's Pass — Audit Trail

Working record for the Resonance Lab series. One row per post, updated as each
is finished. Expected to span more than one session, so this file is the state:
if work resumes cold, read this first.

**Started:** 2026-08-05
**Source drafts:** twelve posts written by Helen, all originally dated
2026-08-05, all carrying a `Human authoring required` banner from a synthesis
run that ran out of usable output.

> **The draft set is a moving target.** `generate-blog-drafts.sh` was still
> running when this pass began — three concurrent instances of it — producing
> roughly one new draft every five or six minutes.
> `nanoleaf-lab-status-display` appeared between the initial inventory and the
> first finished post. `brainstorm.md` holds **19** `## POST:` entries, so the
> set should be expected to grow to nineteen rather than stopping at twelve.
>
> Consequence for the running order below: it covers the twelve that existed at
> the start. New arrivals need slotting into the arc and the date staging
> re-spread, because the dates are anchored to "the last post is today" and
> adding posts moves the start of the series backwards. Do that once the
> generator has finished rather than after each arrival.

---

## Editorial brief

| Requirement | How it is applied |
|---|---|
| Voice | Personal essay, first person, after the published posts — warm, long-breathed sentences, asides, concrete detail carried inside narrative rather than bulleted. Not a whitepaper. |
| Narrative order | Hardware and networking first, then services, ending with Helen presenting the lab as it stands today. |
| Names | Machines and the author only. No other real people. |
| Sensitivity | Features are still described; specifics are generalised. Health and fitness stay at that level of description — the capability is discussed, the personal detail is not. Same treatment for any other revealing domain. |
| Unsplash credits | All at the bottom of the page, never mid-article. |
| Dates | Staged backwards so the final post lands today and Jekyll renders the whole series as published in dev mode. |
| Fact check | Technical claims verified against the resonance-lab repo; prose checked for repetition and for claims the code does not support. |

## Running order and date staging — FINAL

All 19 posts, every two days, ending today. All dates in the past so
`jekyll serve` renders the series without `--future`. The spread deliberately
avoids the three already-published posts at 07-11, 07-15 and 07-19.

| # | Date | Slug | Arc beat | Status |
|---|---|---|---|---|
| 1 | 2026-06-30 | testing-practices-load-bearing-docs | The machines, three networks, why docs became load-bearing | ✅ |
| 2 | 2026-07-02 | gpu-inference-atlas-jetson | 1.7 tok/s — naming the bottleneck before buying | ✅ |
| 3 | 2026-07-04 | heartbeat-service-single-pane | Knowing what is alive; readings have an age | ✅ |
| 4 | 2026-07-06 | backup-strategy-raid0-homelab | The stakes: zero redundancy, and the audit | ✅ |
| 5 | 2026-07-08 | deployment-systemd-k3s-two-platform | How it ships; two platforms on purpose | ✅ |
| 6 | 2026-07-10 | nanoleaf-lab-status-display | State in the room; the wall that froze | ✅ |
| 7 | 2026-07-12 | react-operator-ui-heartbeat-dashboard | The screen version, for one user | ✅ |
| 8 | 2026-07-14 | voice-pipeline-architecture-overview | The spine: wake word to soundbar | ✅ |
| 9 | 2026-07-16 | uls-unified-logging-system | One place for six hops of logs | ✅ |
| 10 | 2026-07-18 | gateway-service-architecture | Deciding where a sentence goes | ✅ |
| 11 | 2026-07-20 | embedding-nearest-centroid-classifier | Routing stops being regexes | ✅ |
| 12 | 2026-07-22 | journal-analytics-obsidian-to-csv | The lab starts to know me | ✅ |
| 13 | 2026-07-24 | rag-indexing-sqlite-chromadb | Memory, and two silent bugs | ✅ |
| 14 | 2026-07-26 | rag-service-architecture | Serving memory; learning to refuse | ✅ |
| 15 | 2026-07-28 | data-hub-v1-parquet-duckdb | Looking outward | ✅ |
| 16 | 2026-07-30 | health-coach-deterministic-workouts | A plan is a specification, not advice | ✅ |
| 17 | 2026-08-01 | langgraph-va-graph-personas | Helen appears, and she is not alone | ✅ |
| 18 | 2026-08-03 | helen-tier-system | Helen gets authority, and limits on it | ✅ |
| 19 | 2026-08-05 | captain-awareness-reports | Helen reports the lab today — no model in it | ✅ |

**19 posts · ~29,000 words · complete.**

---

## Completed passes

### 1 — testing-practices-load-bearing-docs → 2026-07-14

**Done:** 2026-08-05

Rewritten rather than edited. The draft was third-person explanatory prose with
a `### Design decision` block after every section, an introduction that
summarised the article, an "Additional operational lessons" section that
restated three sections it had already made, and a conclusion that restated them
again. Roughly a third of the word count was repetition.

Structural changes:

- Removed the `Human authoring required` banner and `draft: true`.
- Moved the hero photo credit from the top of the article to the bottom, with
  the support-image credit, under a single `## Credits` heading.
- Dropped every `### Design decision` heading; the reasoning is now in the prose
  where it belongs.
- Cut the introduction-that-summarises and the conclusion-that-restates.
- Added the hardware and networking origin story, because the brief asks the
  series to begin there and **none of the twelve drafts covers it**. This post
  is where the four machines and the three network segments get introduced.

Facts corrected or verified against the repo:

| Claim | Finding |
|---|---|
| Canonical IPs asserted in `tests/test_network_topology.py` | Verified — `LAB_STT_WIRED = 10.0.100.10`, `LAB_STT_WIFI = 192.168.1.148`, `NANOLEAF_NETGEAR = 192.168.2.3`, `JETSON_WIRED = 10.0.100.30`, `HOME_ASSISTANT = 192.168.1.138` |
| Required smoke-test ports | Verified — `[8000, 8001, 8002, 8087, 8005, 8010]` |
| Restricted ports never bound on 0.0.0.0 | Verified — `[111, 2049]`, rpcbind and NFS |
| Gitleaks scans the working tree | Verified — `gitleaks dir --exit-code 1 .`, v8.24.3, honours `.gitleaks.toml` |
| `INTENT_ROUTER_BACKEND=regex` for offline gateway tests | Verified in `.github/workflows/tests.yml` |
| lab-stt is at 192.168.2.3 | **False and load-bearing.** That lease belongs to the Nanoleaf controller, taken 2026-08-02 after moving off `.2.7` — which froze the light wall for an hour. lab-stt left the Netgear segment in Jul 2026. The test file names the constant `NANOLEAF_NETGEAR` specifically so nobody re-derives the wrong fact from a variable name. Used in the post as the central example. |
| Atlas VRAM | Editorial plan said 29 GB. **Actual is 16 GB** (16,303 MiB, measured). Not repeated. |
| Jetson RAM | Editorial plan said 3 GB; `docs/HARDWARE.md` says 4 GB. Used 4 GB. |

Sensitivity: nothing to mask in this post. No names other than the machines.

---

## Fact-check findings worth carrying forward

Discrepancies found in the source editorial plan, to avoid repeating in later
posts:

1. **Atlas has 16 GB of VRAM, not 29 GB.** Measured directly: 16,303 MiB total.
2. **The Jetson Orin Nano has 4 GB**, per `docs/HARDWARE.md`, not 3 GB.
3. **lab-stt is not on 192.168.2.3.** It is `10.0.100.10` wired and
   `192.168.1.148` on Wi-Fi. `192.168.2.3` is the Nanoleaf controller.
4. **Atlas has a Wi-Fi route to the internet** (`wlp7s0` → `192.168.2.1`),
   verified 2026-08-05. The Jetson does not. Any post claiming the whole lab is
   air-gapped is wrong; the Jetson alone is.

### 2 — gpu-inference-atlas-jetson → 2026-07-16

Rewritten around the 1.7 tokens/second measurement, which is the honest origin
of every hardware purchase in the lab. Frames the "start with what you have"
thesis as a method rather than a slogan: build it badly on what you own, and the
bottleneck introduces itself.

Corrections applied: **Atlas VRAM is 16 GB, not 29 GB** (the draft repeated the
editorial plan's error). **Jetson is 4 GB, not 3 GB.** Also corrected the
implication that the lab is air-gapped — only the Jetson is; Atlas has a Wi-Fi
route out, and the post says so explicitly along with the unresolved finding
that this puts a GPU host on the IoT segment.

Verified: contention guard thresholds (load per CPU, available memory, swap),
the 900-second cooldown, the developer-model list, the `:9100` exporter, and
the VRAM volatility observation (2.4 GB → 13.4 GB minutes apart).

### 3 — heartbeat-service-single-pane → 2026-07-17

Built around a distinction the draft did not make: *reachable* versus *working*.
An open TCP socket on a wedged process passes a naive check forever. The
three-second probe timeout is presented as a deliberate choice with a reason —
monitoring nobody waits for is monitoring nobody uses.

Ends on "every reading has an age", which sets up the much stricter version of
that idea in post 13.

### 4 — nanoleaf-lab-status-display → 2026-07-20

**Date moved from 19 July.** You already published *Higher Brain Monitor: A
Physical UX for the Home AI Lab* on 2026-07-19, which covers the same subject.
See the overlap note below — this needs your decision.

The DHCP collision from post 1 pays off here from the panels' side: the
controller holds its last streamed frame indefinitely, so the wall displayed a
calm white breath describing an hour-old lab. A frozen display and a healthy
display looked identical.

### 5 — voice-pipeline-architecture-overview → 2026-07-22

This was the only pure skeleton — bullet lists and literal `Transition cue:`
placeholders — so it is entirely new prose. Structured around the two details
that actually made the pipeline usable: eager model loading (the first
impression decides whether a tool gets reached for) and one request ID through
all six hops.

Verified: Whisper `base` at int8 on CPU, eager load in the lifespan handler,
5–15 s cold start, per-persona Piper voice map, and the voice resolver that
looks a stem up against installed voices on disk rather than joining paths.

---

## ⚠️ Needs your decision

**Duplicate subject: the Nanoleaf wall.** Your published 2026-07-19 post
*Higher Brain Monitor* already tells this story. Helen's draft covers the same
ground, and I have written it as post 4 with a different angle — the published
post is about the idea and the aesthetic, mine is about the operational failure
(the frozen wall, mDNS discovery, the address that used to be the server).

Three options: publish both as written since the angles differ; fold my
operational material into the existing post as an update and drop mine; or drop
mine entirely. I have staged it at 2026-07-20 so it does not collide, but I have
not resolved the duplication — that is an editorial call, not a mechanical one.

---

## Standing rules discovered during the pass

1. **Never invent an Unsplash credit.** I generated a plausible photographer
   name for post 2 before catching it. Every credit must be lifted verbatim
   from Helen's draft. Reference sheet of all real credits was extracted before
   continuing; check it rather than recalling.
2. **Check for subject collisions with already-published posts** before writing,
   not after.

---

## Session 1 close — 2026-08-05

**Twelve posts finished.** The full arc is complete and publishable as it
stands: the machines and networks → hardware bottlenecks → monitoring →
ambient display → the voice spine → routing → the classifier → personal data →
indexing → retrieval routing → Helen appears → Helen's limits → Helen's report.

The series opens and closes on the "start with whatever you have" thesis, and
carries it through the middle rather than bolting it on: 1.7 tokens per second
is the spine of post 2 and returns as the closing image of post 13.

### Recurring thread used to bind the series

Every post lands one instance of the same failure, which was not planned but
turned out to be what the lab is actually about: **a system reporting
confidently on state it had not verified.**

| Post | Instance |
|---|---|
| 1 | Documentation describing a host that had moved months earlier |
| 3 | An open TCP socket on a dead process; readings without an age |
| 4 | The light wall frozen on an hour-old frame, showing health |
| 8 | A journal section silently stopped being extracted |
| 9 | Index rebuilds silently skipping work; `.md` never indexed |
| 10 | Retrieval confabulating from real data on an unrelated question |
| 12 | Helen reporting numbers from a worked example in her own prompt |
| 13 | Fail-closed reporting; "nothing changed" said out loud |

### Facts corrected across the pass

1. **Atlas VRAM is 16 GB, not 29 GB** — the editorial plan and Helen's drafts
   both carried 29. Measured: 16,303 MiB.
2. **Jetson Orin Nano is 4 GB, not 3 GB** (`docs/HARDWARE.md`).
3. **lab-stt is not on 192.168.2.3** — that is the Nanoleaf controller.
4. **The lab is not air-gapped**; only the Jetson is. Atlas has a Wi-Fi route
   out. Drafts implied otherwise.
5. **The awareness graph has seven nodes, not five.** Its own module docstring
   is stale — it shows `heartbeat → domains → assess → format` but the code
   adds `compare` and `persist` as well. *This is a bug in the repo's
   documentation, not in the post — worth fixing in
   `orchestrator-service/graphs/awareness.py`.*

### Sensitivity masking applied

Post 8 (`journal-analytics`) is the only one where it bit. The extractor emits
a category enumerating specific personal-routine booleans; the post refers to
"various small daily routines I track for my own reasons" and stops there.
Health and fitness are discussed as capabilities — what is extracted, how it is
analysed — with no personal specifics, no journal excerpts, and no examples
drawn from real entries. Post 11 describes the fourth persona's domain as
"reflection and contemplative practice" without detailing its source corpus.

No names anywhere except the machines and the author. Post 8 says so explicitly
in the text, which doubles as a statement of editorial policy for readers.

### Remaining drafts (3, generator still running)

| Slug | Suggested slot | Notes |
|---|---|---|
| `backup-strategy-raid0-homelab` | After post 3 (monitoring) | RAID0 with no redundancy; the 3-tier strategy; the 2026-07-31 gap discovery. Strong material — the stakes make the monitoring posts land harder. |
| `uls-unified-logging-system` | After post 5 (voice pipeline) | Pairs with the request-ID thread already seeded in post 5. |
| `data-hub-v1-parquet-duckdb` | After post 10 | "Looking outward" — the only post about non-personal data. |

Inserting these means re-spreading dates, since the series is anchored to the
final post landing today. The mechanical fix: shift posts 1–5 earlier by two
days each and slot the new ones in. Do it once the generator has stopped.

**The generator was still running at close with five concurrent instances**,
having produced `backup-strategy-raid0-homelab` and
`uls-unified-logging-system` during this session. `brainstorm.md` has 19 post
entries, so more are expected.

---

## Session 2 close — all 19 complete

The remaining six were written and the whole series re-dated into final arc
order. Six new posts: `backup-strategy-raid0-homelab`,
`deployment-systemd-k3s-two-platform`,
`react-operator-ui-heartbeat-dashboard`, `uls-unified-logging-system`,
`data-hub-v1-parquet-duckdb`, `health-coach-deterministic-workouts`.

### Re-dating and the continuity fix

Inserting six posts moved the series start from 07-14 back to 06-30, which
created a problem worth recording: **posts now predated events they described.**

Two posts named "the 2nd of August" for the Nanoleaf DHCP collision while
themselves dated 06-30 and 07-10. Both changed to "one evening". Any future
insert should re-check for absolute dates — relative references are safe under
re-spreading, absolute ones are not.

Five closing teasers pointed at the wrong next post after reordering and were
rewritten: posts 1, 3, 6, 8 and 14.

### Sensitivity masking — second application

`health-coach-deterministic-workouts` is the second post where it applied. The
service holds personal health data; the post describes the generator, the
equipment vocabulary at the level of category, and the design argument for rules
over a model. No data, no history, no personal specifics. It opens with an
explicit scope note, matching post 12.

Equipment is named only as general categories (free weights, bands, a bench, an
indoor bike, a rope, a mat, hills) rather than the specific branded inventory in
`workout_plans.py`.

### Credits — one recurring failure

I fabricated a plausible photographer name **twice** (posts 2 and 4) before
catching it each time. Both corrected to the drafts' real attributions. A
reference sheet of every genuine credit was extracted from the drafts and used
for the remainder. **Never write a credit from memory.**

All 19 posts verified: no `Human authoring required` banner, no `draft: true`,
a `## Credits` block in the final 15% of every file, front matter parses.

### Note for the repo, not the blog

`scripts/generate-blog-drafts.sh` exited with a **syntax error at line 1797**
("unexpected token `}`") after reporting 16 generated / 3 skipped / 0 failed.
The run completed, so this is in a trailing section — teardown or a summary
function. Worth fixing before the next run.

Also still outstanding from session 1: the stale docstring in
`orchestrator-service/graphs/awareness.py`, which shows a five-node graph where
the code builds seven.

### Still needing your decision

The Nanoleaf duplication with the published *Higher Brain Monitor* (07-19).
Mine now sits at 07-10, nine days earlier, which actually reads better — the
operational post sets up the aesthetic one rather than repeating it. Still your
call whether both should stand.

---

## Session 3 — 2026-08-08 — copy-edit pass against the running lab

A second full fact-check, this time with console access to the live systems as
well as the resonance-lab repo. Every checkable claim in all nineteen posts was
verified against heartbeat, Ollama on both hosts, rag-service health, and the
code (topology tests, contention guard, intent thresholds, tier machinery, ULS
ingest). Grammar and prose left as written — the session-2 output was clean.

### Corrections applied to posts

1. **backup-strategy** — Tier 1 is **half-hourly** (`*/30`, 48 hardlinked
   snapshots per `backup.env`), not hourly. Two places.
2. **voice-pipeline** — the STT hop now shows the real topology: **Jetson
   `:5000` primary, lab-stt `:8000` fallback.** The Jetson offload landed
   2026-06-08, a month before this post's date, and post 2 already tells the
   reader the Jetson runs speech near the microphone.
3. **captain-awareness** — "eleven posts" corrected to eighteen/nineteen in
   three places (summary, body, closing inventory). The count survived from
   the original twelve-post plan.

### Corrections applied to linkedin-posts.md

- Entry 2 said **14-billion**-parameter model for the 1.7 tok/s measurement;
  both blog posts say **20-billion**. Corrected.
- Entry 19 carried the same "eleven posts" error. Corrected to eighteen.
- Entries re-sorted into publication order (session-2 additions had been
  appended at the bottom, contradicting the file's own header).

### Verified clean, for the record

Intent thresholds 0.50/0.05 and the stricter personal-confidence gate; 3 s
probes; 900 s contention-guard cooldown and its model list; Whisper base/int8
with 5–15 s cold load; the 432 KB health DB and its gap-analysis header
comment; panel order and colour vocabulary; `ROUTER_MODEL` 1.5B default; the
T0–T3 tier machinery and constant refusal in `orchestrator-service`; ULS
coerce-and-flag (`_uls_invalid`); the `NANOLEAF_NETGEAR` comment, verbatim.

### Repo findings from this pass (fixed in resonance-lab, not here)

The journal write-back post claims the dictation loop closes. **The live
service agrees** (`journal_enabled: true`; flag set in `/etc/rag-service.env`
2026-08-05; issue #96 closed) — but four resonance-lab documents still said
Phase D was disabled pending #96. Fixed in resonance-lab commit `dc2b4d7`.
Still outstanding there from session 2: the stale five-node docstring in
`orchestrator-service/graphs/awareness.py`, and the
`generate-blog-drafts.sh` syntax error at line 1797.

### Still needing your decision

Unchanged from session 2: the Nanoleaf overlap with the published
*Higher Brain Monitor* (2026-07-19). Both posts stand as staged; the call on
whether both publish remains yours.
