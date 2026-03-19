---
layout: post
date:   2026-03-14 10:00:00 -0400
original_date: 2026-03-14 00:00:00 -0400
last_modified_at: 2026-03-14 10:00:00 -0400
title: "Facades, Envelopes, and Orchestrators: Building a Testable Integration Chain on Azure Logic Apps"
description: "A walkthrough of how we built the PLM-Genesis integration layer using inbound and outbound facades, a standard message envelope, Service Bus topic routing, idempotency via Azure Table Storage, and a central orchestrator—all on Logic Apps Standard with a feature toggle for mock mode."
tags:
  - azure
  - logic-apps
  - integration
  - architecture
  - service-bus
  - facade-pattern
  - orchestrator
  - design-patterns
image: /images/plm-genesis-chain.png
excerpt_separator: <!--more-->
---

I've been building an integration layer between TraceOne (a PLM platform), SAP S/4HANA, and internal middleware using Azure Logic Apps Standard. The system needed to be testable without live endpoints, traceable end-to-end, and structured in a way that future event types could be added without rewiring plumbing.

This post documents the architecture I landed on: an inbound facade, a standard message envelope, Service Bus topic-based routing, an orchestrator with idempotency, and an outbound facade. The whole chain is toggleable between mock and live mode with a single parameter.

It's not theoretical. It's running. I'll show you the patterns, the contracts, where things broke during testing, and the thirty years of published engineering that backs up the terminology.

<!--more-->

## The Problem

We needed to move material data from TraceOne into SAP. Sounds simple until you list the requirements:

- TraceOne pushes webhook events (or we poll—TBD at the time of build)
- SAP requires OAuth, specific headers, and endpoint resolution by entity type
- The orchestrator needs to validate, deduplicate, route by event type, transform, transmit, and emit downstream events
- Everything needs to be observable via Teams
- We need to test the full chain without TraceOne or SAP being connected yet
- The SI partner's team needs to understand and extend it

That last bullet matters. If the architecture isn't legible, it won't survive contact with the team that inherits it.

## A Quick History of These Patterns

Before I walk through the implementation, I want to ground the terminology. "Facade" and "orchestrator" aren't buzzwords I pulled out of a meeting. They're published, peer-reviewed software engineering patterns with decades of production use behind them. If you're going to use them—and defend them in architecture reviews—you should know where they come from.

### The Facade Pattern: 1994–Present

The Facade pattern first appeared in *Design Patterns: Elements of Reusable Object-Oriented Software* by Gamma, Helm, Johnson, and Vlissides—the Gang of Four—in 1994. Their definition:

> *"Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use."*

The original context was object-oriented class design. You had a complex subsystem with dozens of classes, and you put a single class in front of it that exposed only what callers needed. The internal complexity didn't go away—it just got hidden behind a clean contract.

**Martin Fowler** extended this to distributed systems in *Patterns of Enterprise Application Architecture* (2002) with the **Remote Facade** pattern: *"Provides a coarse-grained facade on fine-grained objects to improve efficiency over a network."* His point was that when you're crossing a network boundary, you want fewer, fatter calls instead of many chatty ones. A facade collapses the complexity of authentication, endpoint resolution, header construction, and response parsing into a single interaction.

**Hohpe and Woolf** took it further in *Enterprise Integration Patterns* (2003) with the **Messaging Gateway**: *"A Messaging Gateway encapsulates message-specific code from the rest of the application. The application calls a simple interface without knowing about the messaging infrastructure."* This is exactly what our inbound facade does—it receives HTTP and publishes to Service Bus. The caller doesn't know Service Bus exists. The consumer doesn't know HTTP was involved.

**Microsoft's Azure Architecture Center** (2023) describes the same idea as the **Gateway Aggregation Pattern**—using a gateway to aggregate and abstract multiple backend calls into a single interface. Their reference architectures for API facades in cloud integration are directly aligned with what we built.

That's a thirty-year lineage from GoF class design → Fowler's network boundaries → Hohpe and Woolf's messaging systems → Microsoft's cloud-native reference architectures. Same core principle, applied at different scales.

### The Orchestrator Pattern: 2003–Present

The orchestrator concept shows up under different names depending on who's writing:

**Hohpe and Woolf** (2003) call it a **Process Manager**: *"A Process Manager routes each message to the correct processing step, maintains the state of the process, and determines the next step based on intermediate results."* Our orchestrator validates, deduplicates, routes by event type, transforms, calls the outbound facade, and emits success or failure events. That's a process manager.

