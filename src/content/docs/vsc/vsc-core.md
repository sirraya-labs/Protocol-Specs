

---
title: Verifiable Supply Chain (VSC) — Core Specification

---

## Abstract

This document defines the **VSC Core Specification** — the normative architecture for representing supply chain events as cryptographically verifiable credentials. It defines the SEAL data structure, the VSC State Machine, the Event Matrix envelope, and the +Dn Extension Mechanism for open vocabulary extensibility.

The specification establishes the complete VSC verification infrastructure: immutable event attestation through the SEAL structure, chain-of-custody linking with support for fork and merge topology, cryptographic proof binding via Decentralized Identifiers, selective disclosure through a normative field registry, a correction protocol that preserves audit integrity, and a credential presentation protocol for request-response exchange between verifiers and holders.

Two inaugural profiles are defined: **Pharmaceutical Finished Goods**, constraining VSC for DSCSA and FMD compliance, and **Food Safety**, constraining VSC for FSMA 204 and Codex Alimentarius traceability. These profiles demonstrate how the core architecture extends to specific regulatory domains through vocabulary binding without architectural modification.

This specification is the concrete realization of the requirements established in VSC-REQUIREMENTS. Where the requirements document defines *what* the system must do, this specification defines *how* it does it. All normative statements in this specification derive from requirements in VSC-REQUIREMENTS.

## Status of This Document

This document is a **Community Group Draft** produced by the Verifiable Supply Chain Community Group. It has not been endorsed by the W3C membership and is not a W3C Standard. It may be updated, replaced, or made obsolete at any time.

Feedback is welcome. The preferred mechanism is to open a GitHub issue. For general discussion, see the public mailing list.

---

## 1. Introduction

### 1.1 Purpose

The Verifiable Supply Chain (VSC) Core Specification defines the universal architecture for representing any supply chain event as a cryptographically verifiable credential. It provides the normative data structures, state machine, extension mechanisms, and protocol bindings that enable interoperable, tamper-evident supply chain event exchange across organizational and jurisdictional boundaries.

This specification is designed to be **vocabulary-neutral**. The core architecture — the SEAL structure, the VSC State Machine, the Event Matrix, and the +Dn mechanism — does not depend on any specific industry vocabulary, commodity classification system, commercial terms framework, or regulatory code. Domain-specific requirements are expressed through vocabulary extensions that bind to the core architecture without modifying it. This separation ensures that VSC can represent pharmaceutical shipments, food supply chains, electronics logistics, critical mineral movements, and any other supply chain domain within a single, unified verification framework.

### 1.2 Relationship to Requirements

All normative statements in this specification derive from requirements established in VSC-REQUIREMENTS. The complete mapping of specification sections to requirement identifiers is provided in Appendix A. Where this specification and the requirements document appear to conflict, the requirements document prevails.

### 1.3 Document Structure

This specification is organized as follows:

- **2 The SEAL Data Structure** — defines the atomic unit of VSC truth, including all normative fields, the event vector, chain of custody block, extension mechanism, and proof binding.
- **3 The VSC State Machine** — defines the four-quadrant custody lifecycle model, state transitions, invariants, and the mapping between state quadrants and EPCIS dispositions.
- **4 The Event Matrix Envelope** — defines the five-dimensional vector representation of supply chain events, with complete field specifications for each dimension.
- **5 The +Dn Extension Mechanism** — defines the open vocabulary extensibility system, including vocabulary registration requirements and forward compatibility rules.
- **6 Chain of Custody Linking** — defines the chain topology model supporting linear, fork, and merge structures, with rules for sequence numbering and parent-child relationships.
- **7 Securing Mechanisms** — defines cryptographic proof binding, DID-based identity, selective disclosure, and DLT agnosticism requirements.
- **8 Correction Protocol** — defines the immutable error correction mechanism, correction SEAL structure, and verifier behavior for correction chains.
- **9 Credential Presentation Protocol** — defines the request-response protocol for credential exchange, including transport bindings and authorization levels.
- **10 Profile: Pharmaceutical Finished Goods** — defines the pharma-specific vocabulary bindings, mandatory fields, and verification rules.
- **11 Profile: Food Safety** — defines the food-specific vocabulary bindings, CTE and KDE mappings, and recall readiness requirements.

### 1.4 Conformance

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in RFC2119 and RFC8174 when, and only when, they appear in all capitals, as shown here.

This specification defines three conformance classes:

**VSC Core Conformant Issuer**
An implementation that creates SEALs satisfying all **MUST** requirements in Sections 2–8. A Core Conformant Issuer produces SEALs that are structurally valid, correctly signed, and properly linked into custody chains.

**VSC Core Conformant Verifier**
An implementation that verifies SEALs satisfying all **MUST** requirements in Sections 6–7 and 9. A Core Conformant Verifier correctly resolves DIDs, verifies cryptographic proofs, checks credential status, validates chain topology, and processes correction SEALs according to the rules in Section 8.

**VSC Profile Conformant Implementation**
An implementation satisfying Core Conformance plus all **MUST** requirements of a named profile (Sections 10 or 11). Profile conformance is always in addition to core conformance — no implementation can claim profile conformance without also satisfying core conformance.

The complete conformance test matrix is provided in Appendix D. Passing all tests in a category establishes conformance for that class.

---

## 2. The SEAL Data Structure

![Figure 1 — The VSC SEAL Credential](placeholder-diagram-1.svg)

### 2.1 Concept

**SEAL** stands for **S**ecure **E**vent **A**ttestation **L**edger-entry. It is the atomic, immutable unit of truth in the VSC architecture. A SEAL is what gets signed, what gets stored, what gets verified, and what links together to form a custody chain. Every supply chain event — a manufacturing batch release, a shipment departure, a temperature reading, a customs clearance, a patient dispensing — is represented as a SEAL.

A SEAL is a specialization of the W3C Verifiable Credential (VC-DATA-MODEL). It carries all the standard properties of a Verifiable Credential — an issuer, an issuance date, a credential subject, and a cryptographic proof — and adds VSC-specific properties that make it suitable for supply chain event representation: a versioned seal structure, a five-dimensional event vector, a chain of custody block, an extension mechanism for domain vocabularies, and a correction reference for error handling.

The SEAL is **immutable**. Once created and signed, a SEAL **MUST NOT** be modified. This is not a design limitation — it is the fundamental property that makes VSC chains auditable. If an error is discovered in a SEAL, the correction protocol defined in Section 8 **MUST** be used to issue a new SEAL that references and supersedes the erroneous one. The original SEAL remains permanently in the chain as evidence of what was originally asserted.

