---
layout: post
date:   2025-09-12 07:00:00 -0400
title: "Update (2025-09-12): Post-Migration Deep Dive & Lessons Learned"
description: "Migration notes from an invoice OCR + validation workflow moving from multi-tenant (Consumption) to single-tenant (Standard)—with focus on Blob operations, connector parity, error handling, design hygiene, and secrets management."
categories: howto
tags:
  - azure
  - logic-apps
  - integration
  - migration
  - architecture
image: /images/transmorgify.png
excerpt_separator: <!--more-->
---

After publishing this walkthrough I hit a harder wall than expected when moving a large Logic App from **Consumption** to **Standard**. This update documents what actually went wrong, what *looked* like a connector API “version” issue (but wasn’t), and the practical remediation paths depending on how much refactoring you’re willing to take on.

[Disclaimer: I used AI to generate this post from code scenarios I personally constructed & **very careful** contextual guidance in order to document this topic quickly].

<!--more-->

### 1. The Designer Error Recap

> “Unable to initialize operation details for swagger based operation … Error details – Operation Id cannot be determined from definition and swagger.”

The root trigger was that I pasted raw Consumption‑style managed connector actions (Blob) directly into a Standard workflow. These actions used:
- `type: ApiConnection`
- `method` + `path` + `queries`
- Double URL encoding (`encodeURIComponent(encodeURIComponent(...))`)
- Encoded folder tokens (`foldersV2/<base64>`)

Logic App **Standard** wants either:
1. A normalized managed connector action (`operationId` + `parameters`), or  
2. A built‑in / service provider / HTTP action you fully control.

Because the portal could not map my raw `method`/`path` to an `operationId`, it flagged them as unresolved.

### 2. Two Parallel Connection Models Causing Confusion

My `connections.json` contained BOTH:
- `serviceProviderConnections.AzureBlob` (older “Service Provider” pattern; actions would be `type: ServiceProvider`)
- `managedApiConnections.azureblob-1` (actual managed connector instance; actions were `type: ApiConnection` with `referenceName: azureblob-1`)

Important clarification:  
`azureblob-1` is **not** an API version label; it’s just the resource name of the managed connector instance. API versions used internally by the connector aren’t exposed in that identifier.

I was only using the managed connector in the workflow, so the service provider entry was dead weight (and a source of second‑guessing).

### 3. Why the “Lift & Shift” Failed (Primary Factors)

| Factor | Impact |
|--------|--------|
| Raw `method/path` shape from Consumption | No swagger operation binding → designer error |
| Double encoding & base64 folder IDs | Obscured path pattern matching |
| Huge single workflow definition | Increased chance of partial metadata resolution timeout |
| Preview / future API version usage (Form Recognizer) | Extra metadata load risk; not the *cause*, but noise |
| No normalization step | Downstream expressions assumed old output shape |

### 4. Given time, a Better Migration Path

1. Import only the skeleton (variables, scopes) first.  
2. Re‑add each Blob action **via designer** to let it generate clean `operationId` JSON.  
3. Then paste internal transformations (Compose / Parse / loops) around those actions.  
4. Only after Blob stabilized, reintroduce Form Recognizer + SQL segments.  
5. Avoid double encoding unless absolutely required.

### 5. Practical Remediation Options

| Option | Effort | Pros | Cons | Use When |
|--------|--------|------|------|----------|
| A. Keep raw actions (do nothing) | Lowest | Fast, runs may still succeed | Designer noise, brittle | Short-term triage |
| B. Recreate actions to get `operationId` form | Medium | Clean designer, connector support | Manual rework | Staying on managed connector |
| C. Switch to HTTP + Managed Identity (REST) | Medium | Full control, zero swagger issues | Must handle XML listing & transforms | Want clarity & portability |
| D. Service Provider pattern | Medium | Sometimes bypasses binding quirks | Less commonly used now | If managed connector keeps failing |

### 6. HTTP + MSI Pattern (If You Want Total Control)

List blobs (XML → normalized JSON):

```http
GET https://<storageAccount>.blob.core.windows.net/<container>?restype=container&comp=list&prefix=processing-queue/
x-ms-version: 2023-11-03
Authorization: (Managed Identity)
```

Logic App steps:
1. HTTP action (MSI)  
2. `@xml(body(...))`  
3. `@xpath(..., '/EnumerationResults/Blobs/Blob')`  
4. `Select` → map to `[ { "Id": Name, "Name": Name, "Path": "/processing-queue/" + Name } ]`  
5. Wrap as `{ "value": [...] }` so existing `foreach` loops work unchanged.

Use server-side `copyFile` API where content is unchanged; only `PUT` (upload) for transformed artifacts (CSV, JSON outputs).

### 7. Deciding What to Remove from `connections.json`

| Keep Scenario | Remove |
|---------------|--------|
| Staying on managed connector (`azureblob-1`) | Remove unused `serviceProviderConnections.AzureBlob` |
| Going full HTTP | Remove BOTH blob entries after refactor |
| Switching to service provider model | Remove `azureblob-1` once no actions reference it |

Always search repo for:
- `"referenceName": "azureblob-1"`
- `"connectionName": "AzureBlob"`

before deleting.

### 8. Checklist: Safe Cleanup / Refactor

1. Pick target pattern (Managed vs HTTP vs Service Provider).
2. For each Blob action: rebuild (or replace) and test.
3. Normalize listing output (so `foreach` stays stable).
4. Replace multi-step copy (download → upload → delete) with server-side `copyFile` where applicable.
5. Grant MSI roles: `Storage Blob Data Reader` (read) + `Storage Blob Data Contributor` (write/delete).
6. Remove unused connection entries.
7. Document the decision (README or inline comment Compose).
8. Run a full dry-run / diff on sample invoice set.

### 9. Lessons Learned

- “Copy & paste” of managed connector JSON from Consumption → Standard is fragile.  
- Double encodings and internal folder tokens hamper designer inference.  
- Introducing a slim “connector sanity” workflow first catches metadata issues early.  
- HTTP + MSI is a viable *primary* pattern when stability matters more than wizards.  
- Keep `connections.json` minimal—unused entries create cognitive drag.

### 10. Recommended Documentation Snippet (Internal)

```
Design Choice: Adopt HTTP + MSI for Azure Blob (2025-09-12).
Rationale: Avoid operationId inference failures encountered during Consumption → Standard migration.
Removed: serviceProviderConnections.AzureBlob (unused), managedApiConnections.azureblob-1 (after refactor).
All blob operations now: List (XML → JSON), Get (only when transforming), Server-side copy, Upload (for generated artifacts), Delete (cleanup).
```

### 11. Next Steps (If Following the HTTP Path)

- Migrate “Check_Invoice_Queue” first → validate file enumeration.
- Swap “Get_blob_content_(V2)” with HTTP GET including `inferContentType` equivalent logic (or handle MIME manually).
- Consolidate repetitive upload actions into a helper (Compose name + shared upload pattern) to reduce definition size.
- Add retry policies to external dependencies (Blob, Form Recognizer).
- Version your workflow file in source control with a clear migration commit message.

---

**Final Thought:** The biggest unlock was mentally separating *“connector swagger binding”* from *“my business logic.”* Once Blob access was decoupled via HTTP + MSI, the rest of the workflow became straightforward again.