**Chris Richardson** in *Microservices Patterns* (2018) formalizes the **Orchestration-based Saga**: *"An orchestration-based saga uses a saga orchestrator to tell the participants what to do. The saga orchestrator communicates with the participants using command/reply."* Our orchestrator sends a command (`facadeRequest`) to the SAP facade and processes the reply (`facadeResponse`). It decides the next step based on the response.

**Microsoft's Azure Architecture Center** (2023) explicitly contrasts **Choreography vs. Orchestration**: *"An orchestrator is a central coordinator that controls the interaction between services. The orchestrator is responsible for invoking the services and coordinating the workflow."* Choreography is event-driven with no central coordinator; orchestration has one. We chose orchestration because we needed deterministic routing, idempotency, and a single place to add new event types.

**Sam Newman** in *Building Microservices, 2nd Edition* (2021) ties both patterns together: *"A facade can be used to present a simplified view of a legacy or complex system to the rest of your architecture... The orchestrator pattern works well when you need to coordinate behavior across multiple services and maintain a clear view of the overall business process."*

**Microsoft's own Logic Apps documentation** (2024) recommends separating integration logic into trigger workflows (our facades), orchestration workflows (our orchestrator), and utility workflows for shared operations. We followed this directly.

### The Pattern Lineage

| Term | Pattern Name | Source | Year |
|------|-------------|--------|------|
| Facade | Facade Pattern | GoF — *Design Patterns* | 1994 |
| Facade | Remote Facade | Fowler — *PoEAA* | 2002 |
| Facade | Messaging Gateway | Hohpe & Woolf — *EIP* | 2003 |
| Facade | Gateway Aggregation | Microsoft Azure Architecture Center | 2023 |
| Orchestrator | Process Manager | Hohpe & Woolf — *EIP* | 2003 |
| Orchestrator | Orchestration-based Saga | Richardson — *Microservices Patterns* | 2018 |
| Orchestrator | Choreography vs Orchestration | Microsoft Azure Architecture Center | 2023 |
| Both | Integration separation | Microsoft Logic Apps Best Practices | 2024 |
| Both | Facade + Orchestrator | Newman — *Building Microservices 2e* | 2021 |

These patterns survived because they work. They decompose correctly, they separate concerns along natural boundaries, and they produce systems that teams can reason about. The specific technology doesn't matter—Logic Apps, Azure Functions, Kubernetes, mainframe CICS—the structural principles are the same.

Now let me show you what it looks like when you build it.

---

## The Architecture

```
TraceOne (or Mock)
    │
    ▼
┌─────────────────────────┐
│  TraceOne_Inbound_Facade │  ← HTTP trigger
│  (Normalize + Envelope)  │
└────────────┬────────────┘
             │ Service Bus: material-updates topic
             ▼
┌─────────────────────────┐
│  Material_Orchestrator   │  ← SB trigger (1-min poll)
│  (Validate → Dedup →    │
│   Route → Transform →   │
│   Transmit → Emit)      │
└────────────┬────────────┘
             │ HTTP POST
             ▼
┌─────────────────────────┐
│  SAP_Outbound_Facade     │  ← HTTP trigger
│  (Auth → Resolve →       │
│   Transmit → Classify)   │
└─────────────────────────┘
             │
             ▼
         SAP (or Mock)
```

Three workflows. Two facades. One orchestrator. One Service Bus topic with a subscription. One Azure Table for idempotency. One Teams webhook for observability.

Microsoft's recommended separation:

```
Microsoft recommended pattern:     Our implementation:
─────────────────────────────      ────────────────────────
Trigger workflow (inbound)    -->  TraceOne_Inbound_Facade
Orchestration workflow        -->  Material_Orchestrator
Trigger workflow (outbound)   -->  SAP_Outbound_Facade
```

---

## The Inbound Facade

The `TraceOne_Inbound_Facade` has one job: produce a standard envelope and drop it on the Service Bus topic.

It has two modes controlled by the `APIM_LIVE` parameter:

**Mock mode** (`APIM_LIVE = false`): Ignores the HTTP body entirely. Picks a payload from a `MockPayloads` parameter (a JSON array of test materials), wraps it in the envelope, and publishes.

**Live mode** (`APIM_LIVE = true`): Parses the incoming TraceOne webhook body, validates required fields (`eventType`, `data.recordId`), maps the event type (`material.updated` → `MaterialUpdated`), and builds the envelope from the real data.