### 2.2 Complete SEAL Structure

The following example shows the complete structure of a VSC SEAL. Every top-level property is normative and **MUST** be present in every SEAL unless explicitly marked as optional.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3c-cg.github.io/vsc-core/contexts/vsc-v1.jsonld"
  ],
  "type":          ["VerifiableCredential", "VSC-SEAL"],
  "id":            "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "issuer":        "did:web:manufacturer.example.com",
  "issuanceDate":  "2026-05-16T08:30:05Z",

  "sealVersion":   "1.0",
  "sealTimestamp": "2026-05-16T08:30:05Z",

  "eventVector": {
    "what":  { },
    "when":  { },
    "where": { },
    "who":   { },
    "how":   { }
  },

  "extensions": {
    "+Dn": {}
  },

  "chainOfCustody": {
    "chainId":        "urn:uuid:chain-00000000-0000-0000-0000-000000000001",
    "sequenceNumber": 1,
    "parentSeals":    [],
    "childSeals":     [],
    "topology":       "linear"
  },

  "correctionOf": null,

  "credentialSubject": {
    "id": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479"
  },

  "proof": { }
}
```

Each of these properties is specified in detail in the following subsections. Implementers **MUST** ensure that every SEAL they produce conforms to the field requirements defined below.

### 2.3 Normative Fields

#### 2.3.1 `sealVersion`

**MUST** be present as a string. **MUST** be `"1.0"` for all SEALs conforming to this version of the specification. This field enables verifiers to determine which version of the SEAL schema to apply when validating the credential. Future versions of this specification will increment this value, and verifiers **MUST** reject SEALs with unsupported version identifiers.

#### 2.3.2 `sealTimestamp`

**MUST** be present as an ISO 8601 date-time string with timezone offset. Records the moment at which the SEAL was generated by the issuer's system.

The `sealTimestamp` is distinct from `eventVector.when.eventTime`. The seal timestamp records *when the attestation was created*; the event time records *when the supply chain event occurred*. These two timestamps **MAY** differ by seconds, minutes, or in some operational scenarios hours, due to batch processing, connectivity gaps, or human review workflows. Verifiers **MUST NOT** assume that these two timestamps are equal.

> **Note: Timestamp precision**
> The `sealTimestamp` **SHOULD** be recorded at millisecond precision when the issuing system supports it. At minimum, second precision is **REQUIRED**.

#### 2.3.3 `correctionOf`

**MUST** be present. For original SEALs (those that are not correcting a previous error), this field **MUST** be `null`. For correction SEALs issued under the protocol defined in Section 8, this field **MUST** contain the `id` of the erroneous SEAL being corrected.

The presence of a non-null `correctionOf` value is the mechanism by which verifiers identify correction chains. When a verifier encounters a SEAL where `correctionOf` is not `null`, it **MUST** apply the verification rules specified in Section 8.3.

#### 2.3.4 `id`

Each SEAL **MUST** have a globally unique identifier. This identifier is used for chain linking (as the value referenced in `parentSeals` and `childSeals`), for correction referencing (as the value of `correctionOf`), and for general SEAL retrieval and reference.

UUIDs encoded as URNs (e.g., `urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479`) are **RECOMMENDED** as the identifier scheme. Content-addressed identifiers based on cryptographic hashes of the SEAL content are **PERMITTED**. The identifier **MUST** be stable — it **MUST NOT** change after the SEAL is created, even if the SEAL is later superseded by a correction SEAL. The identifier **MUST** be unique across all SEALs in all chains.

#### 2.3.5 `issuer`

**MUST** be present as a Decentralized Identifier (DID) conforming to DID-CORE. The issuer is the Supply Chain Actor that asserts the event and creates the SEAL. The issuer's DID **MUST** be resolvable to a DID Document containing the public key material used to verify the SEAL's cryptographic proof.

#### 2.3.6 `eventVector`

**MUST** be present. Contains the five dimensions of the Event Matrix: `what`, `when`, `where`, `who`, and `how`. Each dimension is specified in detail in Section 4. The `eventVector` is the core payload of the SEAL — it captures everything that is known about the supply chain event being attested.

#### 2.3.7 `extensions`

**MUST** be present. Contains the `+Dn` extension block for domain-specific vocabularies. The `+Dn` mechanism is specified in Section 5. Even if no extensions are used, the `extensions` object **MUST** be present with an empty `+Dn` block.

#### 2.3.8 `chainOfCustody`

**MUST** be present. Contains the chain linking information that connects this SEAL to its predecessors and successors. The chain of custody structure is specified in Section 6.

#### 2.3.9 `proof`

**MUST** be present. Contains the cryptographic proof that binds the SEAL to the issuer's DID. The proof format and requirements are specified in Section 7.

#### 2.3.10 Immutability Rule

Once created and signed, a SEAL **MUST NOT** be modified. Any change to any field — including the event vector, extensions, chain of custody, or metadata — creates a new SEAL. If the change is a correction of an error, the new SEAL **MUST** be issued as a correction SEAL under the protocol in Section 8. If the change represents a new event in the supply chain (e.g., a product moving from one location to another), the new SEAL **MUST** be linked into the custody chain with `parentSeals` referencing the previous SEAL.

This immutability rule is the foundation of VSC auditability. Because SEALs cannot be modified, a verifier can examine any SEAL in a chain and know with cryptographic certainty that the event data it contains is exactly what the issuer asserted at the time of issuance. The correction protocol preserves this property by creating new SEALs rather than modifying existing ones — the original assertion remains visible and verifiable even after it has been superseded.

---

## 3. The VSC State Machine

![Figure 2 — The VSC State Machine covers the complete lifecycle of any product in any supply chain.]()

### 3.1 Concept

The **VSC State Machine** is a four-quadrant model that expresses the complete lifecycle of any product in any supply chain. Every product tracked by VSC exists in exactly one of four custody states at any given moment. The state machine defines what those states are, how products transition between them, and what conditions must be satisfied for each transition to be valid.

The state machine is deliberately abstract. It speaks only the language of custody — origin, transit, destination, and terminal states. It does not mention any domain, vocabulary, industry, or regulatory framework. This abstraction is what enables VSC to represent pharmaceutical shipments, food supply chains, electronics logistics, and critical mineral movements within the same verification architecture. Domain-specific meaning is added through the +Dn extension mechanism, not through modification of the state machine.

### 3.2 The Four Quadrants

#### 3.2.1 Q1: Origin

The state in which a product comes into existence within the custody domain. This is the entry point for every product into the VSC tracking system. The event that creates a product in Q1 may be manufacturing (for finished goods), harvesting (for agricultural products), extraction (for minerals), commissioning (for serialized pharmaceutical units), or any other act that brings the product into existence as a distinct, trackable entity.

**Invariant Q1-I1 (Single Entry Point):**
A product **MUST** enter the state machine through Q1. There is no other entry point. If a product appears in any other quadrant without a recorded Q1 entry event, the chain is incomplete and **MUST** be flagged by verifiers.

#### 3.2.2 Q2: In Transit

The state in which a product has left its origin but has not yet reached its intended destination. This quadrant encompasses active movement (road, rail, sea, air freight), temporary storage (warehousing, consolidation centres, cold storage), transshipment (port transfers, hub-and-spoke logistics), and any intermediate handling between origin and destination.

A product **MAY** cycle through Q2 multiple times via the Q2→Q2 movement transition. Each movement event records a new location, a new timestamp, and potentially new custody holder information. This enables VSC to track complex multi-leg logistics journeys within a single custody chain.

**Invariant Q2-I1 (No Direct Origin-to-Destination):**
A product **MUST NOT** transition directly from Q1 to Q3 without at least one recorded Q2 state. The movement from origin to destination must be attested by at least one SEAL with `disposition` in the Q2 set.

#### 3.2.3 Q3: Destination

The state in which a product has reached its intended recipient and has been accepted. Acceptance may be physical (goods received and scanned at a warehouse dock), regulatory (customs clearance granted, quarantine released), commercial (payment released against delivery confirmation), or any combination thereof.

**Invariant Q3-I1 (Preceded by Transit):**
A product **MUST NOT** be recorded in Q3 without having passed through at least one Q2 state. The `parentSeals` of a Q3 SEAL **MUST** include at least one SEAL with `disposition` in the Q2 set.

**Invariant Q3-I2 (Verification at Transition):**
Verification of product identity, quantity, condition, and regulatory compliance **SHOULD** occur at the Q2→Q3 transition. This verification may be recorded as a separate SEAL or as part of the receiving SEAL's event data.

#### 3.2.4 Q4: Terminal

The state in which a product ceases to exist within the custody domain. Terminal events include dispensing (pharmaceuticals administered to a patient), consumption (food products sold at retail and consumed), destruction (expired, damaged, or recalled goods destroyed), recycling (materials entering a recycling stream), export (goods leaving the tracking jurisdiction), and permanent loss (goods confirmed lost or stolen with no reasonable prospect of recovery).

**Invariant Q4-I1 (Terminal Finality):**
A product **MUST NOT** re-enter the state machine from Q4. Once a product has been recorded as dispensed, consumed, destroyed, or permanently lost, it cannot reappear in Q1, Q2, or Q3. If a product that was thought to be lost is subsequently found, or if a product is returned from a customer for resale, it **MUST** be recommissioned as a new entity in Q1 with a new chain identifier and a new serial identity. This prevents circular chains and ensures that every custody chain has a definitive end.

### 3.3 State Transitions

The following table defines all valid state transitions in the VSC State Machine. Each transition maps to a `how.disposition` value that **MUST** be used when issuing a SEAL that records that transition.

| Transition | Name | Condition | Disposition |
|---|---|---|---|
| Q1 → Q2 | Shipment | Mandatory after commissioning | `in_transit` |
| Q2 → Q3 | Receipt | Product reaches intended destination | `received` |
| Q3 → Q4 | Termination | Product dispensed, consumed, or destroyed | `dispensed` or `destroyed` |
| Q2 → Q2 | Movement | Intermediate transit, storage, or transshipment | `stored` or `transshipped` |
| Q3 → Q2 | Return | Must carry justification in `+Dn` extension | `returned` |
| Q2 → Q2 (fork) | Consignment Split | Consignment physically divided | `in_transit` |
| Q2 → Q2 (merge) | Transformation | Multiple lots combined into one | `transformed` |

The Q3→Q2 return transition is the only transition that reverses the normal flow of custody. It **MUST** be accompanied by a justification recorded in the `+Dn` extension block, explaining why the product was returned (e.g., damaged goods rejection, quality failure, recall, delivery refusal). Verifiers **MAY** flag Q3→Q2 transitions that lack adequate justification.

The fork and merge transitions represent non-linear custody events. These are not separate state transitions but rather modifications to the chain topology within Q2. They are defined in detail in Section 6.

### 3.4 Disposition-to-Quadrant Mapping

The `how.disposition` field in each SEAL's event vector determines which state quadrant the product occupies at the time of the event. Verifiers **MUST** use this mapping to validate that the sequence of dispositions in a custody chain is consistent with the valid state transitions defined above.

| Disposition Value | Quadrant | Description |
|---|---|---|
| `active` | Q1 | Product is active at origin (commissioned, manufactured) |
| `in_transit` | Q2 | Product is in movement between locations |
| `stored` | Q2 | Product is held at an intermediate location |
| `transshipped` | Q2 | Product is being transferred between carriers |
| `received` | Q3 | Product has been received at destination |
| `returned` | Q2 | Product has been returned from destination |
| `dispensed` | Q4 | Product has been dispensed to end user |
| `destroyed` | Q4 | Product has been destroyed |
| `transformed` | Q2 | Product has been transformed (merge event) |

---

## 4. The Event Matrix Envelope

![Figure 3 — The Event Matrix. Five canonical dimensions standardized via GS1, WCO, ISO, and W3C. +Dn extends without modifying the core. Forward-compatible. Vocabulary-neutral.](placeholder-diagram-3.svg)

### 4.1 Concept

The **Event Matrix** is the five-dimensional vector representation of a supply chain event. It is the canonical form through which all events are expressed in VSC, regardless of domain, vocabulary, or regulatory context. Every SEAL carries an event vector that populates these five dimensions.

The five dimensions address the fundamental questions that any supply chain event must answer: **What** product is involved? **When** did the event occur? **Where** did it happen? **Who** asserted it? **How** did it happen — what type of event, at what business step, resulting in what disposition?

Each dimension draws its values from standardized vocabularies. The What dimension uses GS1 identifiers and WCO HS codes. The When dimension uses ISO 8601 timestamps. The Where dimension uses GS1 GLN/SGLN location identifiers and ISO 3166-1 jurisdiction codes. The Who dimension uses W3C Decentralized Identifiers. The How dimension uses GS1 EPCIS event types and CBV business steps and dispositions. This standardization ensures that every value in the matrix is meaningful to its respective domain authority without translation.

### 4.2 Dimension: What

The What dimension identifies the product or products involved in the supply chain event. It answers the question: what is this event about?

| Field | Obligation | Description |
|---|---|---|
| `productIdentifiers` | **MUST** | Array of product identifiers. At least one entry **MUST** be present. Each entry includes a `scheme` (e.g., GTIN, SSCC), a `value`, an optional `serialNumber`, and a `schemeAuthority` (e.g., GS1). |
| `classifications` | **SHOULD** | Array of commodity classifications. At least one HS code **SHOULD** be present for internationally traded goods. Each entry includes a `scheme` (HS), a `code`, a `description`, a `schemeAuthority` (WCO), and an `effectiveDate`. |
| `batchOrLot` | **SHOULD** | Batch or lot identifier. **MUST** be present for pharmaceutical and food products. Enables recall identification and batch-level traceability. |
| `expiryDate` | **MAY** | Product expiry date in ISO 8601 format. **MUST** be present for pharmaceutical and food profiles. |
| `quantity` | **SHOULD** | Numeric quantity of product units involved in this event. |
| `quantityUnit` | **SHOULD** | Unit of measure for the quantity field. **MUST** be present if `quantity` is present. |
| `description` | **MAY** | Human-readable description of the product. |

### 4.3 Dimension: When

The When dimension captures the temporal context of the event. It answers two distinct questions: when did the event occur, and when was it recorded?

| Field | Obligation | Description |
|---|---|---|
| `eventTime` | **MUST** | ISO 8601 date-time string with timezone offset representing when the supply chain event occurred. |
| `timezone` | **MUST** | String identifying the timezone context (e.g., "UTC", "+05:30"). |
| `recordedAt` | **MUST** | ISO 8601 date-time string representing when the event was recorded in the issuing system. |
| `timePrecision` | **MUST** | One of `millisecond`, `second`, or `minute`. Indicates the precision of the event time recording. |

The separation of `eventTime` and `recordedAt` is essential for supply chain auditability. In many operational scenarios — batch processing of shipping manifests, delayed data entry at remote facilities, data synchronization after connectivity restoration — the recording timestamp may differ from the event timestamp by minutes or hours. Verifiers **MUST NOT** treat a discrepancy between these two timestamps as an error unless the difference exceeds the stated `timePrecision` window by more than a reasonable operational margin.

### 4.4 Dimension: Where

The Where dimension captures the physical and jurisdictional location of the event. It distinguishes between the read point (where the event was captured, typically a specific scanner or gate) and the business location (the facility or site where the product was located).

| Field | Obligation | Description |
|---|---|---|
| `readPoint` | **SHOULD** | Object with `type` (typically GLN or SGLN), `value`, and optional `name`. Identifies the specific capture point. |
| `businessLocation` | **SHOULD** | Object with `type`, `value`, and optional `name`. Identifies the business location. |
| `jurisdiction` | **MUST** | ISO 3166-1 alpha-2 country code identifying the legal jurisdiction in which the event occurred. Required for customs and regulatory routing. |
| `geoCoordinates` | **MAY** | Object with `latitude` and `longitude`. Provides precise geographic coordinates. |

### 4.5 Dimension: Who

The Who dimension identifies the actor that asserted the event and the role in which they acted. It provides the cryptographic binding between the event data and the asserting identity.

| Field | Obligation | Description |
|---|---|---|
| `actorDid` | **MUST** | The DID of the asserting actor. **MUST** be the same as the SEAL `issuer`. |
| `actorRole` | **MUST** | String identifying the role in which the actor asserts this event (e.g., "manufacturer", "wholesaler", "logistics_provider", "pharmacy"). |
| `actorLicense` | **SHOULD** | Object containing license information for regulated industries. Includes `type`, `number`, `issuingAuthority`, `validFrom`, `validUntil`, and optional `licenseCredential` reference to a separate VC. |
| `assertionMethod` | **MUST** | The DID URL identifying the specific verification method (key) used to sign this SEAL. |

### 4.6 Dimension: How

The How dimension captures the nature of the event: what type of event occurred, at what business step, resulting in what disposition, and using what vocabulary to define these terms.

| Field | Obligation | Description |
|---|---|---|
| `eventType` | **MUST** | The event type identifier. Core EPCIS-origin values (ObjectEvent, AggregationEvent, etc.) are valid when `eventTypeVocab` is `"urn:epcis:cbv:v2"`. Custom event types **MUST** use a URN-prefixed value. |
| `eventTypeVocab` | **MUST** | URN identifying the vocabulary that defines the meaning of `eventType`. Enables verifiers to determine which validation rules to apply. |
| `businessStep` | **MUST** | String identifying the business process step (e.g., "commissioning", "shipping", "receiving"). May use GS1 CBV values or custom vocabulary values. |
| `disposition` | **MUST** | String identifying the condition or status of the product. **MUST** map to a valid VSC State Machine quadrant as defined in Section 3.4. |
| `action` | **MUST** | One of `ADD`, `OBSERVE`, or `DELETE`. Follows the EPCIS action vocabulary. |

---

## 5. The +Dn Extension Mechanism

### 5.1 Concept

The **+Dn mechanism** is the vocabulary extension system of the VSC architecture. It allows any domain — pharmaceuticals, food safety, electronics, critical minerals, sustainability reporting, trade finance — to define vocabularies that extend the five-dimensional Event Matrix with domain-specific data fields, without modifying the core architecture.

The "+Dn" name reflects the mathematical concept of additional dimensions. Just as a coordinate system can be extended from three dimensions to n-dimensions without invalidating the original axes, the VSC Event Matrix can be extended from five dimensions to five-plus-n dimensions. Each extension occupies a numbered slot (+D1, +D2, +D3, ... +Dn) within the `extensions` block of the SEAL. Each slot can hold one or more vocabulary instances, identified by their unique vocabulary URNs.

### 5.2 Structural Position

All +Dn vocabularies are carried in the `extensions` block of the SEAL, under the reserved `+Dn` key. The `+Dn` key is reserved — no other extension mechanism may use this key, and no other top-level SEAL property may be named `+Dn`.

The `extensions` block **MUST** be present in every SEAL, even if no extensions are used. An empty `+Dn` object signals that the SEAL carries no domain-specific extensions. This ensures that verifiers can always locate the extensions block at a known position in the SEAL structure.

### 5.3 Vocabulary Definition Requirements

A +Dn vocabulary **MUST** be defined by a vocabulary specification that includes all of the following elements:

| Element | Description | Obligation |
|---|---|---|
| Vocabulary URN | Globally unique identifier for the vocabulary | **MUST** |
| Dimension Key | The +Dn slot key used in the SEAL | **MUST** |
| JSON Schema | Machine-readable schema defining the vocabulary structure | **MUST** |
| Semantic Mapping | Documentation mapping vocabulary terms to the core five dimensions | **MUST** |
| Required Fields | List of fields that must be populated for vocabulary conformance | **MUST** |
| Steward DID | DID of the organization maintaining the vocabulary | **MUST** |
| License | License under which the vocabulary schema is published | **MUST** |

### 5.4 Forward Compatibility

Forward compatibility is the essential property that enables VSC to evolve without breaking existing implementations. When a verifier encounters a SEAL containing a +Dn vocabulary it does not recognize, it **MUST** apply the following rules:

1. Process the core five-dimensional event vector without error — the unrecognized extension does not invalidate the core data.
2. Preserve the unknown vocabulary data unchanged in any stored or forwarded copies of the SEAL.
3. **MUST NOT** reject the SEAL solely due to the presence of unrecognized extensions.
4. **MAY** signal a warning indicating that the SEAL contains unverified extension data.

These rules ensure that new vocabularies can be deployed incrementally. A pharmaceutical vocabulary can be adopted by pharma supply chain participants without requiring food supply chain participants to upgrade their verifiers. Each domain evolves at its own pace, on its own infrastructure, without creating breaking changes for others.

### 5.5 Vocabulary Equality

All registered +Dn vocabularies have equal standing in the VSC ecosystem. The VSC Community Group **MUST NOT** designate any vocabulary as preferred, recommended, mandatory, or privileged. No vocabulary is more "official" than any other. Vocabularies compete on adoption and utility — the vocabularies that provide value to supply chain participants will be widely implemented; those that do not will not. This neutrality is a constitutional principle of VSC governance and is further protected by the forkability provisions in Appendix E.

---

## 6. Chain of Custody Linking

![Figure 4 — Chain of Custody: Linear chains for standard custody. Fork for consignment splits. Merge for lot combinations. Correction for immutable error handling.](placeholder-diagram-4.svg)

### 6.1 Concept

Chain of custody is the mathematically verifiable sequence of SEALs that tracks a product or consignment through the supply chain. Each SEAL in the chain is cryptographically linked to its predecessors through the `parentSeals` array, creating a directed acyclic graph that can be traversed forward (from origin to current location) or backward (from any point to origin).

Real supply chains are not always linear. Consignments are split at distribution centres — a single pallet becomes multiple cases sent to different destinations. Lots are combined in manufacturing — multiple input ingredients become a single output product. The VSC chain of custody model supports all of these topologies through a multi-parent, multi-child linking structure.

### 6.2 Chain of Custody Structure

| Field | Obligation | Description |
|---|---|---|
| `chainId` | **MUST** | Globally unique identifier for this custody chain. All SEALs that belong to the same logical chain share this identifier. |
| `sequenceNumber` | **MUST** | Monotonically increasing integer. The initial event in a chain has sequence number 1. Each subsequent event increments by 1. |
| `parentSeals` | **MUST** | Array of SEAL identifiers. Empty for initial events. Contains one entry for linear chains. Contains multiple entries for merge or transformation events. |
| `childSeals` | **MAY** | Array of SEAL identifiers. Often empty at creation time and populated retroactively. Multiple entries indicate a fork event. |
| `topology` | **MUST** | One of `linear`, `fork`, `merge`, or `transform`. |
| `topologyNote` | **SHOULD** | Human-readable justification for non-linear topologies. |

### 6.3 Linear Chains

Each SEAL has exactly one parent (or none for the initial event). `topology` **MUST** be `"linear"`. `parentSeals` contains at most one entry.

### 6.4 Consignment Fork

When a consignment is divided, the split SEAL **MUST** set `topology: "fork"` with all child SEAL identifiers in `childSeals`. Each child **MUST** reference the fork SEAL in `parentSeals`.

### 6.5 Transformation Merge

When lots are combined, the merge SEAL **MUST** set `topology: "merge"` or `"transform"` with all input SEAL identifiers in `parentSeals`.

### 6.6 Multiple Concurrent Chains

A single consignment **MAY** participate in multiple chains simultaneously via distinct `chainId` values — for example, a logistics chain and a financial chain for the same shipment.

---

## 7. Securing Mechanisms

### 7.1 DID-Based Identity

All actors **MUST** be identified by DID-CORE Decentralized Identifiers. Implementations **MUST** support `did:web`. Additional DID methods are **OPTIONAL**.

### 7.2 Proof Formats

VSC **MUST** support VC-DATA-INTEGRITY Linked Data Proofs using `Ed25519Signature2020`. At least one selective disclosure mechanism **MUST** be supported; BBS-2023 is **RECOMMENDED**.

### 7.3 Selective Disclosure

A **selective disclosure presentation** **MUST** always include all "Always Disclosed" fields. "Selectively Disclosable" fields **MAY** be withheld subject to the requester's authorization level. The complete field registry is in Appendix C.

### 7.4 DLT Agnosticism

VSC **MUST NOT** require Distributed Ledger Technology. The `did:web` method operates on standard DNS/TLS/HTTPS infrastructure.

---

## 8. Correction Protocol

![Figure 5 — Correction Protocol: Immutable error handling with cryptographically linked correction SEALs. Original SEALs are never modified — errors are corrected with new attestations that preserve the complete audit trail.](placeholder-diagram-5.svg)

### 8.1 Concept

Once created, a SEAL **MUST NOT** be modified. When an error is discovered, a **correction SEAL** is issued with `correctionOf` set to the erroneous SEAL's `id`. The erroneous SEAL remains permanently in the chain; the correction SEAL adds a new, corrected attestation that supersedes it.

### 8.2 Correction SEAL Structure

A correction SEAL has the same structure as an original SEAL with the following distinguishing characteristics:

| Field | Value in Correction SEAL |
|---|---|
| `correctionOf` | The `id` of the erroneous SEAL being corrected |
| `eventVector` | The corrected event data |
| `chainOfCustody.parentSeals` | The erroneous SEAL's `id` — the correction SEAL links to the erroneous SEAL as its parent in the correction chain |
| `chainOfCustody.chainId` | A new chain identifier — correction chains are distinct from custody chains |
| `chainOfCustody.topology` | `"correction"` |
| `+Dn` extension | **MUST** include a `correctionReason` field explaining what was corrected and why |

### 8.3 Verifier Behavior for Correction Chains

When a verifier encounters a SEAL where `correctionOf` is not null:

1. The verifier **MUST** verify the cryptographic proof of the correction SEAL.
2. The verifier **MUST** verify that the issuer of the correction SEAL is the same as the issuer of the erroneous SEAL, or is an authorized delegate with documented authority to correct on the original issuer's behalf.
3. The verifier **MUST** verify that the correction SEAL's `chainOfCustody.parentSeals` includes the erroneous SEAL's `id`.
4. The verifier **MUST** retain both the erroneous SEAL and the correction SEAL in its records — the original is not discarded.
5. For downstream processing, the verifier **MUST** use the corrected event data from the correction SEAL, not the data from the erroneous SEAL.
6. The verifier **MUST** flag the original SEAL as superseded in any audit reports, with a reference to the correction SEAL.

Multiple corrections **MAY** be chained. If a correction SEAL itself contains an error, a new correction SEAL may be issued with `correctionOf` pointing to the previous correction SEAL. Verifiers **MUST** follow the chain of corrections to its terminus and use the most recent correction SEAL as the source of truth.

### 8.4 Multi-Party Correction

In some scenarios, a SEAL issued by one actor may need to be corrected by a different actor. For example, a logistics provider may discover that a manufacturer's shipment SEAL contains an incorrect quantity. In such cases:

- The discovering actor **MAY** issue a correction SEAL if they have documented delegated authority.
- If no delegation exists, the discovering actor **SHOULD** issue a new SEAL (not a correction) that documents the discrepancy, with the correct data in its own `eventVector` and a reference to the erroneous SEAL in a `+Dn` extension field.
- The erroneous SEAL's issuer **SHOULD** be notified and **MAY** issue their own correction SEAL.

---

## 9. Credential Presentation Protocol

![Figure 6 — Credential Presentation Protocol: Verifier sends Presentation Request with authorization level. Holder responds with selectively disclosed Verifiable Presentations.](placeholder-diagram-6.svg)

### 9.1 Concept

The Credential Presentation Protocol (CPP) defines how verifiers request SEALs from holders and how holders respond with presentations. The protocol is transport-agnostic — it can be carried over HTTPS, DIDComm, or any other secure messaging channel — and defines the message formats, authorization levels, and processing rules that ensure consistent behavior across all VSC implementations.

### 9.2 Presentation Request

A **presentation request** is a message sent by a verifier to a holder requesting one or more SEALs or SEAL presentations. The request **MUST** include:

| Field | Obligation | Description |
|---|---|---|
| `requestId` | **MUST** | Unique identifier for this request, enabling correlation of response to request. |
| `verifierDid` | **MUST** | The DID of the requesting verifier. |
| `holderDid` | **MUST** | The DID of the holder from whom SEALs are requested. |
| `requestedSeals` | **MUST** | Array of criteria identifying which SEALs are requested. Criteria may include chain identifiers, time ranges, product identifiers, or event types. |
| `authorizationLevel` | **MUST** | One of `public`, `partner`, `regulatory`, or `full`. Determines which selectively disclosable fields may be included. |
| `purposeOfUse` | **SHOULD** | Human-readable statement of why the SEALs are being requested. |
| `legalBasis` | **SHOULD** | Legal or regulatory basis for the request (e.g., "DSCSA 582", "FSMA 204", "Customs Inspection"). |
| `responseDeadline` | **MAY** | ISO 8601 timestamp by which a response is requested. |

### 9.3 Presentation Response

A **presentation response** is a message sent by a holder to a verifier in response to a presentation request. The response **MUST** include:

| Field | Obligation | Description |
|---|---|---|
| `responseId` | **MUST** | Unique identifier for this response. |
| `requestId` | **MUST** | The `requestId` from the presentation request being responded to. |
| `presentations` | **MUST** | Array of SEAL presentations. Each presentation is a Verifiable Presentation (VC-DATA-MODEL) containing one or more SEALs, with selective disclosure applied according to the request's `authorizationLevel`. |
| `status` | **MUST** | One of `complete`, `partial`, or `denied`. |
| `statusReason` | **SHOULD** | Human-readable explanation when `status` is `partial` or `denied`. |

### 9.4 Authorization Levels

The authorization level in a presentation request determines which fields from the selective disclosure registry (Appendix C) the holder may include in the presented SEALs. The four levels are:

| Level | Description | Typical Use |
|---|---|---|
| `public` | Only "Always Disclosed" fields are included. No selectively disclosable fields are revealed. | Public product verification, consumer scanning |
| `partner` | Selectively disclosable fields classified as "Partner" in the registry are included. Commercial and operational data is visible. | Supply chain partners, logistics providers |
| `regulatory` | All fields except those classified as "Sensitive-Commercial" are included. Full regulatory data is visible. | FDA inspectors, customs authorities |
| `full` | All fields are included. Holder **SHOULD** verify the legal right of the requester before responding at this level. | Auditors with legal mandate, court orders |

### 9.5 Transport Bindings

The Credential Presentation Protocol is transport-agnostic. Implementations **MUST** support HTTPS as a transport binding. The following additional transport bindings are **OPTIONAL**:

- **DIDComm v2** — for asynchronous, DID-authenticated messaging
- **WebSocket** — for real-time verification scenarios
- **QR Code / Offline** — for physical-to-digital verification (e.g., scanning a product code at a retail point)

---

## 10. Profile: Pharmaceutical Finished Goods

![Figure 7 — Pharmaceutical Finished Goods Profile: Constrains VSC Core for DSCSA and FMD compliance.](placeholder-diagram-7.svg)

### 10.1 Scope

This profile constrains the VSC Core Specification for pharmaceutical finished goods supply chains. It is designed to satisfy the traceability requirements of the U.S. Drug Supply Chain Security Act (DSCSA) and the EU Falsified Medicines Directive (FMD), while remaining compatible with other pharmaceutical regulatory frameworks.

This profile does not modify the core VSC architecture. All requirements in this section are *additional constraints* on the core specification, not replacements. Implementations claiming conformance to this profile **MUST** also satisfy all core conformance requirements.

### 10.2 Pharma Vocabulary Binding

Pharmaceutical implementations **MUST** include the `+D1` vocabulary in the `extensions` block. The `+D1` slot is reserved for pharmaceutical-specific data.

| Field | Obligation | Description |
|---|---|---|
| `+D1.productNDC` | **MUST** | U.S. National Drug Code (NDC) for products in U.S. distribution |
| `+D1.productMAH` | **MUST** | Marketing Authorization Holder identifier (EMA or national competent authority) |
| `+D1.manufacturingSite` | **MUST** | GMP certificate reference for the manufacturing site |
| `+D1.serializationFormat` | **MUST** | One of `GS1_Datamatrix`, `GS1_128`, or `custom` |
| `+D1.transactionStatement` | **MUST** | DSCSA transaction statement data (TI, TH, TS) |
| `+D1.temperatureRange` | **SHOULD** | Object with `minCelsius` and `maxCelsius` for cold chain products |
| `+D1.excursionDetected` | **MAY** | Boolean indicating whether a temperature excursion was detected |
| `+D1.quarantineStatus` | **MAY** | One of `none`, `quarantined`, `released`, `rejected` |

### 10.3 Mandatory Core Fields

In addition to all core mandatory fields, pharmaceutical SEALs **MUST** populate the following core fields:

- `eventVector.what.productIdentifiers` — at minimum, GTIN with serial number (SGTIN)
- `eventVector.what.batchOrLot`
- `eventVector.what.expiryDate`
- `eventVector.who.actorLicense`

### 10.4 Verification Rules

Pharma profile verifiers **MUST** perform all core verifications plus the following pharma-specific checks:

1. Verify that the product identifier includes a valid GTIN and serial number.
2. Verify that the batch/lot number is present and matches the product master data.
3. Verify that the expiry date has not passed (unless the event is a Q4 termination event acknowledging expiry).
4. Verify that the actor's license is valid at the time of the event (check `validFrom` and `validUntil` against `eventTime`).
5. Verify that the transaction statement (TI/TH/TS) is present and correctly structured for DSCSA compliance.
6. If `+D1.quarantineStatus` is `quarantined`, flag the product as not eligible for dispensing.

---

## 11. Profile: Food Safety

### 11.1 Scope

This profile constrains the VSC Core Specification for food supply chains. It is designed to satisfy the traceability requirements of the FDA Food Safety Modernization Act Section 204 (FSMA-204) and the Codex Alimentarius principles for food traceability, while remaining compatible with other food safety regulatory frameworks including EU Regulation 178/2002.

### 11.2 Food Safety Vocabulary Binding

Food safety implementations **MUST** include the `+D2` vocabulary in the `extensions` block. The `+D2` slot is reserved for food-specific data.

| Field | Obligation | Description |
|---|---|---|
| `+D2.cteList` | **MUST** | Array of Critical Tracking Events for this product category |
| `+D2.kdeList` | **MUST** | Array of Key Data Elements associated with each CTE |
| `+D2.foodCategory` | **MUST** | Codex Alimentarius food category code |
| `+D2.harvestDate` | **SHOULD** | ISO 8601 date of harvest (for produce, seafood, etc.) |
| `+D2.productionDate` | **SHOULD** | ISO 8601 date of production or processing |
| `+D2.useByDate` | **MUST** | ISO 8601 date for use-by or best-before |
| `+D2.temperatureHistory` | **SHOULD** | Array of temperature readings with timestamps for cold chain products |
| `+D2.allergens` | **MUST** | Array of allergen codes as defined by Codex Alimentarius |
| `+D2.certifications` | **MAY** | Array of food safety certifications (e.g., organic, fair trade, halal, kosher) |

### 11.3 CTE and KDE Mapping

The FDA FSMA 204 rule defines Critical Tracking Events (CTEs) and Key Data Elements (KDEs) for each point in the food supply chain. This profile maps CTEs to VSC event types and KDEs to event vector fields and +D2 vocabulary fields.

| CTE | VSC Event Type | KDE Mapping |
|---|---|---|
| Harvesting | ObjectEvent with `action: ADD` | `what.productIdentifiers`, `+D2.harvestDate`, `where.businessLocation` |
| Cooling | ObjectEvent with `action: OBSERVE` | `+D2.temperatureHistory`, `when.eventTime` |
| Packing (Initial) | AggregationEvent with `action: ADD` | `what.productIdentifiers`, `+D2.useByDate`, `+D2.allergens` |
| Shipping | ObjectEvent with `disposition: in_transit` | `when.eventTime`, `where.businessLocation`, `who.actorDid` |
| Receiving | ObjectEvent with `disposition: received` | `when.eventTime`, `where.businessLocation`, `who.actorDid` |
| Transforming | TransformationEvent | `+D2.productionDate`, `what.productIdentifiers` (new product), `chainOfCustody.parentSeals` (input products) |

### 11.4 Recall Readiness

Food safety profile implementations **MUST** support the following recall-related capabilities:

- **One-up, one-back traceability:** For any SEAL in the chain, verifiers **MUST** be able to identify the immediate previous SEAL (one back) and the immediate next SEAL (one up) within 24 hours of a recall notification.
- **Full chain reconstruction:** Verifiers **MUST** be able to traverse the entire custody chain from origin to current location within 72 hours of a recall notification.
- **Batch isolation:** When a batch/lot is identified for recall, verifiers **MUST** be able to identify all SEALs containing that batch/lot identifier within 4 hours.

---

## Appendix A: Requirements Mapping

This appendix provides the complete mapping from requirements established in VSC-REQUIREMENTS to the normative sections of this specification that satisfy each requirement.

| Requirement ID | Requirement | Specification Section |
|---|---|---|
| REQ-SEAL-001 | Immutable Event Attestation | Section 2 |
| REQ-SEAL-002 | Normative Field Structure | Section 2.3 |
| REQ-SEAL-003 | Correction Protocol | Section 8 |
| REQ-SM-001 | State Machine Model | Section 3 |
| REQ-SM-002 | Disposition Mapping | Section 3.4 |
| REQ-EM-001 | Five-Dimensional Event Matrix | Section 4 |
| REQ-EM-002 | Standardized Vocabularies | Section 4 |
| REQ-EXT-001 | Vocabulary Extension System | Section 5 |
| REQ-EXT-002 | Forward Compatibility | Section 5.4 |
| REQ-EXT-003 | Vocabulary Neutrality | Section 5.5 |
| REQ-CHAIN-001 | Chain of Custody Linking | Section 6 |
| REQ-CHAIN-002 | Fork and Merge Topology | Sections 6.3, 6.4 |
| REQ-SEC-001 | DID-Based Identity | Section 7.1 |
| REQ-SEC-002 | Cryptographic Proof Binding | Section 7.2 |
| REQ-SEC-003 | Selective Disclosure | Section 7.3 |
| REQ-CPP-001 | Credential Presentation Protocol | Section 9 |
| REQ-CPP-002 | Authorization Levels | Section 9.3 |
| REQ-PHARMA-001 | DSCSA Compliance | Section 10 |
| REQ-PHARMA-002 | FMD Compliance | Section 10 |
| REQ-FOOD-001 | FSMA 204 Compliance | Section 11 |
| REQ-FOOD-002 | Recall Readiness | Section 11.4 |

---

## Appendix B: Complete SEAL Example

The following is a complete, valid VSC SEAL for a pharmaceutical product shipment. It demonstrates all normative fields populated with realistic data.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3c-cg.github.io/vsc-core/contexts/vsc-v1.jsonld"
  ],
  "type": ["VerifiableCredential", "VSC-SEAL"],
  "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "issuer": "did:web:pharma-manufacturer.example.com",
  "issuanceDate": "2026-05-16T08:30:05Z",

  "sealVersion": "1.0",
  "sealTimestamp": "2026-05-16T08:30:05.123Z",

  "eventVector": {
    "what": {
      "productIdentifiers": [
        {
          "scheme": "GTIN",
          "value": "00312345678904",
          "serialNumber": "ABC123XYZ789",
          "schemeAuthority": "GS1"
        }
      ],
      "classifications": [
        {
          "scheme": "HS",
          "code": "3004.90",
          "description": "Medicaments consisting of mixed or unmixed products",
          "schemeAuthority": "WCO",
          "effectiveDate": "2022-01-01"
        }
      ],
      "batchOrLot": "BATCH-2026-05-001",
      "expiryDate": "2028-05-15",
      "quantity": 500,
      "quantityUnit": "units",
      "description": "ExampleRx 10mg tablets, 30-count bottle"
    },
    "when": {
      "eventTime": "2026-05-16T08:30:00Z",
      "timezone": "UTC",
      "recordedAt": "2026-05-16T08:30:05Z",
      "timePrecision": "second"
    },
    "where": {
      "readPoint": {
        "type": "SGLN",
        "value": "urn:epc:id:sgln:0614141.00001.0",
        "name": "Shipping Dock Scanner 3"
      },
      "businessLocation": {
        "type": "GLN",
        "value": "0614141000012",
        "name": "PharmaCorp Manufacturing Facility — Mumbai"
      },
      "jurisdiction": "IN",
      "geoCoordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    },
    "who": {
      "actorDid": "did:web:pharma-manufacturer.example.com",
      "actorRole": "manufacturer",
      "actorLicense": {
        "type": "manufacturing_license",
        "number": "MFG-2026-IND-0042",
        "issuingAuthority": "Central Drugs Standard Control Organization",
        "validFrom": "2026-01-01",
        "validUntil": "2030-12-31",
        "licenseCredential": "urn:uuid:license-credential-123"
      },
      "assertionMethod": "did:web:pharma-manufacturer.example.com#key-1"
    },
    "how": {
      "eventType": "ObjectEvent",
      "eventTypeVocab": "urn:epcis:cbv:v2",
      "businessStep": "shipping",
      "disposition": "in_transit",
      "action": "OBSERVE"
    }
  },

  "extensions": {
    "+Dn": {
      "+D1": {
        "vocabularyUrn": "urn:vsc:vocab:pharma:v1",
        "productNDC": "12345-6789-01",
        "productMAH": "EU/1/26/123/001",
        "manufacturingSite": "GMP-CERT-IND-MUM-2026",
        "serializationFormat": "GS1_Datamatrix",
        "transactionStatement": {
          "TI": "urn:uuid:ti-document-2026-001",
          "TH": "did:web:pharma-manufacturer.example.com",
          "TS": "2026-05-16T08:30:00Z"
        },
        "temperatureRange": {
          "minCelsius": 15,
          "maxCelsius": 25
        },
        "excursionDetected": false,
        "quarantineStatus": "none"
      }
    }
  },

  "chainOfCustody": {
    "chainId": "urn:uuid:chain-pharma-2026-001",
    "sequenceNumber": 2,
    "parentSeals": ["urn:uuid:commissioning-seal-2026-001"],
    "childSeals": [],
    "topology": "linear"
  },

  "correctionOf": null,

  "credentialSubject": {
    "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },

  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-05-16T08:30:05Z",
    "verificationMethod": "did:web:pharma-manufacturer.example.com#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5LbBqYhG..."
  }
}
```