Either way, the output is identical: a standard envelope on the `material-updates` topic. The orchestrator doesn't know or care which mode produced it.

This is Hohpe and Woolf's **Messaging Gateway** in practice. The external system (TraceOne) speaks HTTP with its own event naming conventions. The internal system (the orchestrator) speaks envelopes on Service Bus. The facade translates between them. Neither side knows about the other's protocol.

### The Feature Toggle

```json
"Condition_APIM_Live": {
    "type": "If",
    "expression": {
        "and": [{ "equals": ["@parameters('APIM_LIVE')", true] }]
    }
}
```

One boolean. One branch. Every facade uses the same pattern. When APIM is offline, when SAP isn't connected yet, when you're running a load test at your desk—flip it to `false` and the entire chain runs end-to-end on mock data.

This is the single most useful thing in the architecture for day-one testing.

---

## The Message Envelope

Every message on the Service Bus conforms to this structure:

```json
{
    "schemaVersion": "1.0",
    "messageId": "guid",
    "correlationId": "guid",
    "causationId": "MOCK-INBOUND-{facadeRunId}",
    "sourceSystem": "TraceOne",
    "eventType": "MaterialUpdated",
    "commandType": null,
    "entityType": "Material",
    "entityId": "TO-MAT-90001",
    "occurredAt": "2026-03-11T16:00:00Z",
    "replayFlag": false,
    "trace": {
        "traceId": "guid",
        "spanId": "inbound-facade-mock",
        "env": "dev",
        "tenant": "plm-genesis"
    },
    "payload": {
        "materialName": "Organic Wheat Flour",
        "supplierId": "SUP-001",
        "regulatoryStatus": "approved"
    }
}
```

### Why This Shape

| Field | Purpose |
|-------|---------|
| `schemaVersion` | Forward compatibility. The orchestrator validates this. |
| `messageId` | Unique per message. Used as the idempotency key. |
| `correlationId` | Ties the entire chain together across all three workflows. |
| `causationId` | What caused this message. Enables event sourcing traceability. |
| `eventType` | Routing key. The orchestrator's Switch action uses this. |
| `entityType` + `entityId` | What this message is about. Partition key for idempotency. |
| `trace` | Distributed tracing metadata. Environment, tenant, span context. |
| `payload` | The actual business data. Schema varies by entity type. |

This is not an accidental shape. It's derived from the Process Manager pattern (Hohpe & Woolf, p. 312) and Microsoft's own event schema guidance for Azure Integration Services. Every field has a job.

---

## The Orchestrator

The `Material_Orchestrator` is triggered by the Service Bus subscription. It polls every minute. When a message arrives, it executes Hohpe and Woolf's Process Manager: route the message to the correct processing step, maintain state, and determine the next step based on intermediate results.

### 1. Decode and Parse

```json
"Compose_Envelope": {
    "inputs": "@base64ToString(triggerBody()?['ContentData'])"
}
```

Service Bus messages are base64-encoded. We decode, then parse against the envelope schema.

### 2. Validate

Three sequential validation checks:

- **Required fields**: schemaVersion, messageId, correlationId, sourceSystem, entityType, entityId, occurredAt, payload
- **Schema version**: Must be `1.0`
- **Event or command type**: Exactly one of `eventType` or `commandType` must be present

Validation errors accumulate into an array. If any check fails, the message is dead-lettered with the specific errors joined into the dead-letter description. A Teams card fires with the full error context. The run terminates with `Succeeded` status—because handling an invalid message gracefully is correct behavior, not a failure.

### 3. Idempotency Check

```json
"Get_Idempotency_Record": {
    "type": "ApiConnection",
    "inputs": {
        "path": "/v2/storageAccounts/.../tables/idempotency/entities(
            PartitionKey='Material',
            RowKey='{messageId}'
        )"
    }
}
```

We use Azure Table Storage. Partition key = entity type. Row key = message ID.

The logic:

- Record exists with `status: Completed` → skip processing, complete the message, terminate
- Record doesn't exist (404) → insert with `status: Processing`, continue
- After successful processing → update to `status: Completed` with timestamp

This handles Service Bus's at-least-once delivery guarantee. The same message can arrive twice. The orchestrator processes it once. This is Richardson's saga pattern applied at the message level—each processing step is tracked, and replays are caught before they cause duplicate side effects.

### 4. Route by Event Type

```json
"Switch_DetermineBusinessAction": {
    "expression": "@variables('_eventType')",
    "cases": {
        "Case_MaterialUpdated": { "case": "MaterialUpdated", ... }
    },
    "default": { ... dead-letter as UnsupportedEventType ... }
}
```

Adding a new event type means adding a new case to the switch. Each case follows the same internal pattern: Transform → Transmit → Emit Event → Notify.

The default case dead-letters and sends a Teams alert. Unknown event types don't fail silently. This is a deliberate design choice—I'd rather get an alert about an event type I didn't expect than have it sit on the subscription forever or get silently consumed.

### 5. Transform and Transmit

For `MaterialUpdated`, the orchestrator transforms the envelope into the outbound facade's contract:

```json
{
    "facadeRequest": {
        "correlationId": "...",
        "messageId": "...",
        "runId": "...",
        "sourceSystem": "TraceOne",
        "targetSystem": "SAP",
        "direction": "OUTBOUND",
        "entityType": "Material",
        "entityId": "...",
        "eventType": "MaterialUpdated",
        "operation": "UPSERT",
        "timestamp": "..."
    },
    "payload": {
        "materialName": "...",
        "supplierId": "...",
        "regulatoryStatus": "..."
    }
}
```

This is Richardson's command/reply in action. The orchestrator sends a command (`facadeRequest`) and the facade returns a reply (`facadeResponse`). The orchestrator decides the next step based on the reply.

### 6. Emit Downstream Event

After a successful SAP call, the orchestrator publishes a `MaterialUpdateSucceeded` event to the `events` topic:

```json
{
    "schemaVersion": "1.0",
    "eventType": "MaterialUpdateSucceeded",
    "causationId": "{original messageId}",
    "payload": {
        "targetSystem": "SAP",
        "status": "SUCCESS",
        "sapHttpStatus": "200"
    }
}
```

Same envelope format. Same tracing. Same correlation ID. Any downstream subscriber on the `events` topic can react to this without knowing anything about the orchestrator's internals.

---

## The Outbound Facade

The `SAP_Outbound_Facade` is Fowler's **Remote Facade** applied to a cloud integration boundary. SAP's API surface requires OAuth token acquisition, endpoint resolution by entity type, specific headers (`sap-client`, `Authorization: Bearer`), exponential retry, and error classification across auth failures, validation errors, and server errors. The facade collapses all of that into a single HTTP POST with a standard contract.

**Mock mode** (`APIM_LIVE = false`): Skips auth and SAP call entirely. Generates a mock external reference ID (`SAP-MOCK-Material-{guid}`), returns `SUCCESS` with HTTP 200.

**Live mode** (`APIM_LIVE = true`):
1. Validates the `facadeRequest` + `payload` structure
2. Resolves the SAP endpoint by entity type (Material → `/api/material/v1/materials`)
3. Authenticates via OAuth (`client_credentials`)
4. Posts the transformed payload with SAP headers and exponential retry (3 attempts, 10s–60s intervals)
5. Classifies the response:

| SAP HTTP Status | Facade Status | Error Code |
|-----------------|---------------|------------|
| 2xx | SUCCESS | — |
| 401, 403 | FAILURE | SAP_AUTH_FAILED |
| 4xx (other) | FAILURE | SAP_VALIDATION_FAILED |
| 5xx | FAILURE | SAP_INTERNAL_ERROR |

The response contract is always the same:

```json
{
    "facadeResponse": {
        "status": "SUCCESS | REJECTED | FAILURE | ERROR",
        "correlationId": "...",
        "targetHttpStatus": 200,
        "externalReferenceId": "SAP-MOCK-Material-...",
        "errorCode": "",
        "errorMessage": "",
        "mode": "MOCK | LIVE"
    }
}
```

The orchestrator inspects `status` and `targetHttpStatus`. It doesn't need to know whether SAP was real or mocked. That's the facade contract doing its job.

---

## Error Handling: Try / Catch / Finally

All three workflows use the same structural pattern:

```
Scope_Try (or Scope_Main)
    └── Business logic
Scope_Catch
    └── runAfter: Scope_Try [FAILED, TIMEDOUT]
    └── Set error variables → Teams alert → (emit failure event)
Response_Final (facades only)
    └── runAfter: Scope_Try [SUCCEEDED], Scope_Catch [SUCCEEDED, SKIPPED]
```

`Response_Final` runs on every code path. The HTTP caller always gets a response. No timeouts. No abandoned requests.