---

## Appendix C: Selective Disclosure Field Registry

This registry classifies every field in the VSC SEAL structure for selective disclosure purposes. Fields classified as "Always Disclosed" **MUST** be included in every presentation. Fields classified as "Selectively Disclosable" **MAY** be withheld based on the requester's authorization level.

| Field | Classification | Authorization Level Required |
|---|---|---|
| `sealVersion` | Always Disclosed | public |
| `sealTimestamp` | Always Disclosed | public |
| `id` | Always Disclosed | public |
| `issuer` | Always Disclosed | public |
| `eventVector.what.productIdentifiers` | Always Disclosed | public |
| `eventVector.what.classifications` | Selectively Disclosable | partner |
| `eventVector.what.batchOrLot` | Selectively Disclosable | partner |
| `eventVector.what.expiryDate` | Selectively Disclosable | partner |
| `eventVector.what.quantity` | Selectively Disclosable | partner |
| `eventVector.what.description` | Selectively Disclosable | partner |
| `eventVector.when.eventTime` | Always Disclosed | public |
| `eventVector.when.timezone` | Always Disclosed | public |
| `eventVector.when.recordedAt` | Selectively Disclosable | regulatory |
| `eventVector.where.jurisdiction` | Always Disclosed | public |
| `eventVector.where.readPoint` | Selectively Disclosable | partner |
| `eventVector.where.businessLocation` | Selectively Disclosable | partner |
| `eventVector.where.geoCoordinates` | Selectively Disclosable | regulatory |
| `eventVector.who.actorDid` | Always Disclosed | public |
| `eventVector.who.actorRole` | Always Disclosed | public |
| `eventVector.who.actorLicense` | Selectively Disclosable | regulatory |
| `eventVector.how.eventType` | Always Disclosed | public |
| `eventVector.how.disposition` | Always Disclosed | public |
| `eventVector.how.businessStep` | Selectively Disclosable | partner |
| `extensions.+Dn.*` | Selectively Disclosable | partner (field-specific overrides may apply) |
| `chainOfCustody.chainId` | Always Disclosed | public |
| `chainOfCustody.sequenceNumber` | Selectively Disclosable | partner |
| `chainOfCustody.parentSeals` | Selectively Disclosable | partner |
| `chainOfCustody.childSeals` | Selectively Disclosable | partner |
| `correctionOf` | Always Disclosed | public |