The orchestrator's `Scope_Exception_Handler` emits a `MaterialUpdateFailed` event to the events topic before alerting Teams. Downstream systems know the attempt failed even if nobody is watching the Teams channel.

---

## Testing Without External Systems

This was the design goal from day one. With `APIM_LIVE = false`:

1. POST `{}` to the inbound facade
2. It picks a mock payload, wraps it in an envelope, publishes to Service Bus
3. The orchestrator picks it up within 60 seconds
4. It validates, checks idempotency, routes to `Case_MaterialUpdated`
5. It transforms and POSTs to the outbound facade
6. The outbound facade returns a mock SAP response
7. The orchestrator emits a success event and sends a Teams card
8. Three Teams cards appear in sequence: **EnvelopePublished → MessageReceived → SAP Success**

The entire chain runs. All three workflows fire. All observability works. No TraceOne. No SAP. No APIM.

I built a bash script that fires N requests at the inbound facade with realistic material payloads (round-robin through 20 different materials), parses each response, writes a CSV, and tells you how many Teams cards to expect. It's not sophisticated. It doesn't need to be. The architecture is doing the work.

---

## What Broke During Testing

Everything breaks. Here's what I hit and fixed:

**Missing `MockPayloads` parameter.** The workflow referenced `parameters('MockPayloads')` but it wasn't in `parameters.json`. Logic Apps gave: *"The workflow parameter 'MockPayloads' is not found."* Fix: add the parameter to the app-level `parameters.json` file as a JSON string containing an array of mock material objects.

**Orchestrator sending flat JSON to the outbound facade.** The `Transform_To_SAP_JSON` compose action was producing a flat object instead of the `facadeRequest` + `payload` envelope. The outbound facade rejected it with `FACADE_VALIDATION_FAILED`. Fix: restructure the Compose inputs to match the facade's expected contract. Obvious in hindsight. Every contract mismatch is obvious in hindsight.

**`date +%s%N` not supported.** The load-testing bash script used nanosecond timestamps for duration calculation. Pop!_OS didn't support `%N`. Combined with `set -e`, the script silently exited after the first request. Fix: use `date +%s` with second-precision math, remove `set -e`.

**Azure portal test panel timeout.** The "Run with payload" panel has a short timeout. Workflows that take more than a few seconds to complete (Service Bus send + Teams webhook) will show "Failed to start" even though the run succeeded. Fix: use curl or Postman with `--max-time 120`. Always check run history.

None of these were architecture problems. They were integration friction. The architecture held. The contracts caught the errors. The try/catch handlers returned responses. That's the point.

---

## What I'd Tell Another Architect

1. **Know the patterns by name and source.** When someone pushes back on "why two facades instead of one big workflow," you can point to Gamma (1994), Fowler (2002), and Hohpe and Woolf (2003). These aren't opinions—they're published, battle-tested structural decisions with thirty years of production evidence.

2. **Start with the envelope.** Define the message contract before you build the workflows. Everything downstream depends on it. Get `schemaVersion`, `messageId`, `correlationId`, and `eventType` right on day one.

3. **Build facades first.** Get the inbound producing envelopes and the outbound returning mock responses. Then build the orchestrator in between. This lets you test each boundary independently before wiring them together.

4. **Use a feature toggle from day one.** `APIM_LIVE` cost nothing to implement and saved weeks of waiting for external systems. The entire chain was testable before a single external endpoint was connected.

5. **Dead-letter explicitly.** Don't let bad messages rot on the subscription. Dead-letter with a reason. Alert on it. You'll thank yourself during production support.

6. **One response action.** Every HTTP-triggered workflow should have exactly one `Response_Final` that runs on every code path. No orphaned callers.

7. **Test the contracts, not the systems.** The outbound facade's validation caught the orchestrator's malformed payload before SAP ever would have. That's cheaper debugging by an order of magnitude.

8. **Read the books.** Hohpe and Woolf's *Enterprise Integration Patterns* is from 2003 and it reads like it was written for what we're building today on Logic Apps and Service Bus. Fowler's *PoEAA* explains why your facade should be coarse-grained. Richardson explains why your orchestrator should own the saga. The technology changes. The decomposition principles don't.

---

*This is a living system. The Switch has one case today (`MaterialUpdated`). It'll have more. The facades will connect to real endpoints. The idempotency table will fill up and need a retention policy. But the bones are right, and the patterns will hold.*

*Start simple, test the chain, and evolve based on what actually breaks.*