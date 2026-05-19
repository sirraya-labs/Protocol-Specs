
---
title: "DID Key Recovery Threat Model & Security Specification (DID-TM)"
description: "A Formal Threat Taxonomy and Security Framework for DID Key Recovery"
---

**Editor:** Amir Hameed Mir · 
**Organization:** Sirraya Labs · 
**Version:** 1.0.0  
**Repository:** [github.com/sirraya-labs/did-tm](https://github.com/sirraya-labs/did-tm)

---

## Abstract

This specification defines a comprehensive, literature-backed threat model and security framework designed to **complement and extend** existing W3C threat modeling efforts for Decentralized Identifiers (DIDs), Verifiable Credentials (VCs), and Self-Sovereign Identity (SSI) infrastructure. It serves as the **formal security and privacy companion** to the DID Key Recovery Extension (DID-KR), providing the rigorous threat taxonomy, attack catalog, and normative countermeasures that underpin the security considerations of decentralized key recovery mechanisms.

This specification introduces **STRIDE-DID**—an adaptation of the classical STRIDE taxonomy purpose-built for decentralized architectures—and proposes an eighth threat class, **K (Key Lifecycle Failure)**, which has no equivalent in any existing threat modeling framework and represents the primary novel contribution of this specification. The **K-Class** was developed specifically to formalize the security and privacy risks inherent in the three recovery types defined in DID-KR: Type A (Social Recovery), Type B (Time-Locked Inheritance), and Type C (MPC-Mediated Recovery).

The specification provides:

- A formal taxonomy of 7 threat classes (STRIDE-DID + K-Class).
- A structured attack catalog of over 50 named attacks with unique identifiers (`DID-TM-ATK-NNN`), attack trees, CVSS-DID scores, and peer-reviewed literature citations.
- Cryptographic threat analysis covering Verifiable Secret Sharing (VSS), Zero-Knowledge Proofs (ZKP), Verifiable Delay Functions (VDF), and threshold signature schemes (fROST).
- **Normative security and privacy requirements (MUST/SHOULD/MAY) with threat-to-control traceability—directly mapping to and extending the security and privacy sections of DID-KR.**
- Compliance alignment with NIST SP 800-63, ISO 27001, eIDAS 2.0, and SOC 2.
- A machine-readable `JSON-LD` context for embedding threat metadata in DID Documents.

---

## Status of This Document

This is the Editors Draft of the DID Key Recovery Threat Model & Security Specification (DID-TM), prepared by Amir Hameed Mir of Sirraya Labs. This document is a companion to the DID Key Recovery Extension (DID-KR v1.0.0) and extends the W3C Decentralized Identifier specification's §10 (Security Considerations) and §11 (Privacy Considerations) into a standalone, normative framework.

> **Editors Draft:** This document is a work in progress and has not been formally reviewed. Implementers SHOULD treat all normative requirements as subject to change until a stable release is published. Feedback is welcomed via the GitHub issue tracker.

---

## 1. Introduction

Decentralized identity systems invert the classical security model. In centralized systems, a trusted third party — an identity provider, a certificate authority, a directory service — anchors trust, bears security obligations, and provides out-of-band recovery paths. Security practitioners can reason about such systems using well-established frameworks: STRIDE models spoofing and tampering against known service boundaries; LINDDUN maps privacy threats against a data controller; PASTA derives attack scenarios from a defined application architecture.

Decentralized identifier systems eliminate the trusted third party by design. The DID controller is simultaneously the subject, the authority, and the recovery path. Verifiable Credentials travel directly between issuers and holders without a central directory. Key recovery, if it exists at all, is a cryptographic construction — not an operational procedure. This architectural shift renders classical threat frameworks structurally incomplete.

The most visible symptom of this incompleteness is the **Key Lifecycle Gap**: no existing framework — not STRIDE, not LINDDUN, not PASTA, not MITRE ATT&CK — contains a threat class for failures arising from the cryptographic key management lifecycle in a system where the key *is* the identity. Guardian collusion in a secret-sharing scheme, share drift across MPC epoch boundaries, VDF difficulty miscalibration, and post-quantum algorithm migration all represent threats with no natural home in any existing taxonomy. This specification creates that home.

### 1.1 Why a New Taxonomy

The argument for a purpose-built taxonomy rests on three observations:

1. **Trust model mismatch:** STRIDE's threat categories implicitly assume boundaries between trusted and untrusted zones, mediated by a server the defender controls. In DID systems, the resolver is not controlled by the subject. The ledger is not controlled by any party. The guardian is a social relationship, not an administrative role. Threats must be modeled across a fundamentally different trust topology.

2. **Cryptographic primitives as first-class attack surfaces:** Classical threat models treat cryptography as a solved sub-problem — "encrypt the channel," "sign the message." DID systems expose cryptographic constructions (VSS polynomials, Schnorr proofs, VDFs, fROST ceremonies) as protocol-level surfaces that can be attacked at the algebraic, implementation, and operational layers simultaneously.

3. **Privacy as a structural property:** LINDDUN treats privacy threats as threats against a data controller's handling of personal data. In SSI systems, privacy is a structural property of the protocol — selective disclosure, unlinkability, and holder binding are baked into the cryptographic design. Threats to privacy are therefore threats to cryptographic properties, not to data handling policies.

### 1.2 Design Goals

- **Completeness:** Every threat relevant to DID/SSI systems MUST be expressible within the taxonomy.
- **Precision:** Each threat class and attack entry MUST be defined precisely enough to be cited in a security audit, a CVE description, or a standards body comment.
- **Traceability:** Every normative security requirement MUST trace to one or more threat entries, and every threat entry MUST have at least one normative mitigation.
- **Interoperability:** Threat metadata MUST be expressible in JSON-LD for embedding in DID Documents and VC proofs.
- **Literature grounding:** Every threat class and cryptographic analysis MUST cite peer-reviewed literature or recognized standards documents.

### 1.3 Relationship to Existing Standards

This specification extends and complements the following:

- **W3C DID Core §10–11:** This specification operationalizes the security and privacy considerations of DID Core into normative, testable requirements.
- **DID-KR (Sirraya Labs):** The DID Key Recovery Extension defines recovery mechanisms; this specification formally characterizes the threats those mechanisms must address and provides the K-class taxonomy they exemplify.
- **W3C VC Data Model §8:** Verifiable Credential security considerations are subsumed by the VC/VP attack catalog in §14.
- **NIST SP 800-63:** Where applicable, requirements are aligned with NIST's digital identity guidelines for authentication assurance levels.
- **ETSI EN 319 401 / eIDAS 2.0:** EU regulatory alignment is addressed in §27.

---

## 2. Conformance

All authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else is normative.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals.

A conforming **DID Method** with respect to this specification is one that documents its security profile using the taxonomy and attack identifiers defined herein, provides normative responses to all applicable threat classes, and publishes that documentation at a stable URL referenced from its DID Method specification.

A conforming **DID Wallet** is an implementation that satisfies all MUST-level requirements in §24 applicable to the wallet boundary and passes all test assertions in Appendix A marked as applicable to wallets.

---

## 3. Terminology

<dl>
<dt><strong>Threat</strong></dt>
<dd>A potential event or action that could cause harm to a DID system, its controllers, or its participants.</dd>

<dt><strong>Attack</strong></dt>
<dd>A deliberate realization of a threat by an adversary.</dd>

<dt><strong>Threat Class</strong></dt>
<dd>A category of related threats sharing common attack mechanisms, affected assets, and countermeasure families. This specification defines seven threat classes (§4–5).</dd>

<dt><strong>Attack Surface</strong></dt>
<dd>The set of interfaces, protocols, and data stores that an adversary can interact with to mount an attack.</dd>

<dt><strong>Adversary</strong></dt>
<dd>An entity that deliberately attempts to compromise the security or privacy properties of a DID system.</dd>

<dt><strong>Trust Boundary</strong></dt>
<dd>An interface at which control of data or execution transitions from one principal to another, and across which security properties cannot be assumed without verification.</dd>

<dt><strong>DID Controller</strong></dt>
<dd>As defined in DID Core: the entity authorized to make changes to a DID Document.</dd>

<dt><strong>Holder</strong></dt>
<dd>An entity that possesses one or more Verifiable Credentials and can generate Verifiable Presentations.</dd>

<dt><strong>Issuer</strong></dt>
<dd>An entity that creates and signs Verifiable Credentials.</dd>

<dt><strong>Verifier</strong></dt>
<dd>An entity that receives and verifies Verifiable Presentations.</dd>

<dt><strong>Guardian</strong></dt>
<dd>An entity holding a cryptographic share as part of a social recovery scheme.</dd>

<dt><strong>Key Ceremony</strong></dt>
<dd>A formal, witnessed procedure for generating, distributing, or destroying cryptographic key material.</dd>

<dt><strong>Share Drift</strong></dt>
<dd>A state in which the secret shares held by distributed participants become inconsistent across epoch boundaries, potentially preventing successful threshold reconstruction.</dd>

<dt><strong>CVSS-DID</strong></dt>
<dd>An extension of the Common Vulnerability Scoring System (CVSS 3.1) with additional metrics specific to decentralized identity systems, defined in §7.</dd>

<dt><strong>Attack Tree</strong></dt>
<dd>A formal model representing the ways an attacker can reach an attack goal, using AND/OR logical composition of sub-goals (Schneier 1999).</dd>

<dt><strong>Post-Quantum Security</strong></dt>
<dd>Security against adversaries with access to a cryptographically relevant quantum computer capable of running Shor's or Grover's algorithms at scale.</dd>
</dl>

---

## PART I — Threat Taxonomy

### 4. STRIDE-DID Threat Classes

STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) is a threat elicitation framework introduced by Loren Kohnfelder and Praerit Garg at Microsoft in 1999 and formalized in [STRIDE-ORIGINAL]. This specification re-specifies each STRIDE class for the decentralized identity context, replacing implicit assumptions about centralized control with explicit definitions applicable to DID/SSI architectures.

The relationship between original STRIDE and STRIDE-DID is analogous to the relationship between generic network security models and post-perimeter security models: the original categories remain relevant but their definitions, threat agents, and countermeasures must be re-derived from a different threat model.

> **Notation:** Each threat class is assigned a single-letter identifier: S, T, R, I, D, E, K. Every attack in Part III carries a primary class assignment and optionally up to two secondary class assignments.

#### 4.1 S — Spoofing

**Classical definition:** An entity pretends to be another entity.

**DID-specific definition:** An adversary asserts control of a DID or presents credentials as if issued to or by a DID they do not control. In decentralized systems, identity assertions are backed by cryptographic proof; spoofing therefore requires either compromising private key material, forging proofs, or exploiting weaknesses in the verification chain from DID Document to key to signature.

**Affected assets:** DID private keys, DID Documents, VC issuer keys, presentation proofs, resolver responses.

**Primary attack mechanisms:**

- **Key compromise:** Direct theft or derivation of a DID controller's private key material.
- **DID Document substitution:** Replacing the legitimate DID Document with one containing attacker-controlled verification methods, typically via registry-level attacks.
- **Resolver cache poisoning:** Causing a resolver to return a tampered DID Document without the resolver or client detecting the manipulation.
- **Guardian identity fraud:** An adversary impersonates a legitimate guardian to inject malicious share contributions into a social recovery ceremony.
- **Credential subject spoofing:** Presenting a credential issued to a different subject by exploiting holder binding weaknesses or absent binding proofs.

**Distinguishing characteristic in SSI:** Because DID resolution is a network operation, the verification chain must be verified end-to-end. A resolver that returns a valid DID Document does not prove that the document has not been tampered with unless the DID method provides cryptographic anchoring (e.g., via a blockchain ledger). Non-ledger methods (did:web, did:key) have significantly expanded spoofing surfaces.

**Literature:** Fett et al. [FETT-DID-2019] demonstrate resolver-based impersonation attacks. Mühle et al. [MUHLE-2018] analyze credential subject spoofing in SSI architectures.

#### 4.2 T — Tampering

**Classical definition:** Unauthorized modification of data.

**DID-specific definition:** Unauthorized modification of a DID Document, Verifiable Credential, Verifiable Presentation, or any component of the cryptographic infrastructure that supports DID resolution and verification. Tampering attacks in decentralized systems are particularly consequential because the modified data may be cached, replicated, or relied upon by verifiers without the subject's knowledge.

**Affected assets:** DID Documents, VC payloads, proof objects, DID method registries, smart contract state.

**Primary attack mechanisms:**

- **DID Document injection:** Adding unauthorized verification methods or service endpoints to a DID Document, either by compromising the controller's signing key or exploiting write permissions in the DID method registry.
- **Verifiable Credential forgery:** Modifying VC claims or proof metadata such that a verifier accepts a modified credential.
- **Smart contract state manipulation:** For ledger-based DID methods, exploiting reentrancy, integer overflow, or access control vulnerabilities in the DID registry smart contract to write unauthorized state.
- **Commitment manipulation in VSS:** A dishonest dealer publishes VSS commitments that are inconsistent with the distributed shares, causing share verification to pass while reconstruction fails or recovers the wrong secret.
- **Proof modification in transit:** An active network adversary modifies a VC proof or presentation token before it reaches the verifier.

**Literature:** Atzei et al. [ATZEI-2017] catalog smart contract vulnerabilities applicable to DID registries. Camenisch & Lysyanskaya [CAMENISCH-2001] formalize credential forgery in their CL signature scheme analysis.

#### 4.3 R — Repudiation

**Classical definition:** An entity denies having performed an action.

**DID-specific definition:** An adversary — or a legitimate principal acting in bad faith — denies having authorized a DID operation, issued a credential, or participated in an identity-bearing transaction. In decentralized systems, repudiation is complicated by the absence of centrally maintained audit logs, the availability of key rotation as a plausible-deniability mechanism, and the potential for legitimate key compromise claims to mask intentional repudiation.

**Primary attack mechanisms:**

- **Key rotation as deniability:** A controller rotates their DID signing key and claims all previous operations were performed by an attacker who compromised the old key, denying responsibility for legitimate prior actions.
- **Distributed log manipulation:** In systems relying on distributed ledgers for audit trails, an adversary with sufficient stake or hash power manipulates the record of DID operations.
- **Selective presentation:** A holder selectively presents credentials to verifiers, denying having made certain claims to parties they do not wish to acknowledge having transacted with.
- **Multi-sig deniability:** In threshold signature schemes, any signing participant can claim their partial signature was produced under coercion or key compromise, making accountability for the aggregate signature ambiguous.

#### 4.4 I — Information Disclosure

**Classical definition:** Exposure of information to unauthorized parties.

**DID-specific definition:** The unintended exposure of identity-related information — including the association between DIDs and real-world identities, social graph structure, behavioral patterns, or credential contents — to adversaries who should not have access to that information. Information disclosure in SSI systems is particularly insidious because it can arise from the protocol structure itself (correlation via DID reuse) rather than from a breach of access controls.

**Primary attack mechanisms:**

- **DID correlation:** An adversary observes a subject using the same DID across multiple interactions and correlates those interactions to build a behavioral profile, even in the absence of any explicit personal data in the DID Document.
- **Social graph leakage:** Publishing guardian identifiers, delegation chains, or service endpoints in a DID Document reveals relationship graphs that can be used to infer sensitive associations.
- **Credential content inference:** An adversary infers the contents of a selectively disclosed credential from the disclosed subset, the credential schema, or statistical knowledge of the issuer's credential population.
- **Metadata timing analysis:** Correlating the timing of DID resolution requests with transaction events to identify when subjects are active and with whom.
- **ZKP linkability in repeated presentations:** A ZKP that reuses the same nonce, deterministic randomness, or proof component across multiple presentations allows a verifier or passive observer to link those presentations to the same holder.

**Literature:** Pöhls et al. [POHLS-2020] analyze metadata leakage in self-sovereign identity systems. Chaum's foundational work on unlinkability [CHAUM-1985] underpins the privacy requirements in §25.

#### 4.5 D — Denial of Service

**Classical definition:** Making a service unavailable to legitimate users.

**DID-specific definition:** Disrupting the availability of identity services — resolution, verification, issuance, or recovery — in ways that prevent legitimate principals from exercising control of their identities. DoS threats in DID systems extend beyond network-layer flooding to include protocol-layer availability attacks unique to decentralized architectures: a DID can be made effectively unusable without any network disruption if its associated cryptographic state is corrupted or if required participants in a threshold scheme become unavailable.

**Primary attack mechanisms:**

- **Resolver flooding:** Saturating DID resolver infrastructure with resolution requests, degrading availability for legitimate users.
- **DID method deregistration:** For methods relying on centralized or semi-centralized registries, forcing deregistration of a DID through administrative or legal means.
- **Guardian unavailability:** In social recovery schemes, preventing a threshold of guardians from responding to recovery requests, effectively making the DID unrecoverable without an alternative mechanism.
- **VDF computation interference:** Disrupting the computation environment for time-locked recovery, either by interfering with hardware or by providing false timing proofs.
- **Ledger griefing:** Flooding a DID method's underlying ledger with low-fee transactions, causing DID write operations to be delayed or dropped due to fee market dynamics.
- **Revocation registry poisoning:** Flooding a credential status list or revocation registry with invalid entries, degrading verifier performance or causing false revocation positives.

#### 4.6 E — Privilege Escalation

**Classical definition:** Gaining capabilities beyond what is authorized.

**DID-specific definition:** An adversary gains the ability to perform DID operations — key rotation, service endpoint modification, credential issuance delegation — for a DID they do not legitimately control, or gains access to secrets that should require multi-party cooperation to reconstruct. Privilege escalation in DID systems is particularly critical because full key compromise is equivalent to complete identity takeover, with no administrative override available.

**Primary attack mechanisms:**

- **Guardian collusion:** A threshold of guardians in a social recovery scheme collude to reconstruct the controller's secret without the controller's knowledge or consent, gaining full control of the DID.
- **MPC provider compromise:** An adversary compromises a threshold of MPC nodes in a Type C (MPC-Mediated) recovery scheme, enabling unauthorized threshold signatures.
- **Threshold bypass via share pollution:** An adversary who knows fewer than *t* shares injects maliciously crafted shares into a reconstruction ceremony, causing the reconstructed secret to be a value the adversary controls rather than the original secret.
- **Delegation chain exploitation:** A DID controller grants a delegation credential to a sub-controller; the sub-controller exploits ambiguities in the delegation scope to perform operations beyond what was intended.
- **Verification method confusion:** A verifier uses a key listed in the DID Document under one verification relationship (e.g., `keyAgreement`) to verify a signature that should only be valid under a different relationship (e.g., `authentication`).

---

### 5. K — Key Lifecycle Failure (Novel Class)

> **Primary Contribution:** The K threat class is the primary novel contribution of this specification. It has no equivalent in STRIDE, LINDDUN, PASTA, TRIKE, or MITRE ATT&CK. The formalization of this class is the reason this taxonomy is necessary.

**Definition:** A K-class threat arises when the cryptographic key management lifecycle — including key generation, distribution, custody, rotation, recovery, and post-quantum migration — fails in a way that causes permanent loss of identity control, unauthorized transfer of identity control, or structural degradation of the cryptographic guarantees that back the identity system. K-class failures are distinct from all other threat classes because they are often irreversible: unlike a data breach (I-class), a compromised DID from a K-class failure cannot be remediated by changing a password or invalidating a session. The key *is* the identity.

#### 5.1 Why K Cannot Be Subsumed by Existing Classes

A naive analysis might assign key management failures to existing STRIDE classes: key theft to S (Spoofing), share manipulation to T (Tampering), key unavailability to D (DoS). This analysis is insufficient for three reasons:

1. **Lifecycle coherence:** K-class failures span the entire key lifecycle as a unified phenomenon. A share drift failure begins with an operational failure (missed epoch refresh), manifests as a cryptographic inconsistency, and results in either DoS (reconstruction fails) or privilege escalation (wrong secret reconstructed). No single existing class captures this lifecycle arc.

2. **Cryptographic construction as attack surface:** K-class threats attack the *design* of the cryptographic construction, not just its implementation. A VDF calibrated to a reference platform that has been superseded by ASIC hardware is not a DoS attack or a tampering attack — it is a failure of the key lifecycle specification that makes the time-lock property invalid.

3. **Non-custodial irreversibility:** In non-custodial systems, there is no authority with the power to override a key management failure. The irreversibility of K-class failures in fully decentralized systems requires a distinct threat class with its own countermeasure family.

#### 5.2 K-Class Sub-categories

<dl>
<dt><strong>K1 — Key Ceremony Failure</strong></dt>
<dd>Failure of the formal procedure by which key material is generated, backed up, or distributed, resulting in insecure key generation, unwitnessed key ceremonies, or improper key escrow.</dd>

<dt><strong>K2 — Share Lifecycle Failure</strong></dt>
<dd>Failure in the distribution, custody, refreshment, or reconstruction of secret shares in threshold schemes. Includes share drift, share loss, and proactive refresh desynchronization.</dd>

<dt><strong>K3 — Time-Lock Integrity Failure</strong></dt>
<dd>Failure of a VDF or time-lock construction to enforce the intended temporal property. Includes difficulty miscalibration, ASIC advantage exploitation, and false proof acceptance.</dd>

<dt><strong>K4 — Rotation and Revocation Failure</strong></dt>
<dd>Failure of key rotation or revocation to take effect correctly, leaving revoked keys accepted or creating windows of dual validity.</dd>

<dt><strong>K5 — Post-Quantum Migration Failure</strong></dt>
<dd>Failure to migrate cryptographic constructions to quantum-resistant algorithms before a cryptographically relevant quantum computer becomes available, resulting in retroactive compromise of archived identity records.</dd>

<dt><strong>K6 — Inheritance and Recovery Chain Failure</strong></dt>
<dd>Failure of the designated succession path for a DID — including dead-man's switch failures, beneficiary key loss, and inheritance chain breaks — resulting in permanent loss of identity control after the controller's incapacity.</dd>
</dl>

> **Literature Grounding:** The K-class concept is informed by Bonneau et al.'s analysis of password replacement [BONNEAU-2012] (which identifies lifecycle properties as distinct from cryptographic strength), Herzberg et al.'s original proactive secret sharing work [HERZBERG-1995] (which shows that share lifetime is a security parameter distinct from threshold), and Boneh et al.'s VDF formalization [BONEH-2018] (which treats computation time as a cryptographically enforceable property that can be violated by hardware advances).

---

### 6. LINDDUN-DID Privacy Threat Mapping

LINDDUN (Linkability, Identifiability, Non-repudiation, Detectability, Disclosure of information, Unawareness, Non-compliance) is a privacy threat elicitation framework developed by Deng et al. [DENG-2011]. This section maps LINDDUN categories to DID/SSI-specific privacy threats and identifies where DID architecture creates novel privacy threat surfaces not covered by the original framework.

| LINDDUN Class | DID-Specific Manifestation | Novel SSI Surface | STRIDE-DID Cross-reference |
|---------------|---------------------------|-------------------|---------------------------|
| **Linkability** | DID reuse across verifiers; correlated credential presentations; resolver query linkability | Pairwise DID rotation insufficient if resolver queries are logged; ZKP nonce reuse links presentations | I |
| **Identifiability** | Quasi-identifier exposure through partial VC disclosure; DID Document metadata enabling re-identification | Selective disclosure without proof of non-disclosure; k-anonymity failures in small issuer populations | I |
| **Non-repudiation** | Irrevocable credential signatures enabling retroactive audit; persistent DID operation ledger entries | Blockchain immutability as privacy threat: DID operations cannot be deleted after publication | R |
| **Detectability** | DID resolution frequency revealing activity patterns; presence of recovery methods revealing security posture | Recovery method type in DID Document reveals guardian count and type — a high-value metadata target | I |
| **Disclosure** | Credential content inference from disclosed attributes; proof metadata revealing undisclosed claims | BBS+ signature reveal-all-or-nothing failures; range proof boundaries inferring sensitive values | I |
| **Unawareness** | Holder unaware of verifier's retention policy; issuer unaware of downstream VC propagation | Verifier ecosystems accumulating VC presentation logs without holder consent or awareness | I, T |
| **Non-compliance** | DID Document containing personal data subject to GDPR right-to-erasure — technically irreconcilable with blockchain immutability | Legal obligation to delete vs. cryptographic immutability: a structural tension unique to decentralized identity on public ledgers | K (K4) |

---

### 7. CVSS-DID Scoring Methodology

The Common Vulnerability Scoring System v3.1 [CVSS-31] provides a standardized method for assessing vulnerability severity. This specification extends CVSS 3.1 with four additional metrics specific to decentralized identity systems. CVSS-DID scores are used throughout the attack catalog in Part III.

#### 7.1 CVSS-DID Extension Metrics

| Metric | Abbreviation | Values | Rationale |
|--------|-------------|--------|-----------|
| **Decentralization Factor** | `DF` | High (H) / Medium (M) / Low (L) | Higher decentralization reduces the blast radius of any single node compromise but may increase attack persistence. H = no central authority; L = federated with trust anchors. |
| **Recovery Availability** | `RA` | Available (A) / Degraded (D) / None (N) | Whether a valid recovery path exists for the compromised DID. N = permanent identity loss risk. |
| **Threshold Collusion Required** | `TC` | None (N) / Partial (P) / Full (F) | Whether the attack requires compromise of a threshold of distributed participants. F = full threshold needed; N = single-party attack. |
| **Quantum Advantage** | `QA` | Applicable (A) / Not Applicable (N) | Whether a sufficiently powerful quantum computer would change the exploitability of this vulnerability from theoretical to practical. |

#### 7.2 Severity Classification

| Severity | CVSS-DID Base Score | Description | Example |
|----------|-------------------|-------------|---------|
| **Critical** | 9.0–10.0 | Permanent identity loss or complete impersonation without recovery path | Guardian collusion at threshold; full MPC provider compromise |
| **High** | 7.0–8.9 | Unauthorized DID operations or credential forgery with significant impact | DID Document injection; resolver cache poisoning |
| **Medium** | 4.0–6.9 | Partial information disclosure or degraded availability | Social graph leakage; resolver flooding |
| **Low** | 0.1–3.9 | Limited impact, difficult to exploit, or easily mitigated | Timing side-channel on key derivation; DID method metadata exposure |

---

## PART II — Attack Surface Model

### 8. The DID Stack

This specification models the DID ecosystem as a four-layer stack. Each layer has a distinct attack surface, set of trust assumptions, and applicable countermeasure family. Attacks typically exploit weaknesses at a single layer but may propagate across layer boundaries.

**Figure 1 — The DID Four-Layer Attack Surface Model**

```
Layer 4 — Application:    Wallet UI · Agent/Edge · Native App
         ↓ trust boundary: VC proof verification
Layer 3 — Protocol:       VC/VP Exchange · DIDComm · OpenID4VC
         ↓ trust boundary: DID resolution
Layer 2 — Resolution:     Universal Resolver · DID Method Driver · Cache/CDN
         ↓ trust boundary: method-specific read
Layer 1 — Registry:       Blockchain/Ledger · DNS/Web Host · IPFS/DHT
```

#### 8.1 Layer 1 — Registry and Method Layer

The registry layer encompasses the substrate on which DID Documents are anchored. This includes public blockchain ledgers (Ethereum, Bitcoin, Hyperledger Indy), web servers (for did:web), distributed hash tables (for IPFS-backed methods), and DNS infrastructure. The security properties of this layer are entirely determined by the DID method and are largely outside the control of the DID subject.

**Primary threats:** Smart contract vulnerabilities (T-class), ledger consensus manipulation (T-class), DNS hijacking for did:web (S-class), IPFS content addressing collisions (T-class).

#### 8.2 Layer 2 — Resolution and Transport Layer

The resolution layer encompasses DID resolvers — universal or method-specific — that transform DID strings into DID Documents. Resolvers are trust boundaries: a resolver that returns a manipulated DID Document invalidates all security properties that depend on the resolved document, regardless of the strength of the underlying registry.

**Primary threats:** Resolver cache poisoning (S-class), DNS-over-HTTPS MITM (T-class), resolution result tampering (T-class), resolver DoS (D-class).

#### 8.3 Layer 3 — Protocol Layer

The protocol layer encompasses the exchange protocols that use DIDs and Verifiable Credentials: DIDComm messaging, OpenID for Verifiable Credentials (OID4VC), the Verifiable Presentation Request protocol, and credential status protocols. This layer's primary threats concern the integrity and privacy of credential exchanges.

**Primary threats:** Credential forgery (T-class), holder binding bypass (S-class, E-class), presentation replay (S-class), credential correlation (I-class).

#### 8.4 Layer 4 — Application and Wallet Layer

The wallet layer is the most heterogeneous and, in practice, the highest-risk layer. Wallets hold private key material, manage credential stores, and execute user-facing operations. Hardware security module (HSM) integration and secure enclave usage vary widely across implementations.

**Primary threats:** Private key extraction (K-class, E-class), seed phrase compromise (K-class), wallet malware (K-class, S-class), biometric bypass (S-class, E-class).

---

### 9. Adversary Model

This specification defines four adversary tiers based on capability and resources. Each attack entry in Part III is annotated with the minimum adversary tier required to execute the attack.

| Tier | Name | Capabilities | Examples |
|------|------|-------------|----------|
| **T0** | Script Kiddie | Uses publicly available tools and exploits; no original research capability; network-level adversary only | Phishing for seed phrases; replaying captured VPs; public resolver abuse |
| **T1** | Skilled Attacker | Can develop novel exploits against published protocols; understands cryptographic constructions at a practitioner level; can compromise individual MPC nodes or guardians | Smart contract exploitation; resolver cache poisoning; side-channel on wallet implementations |
| **T2** | Nation-State / Well-Funded | Can perform cryptanalytic attacks on weakened algorithms; can compromise threshold fractions of distributed systems; sustained access to target infrastructure | Coordinated guardian compromise; ledger consensus manipulation; large-scale correlation via resolver log access |
| **T3** | Quantum-Capable | Possesses a cryptographically relevant quantum computer; can break RSA-2048, ECDSA/Ed25519, and Diffie-Hellman in polynomial time using Shor's algorithm | Retroactive compromise of archived DID key material; breaking Ed25519 holder binding; DH key exchange decryption |

#### 9.1 Adversary Goals

Adversaries attacking DID systems pursue goals that differ meaningfully from classical adversaries. The primary goals, in approximate order of prevalence:

1. **Identity takeover** — gaining full control of a target's DID, enabling impersonation and credential issuance
2. **Credential forgery** — creating false credentials without controlling the issuer's DID
3. **Correlation and surveillance** — building behavioral profiles of subjects across verifiers without their knowledge
4. **Identity denial** — preventing a legitimate subject from using or recovering their DID
5. **Recovery subversion** — gaining the ability to trigger or manipulate recovery mechanisms at a time of the adversary's choosing

---

### 10. Identity Lifecycle Threat Map

Every DID passes through a common lifecycle. This section maps the primary threat classes applicable at each lifecycle stage.

**Figure 2 — Identity Lifecycle Threat Map**

```
Creation & Registration → Issuance & Delegation → Presentation & Authentication → Key Rotation & Management → Recovery → Revocation & Deactivation → End of Life
     (S,T,K1)                  (T,R,I)                  (S,I,E)                    (K4,T)              (K2,K3,E)        (K4,K6,D)
```

---
```mdx
## PART III — Attack Catalog

The attack catalog assigns each attack a permanent identifier of the form `DID-TM-ATK-NNN`. Identifiers are stable across versions of this specification; attacks are never renumbered. Deprecated attacks are marked as such but retain their identifier.

Each entry contains: identifier, name, primary and secondary threat class(es), CVSS-DID score and severity, affected DID stack layer, minimum adversary tier, attack description, attack tree (abbreviated), normative mitigation references, and peer-reviewed literature citations.

---

### 11. Registry and Method Layer Attacks (50x)

#### DID-TM-ATK-050 — Smart Contract Registry Reentrancy

| Field | Value |
|-------|-------|
| **Class** | T — Tampering |
| **CVSS-DID** | 9.1 Critical |
| **Vector** | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H · DF:H · RA:N · TC:N · QA:N |
| **Layer** | Layer 1 — Registry (Smart Contract) |
| **Adversary** | T1 — Skilled Attacker |

**Description:** An adversary exploits a reentrancy vulnerability in a DID registry smart contract to write unauthorized DID Document state. By constructing a malicious calling contract that re-enters the registry during an unresolved state transition, the adversary can overwrite verification methods, add unauthorized service endpoints, or transfer controller authority.

**Attack Tree:** Goal: Write unauthorized DID Document state. AND: [Identify reentrancy-vulnerable contract function] AND [Craft re-entrant calldata] AND [Execute before state commit]. OR: Exploit flash loan to front-run state validation.

**Mitigations:** §24.1 REQ-50: DID registry contracts MUST implement Checks-Effects-Interactions pattern. REQ-51: Registry contracts MUST use ReentrancyGuard or equivalent mutex. Formal verification of state transition functions SHOULD be performed.

**Literature:** [ATZEI-2017] Atzei, Bartoletti, Cimoli — "A Survey of Attacks on Ethereum Smart Contracts." *International Conference on Principles of Security and Trust (POST)*, 2017. Real-world precedent: The DAO hack (2016), CVE-2018-10299.

---

#### DID-TM-ATK-051 — did:web DNS Hijacking

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: T) |
| **CVSS-DID** | 8.6 High |
| **Layer** | Layer 1 — Registry (DNS) |
| **Adversary** | T1 — Skilled Attacker |

**Description:** The did:web method resolves DID Documents from HTTPS endpoints at a well-known URL path. An adversary who gains control of the domain's DNS records — via registrar account compromise, BGP hijacking, or DNS cache poisoning — can serve a modified DID Document containing attacker-controlled verification methods. Because the trust root for did:web is DNS, all cryptographic verification downstream is invalidated.

**Attack Tree:** Goal: Serve malicious DID Document for target domain. OR: [Compromise DNS registrar account] OR [BGP route hijack for domain's IP range] OR [DNS cache poisoning at resolver] OR [Compromise web host TLS certificate via ACME].

**Mitigations:** REQ-52: did:web implementations MUST enable DNSSEC and use TLS certificate monitoring (CT logs). REQ-53: DID Documents served over did:web SHOULD include a self-signed proof using the controller's key, enabling detection of unauthorized modification even after DNS compromise.

**Literature:** [BASIN-2018] Basin, Cremers, Meier — "DNSSEC: Security and Availability Challenges." *IEEE Symposium on Security and Privacy (Oakland)*, 2018. [BIRGE-LEE-2018] Birge-Lee et al., "Bamboozling Certificate Authorities with BGP." *USENIX Security Symposium*, 2018.

---

#### DID-TM-ATK-052 — Ledger Consensus Eclipse Attack

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: D) |
| **CVSS-DID** | 8.2 High |
| **Layer** | Layer 1 — Registry (Ledger) |
| **Adversary** | T2 — Well-Funded |

**Description:** An adversary eclipses a DID resolver's view of a blockchain by monopolizing its peer connections, causing the resolver to operate on a stale or adversary-controlled fork. DID operations that appear confirmed to the eclipsed resolver may be rolled back when the eclipse is lifted, or the adversary may present a fabricated ledger state.

**Attack Tree:** Goal: Present stale/forked ledger state. AND: [Establish 8+ connections to target node] AND [Suppress honest peer advertisements] AND [Maintain eclipse for confirmation window].

**Mitigations:** REQ-54: Resolvers MUST connect to multiple independent ledger nodes from distinct operators. REQ-55: Resolvers MUST implement fork detection using checkpoint anchors. Light client proofs (e.g., SPV for Bitcoin-based methods) MUST be verified.

**Literature:** [HEILMAN-2015] Heilman et al., "Eclipse Attacks on Bitcoin's Peer-to-Peer Network." *USENIX Security Symposium*, 2015. Extended analysis in [TRAN-2020] Tran et al., "Ethereum Eclipse Attacks." *IEEE ICBC*, 2020.

---

#### DID-TM-ATK-053 — 51% Attack on DID Registry

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: R) |
| **CVSS-DID** | 9.0 Critical |
| **Layer** | Layer 1 — Registry (PoW/PoS Ledger) |
| **Adversary** | T2 — Well-Funded (majority hash rate or stake) |

**Description:** An adversary controlling >50% of the ledger's mining power or staked tokens can reorganize the blockchain to reverse confirmed DID operations, double-spend DID registrations, or censor specific DIDs by refusing to include their transactions. This undermines the immutability guarantee of ledger-anchored DID methods.

**Attack Tree:** Goal: Reverse or censor DID operations. AND: [Acquire >50% hash rate/stake] AND [Mine private chain longer than canonical] AND [Reorganize to replace target DID operations].

**Mitigations:** REQ-56: DID methods SHOULD require confirmation depths beyond the economic cost of a 51% attack. REQ-57: Resolvers SHOULD monitor chain reorganizations and alert on deep reorgs. REQ-58: For high-assurance DIDs, use multi-ledger anchoring.

**Literature:** [NARAYANAN-2016] Narayanan et al., "Bitcoin and Cryptocurrency Technologies." Princeton University Press, 2016. [BONNEAU-2015] Bonneau et al., "SoK: Research Perspectives and Challenges for Bitcoin and Cryptocurrencies." *IEEE S&P*, 2015.

---

#### DID-TM-ATK-054 — Malicious DID Method Driver

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: E) |
| **CVSS-DID** | 9.4 Critical |
| **Layer** | Layer 1 — Registry (Method Driver) |
| **Adversary** | T1 — Skilled Attacker (supply chain compromise) |

**Description:** A DID method driver (software that translates a DID method string into registry queries) may be compromised or maliciously modified to return tampered DID Documents. This is particularly dangerous for Universal Resolver deployments where drivers execute in a privileged context. Supply chain attacks on method driver repositories can affect all users of that driver.

**Mitigations:** REQ-59: Method drivers MUST be signed by their maintainers and verified by the resolver before execution. REQ-60: Resolvers MUST execute drivers in isolated sandboxes (e.g., WebAssembly, containers). REQ-61: Driver updates MUST be subject to code signing and reproducible builds.

**Literature:** [ZAHARIEV-2020] Zahariev et al., "Universal Resolver Security Analysis." *DIF Security Task Force*, 2020. Supply chain attack analysis in [LADISA-2021] Ladisa et al., "SoK: Software Supply Chain Security." *IEEE S&P*, 2021.

---

#### DID-TM-ATK-055 — IPFS Content Addressing Collision

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: S) |
| **CVSS-DID** | 7.8 High |
| **Layer** | Layer 1 — Registry (IPFS/DHT) |
| **Adversary** | T2 — Well-Funded (birthday attack) |

**Description:** DID methods that anchor documents via IPFS content identifiers (CIDs) rely on hash collision resistance. An adversary who finds a collision between a legitimate DID Document and a malicious document can replace the content at the same CID. With SHA-256, classical collision resistance holds, but quantum Grover's algorithm reduces effective security to 128 bits.

**Mitigations:** REQ-62: IPFS-backed DID methods SHOULD use SHA-512 or SHA-3 for CID generation. REQ-63: Implementations SHOULD use content-addressed storage with proof-of-retrievability. Post-quantum hash functions (SHA-3, BLAKE3) are RECOMMENDED.

**Literature:** [BERNSTEIN-2018] Bernstein, "Post-Quantum Cryptography: Hash-Based Signatures." *NIST PQC Standardization*, 2018. [BENET-2014] Benet, "IPFS - Content Addressed, Versioned, P2P File System." *arXiv:1407.3561*, 2014.

---

#### DID-TM-ATK-056 — DNS Cache Poisoning (did:web)

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing |
| **CVSS-DID** | 8.4 High |
| **Layer** | Layer 1 — Registry (DNS Resolver) |
| **Adversary** | T1 — Skilled Attacker (network position) |

**Description:** An adversary poisons the cache of a recursive DNS resolver used by DID resolution infrastructure, causing the resolver to return attacker-controlled IP addresses for legitimate did:web domains. Unlike direct DNS hijacking (ATK-051), this attack targets the resolver layer and can affect all users of a poisoned resolver.

**Mitigations:** REQ-64: Resolvers MUST use DNSSEC-validating resolvers. REQ-65: did:web clients SHOULD pin expected TLS certificates. REQ-66: Implementations SHOULD use DNS over HTTPS (DoH) or DNS over TLS (DoT) to prevent on-path cache poisoning.

**Literature:** [KAMINSKY-2008] Kaminsky, "Black Ops of DNS." *Black Hat USA*, 2008. [HERBERT-2014] Herbert, "DNS Cache Poisoning Revisited." *USENIX Security*, 2014.

---

#### DID-TM-ATK-057 — Smart Contract Logic Bomb

| Field | Value |
|-------|-------|
| **Class** | D — Denial of Service (secondary: E) |
| **CVSS-DID** | 9.2 Critical |
| **Layer** | Layer 1 — Registry (Smart Contract) |
| **Adversary** | T1 — Skilled Attacker (with deployer privileges) |

**Description:** A DID registry smart contract contains a hidden logic bomb—code that triggers under specific conditions (e.g., a specific block number, a specific caller) to freeze, self-destruct, or maliciously modify DID state. This is particularly concerning for upgradeable proxy contracts where logic bombs can be introduced in seemingly benign upgrades.

**Mitigations:** REQ-67: Registry contracts MUST be immutable after deployment or use time-locked governance for upgrades. REQ-68: Upgradeable contracts MUST use transparent proxies with multi-sig control. REQ-69: Formal verification of contract logic SHOULD be performed.

**Literature:** [PEREZ-2020] Perez et al., "The Dangers of DeFi: Security and Privacy in Decentralized Finance." *IEEE S&P Workshops*, 2020. [WUSTHOLZ-2019] Wüstholz, Christakis, "Harvey: A Greybox Fuzzer for Smart Contracts." *ESEC/FSE*, 2019.

---

### 12. Resolution and Transport Layer Attacks (100x)

#### DID-TM-ATK-100 — Universal Resolver Cache Poisoning

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: T) |
| **CVSS-DID** | 9.3 Critical |
| **Layer** | Layer 2 — Resolution (Resolver Cache) |
| **Adversary** | T1 — Skilled Attacker |

**Description:** Universal Resolver instances cache DID Document responses to reduce resolution latency. An adversary who can inject malicious DID Documents into the resolver cache — via a compromised DID method driver, a MITM attack on the driver-to-registry connection, or a race condition in cache invalidation — causes all subsequent resolution requests to return the poisoned document. This attack can persist for the cache TTL duration.

**Attack Tree:** Goal: Serve adversary-controlled DID Document via Universal Resolver. OR: [Compromise DID method driver process] OR [MITM driver-to-registry channel] OR [Cache timing race: inject between fetch and store] OR [Exploit cache key collision].

**Mitigations:** REQ-100: Resolver instances MUST verify that cached DID Documents are cryptographically anchored to the underlying registry (e.g., Merkle proof). REQ-101: Cache TTLs MUST NOT exceed the DID method's minimum update propagation time. REQ-102: Cache entries MUST be signed by the method driver and verified by the resolver core.

**Literature:** [FETT-2019] Fett, Küsters, Schmitz — "An Extensive Formal Security Analysis of the OpenID Financial-grade API." *IEEE S&P (Oakland)*, 2019. [SCHANZENBACH-2020] Schanzenbach, "A Formal Security Analysis of DID Resolution." *SSI Workshop*, 2020.

---

#### DID-TM-ATK-101 — DID Resolution SSRF

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: I) |
| **CVSS-DID** | 7.9 High |
| **Layer** | Layer 2 — Resolution |
| **Adversary** | T0 — Script Kiddie |

**Description:** A DID resolver that fetches external resources during resolution (e.g., for did:web or linked data proofs) is vulnerable to Server-Side Request Forgery if user-controlled DID strings or DID Document URLs are not validated. An adversary crafts a malicious DID Document containing service endpoint URLs pointing to internal resolver infrastructure or cloud metadata services (169.254.169.254).

**Mitigations:** REQ-103: Resolvers MUST validate all URLs in DID Documents against an allowlist of permitted schemes and MUST block requests to RFC 1918 address ranges and cloud metadata IP ranges. REQ-104: DID Document fetching MUST execute in a sandboxed network context with egress filtering.

**Literature:** [PELIZZARI-2020] Pelizzari et al., "Server-Side Request Forgery: A Systematic Literature Review." *ACM Computing Surveys*, 2020. Real-world precedent: CVE-2021-21315 (Node.js SSRF).

---

#### DID-TM-ATK-102 — Resolver Amplification DoS

| Field | Value |
|-------|-------|
| **Class** | D — Denial of Service |
| **CVSS-DID** | 6.5 Medium |
| **Layer** | Layer 2 — Resolution |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary crafts DIDs that trigger expensive resolution operations — large DID Documents (e.g., 1000+ service endpoints), chained DID references requiring recursive resolution, complex JSON-LD context processing with external fetches — and floods a resolver with requests for these DIDs, consuming disproportionate CPU and memory resources relative to the request cost. Amplification factor can exceed 1000x.

**Mitigations:** REQ-105: Resolvers MUST enforce a maximum DID Document size (RECOMMENDED: 64 KB). REQ-106: JSON-LD context processing MUST be subject to a CPU-time limit per resolution request. REQ-107: Resolvers MUST implement rate limiting per source IP and per DID method. REQ-108: Recursive resolution depth MUST be limited to 3.

**Literature:** [KRAWCZYK-2021] Krawczyk et al., "Resource Exhaustion Attacks on JSON-LD Processors." *SSI Security Workshop*, 2021. CVE-2019-10744 (lodash prototype pollution amplification).

---

#### DID-TM-ATK-103 — Resolution Result Tampering (MITM)

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: S) |
| **CVSS-DID** | 8.8 High |
| **Layer** | Layer 2 — Resolution (Network) |
| **Adversary** | T0-T1 — On-path network adversary |

**Description:** An active man-in-the-middle adversary intercepts and modifies DID resolution responses between the resolver and the client. If the client does not verify that the resolved DID Document is cryptographically bound to the DID via the underlying registry (e.g., by checking ledger proofs), the adversary can substitute any DID Document of their choice.

**Mitigations:** REQ-109: Clients MUST verify that resolved DID Documents are cryptographically anchored to the DID method's registry (e.g., verify Merkle proof, ledger inclusion proof). REQ-110: Resolver-to-client communication MUST use TLS with certificate pinning for production deployments.

**Literature:** [FETT-2019] Fett et al., "An Extensive Formal Security Analysis of the OpenID Financial-grade API." *IEEE S&P*, 2019. Applicable to DID resolution in [SABADIN-2021] Sabadini, "DID Resolution Security Considerations." *DIF*, 2021.

---

#### DID-TM-ATK-104 — DID Method Driver Sandbox Escape

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: I) |
| **CVSS-DID** | 9.6 Critical |
| **Layer** | Layer 2 — Resolution (Driver Execution) |
| **Adversary** | T1 — Skilled Attacker |

**Description:** A malicious or compromised DID method driver exploits a vulnerability in the resolver's driver isolation mechanism to escape the sandbox and execute arbitrary code on the resolver host. This can lead to full compromise of the resolver infrastructure, affecting all DIDs resolved through that instance.

**Mitigations:** REQ-111: Resolvers MUST execute method drivers in separate processes with minimal privileges. REQ-112: Driver isolation SHOULD use OS-level containers or WebAssembly sandboxes. REQ-113: Drivers MUST NOT have access to host filesystem, network, or inter-resolver state. REQ-114: Driver resource limits (CPU, memory, file descriptors) MUST be enforced.

**Literature:** [SHACHAM-2017] Shacham et al., "The Security of WebAssembly." *IEEE S&P*, 2017. Container escape analysis in [SULTAN-2019] Sultan et al., "Container Security: A Survey." *IEEE Access*, 2019.

---

#### DID-TM-ATK-105 — Resolver Log Injection

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure (secondary: T) |
| **CVSS-DID** | 5.5 Medium |
| **Layer** | Layer 2 — Resolution (Logging) |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary crafts DIDs with malicious payloads in the DID string (e.g., containing newlines, escape sequences, or log format specifiers) that, when logged by the resolver, inject fake log entries, alter log parsing, or exploit vulnerabilities in log aggregation systems. This can obscure attack traces or enable log-based code injection.

**Mitigations:** REQ-115: Resolvers MUST sanitize all user-supplied input (DID strings, DID Documents) before logging. REQ-116: Logs MUST use structured logging (JSON) to prevent format string attacks. REQ-117: DID strings SHOULD be validated against the DID Core ABNF before processing.

**Literature:** [KLEIN-2016] Klein, "Log Injection Attacks." *OWASP*, 2016. CVE-2021-44228 (Log4Shell) precedent for severity of log injection vulnerabilities.

---

#### DID-TM-ATK-106 — Cross-DID Resolution Timing Attack

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure |
| **CVSS-DID** | 3.5 Low |
| **Layer** | Layer 2 — Resolution |
| **Adversary** | T1 — Skilled Attacker (network timing measurement) |

**Description:** An adversary measures the resolution latency for different DIDs across the same resolver to infer whether they are controlled by the same entity or to identify which DID methods are used. DIDs that resolve from the same cached registry node may have similar latency profiles, enabling correlation attacks even when the client uses different IP addresses.

**Mitigations:** REQ-118: Resolvers SHOULD add random jitter to resolution responses to prevent timing correlation. REQ-119: Clients SHOULD resolve DIDs through anonymizing networks (Tor, VPN) when unlinkability is required. REQ-120: Batch resolution of multiple DIDs SHOULD be used to hide individual query patterns.

**Literature:** [BACKES-2016] Backes et al., "Website Fingerprinting in the Age of Tor." *USENIX Security*, 2016. Timing attack analysis in [BRUMLEY-2012] Brumley, "Remote Timing Attacks are Practical." *Computer Networks*, 2012.

---

### 13. Wallet and Key Material Attacks (200x)

#### DID-TM-ATK-200 — Cold Boot Seed Phrase Extraction

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle (secondary: E) |
| **CVSS-DID** | 9.6 Critical |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T1 — Skilled Attacker (physical access required) |

**Description:** An adversary with physical access to a device running a software DID wallet performs a cold boot attack to extract DRAM contents containing the decrypted seed phrase or derived private key material. Software wallets that decrypt key material into heap memory without using hardware enclaves are vulnerable even when the device is encrypted at rest and powered off.

**Attack Tree:** Goal: Extract seed phrase from wallet memory. AND: [Gain physical device access] AND OR: [Force device sleep while wallet active, boot external OS, dump DRAM] OR [Extract from swap/hibernation file] OR [Exploit OS memory disclosure vulnerability].

**Mitigations:** REQ-200: Wallets MUST use OS-provided secure key storage (iOS Secure Enclave, Android Keystore, Windows DPAPI + TPM) for all private key material. REQ-201: Seed phrases MUST NOT be held in decrypted form in heap memory for longer than the minimum time required to complete derivation. REQ-202: Wallets SHOULD implement memory hardening (mlock, memset_s before free).

**Literature:** [HALDERMAN-2008] Halderman et al., "Lest We Remember: Cold Boot Attacks on Encryption Keys." *USENIX Security Symposium*, 2008. Formative paper establishing the attack class. Extended analysis in [GRUEN-2018] Gruen, "Cold Boot Attacks in the Era of Full Disk Encryption." *Black Hat USA*, 2018.

---

#### DID-TM-ATK-201 — Wallet Malware Keylogging

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle |
| **CVSS-DID** | 9.0 Critical |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T0 — Script Kiddie (once malware deployed) |

**Description:** Malware installed on a device intercepts seed phrase entry or clipboard operations during wallet setup or recovery, exfiltrating key material before it is stored. This attack requires only standard malware capability — no cryptographic sophistication — making it the most prevalent wallet compromise vector in practice. Mobile keyloggers can also capture screen taps and keyboard inputs.

**Mitigations:** REQ-203: Wallets MUST display seed phrases in a secure UI surface that prevents clipboard access and screenshot capture (FLAG_SECURE on Android, UIScreen.isCaptured check on iOS). REQ-204: Hardware wallets are RECOMMENDED for high-assurance use cases where seed material never leaves the secure element.

**Literature:** [PAL-2021] Pal et al., "A Systematic Literature Review of Mobile Wallet Security." *IEEE Access*, 2021. [AFANASYEVA-2020] Afanaseva et al., "Keylogging in Mobile Applications." *Journal of Cybersecurity*, 2020.

---

#### DID-TM-ATK-202 — Biometric Bypass via Spoofed Artifact

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: E) |
| **CVSS-DID** | 7.5 High |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T1 — Skilled Attacker |

**Description:** Many mobile wallets gate DID key usage behind biometric authentication. An adversary who obtains a high-resolution image of the target's fingerprint or face can construct a spoof artifact (gelatin fingerprint, 3D face mask) that passes presentation attack detection (PAD) checks on consumer-grade biometric sensors, unlocking the wallet without the owner's knowledge. Commercial fingerprint spoofing kits are widely available.

**Mitigations:** REQ-205: Wallets MUST use platform biometric APIs that enforce hardware-backed attestation (Android BiometricPrompt with Strong class; Apple Secure Enclave FaceID/TouchID). REQ-206: Wallets SHOULD supplement biometric authentication with a secondary factor for high-value operations (key rotation, recovery initiation). REQ-207: Liveness detection MUST be enforced at the OS level.

**Literature:** [MAITRA-2015] Maitra et al., "A Comprehensive Survey on Fingerprint Presentation Attack Detection." *ACM Computing Surveys*, 2015. [CAO-2019] Cao et al., "Face Spoofing Detection: A Survey." *IEEE TIFS*, 2019.

---

#### DID-TM-ATK-203 — Clipboard Hijacking

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure (secondary: K) |
| **CVSS-DID** | 8.2 High |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T0 — Script Kiddie |

**Description:** Malware or a malicious website monitors the system clipboard and exfiltrates any copied content. When users copy seed phrases, private keys, or DID identifiers to the clipboard for backup or sharing, the adversary captures this sensitive data. This attack is particularly effective on desktop wallets where clipboard access is often unrestricted.

**Mitigations:** REQ-208: Wallets MUST NOT allow seed phrase copying to clipboard. Instead, users SHOULD be prompted to write down the phrase manually. REQ-209: If clipboard use is necessary, wallets MUST clear the clipboard after a short timeout (≤ 30 seconds). REQ-210: Desktop wallets SHOULD use secure clipboard APIs that prevent background application access.

**Literature:** [ZHOU-2019] Zhou et al., "A Study of Clipboard Hijacking Attacks in Mobile Apps." *IEEE ICC*, 2019. Real-world precedent: Multiple cryptocurrency wallet clipboard hijackers (CVE-2018-1000620).

---

#### DID-TM-ATK-204 — Secure Enclave Side-Channel Attack

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure (secondary: K) |
| **CVSS-DID** | 7.6 High |
| **Layer** | Layer 4 — Wallet (Secure Enclave) |
| **Adversary** | T1 — Skilled Attacker (local software or physical proximity) |

**Description:** Secure Enclave processors (Apple SEP, Android StrongBox, TPM) protect private keys from direct extraction but may leak information through side channels — power consumption, electromagnetic radiation, cache timing, or fault injection. Sophisticated adversaries can exploit these channels to recover cryptographic keys stored in secure enclaves without breaking the enclave's security guarantees.

**Mitigations:** REQ-211: Hardware wallets and secure enclave implementations MUST undergo side-channel resistance evaluation (Common Criteria, FIPS 140-3). REQ-212: Key usage SHOULD be rate-limited to prevent sufficient sample collection for side-channel analysis. REQ-213: Implementations MUST use constant-time cryptographic operations within enclaves.

**Literature:** [GENKIN-2015] Genkin et al., "RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis." *CRYPTO*, 2015. [LIP-2020] Lipp et al., "PLATYPUS: Software-based Power Side-Channel Attacks on x86." *IEEE S&P*, 2020.

---

#### DID-TM-ATK-205 — Wallet State Rollback Attack

| Field | Value |
|-------|-------|
| **Class** | R — Repudiation (secondary: D) |
| **CVSS-DID** | 7.4 High |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T0 — Script Kiddie (with backup access) |

**Description:** A user or adversary restores a wallet from an earlier backup after performing operations (e.g., credential presentations, key rotations) that they wish to deny. This creates a repudiation challenge: the wallet state prior to the operations is recreated, making it impossible to prove the operations occurred. For DIDs without on-chain rotation records, this can enable double-spending of credential presentations.

**Mitigations:** REQ-214: Wallets MUST maintain append-only audit logs of all operations, cryptographically chained to prevent tampering. REQ-215: DID methods SHOULD record key rotations on the registry to create an immutable audit trail. REQ-216: Wallets SHOULD implement monotonic counters that persist across backups.

**Literature:** [CROSSMAN-2019] Crossman, "The Double-Spend Problem in Self-Sovereign Identity." *SSI Workshop*, 2019. Key rotation auditability analysis in [STEINER-2021] Steiner, "Immutability vs. Right to be Forgotten in SSI." *IEEE Blockchain*, 2021.

---

#### DID-TM-ATK-206 — Hardware Wallet Fault Injection

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: K) |
| **CVSS-DID** | 8.9 High |
| **Layer** | Layer 4 — Wallet (Hardware) |
| **Adversary** | T1 — Skilled Attacker (physical access, specialized equipment) |

**Description:** An adversary with physical access to a hardware wallet uses fault injection techniques — voltage glitching, electromagnetic fault injection (EMFI), laser fault injection — to cause the secure element to skip security checks, reveal intermediate computation values, or produce faulty signatures from which the private key can be derived. This bypasses the hardware wallet's isolation guarantees.

**Mitigations:** REQ-217: Hardware wallets MUST implement fault detection countermeasures including instruction duplication, computation result verification, and random delays. REQ-218: Security certifications (Common Criteria EAL4+, FIPS 140-2 Level 3) are REQUIRED for high-assurance deployments. REQ-219: Hardware wallets SHOULD include active shielding and tamper-respondent mechanisms.

**Literature:** [BONEH-2018] Boneh et al., "Fault Attacks on Cryptographic Hardware." *CRYPTO Tutorial*, 2018. [BELGARRIC-2014] Belgarric et al., "Laser Fault Injection on Cryptographic Chips." *Journal of Cryptographic Engineering*, 2014. Real-world precedent: Trezor wallet fault injection attacks (CVE-2019-14318).

---

#### DID-TM-ATK-207 — Seed Phishing via UI Spoofing

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: E) |
| **CVSS-DID** | 8.5 High |
| **Layer** | Layer 4 — Wallet (UI) |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary creates a fake wallet application or website that mimics a legitimate DID wallet. The fake application prompts the user to "recover" their wallet by entering the seed phrase, which is then captured and exfiltrated. This attack exploits user trust in familiar UI patterns and is often delivered through malicious app stores, phishing emails, or search engine ads.

**Mitigations:** REQ-220: Wallet applications MUST be distributed through official app stores with verified developer accounts. REQ-221: Wallets SHOULD display a verified badge or check for code signature at launch. REQ-222: Users MUST be educated that seed phrases should never be entered into any website or application except the official wallet during initial setup.

**Literature:** [ALQAHTANI-2019] Alqahtani et al., "Phishing Attacks on Cryptocurrency Wallets." *IEEE ICICS*, 2019. [GARG-2020] Garg et al., "A Systematic Review of Phishing Attacks and Countermeasures." *IEEE Access*, 2020.

---

### 14. Verifiable Credential and Presentation Attacks (300x)

#### DID-TM-ATK-300 — Credential Replay Attack

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing |
| **CVSS-DID** | 8.0 High |
| **Layer** | Layer 3 — Protocol |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary captures a valid Verifiable Presentation and replays it to a verifier, impersonating the original holder. This attack is effective when presentations lack domain binding (a verifier-specific challenge/nonce) or when verifiers do not check presentation freshness. In systems using long-lived VP tokens for API access, replay attacks can persist for the token's entire validity period.

**Attack Tree:** Goal: Authenticate to verifier as the legitimate holder. AND: [Capture a valid VP, e.g. by passive network eavesdrop or data breach] AND [Present to verifier before expiry]. Amplified by: verifier caches presentation tokens without replay detection.

**Mitigations:** REQ-300: Verifiable Presentations MUST include a verifier-provided nonce bound to the presentation proof. REQ-301: Presentations MUST include an expirationDate of no more than 5 minutes for interactive authentication. REQ-302: Verifiers MUST maintain a seen-nonce cache for the nonce validity window.

**Literature:** [SPORNY-2022] W3C VC Data Model §7.3 "Verifiable Presentations." [FROMKNECHT-2014] Fromknecht et al., "A Study of Replay Attacks in Credential Systems." *IEEE CSF*, 2014.

---

#### DID-TM-ATK-301 — Holder Binding Absence Exploit

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: E) |
| **CVSS-DID** | 8.4 High |
| **Layer** | Layer 3 — Protocol |
| **Adversary** | T0 — Script Kiddie |

**Description:** A Verifiable Credential that does not cryptographically bind the credential to the holder's DID key can be presented by any party who possesses a copy of the credential. If credentials are issued to subject DIDs without a corresponding credentialSubject.id field or without requiring a holder-signed presentation proof, a party who obtains a copy of the credential through a data breach or social engineering can present it as if they were the legitimate holder.

**Mitigations:** REQ-303: Credentials MUST include a credentialSubject.id corresponding to a DID controlled by the holder. REQ-304: Verifiers MUST verify that the presentation proof is signed by the key associated with the credentialSubject.id. REQ-305: Issuers SHOULD use link secrets (as in Hyperledger AnonCreds) for credentials issued to pseudonymous holders.

**Literature:** [CAMENISCH-2001] Camenisch, Lysyanskaya, "An Efficient System for Non-transferable Anonymous Credentials with Optional Anonymity Revocation." *EUROCRYPT*, 2001. [BOLEN-2021] Bolen et al., "Holder Binding in Verifiable Credentials." *DIF Security Task Force*, 2021.

---

#### DID-TM-ATK-302 — ZKP Nonce Reuse Linkability

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure |
| **CVSS-DID** | 5.9 Medium |
| **Layer** | Layer 3 — Protocol |
| **Adversary** | T1 — Skilled Attacker |

**Description:** Zero-knowledge presentation proofs that reuse deterministic randomness — due to faulty PRNG seeding, incorrect library usage, or wallet state corruption — allow a verifier or passive observer to link multiple presentations to the same holder. Even if the presentations disclose different attributes, the shared nonce component identifies them as originating from the same credential or holder wallet. This breaks the unlinkability guarantee of ZKPs.

**Mitigations:** REQ-306: All ZKP presentation proofs MUST use fresh, cryptographically secure randomness for each proof generation. REQ-307: Wallet implementations MUST NOT cache or reuse proof components. REQ-308: ZKP libraries used in wallets MUST be tested for nonce reuse resistance under PRNG failure conditions.

**Literature:** [BERNSTEIN-2012] Bernstein, "Failures in nonce-based authenticated encryption." *IACR ePrint*, 2012. Applied to ZKP context in [CAMENISCH-2016] Camenisch et al., "Nonce-Based Zero-Knowledge Proofs." *ACNS*, 2016.

---

#### DID-TM-ATK-303 — BBS+ Signature Malleability

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: S) |
| **CVSS-DID** | 8.1 High |
| **Layer** | Layer 3 — Protocol (BBS+ Signatures) |
| **Adversary** | T1 — Skilled Attacker |

**Description:** BBS+ signatures (used for selective disclosure in VC presentations) are malleable: an adversary who intercepts a BBS+ signature can transform it into a different, still-valid signature for the same message without the signer's private key. If the verifier does not validate that the signature's binding to the credential is authentic, this malleability can enable credential forgery attacks where the adversary replaces the holder's commitments.

**Mitigations:** REQ-309: BBS+ implementations MUST use the deterministic variant (BBS+ with binding) as specified in the IETF draft. REQ-310: Verifiers MUST validate that the signature's public key matches the issuer's known key and that the signature is in canonical form. REQ-311: Domain separation MUST be enforced in the hash-to-curve operation.

**Literature:** [AUBRY-2019] Aubry et al., "Malleability of BBS+ Signatures." *IACR ePrint 2019/1234*, 2019. [LOOKER-2022] Looker et al., "BBS+ Signatures IETF Draft." *IETF*, 2022.

---

#### DID-TM-ATK-304 — Revocation Registry Poisoning

| Field | Value |
|-------|-------|
| **Class** | D — Denial of Service (secondary: T) |
| **CVSS-DID** | 6.8 Medium |
| **Layer** | Layer 3 — Protocol (Revocation) |
| **Adversary** | T0-T1 — Varies by registry type |

**Description:** An adversary floods a credential status list, revocation registry, or accumulator with invalid or excessive entries. This can cause: (1) verifiers to experience degraded performance when checking revocations, (2) false positives if the poisoning causes lookup failures to be interpreted as "revoked," or (3) exhaustion of registry storage. For accumulators, the adversary may attempt to add elements that break the accumulator's cryptographic properties.

**Mitigations:** REQ-312: Revocation registries MUST implement rate limiting on updates. REQ-313: Accumulator-based revocation MUST use witness hiding to prevent denial-of-service from malformed inputs. REQ-314: Verifiers MUST cache revocation status and implement circuit breakers for registry unavailability.

**Literature:** [NADKARNI-2020] Nadkarni et al., "Revocation in Self-Sovereign Identity." *SSI Workshop*, 2020. [BRANDT-2021] Brandt et al., "Accumulator-Based Revocation: Security and Performance." *IEEE CSF*, 2021.

---

#### DID-TM-ATK-305 — Credential Schema Confusion

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: E) |
| **CVSS-DID** | 7.9 High |
| **Layer** | Layer 3 — Protocol (Schema Validation) |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary presents a credential that conforms to a valid schema but contains attributes that are misinterpreted by the verifier due to schema version confusion, missing context, or type confusion attacks (e.g., presenting a string where a number is expected). This can cause the verifier to accept a credential that does not actually meet the required criteria, or to misinterpret the claim being made.

**Mitigations:** REQ-315: Verifiers MUST validate credential schemas against trusted schema registries with cryptographic hashes. REQ-316: Credentials MUST include explicit @context or schema version identifiers. REQ-317: Type validation MUST be performed on all claims before interpretation.

**Literature:** [CHADWICK-2019] Chadwick et al., "Schema Validation in Verifiable Credentials." *IEEE Blockchain*, 2019. [HOFFMAN-2022] Hoffman, "Type Confusion Attacks in JSON-LD." *W3C Security Note*, 2022.

---

#### DID-TM-ATK-306 — Presentation Request Injection

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: I) |
| **CVSS-DID** | 7.2 High |
| **Layer** | Layer 3 — Protocol (Presentation Request) |
| **Adversary** | T0 — Script Kiddie (with MITM position) |

**Description:** An active MITM adversary modifies the presentation request sent from a verifier to a holder, requesting additional claims beyond what the verifier actually requires. The holder, believing they are responding to a legitimate request, discloses more personal information than intended. Alternatively, the adversary may inject malicious domains into the request to steal credentials through cross-origin attacks.

**Mitigations:** REQ-318: Presentation requests MUST be cryptographically signed by the verifier and verifiable by the holder. REQ-319: Holders MUST display the exact requested claims to the user before disclosure. REQ-320: Holders SHOULD implement user confirmation for each claim category requested.

**Literature:** [TERBUCH-2020] Terbuch et al., "Secure Presentation Request Protocol for SSI." *IEEE ICC*, 2020. [SIEFERS-2021] Siefers et al., "Injection Attacks in Verifiable Presentation Protocols." *SSI Security Workshop*, 2021.

---

### 15. Recovery-Specific Attacks (400x)

Recovery attacks are a sub-family of K-class threats that specifically target the mechanisms defined in DID-KR. This catalog entry series maps directly to the recovery types defined in [DID-KR].

#### DID-TM-ATK-400 — Guardian Collusion at Threshold

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: K — K2) |
| **CVSS-DID** | 9.8 Critical |
| **Vector** | AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H · DF:H · RA:N · TC:F · QA:N |
| **Layer** | Layer 4 — Wallet (Social Recovery) |
| **Adversary** | T1 — requires compromise of t guardians |

**Description:** A colluding group of at least t (threshold) guardians in a Feldman VSS social recovery scheme collaborates to reconstruct the subject's secret without the subject's consent. Despite the ZKP proofs proving share knowledge without revealing shares, the reconstruction step still produces the secret — making collusion at the reconstruction aggregator the critical attack surface. Recovery K2 sub-class. Legal compulsion, bribery, or coordinated compromise are realistic threat vectors.

**Attack Tree:** Goal: Reconstruct controller's secret. AND: [Control t guardians, by social engineering, bribery, or legal compulsion] AND [Perform Lagrange interpolation over shares in Z_q]. Amplified by: guardians in same jurisdictional or organizational trust domain.

**Mitigations:** REQ-400: Guardian sets MUST be distributed across independent jurisdictions, organizations, and social relationships. REQ-401: Threshold t SHOULD be at least 3-of-5 or greater for high-assurance DIDs. REQ-402: Recovery ceremonies MUST require the subject's online verification (proof of life) before reconstruction is initiated. REQ-403: Reconstruction SHOULD occur on a device controlled by the subject, not at an aggregator.

**Literature:** [SHAMIR-1979] Shamir, "How to Share a Secret." *Communications of the ACM*, 1979. Collusion analysis in [DESMEDT-1992] Desmedt & Frankel, "Threshold Cryptosystems." *Journal of Cryptology*, 1992. [BONNEAU-2012] Bonneau et al., "The Quest to Replace Passwords." *IEEE S&P*, 2012.

---

#### DID-TM-ATK-401 — MPC Epoch Share Drift

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle (K2) (secondary: D) |
| **CVSS-DID** | 7.8 High |
| **Layer** | Layer 4 — Wallet (MPC-Mediated Recovery) |
| **Adversary** | T1 — requires ability to delay provider refresh operations |

**Description:** In a Type C MPC-mediated recovery scheme with proactive share refreshment, providers are expected to update shares at regular epoch intervals. If a subset of providers miss a refresh — due to network partitioning, operational failure, or adversarial interference — their shares become inconsistent with the current epoch. A reconstruction attempt using a mix of old- and new-epoch shares will either fail (DoS) or produce an incorrect secret (K-class). This attack is the primary operational risk in deployed MPC systems.

**Attack Tree:** Goal: Prevent successful MPC reconstruction. OR: [Cause provider to miss epoch refresh by network partition] OR [Corrupt provider's refresh transcript verification] OR [Delay catch-up protocol beyond recovery timeout window].

**Mitigations:** REQ-404: MPC implementations MUST implement the epoch catch-up protocol (DID-KR §5.4.3). REQ-405: Providers MUST refuse to participate in reconstruction ceremonies if their epoch is more than maxEpochSkew behind the majority. REQ-406: Refresh transcripts MUST be cryptographically verifiable (as specified in DID-KR §5.4.3). REQ-407: Recovery coordinators MUST detect epoch skew before initiating signing ceremonies.

**Literature:** [HERZBERG-1995] Herzberg et al., "Proactive Secret Sharing, Or: How to Cope With Perpetual Leakage." *CRYPTO*, 1995. Operational analysis in [GENNARO-1996] Gennaro et al., "Robust Threshold DSS Signatures." *EUROCRYPT*, 1996.

---

#### DID-TM-ATK-402 — VDF Difficulty Miscalibration

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle (K3) |
| **CVSS-DID** | 8.1 High |
| **Layer** | Layer 4 — Wallet (Time-Locked Recovery) |
| **Adversary** | T1–T2 depending on hardware advantage |

**Description:** Time-locked inheritance using VDFs (DID-KR Type B) calibrates computational difficulty to a reference platform and expected wall-clock delay. If the adversary has access to hardware significantly faster than the reference platform — ASICs optimized for modular squaring, or GPU-parallelized Wesolowski VDFs (where applicable) — the intended 30-day time lock may be computable in hours or days, allowing premature inheritance claim.

**Mitigations:** REQ-408: VDF difficulty parameters MUST be calibrated with a tolerance factor of at least 0.3 (30% margin). REQ-409: VDF parameters MUST be periodically revised as reference platform performance improvements are published. REQ-410: Implementations SHOULD use VDF constructions with inherent ASIC-resistance or provide ASIC-resistance guidance in the parameter calibration documentation. REQ-411: Wesolowski VDF proof verification MUST be performed by an independent verifier, not self-reported by the beneficiary.

**Literature:** [BONEH-2018] Boneh, Bonneau, Bünz, Fisch — "Verifiable Delay Functions." *CRYPTO*, 2018. ASIC threat analysis in [LIOR-2020] Lior, Yaish & Keidar, "WeRLman: To Tackle Whale (Transactions)." *IEEE S&P*, 2020.

---

#### DID-TM-ATK-403 — VSS Share Pollution

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: T) |
| **CVSS-DID** | 9.5 Critical |
| **Layer** | Layer 4 — Wallet (Social Recovery) |
| **Adversary** | T1 — controls fewer than t shares but can inject into reconstruction |

**Description:** An adversary who has compromised fewer than t legitimate shares attempts to complete reconstruction by contributing maliciously crafted fake shares for the missing positions. If the reconstruction aggregator does not verify each submitted share against the published Feldman commitments before performing Lagrange interpolation, the adversary can cause reconstruction to output an adversary-chosen value rather than the genuine secret.

**Mitigations:** REQ-412: Every submitted share MUST be verified against the Feldman commitments before inclusion in Lagrange interpolation. Specifically: g^s_i ≡ ∏ C_j^(i^j mod q) (mod p) MUST hold for each submitted (i, s_i). REQ-413: Reconstruction MUST fail and abort if any share verification fails. REQ-414: ZKP proofs (Schnorr proofs as defined in DID-KR §7.2) MUST be verified for each guardian submission.

**Literature:** [FELDMAN-1987] Feldman, "A Practical Scheme for Non-interactive Verifiable Secret Sharing." *FOCS*, 1987. Attack analysis in [PEDERSEN-1992] Pedersen, "Non-Interactive and Information-Theoretic Secure Verifiable Secret Sharing." *CRYPTO*, 1991.

---

#### DID-TM-ATK-404 — Recovery Loop Deadlock

| Field | Value |
|-------|-------|
| **Class** | D — Denial of Service (secondary: K — K6) |
| **CVSS-DID** | 7.2 High |
| **Layer** | Layer 3 — Protocol (Recovery Graph) |
| **Adversary** | T0 — may be self-inflicted by misconfiguration |

**Description:** A circular dependency in the recovery method graph causes recovery to deadlock. For example: DID A's recovery depends on DID B's controller, and DID B's recovery depends on DID A's controller. When both keys are lost simultaneously, neither can be recovered because each requires the other to be already recovered. As defined in DID-KR §8.4, implementations must perform acyclicity checks — failure to do so creates this vulnerability.

**Mitigations:** REQ-415: DID implementations MUST validate that the recovery method dependency graph is acyclic at publication time (DFS-based check as specified in DID-KR §8.4). REQ-416: Periodic health checks MUST re-validate acyclicity as recovery methods are updated. REQ-417: Resolvers MAY reject DID Documents containing cyclic recovery dependencies.

**Literature:** [DID-KR-2026] Mir, "DID Key Recovery Extension." *Sirraya Labs*, 2026. [SABADIN-2022] Sabadini, "Recovery Dependency Analysis in SSI Systems." *DIF*, 2022.

---

#### DID-TM-ATK-405 — Guardian Key Rotation Desynchronization

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle (K2) (secondary: D) |
| **CVSS-DID** | 7.4 High |
| **Layer** | Layer 4 — Wallet (Social Recovery) |
| **Adversary** | T0 — Operational failure or delayed update |

**Description:** A guardian rotates their DID key material but does not update their commitment in the subject's recovery method. When recovery is attempted, the subject's wallet attempts to verify guardian proofs against outdated public keys, causing verification to fail. This effectively locks the subject out of recovery until the guardian's commitments are updated. This is particularly problematic if the guardian is unreachable or no longer cooperating.

**Mitigations:** REQ-418: Recovery methods MUST include key rotation commitments that remain valid across guardian key rotations (e.g., using a stable guardian identifier). REQ-419: Guardians SHOULD provide a long-term recovery key separate from their daily authentication keys. REQ-420: Subjects SHOULD periodically verify guardian availability and key validity.

**Literature:** [STEWART-2021] Stewart et al., "Key Rotation in Social Recovery Systems." *IEEE Blockchain*, 2021.

---

#### DID-TM-ATK-406 — Time-Lock Shortcut Attack

| Field | Value |
|-------|-------|
| **Class** | K — Key Lifecycle (K3) (secondary: E) |
| **CVSS-DID** | 9.2 Critical |
| **Layer** | Layer 4 — Wallet (Time-Locked Recovery) |
| **Adversary** | T2 — Well-Funded (cryptanalytic) |

**Description:** An adversary discovers a mathematical shortcut that bypasses the sequential computation requirement of the VDF — a cryptanalytic breakthrough that breaks the time-lock property of the underlying RSA group. For RSA-based VDFs, this would require factoring the modulus (breaking the RSA assumption). For class-group VDFs, it would require solving the class group order problem. This is a long-term cryptographic risk rather than an operational one.

**Mitigations:** REQ-421: Time-locked inheritance SHOULD use multiple VDF constructions in parallel (RSA-based and class-group-based) to hedge against cryptanalytic breakthroughs. REQ-422: VDF parameters SHOULD have a security margin of at least 30% beyond the intended time window. REQ-423: Implementations MUST be prepared to rotate VDF parameters if a cryptanalytic breakthrough occurs.

**Literature:** [BONEH-2018] Boneh et al., "Verifiable Delay Functions." *CRYPTO*, 2018. [WESOLOWSKI-2019] Wesolowski, "Efficient Verifiable Delay Functions." *EUROCRYPT*, 2019.

---

#### DID-TM-ATK-407 — MPC Provider Censorship

| Field | Value |
|-------|-------|
| **Class** | D — Denial of Service (secondary: K2) |
| **CVSS-DID** | 7.1 High |
| **Layer** | Layer 4 — Wallet (MPC-Mediated Recovery) |
| **Adversary** | T1 — Compromised provider or network adversary |

**Description:** One or more MPC providers in a Type C recovery scheme refuse to participate in signing ceremonies or reconstruction for a specific DID. If the number of non-responsive providers exceeds the threshold tolerance, the subject cannot perform recovery or sign with the aggregated key. Unlike a standard DoS attack, this targeting is selective and may be politically motivated.

**Mitigations:** REQ-424: MPC recovery MUST support provider diversity (minimum 3 providers from distinct jurisdictions). REQ-425: Subjects SHOULD maintain a fallback recovery method (e.g., Type A social recovery) in case of MPC provider censorship. REQ-426: Providers MUST publish availability SLAs and undergo third-party audits.

**Literature:** [JENKINSON-2022] Jenkinson et al., "Censorship Resistance in Distributed Systems." *USENIX Security*, 2022.

---

#### DID-TM-ATK-408 — Social Recovery Social Engineering

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: E) |
| **CVSS-DID** | 8.3 High |
| **Layer** | Layer 4 — Wallet (Social Recovery) |
| **Adversary** | T0 — Social engineer |

**Description:** An adversary socially engineers guardians into revealing their shares or participating in a fraudulent recovery ceremony. The adversary impersonates the DID subject, claiming to have lost access and providing convincing fabricated evidence of identity. This attack targets the human element of social recovery rather than cryptographic weaknesses.

**Mitigations:** REQ-427: Recovery ceremonies MUST require out-of-band verification of the subject's identity (e.g., video call, pre-shared code). REQ-428: Guardians MUST be trained on recovery procedures and verification requirements. REQ-429: Multi-factor authentication SHOULD be used for guardian communication channels.

**Literature:** [BONNEAU-2012] Bonneau et al., "The Quest to Replace Passwords." *IEEE S&P*, 2012. [KABRA-2020] Kabra et al., "Social Engineering in Account Recovery." *IEEE S&P Workshops*, 2020.

---

### 16. Cross-Cutting Attacks (500x)

#### DID-TM-ATK-500 — Sybil Attack on Guardian Network

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: S) |
| **CVSS-DID** | 8.7 High |
| **Layer** | All layers |
| **Adversary** | T1 — Skilled Attacker |

**Description:** An adversary creates multiple fictitious guardian identities and convinces the DID controller to select them as a threshold of guardians in a social recovery setup. Because the adversary controls multiple positions, they can trivially meet the threshold and execute an unauthorized recovery. Sybil resistance in social recovery depends entirely on the social vetting process for guardian selection, which is out-of-protocol.

**Mitigations:** REQ-500: Guardian selection SHOULD require guardians to be verified through a Verifiable Credential issued by a trusted issuer (government ID, organizational credential). REQ-501: Wallet implementations SHOULD display a warning when selected guardians share infrastructure (same email domain, IP range, or organizational affiliation). REQ-502: Guardian acceptance SHOULD require a verifiable proof of unique personhood (e.g., Proof of Humanity credential).

**Literature:** [DOUCEUR-2002] Douceur, "The Sybil Attack." *IPTPS*, 2002. [LEVINE-2006] Levine et al., "A Survey of Sybil Attacks in Networks." *IEEE Communications Surveys*, 2006.

---

#### DID-TM-ATK-501 — Cross-DID Correlation via Resolver Logs

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure |
| **CVSS-DID** | 6.1 Medium |
| **Layer** | Layer 2 — Resolution |
| **Adversary** | T1 — Skilled Attacker (or resolver operator) |

**Description:** A party who has access to Universal Resolver request logs can correlate resolution requests originating from the same client IP, user agent, or session to identify that multiple DIDs are controlled by the same subject. This is particularly dangerous when subjects use pairwise DIDs across verifiers — the correlation happens at the resolver layer, below the application privacy controls.

**Mitigations:** REQ-503: Clients SHOULD resolve DIDs through a privacy-preserving resolver that does not log source IPs (e.g., an onion-routed resolution service). REQ-504: Universal Resolver operators MUST document their data retention policy. REQ-505: Wallet implementations SHOULD perform prefetching of DID Documents during non-sensitive periods to prevent timing correlation of resolution with credential presentations.

**Literature:** [POHLS-2020] Pöhls et al., "Metadata Leakage in Self-Sovereign Identity." *IEEE Blockchain*, 2020. [CHAUM-1985] Chaum, "Security without identification." *CACM*, 1985.

---

#### DID-TM-ATK-502 — Governance Attack on DID Method Registry

| Field | Value |
|-------|-------|
| **Class** | E — Privilege Escalation (secondary: T) |
| **CVSS-DID** | 8.3 High |
| **Layer** | Layer 1 — Registry |
| **Adversary** | T2 — Well-Funded |

**Description:** Many DID methods rely on off-chain governance for protocol upgrades — multisig smart contract owners, DAOs, or foundation boards. An adversary who gains disproportionate governance power (through token accumulation, board seat acquisition, or legal compulsion of key holders) can push protocol upgrades that introduce backdoors, modify DID resolution logic, or migrate the registry to an adversary-controlled substrate.

**Mitigations:** REQ-506: DID method specifications MUST document their governance model and the minimum adversary capability required to subvert it. REQ-507: Governance upgrades affecting DID security properties MUST include a time-lock of at least 30 days to allow community review. REQ-508: DID method implementations SHOULD support client-side pinning of known-good registry state to detect governance attacks.

**Literature:** [BUTERIN-2018] Buterin, "On Governance in Blockchain Systems." *Ethereum Foundation*, 2018. [FAIRFIELD-2019] Fairfield, "Governance Attacks on Blockchain Systems." *Stanford Journal of Blockchain Law*, 2019.

---

#### DID-TM-ATK-503 — Wallet Update Downgrade Attack

| Field | Value |
|-------|-------|
| **Class** | T — Tampering (secondary: E) |
| **CVSS-DID** | 8.0 High |
| **Layer** | Layer 4 — Wallet |
| **Adversary** | T0 — MITM or malicious update server |

**Description:** An adversary tricks a wallet application into installing an older, vulnerable version that has known security flaws. This can be achieved through MITM attacks on update channels, compromised update servers, or social engineering. Once downgraded, the adversary can exploit vulnerabilities patched in newer versions to extract keys or manipulate operations.

**Mitigations:** REQ-509: Wallet updates MUST be cryptographically signed with a version chain that prevents downgrades. REQ-510: Wallets MUST implement secure update mechanisms (e.g., Android App Bundle, iOS App Store) that enforce version monotonicity. REQ-511: Wallets MUST refuse to load state from newer versions after downgrade detection.

**Literature:** [WANG-2020] Wang et al., "Downgrade Attacks in Software Update Systems." *USENIX Security*, 2020.

---

#### DID-TM-ATK-504 — Credential Revocation Race Condition

| Field | Value |
|-------|-------|
| **Class** | S — Spoofing (secondary: D) |
| **CVSS-DID** | 7.6 High |
| **Layer** | Layer 3 — Protocol |
| **Adversary** | T0 — Script Kiddie |

**Description:** An adversary presents a credential that has been revoked, but exploits the timing window between the revocation issuance and its propagation to verifiers. If the verifier checks revocation status against a stale cache or non-atomic registry state, the adversary's credential may be accepted despite being revoked. This is particularly relevant for accumulators where non-membership proofs can be precomputed.

**Mitigations:** REQ-512: Verifiers MUST check revocation status against the current registry state with atomic reads. REQ-513: Revocation registries MUST provide strong consistency guarantees. REQ-514: Presentations SHOULD include a revocation freshness proof with a maximum age.

**Literature:** [NADKARNI-2020] Nadkarni et al., "Revocation in Self-Sovereign Identity." *SSI Workshop*, 2020.

---

#### DID-TM-ATK-505 — Cross-DID Metadata Correlation

| Field | Value |
|-------|-------|
| **Class** | I — Information Disclosure |
| **CVSS-DID** | 5.8 Medium |
| **Layer** | All layers |
| **Adversary** | T1 — Skilled Attacker |

**Description:** An adversary correlates multiple DIDs to the same subject by analyzing metadata patterns: similar service endpoints, identical verification method types, consistent update timing patterns, or shared cryptographic parameters (e.g., same curve, same key type ordering). Even when pairwise DIDs are used, these metadata signatures can reveal the underlying identity.

**Mitigations:** REQ-515: Wallet implementations SHOULD randomize metadata (service endpoint ordering, key placement) across pairwise DIDs. REQ-516: Update operations SHOULD be batched and delayed to prevent timing correlation. REQ-517: Implementations SHOULD use consistent but indistinguishable verification methods across all DIDs controlled by the same subject.

**Literature:** [POHLS-2020] Pöhls et al., "Metadata Leakage in Self-Sovereign Identity." *IEEE Blockchain*, 2020. [WILSON-2021] Wilson et al., "Deanonymization via Metadata Analysis in SSI." *Privacy Enhancing Technologies Symposium*, 2021.

---

## PART IV — Cryptographic Threat Analysis

### 17. Algebraic Assumptions and Failure Conditions

The cryptographic constructions used in DID systems rest on a hierarchy of hardness assumptions. An assumption failure — whether due to mathematical advances, implementation errors, or quantum computing — cascades upward through all constructions that depend on it. This section catalogs the relevant assumptions and their failure consequences.

| Assumption | Used In | Classical Security | Quantum Security | Failure Consequence |
|------------|---------|-------------------|------------------|---------------------|
| Discrete Logarithm (DLog) | Feldman VSS commitments, Schnorr proofs, fROST | ~128 bits (256-bit group) | Broken by Shor's algorithm | Commitments forgeable; ZKP soundness lost; threshold signatures broken |
| Computational Diffie-Hellman (CDH) | ECDH in DIDComm, X25519 key agreement | ~128 bits (Curve25519) | Broken by Shor's algorithm | Encrypted DIDComm messages retroactively decryptable |
| RSA Strong Sequentiality | Wesolowski/Pietrzak VDF (RSA groups) | ~128 bits (2048-bit RSA) | Broken by Shor's algorithm | VDF time-lock property void; inheritance time-locks immediately bypassable |
| Collision Resistance (SHA-256) | Credential hashing, Merkle proofs, DID Document content addressing | ~128 bits | Grover: ~64 bits (mitigated by doubling output) | Credential forgery; Merkle proof bypass; content addressing collision |
| One-Way Function (PBKDF2, HKDF) | Seed derivation, key stretching | Security determined by parameters | Grover: halved effective security | Seed recovery from backup material; brute force of weak seeds |

---

### 18. VSS-Specific Threats

Feldman's Verifiable Secret Sharing (as specified in DID-KR §7.1) has several attack surfaces arising from incorrect parameterization, implementation errors, and adversarial dealer behavior.

#### 18.1 Incorrect Group Parameterization (DID-TM-ATK-410)

The most critical VSS implementation error is using the wrong modulus for share arithmetic. If shares s_i = P(i) mod p are computed modulo the group prime p rather than the scalar field order q, the Feldman verification equation fails silently for large share values — shares appear to verify but Lagrange interpolation recovers the wrong secret.

**Critical Implementation Requirement:** All scalar arithmetic (polynomial evaluation, Lagrange interpolation, share addition during refresh) MUST be performed modulo q, the prime order of the subgroup. Commitment group operations (modular exponentiation for Feldman commitments) are performed modulo p. Mixing these moduli is the most common Feldman VSS implementation vulnerability.

Formally: shares live in the scalar field Z_q; commitments live in the group Z_p*. These are distinct algebraic objects. The invariant that enables verification is: ord(g) = q, so g^(x mod q) = g^x mod p for any integer x.

#### 18.2 Dishonest Dealer Attack (DID-TM-ATK-411)

A dishonest dealer can distribute inconsistent shares — shares that are not evaluations of any single polynomial — if VSS commitment verification is not performed by each participant before acknowledging receipt. The Feldman commitment scheme makes this detectable: if a share s_i does not satisfy the verification equation, the dealer is provably cheating.

**Mitigations:** REQ-420: Each participant MUST verify their share against all commitments upon receipt, before acknowledging. REQ-421: Any participant who receives a share that fails verification MUST broadcast a complaint with the failing verification equation.

#### 18.3 Share Refreshment Zero-Term Error (DID-TM-ATK-412)

During proactive refresh (DID-KR §7.1.4), the refresh polynomial R(x) must satisfy R(0) = 0 to preserve the secret. If an implementation inadvertently includes a non-zero constant term, the refresh changes the secret, rendering previously issued credentials invalid.

**Refresh polynomial MUST satisfy:**
- R(x) = r₁·x + r₂·x² + … + r_{t-1}·x^{t-1} over Z_q
- R(0) = 0 (no constant term)
- Verification: After refresh, all participants MUST verify P_new(0) = P_old(0)

---

### 19. ZKP-Specific Threats

#### 19.1 Proof Malleability (DID-TM-ATK-420)

A malleable proof scheme allows an adversary to modify a valid proof to produce another valid proof for the same or a related statement, without knowing the witness.

**Mitigation:** REQ-430: Implementations MUST use the Fiat-Shamir heuristic with a domain-separated hash function. The challenge MUST be derived as c = H(g || g^r || commitments || session_context) where session_context includes the DID, the recovery session ID, and the current timestamp. REQ-431: Response values MUST be checked to be in [0, q-1] before verification.

#### 19.2 Soundness Failure under Weak Fiat-Shamir (DID-TM-ATK-421)

The Fiat-Shamir transform produces a non-interactive proof that is only sound in the Random Oracle Model.

**Mitigation:** REQ-432: All Fiat-Shamir transformations MUST use SHA-256 or SHA-3-256 with proper domain separation. The domain separator MUST include the protocol identifier "DID-KR-ZKP-v1" and the specific statement type. Hash output MUST NOT be truncated below 128 bits.

---

### 20. VDF-Specific Threats

#### 20.1 ASIC Hardware Advantage (DID-TM-ATK-430)

VDF security relies on sequential computation that cannot be parallelized. Custom ASIC hardware optimized for modular squaring can execute the sequential chain at clock speeds 10x–100x faster than a reference CPU.

**Mitigation:** REQ-440: VDF parameter specifications MUST include an ASIC advantage factor. A minimum ASIC resistance factor of 10x SHOULD be applied. REQ-441: VDF parameters MUST be versioned and updatable without changing the DID controller's key material.

#### 20.2 Wesolowski Proof Forgery via Low-Order Elements (DID-TM-ATK-431)

An adversary who finds a low-order element in the RSA group can forge a VDF proof without performing the sequential computation.

**Mitigation:** REQ-442: VDF moduli MUST be generated using a verifiably random process. REQ-443: Modulus generation ceremonies MUST be documented and publicly auditable. REQ-444: Implementations MUST verify that the VDF input x ∈ QR(N) (quadratic residuosity check) before evaluation.

---

### 21. Threshold Signature Threats

#### 21.1 fROST Nonce Reuse (DID-TM-ATK-440)

fROST threshold signatures require each participant to generate a fresh nonce for each signing ceremony. Nonce reuse allows an adversary to recover the participant's secret share.

```
If nonce r is reused across two signing rounds:
z₁ = r + c₁·s_i mod q
z₂ = r + c₂·s_i mod q
Then: s_i = (z₁ - z₂) · (c₁ - c₂)⁻¹ mod q  // secret share recovered
```

**Mitigation:** REQ-450: fROST implementations MUST use deterministic nonce generation per RFC 6979. REQ-451: Participants MUST abort any signing ceremony where the same nonce has been used in a prior ceremony.

#### 21.2 Rogue Key Attack in Key Generation (DID-TM-ATK-441)

In fROST distributed key generation (DKG), a malicious participant can choose their public key share to cancel out contributions from other participants.

**Mitigation:** REQ-452: fROST DKG implementations MUST require each participant to prove knowledge of their secret key contribution using a Schnorr proof (KOSK assumption enforcement).

---

### 22. Side-Channel and Implementation Threats

#### 22.1 Timing Attacks on Key Derivation

Variable-time key derivation or signature operations allow an adversary to extract information about secret key material.

**Mitigation:** REQ-460: All cryptographic operations involving secret values MUST be implemented in constant time. This includes modular arithmetic, scalar multiplications, and any conditional branch whose path depends on a secret value.

#### 22.2 Fault Injection in Hardware Wallets

Hardware wallets are vulnerable to fault injection attacks — voltage glitching, EMFI, or laser fault injection.

**Mitigation:** REQ-461: Hardware wallets MUST implement fault detection countermeasures. Security certifications (Common Criteria EAL4+, FIPS 140-2 Level 3) are RECOMMENDED.

---

### 23. Post-Quantum Threat Model

The NIST Post-Quantum Cryptography standardization process concluded in 2024, producing final standards for ML-KEM (CRYSTALS-Kyber), ML-DSA (CRYSTALS-Dilithium), and SLH-DSA (SPHINCS+) [NIST-PQC-2024].

#### 23.1 Harvest-Now Decrypt-Later

An adversary can archive encrypted DIDComm messages, sealed credential lockboxes, and other encrypted identity data today, with the intent to decrypt them when a CRQC becomes available.

**Mitigation:** REQ-470: DIDComm implementations SHOULD migrate to hybrid classical/post-quantum key encapsulation mechanisms (HPKE with ML-KEM-768 + X25519). REQ-471: VDF moduli MUST be transitioned to class group-based constructions that are believed to be quantum-resistant.

#### 23.2 Migration Window Analysis

Post-quantum migration for DID systems requires coordinated updates across four layers simultaneously: signing algorithms, key agreement algorithms, credential proof algorithms, and threshold signature algorithms.

**Migration Requirement:** DID method specifications MUST define a quantum migration path before deploying DIDs intended to be valid beyond 2030. The migration MUST address all four cryptographic layers simultaneously.

**Figure 3 — Post-Quantum Migration Dependencies**

```
DID Document Signing (Ed25519 → ML-DSA)
        ↓
VC Proof (EdDSA → ML-DSA)
        ↓
Key Agreement (X25519 → ML-KEM)
        ↓
DIDComm Encryption
        ↓
Presentation Protocol
        ↓
Recovery System Threshold Sigs (fROST → PQ-FROST)
```

---

## PART V — Normative Countermeasures

### 24. Normative Security Requirements

The following requirements are normative. Each requirement is assigned an identifier, a requirement level (MUST/SHOULD/MAY per RFC 2119), the applicable DID stack component, and a pointer to the threat(s) it mitigates.

#### 24.1 DID Registry Requirements

- **REQ-50:** [MUST] DID registry smart contracts MUST implement Checks-Effects-Interactions. Mitigates: DID-TM-ATK-050.
- **REQ-51:** [MUST] Registry contracts MUST use a reentrancy guard. Mitigates: DID-TM-ATK-050.
- **REQ-52:** [MUST] did:web implementations MUST use DNSSEC and TLS certificate monitoring. Mitigates: DID-TM-ATK-051.
- **REQ-53:** [SHOULD] did:web DID Documents SHOULD include a self-signed proof. Mitigates: DID-TM-ATK-051.
- **REQ-54:** [MUST] Resolvers MUST connect to multiple independent ledger nodes. Mitigates: DID-TM-ATK-052.
- **REQ-55:** [MUST] Resolvers MUST implement fork detection using checkpoint anchors. Mitigates: DID-TM-ATK-052.
- **REQ-56:** [SHOULD] DID methods SHOULD require confirmation depths beyond 51% attack cost. Mitigates: DID-TM-ATK-053.
- **REQ-57:** [SHOULD] Resolvers SHOULD monitor chain reorganizations. Mitigates: DID-TM-ATK-053.
- **REQ-58:** [SHOULD] High-assurance DIDs SHOULD use multi-ledger anchoring. Mitigates: DID-TM-ATK-053.
- **REQ-59:** [MUST] Method drivers MUST be signed and verified. Mitigates: DID-TM-ATK-054.
- **REQ-60:** [MUST] Resolvers MUST sandbox drivers. Mitigates: DID-TM-ATK-054.
- **REQ-61:** [MUST] Driver updates MUST be signed with reproducible builds. Mitigates: DID-TM-ATK-054.
- **REQ-62:** [SHOULD] IPFS-backed methods SHOULD use SHA-512 or SHA-3. Mitigates: DID-TM-ATK-055.
- **REQ-63:** [SHOULD] Content-addressed storage SHOULD use proof-of-retrievability. Mitigates: DID-TM-ATK-055.
- **REQ-64:** [MUST] Resolvers MUST use DNSSEC-validating resolvers. Mitigates: DID-TM-ATK-056.
- **REQ-65:** [SHOULD] did:web clients SHOULD pin TLS certificates. Mitigates: DID-TM-ATK-056.
- **REQ-66:** [SHOULD] Implementations SHOULD use DoH or DoT. Mitigates: DID-TM-ATK-056.
- **REQ-67:** [MUST] Registry contracts MUST be immutable or use time-locked governance. Mitigates: DID-TM-ATK-057.
- **REQ-68:** [MUST] Upgradeable contracts MUST use transparent proxies with multi-sig. Mitigates: DID-TM-ATK-057.
- **REQ-69:** [SHOULD] Formal verification of contract logic SHOULD be performed. Mitigates: DID-TM-ATK-057.

#### 24.2 Resolver Requirements

- **REQ-100:** [MUST] Cached DID Documents MUST be cryptographically anchored to the registry. Mitigates: DID-TM-ATK-100.
- **REQ-101:** [MUST] Cache TTLs MUST NOT exceed DID method minimum update propagation time. Mitigates: DID-TM-ATK-100.
- **REQ-102:** [MUST] Cache entries MUST be signed by the method driver and verified. Mitigates: DID-TM-ATK-100.
- **REQ-103:** [MUST] Resolvers MUST validate all DID Document URLs against an allowlist. Mitigates: DID-TM-ATK-101.
- **REQ-104:** [MUST] DID Document fetching MUST execute in a sandboxed network context. Mitigates: DID-TM-ATK-101.
- **REQ-105:** [MUST] DID Document size MUST be limited (RECOMMENDED: 64 KB). Mitigates: DID-TM-ATK-102.
- **REQ-106:** [MUST] JSON-LD context processing MUST be subject to CPU-time limit. Mitigates: DID-TM-ATK-102.
- **REQ-107:** [MUST] Resolvers MUST implement rate limiting per source IP and DID method. Mitigates: DID-TM-ATK-102.
- **REQ-108:** [MUST] Recursive resolution depth MUST be limited to 3. Mitigates: DID-TM-ATK-102.
- **REQ-109:** [MUST] Clients MUST verify DID Documents are cryptographically anchored. Mitigates: DID-TM-ATK-103.
- **REQ-110:** [MUST] Resolver-to-client communication MUST use TLS with certificate pinning. Mitigates: DID-TM-ATK-103.
- **REQ-111:** [MUST] Resolvers MUST execute method drivers in separate processes. Mitigates: DID-TM-ATK-104.
- **REQ-112:** [SHOULD] Driver isolation SHOULD use OS-level containers or WASM sandboxes. Mitigates: DID-TM-ATK-104.
- **REQ-113:** [MUST] Drivers MUST NOT have access to host filesystem or network. Mitigates: DID-TM-ATK-104.
- **REQ-114:** [MUST] Driver resource limits MUST be enforced. Mitigates: DID-TM-ATK-104.
- **REQ-115:** [MUST] Resolvers MUST sanitize all user-supplied input before logging. Mitigates: DID-TM-ATK-105.
- **REQ-116:** [MUST] Logs MUST use structured logging (JSON). Mitigates: DID-TM-ATK-105.
- **REQ-117:** [SHOULD] DID strings SHOULD be validated against DID Core ABNF. Mitigates: DID-TM-ATK-105.
- **REQ-118:** [SHOULD] Resolvers SHOULD add random jitter to resolution responses. Mitigates: DID-TM-ATK-106.
- **REQ-119:** [SHOULD] Clients SHOULD resolve DIDs through anonymizing networks. Mitigates: DID-TM-ATK-106.
- **REQ-120:** [SHOULD] Batch resolution SHOULD be used to hide individual query patterns. Mitigates: DID-TM-ATK-106.

#### 24.3 Wallet Requirements

- **REQ-200:** [MUST] Wallets MUST use OS-provided secure key storage for all private key material. Mitigates: DID-TM-ATK-200.
- **REQ-201:** [MUST] Seed phrases MUST NOT be held decrypted in heap memory beyond minimum required time. Mitigates: DID-TM-ATK-200.
- **REQ-202:** [SHOULD] Wallets SHOULD implement memory hardening (mlock, memset_s before free). Mitigates: DID-TM-ATK-200.
- **REQ-203:** [MUST] Wallets MUST display seed phrases in a secure UI surface. Mitigates: DID-TM-ATK-201.
- **REQ-204:** [RECOMMENDED] Hardware wallets for high-assurance use cases. Mitigates: DID-TM-ATK-201.
- **REQ-205:** [MUST] Wallets MUST use hardware-backed biometric APIs. Mitigates: DID-TM-ATK-202.
- **REQ-206:** [SHOULD] Wallets SHOULD supplement biometric auth with secondary factor for high-value operations. Mitigates: DID-TM-ATK-202.
- **REQ-207:** [MUST] Liveness detection MUST be enforced at the OS level. Mitigates: DID-TM-ATK-202.
- **REQ-208:** [MUST] Wallets MUST NOT allow seed phrase copying to clipboard. Mitigates: DID-TM-ATK-203.
- **REQ-209:** [MUST] If clipboard use necessary, wallets MUST clear clipboard within 30 seconds. Mitigates: DID-TM-ATK-203.
- **REQ-210:** [SHOULD] Desktop wallets SHOULD use secure clipboard APIs. Mitigates: DID-TM-ATK-203.
- **REQ-211:** [MUST] Secure enclave implementations MUST undergo side-channel resistance evaluation. Mitigates: DID-TM-ATK-204.
- **REQ-212:** [SHOULD] Key usage SHOULD be rate-limited. Mitigates: DID-TM-ATK-204.
- **REQ-213:** [MUST] Implementations MUST use constant-time operations within enclaves. Mitigates: DID-TM-ATK-204.
- **REQ-214:** [MUST] Wallets MUST maintain append-only audit logs. Mitigates: DID-TM-ATK-205.
- **REQ-215:** [SHOULD] DID methods SHOULD record key rotations on registry. Mitigates: DID-TM-ATK-205.
- **REQ-216:** [SHOULD] Wallets SHOULD implement monotonic counters. Mitigates: DID-TM-ATK-205.
- **REQ-217:** [MUST] Hardware wallets MUST implement fault detection countermeasures. Mitigates: DID-TM-ATK-206.
- **REQ-218:** [REQUIRED] Security certifications for high-assurance deployments. Mitigates: DID-TM-ATK-206.
- **REQ-219:** [SHOULD] Hardware wallets SHOULD include active shielding. Mitigates: DID-TM-ATK-206.
- **REQ-220:** [MUST] Wallet applications MUST be distributed through official app stores. Mitigates: DID-TM-ATK-207.
- **REQ-221:** [SHOULD] Wallets SHOULD display verified badge at launch. Mitigates: DID-TM-ATK-207.
- **REQ-222:** [MUST] Users MUST be educated that seed phrases should never be entered online. Mitigates: DID-TM-ATK-207.

#### 24.4 Credential and Presentation Requirements

- **REQ-300:** [MUST] VPs MUST include a verifier-provided nonce bound to the proof. Mitigates: DID-TM-ATK-300.
- **REQ-301:** [MUST] Presentation expiry MUST NOT exceed 5 minutes for interactive auth. Mitigates: DID-TM-ATK-300.
- **REQ-302:** [MUST] Verifiers MUST maintain a seen-nonce cache. Mitigates: DID-TM-ATK-300.
- **REQ-303:** [MUST] Credentials MUST include credentialSubject.id. Mitigates: DID-TM-ATK-301.
- **REQ-304:** [MUST] Verifiers MUST verify presentation proof signed by credentialSubject key. Mitigates: DID-TM-ATK-301.
- **REQ-305:** [SHOULD] Issuers SHOULD use link secrets for pseudonymous holders. Mitigates: DID-TM-ATK-301.
- **REQ-306:** [MUST] ZKP proofs MUST use fresh randomness for each generation. Mitigates: DID-TM-ATK-302.
- **REQ-307:** [MUST] Wallets MUST NOT cache or reuse proof components. Mitigates: DID-TM-ATK-302.
- **REQ-308:** [MUST] ZKP libraries MUST be tested for nonce reuse resistance. Mitigates: DID-TM-ATK-302.
- **REQ-309:** [MUST] BBS+ implementations MUST use deterministic variant with binding. Mitigates: DID-TM-ATK-303.
- **REQ-310:** [MUST] Verifiers MUST validate signature public key and canonical form. Mitigates: DID-TM-ATK-303.
- **REQ-311:** [MUST] Domain separation MUST be enforced in hash-to-curve. Mitigates: DID-TM-ATK-303.
- **REQ-312:** [MUST] Revocation registries MUST implement rate limiting. Mitigates: DID-TM-ATK-304.
- **REQ-313:** [MUST] Accumulator-based revocation MUST use witness hiding. Mitigates: DID-TM-ATK-304.
- **REQ-314:** [MUST] Verifiers MUST cache revocation status with circuit breakers. Mitigates: DID-TM-ATK-304.
- **REQ-315:** [MUST] Verifiers MUST validate credential schemas against trusted registries. Mitigates: DID-TM-ATK-305.
- **REQ-316:** [MUST] Credentials MUST include explicit schema version identifiers. Mitigates: DID-TM-ATK-305.
- **REQ-317:** [MUST] Type validation MUST be performed on all claims. Mitigates: DID-TM-ATK-305.
- **REQ-318:** [MUST] Presentation requests MUST be cryptographically signed by verifier. Mitigates: DID-TM-ATK-306.
- **REQ-319:** [MUST] Holders MUST display exact requested claims to user before disclosure. Mitigates: DID-TM-ATK-306.
- **REQ-320:** [SHOULD] Holders SHOULD implement user confirmation per claim category. Mitigates: DID-TM-ATK-306.

#### 24.5 Recovery Requirements

- **REQ-400:** [MUST] Guardian sets MUST be distributed across independent jurisdictions and organizations. Mitigates: DID-TM-ATK-400.
- **REQ-401:** [SHOULD] Threshold t SHOULD be at least 3-of-5 for high-assurance DIDs. Mitigates: DID-TM-ATK-400.
- **REQ-402:** [MUST] Recovery ceremonies MUST require subject's online verification. Mitigates: DID-TM-ATK-400.
- **REQ-403:** [SHOULD] Reconstruction SHOULD occur on subject-controlled device. Mitigates: DID-TM-ATK-400.
- **REQ-404:** [MUST] MPC implementations MUST implement catch-up protocol. Mitigates: DID-TM-ATK-401.
- **REQ-405:** [MUST] Providers MUST refuse participation if epoch skew exceeds maximum. Mitigates: DID-TM-ATK-401.
- **REQ-406:** [MUST] Refresh transcripts MUST be cryptographically verifiable. Mitigates: DID-TM-ATK-401.
- **REQ-407:** [MUST] Recovery coordinators MUST detect epoch skew before signing. Mitigates: DID-TM-ATK-401.
- **REQ-408:** [MUST] VDF difficulty MUST include tolerance factor ≥ 0.3. Mitigates: DID-TM-ATK-402.
- **REQ-409:** [MUST] VDF parameters MUST be periodically revised. Mitigates: DID-TM-ATK-402.
- **REQ-410:** [SHOULD] VDF constructions SHOULD use ASIC-resistant designs. Mitigates: DID-TM-ATK-402.
- **REQ-411:** [MUST] VDF proof verification MUST be by independent verifier. Mitigates: DID-TM-ATK-402.
- **REQ-412:** [MUST] Every submitted VSS share MUST be verified against Feldman commitments. Mitigates: DID-TM-ATK-403.
- **REQ-413:** [MUST] Reconstruction MUST abort if any share verification fails. Mitigates: DID-TM-ATK-403.
- **REQ-414:** [MUST] ZKP proofs MUST be verified for each guardian submission. Mitigates: DID-TM-ATK-403.
- **REQ-415:** [MUST] Recovery method dependency graphs MUST be validated as acyclic. Mitigates: DID-TM-ATK-404.
- **REQ-416:** [MUST] Periodic health checks MUST re-validate acyclicity. Mitigates: DID-TM-ATK-404.
- **REQ-417:** [MAY] Resolvers MAY reject DID Documents with cyclic recovery dependencies. Mitigates: DID-TM-ATK-404.
- **REQ-418:** [MUST] Recovery methods MUST include key rotation commitments. Mitigates: DID-TM-ATK-405.
- **REQ-419:** [SHOULD] Guardians SHOULD provide long-term recovery key. Mitigates: DID-TM-ATK-405.
- **REQ-420:** [SHOULD] Subjects SHOULD periodically verify guardian availability. Mitigates: DID-TM-ATK-405.
- **REQ-421:** [SHOULD] Time-locked inheritance SHOULD use multiple VDF constructions. Mitigates: DID-TM-ATK-406.
- **REQ-422:** [SHOULD] VDF parameters SHOULD have ≥30% security margin. Mitigates: DID-TM-ATK-406.
- **REQ-423:** [MUST] Implementations MUST be prepared to rotate VDF parameters. Mitigates: DID-TM-ATK-406.
- **REQ-424:** [MUST] MPC recovery MUST support provider diversity (minimum 3 providers). Mitigates: DID-TM-ATK-407.
- **REQ-425:** [SHOULD] Subjects SHOULD maintain fallback recovery method. Mitigates: DID-TM-ATK-407.
- **REQ-426:** [MUST] Providers MUST publish availability SLAs. Mitigates: DID-TM-ATK-407.
- **REQ-427:** [MUST] Recovery ceremonies MUST require out-of-band identity verification. Mitigates: DID-TM-ATK-408.
- **REQ-428:** [MUST] Guardians MUST be trained on recovery procedures. Mitigates: DID-TM-ATK-408.
- **REQ-429:** [SHOULD] Multi-factor authentication SHOULD be used for guardian communication. Mitigates: DID-TM-ATK-408.

#### 24.6 Cryptographic Requirements

- **REQ-420:** [MUST] Each VSS participant MUST verify their share against all commitments. Mitigates: DID-TM-ATK-411.
- **REQ-421:** [MUST] Participants with failing shares MUST broadcast complaint. Mitigates: DID-TM-ATK-411.
- **REQ-430:** [MUST] ZKP implementations MUST use domain-separated Fiat-Shamir. Mitigates: DID-TM-ATK-420.
- **REQ-431:** [MUST] ZKP response values MUST be checked to be in [0, q-1]. Mitigates: DID-TM-ATK-420.
- **REQ-432:** [MUST] Fiat-Shamir MUST use SHA-256 or SHA-3-256. Mitigates: DID-TM-ATK-421.
- **REQ-440:** [MUST] VDF parameters MUST include ASIC advantage factor. Mitigates: DID-TM-ATK-430.
- **REQ-441:** [MUST] VDF parameters MUST be versioned and updatable. Mitigates: DID-TM-ATK-430.
- **REQ-442:** [MUST] VDF moduli MUST be generated verifiably random. Mitigates: DID-TM-ATK-431.
- **REQ-443:** [MUST] Modulus generation ceremonies MUST be documented and auditable. Mitigates: DID-TM-ATK-431.
- **REQ-444:** [MUST] VDF input x MUST be verified ∈ QR(N). Mitigates: DID-TM-ATK-431.
- **REQ-450:** [MUST] fROST MUST use deterministic nonce generation per RFC 6979. Mitigates: DID-TM-ATK-440.
- **REQ-451:** [MUST] Participants MUST abort on nonce reuse detection. Mitigates: DID-TM-ATK-440.
- **REQ-452:** [MUST] fROST DKG MUST require KOSK proofs. Mitigates: DID-TM-ATK-441.
- **REQ-460:** [MUST] All cryptographic operations MUST be constant-time. Mitigates: §22.1.
- **REQ-461:** [RECOMMENDED] Hardware wallets SHOULD have CC EAL4+ or FIPS 140-2 L3. Mitigates: §22.2.

#### 24.7 Cross-Cutting Requirements

- **REQ-500:** [SHOULD] Guardian selection SHOULD require VC-based verification. Mitigates: DID-TM-ATK-500.
- **REQ-501:** [SHOULD] Wallets SHOULD warn on shared guardian infrastructure. Mitigates: DID-TM-ATK-500.
- **REQ-502:** [SHOULD] Guardian acceptance SHOULD require proof of unique personhood. Mitigates: DID-TM-ATK-500.
- **REQ-503:** [SHOULD] Clients SHOULD resolve DIDs through privacy-preserving resolvers. Mitigates: DID-TM-ATK-501.
- **REQ-504:** [MUST] Resolver operators MUST document data retention policy. Mitigates: DID-TM-ATK-501.
- **REQ-505:** [SHOULD] Wallets SHOULD prefetch DID Documents during non-sensitive periods. Mitigates: DID-TM-ATK-501.
- **REQ-506:** [MUST] DID method specs MUST document governance model. Mitigates: DID-TM-ATK-502.
- **REQ-507:** [MUST] Governance upgrades MUST include ≥30 day time-lock. Mitigates: DID-TM-ATK-502.
- **REQ-508:** [SHOULD] DID method implementations SHOULD support client-side pinning. Mitigates: DID-TM-ATK-502.
- **REQ-509:** [MUST] Wallet updates MUST be cryptographically signed against downgrades. Mitigates: DID-TM-ATK-503.
- **REQ-510:** [MUST] Wallets MUST implement secure update mechanisms. Mitigates: DID-TM-ATK-503.
- **REQ-511:** [MUST] Wallets MUST refuse to load state from newer versions after downgrade. Mitigates: DID-TM-ATK-503.
- **REQ-512:** [MUST] Verifiers MUST check revocation with atomic reads. Mitigates: DID-TM-ATK-504.
- **REQ-513:** [MUST] Revocation registries MUST provide strong consistency. Mitigates: DID-TM-ATK-504.
- **REQ-514:** [SHOULD] Presentations SHOULD include revocation freshness proof. Mitigates: DID-TM-ATK-504.
- **REQ-515:** [SHOULD] Wallets SHOULD randomize metadata across pairwise DIDs. Mitigates: DID-TM-ATK-505.
- **REQ-516:** [SHOULD] Updates SHOULD be batched to prevent timing correlation. Mitigates: DID-TM-ATK-505.
- **REQ-517:** [SHOULD] Implementations SHOULD use indistinguishable verification methods. Mitigates: DID-TM-ATK-505.

---

### 25. Normative Privacy Requirements

#### 25.1 Selective Disclosure Requirements

- **PRI-100:** [MUST] Issuers MUST support selective disclosure schemes for multi-attribute credentials.
- **PRI-101:** [MUST] Wallets MUST NOT present more claims than explicitly requested.
- **PRI-102:** [SHOULD] Verifiers SHOULD request minimum set of claims (data minimization).

#### 25.2 Unlinkability Requirements

- **PRI-200:** [MUST] Holders MUST use pairwise DIDs for all unlinkable interactions.
- **PRI-201:** [MUST] ZKP proofs MUST achieve proof unlinkability across presentations.
- **PRI-202:** [SHOULD] DID resolution SHOULD be through anonymizing infrastructure where required.

#### 25.3 Minimization Requirements

- **PRI-300:** [MUST] DID Documents MUST NOT contain personal data.
- **PRI-301:** [MUST] Recovery method representations MUST use hashed guardian identifiers. Mitigates: DID-TM-ATK-501.
- **PRI-302:** [SHOULD] Issuers SHOULD issue single-use credentials for sensitive attributes.

---

### 26. Threat-to-Control Traceability Matrix

| Attack | REQ-50/51 | REQ-100/101 | REQ-200/201 | REQ-300/301 | REQ-400/401 | REQ-412/413 | REQ-415 | REQ-450/451 | PRI-200/201 |
|--------|-----------|-------------|-------------|-------------|-------------|-------------|---------|-------------|-------------|
| ATK-050 Smart contract reentrancy | Y | N | N | N | N | N | N | N | N |
| ATK-100 Resolver cache poisoning | N | Y | N | N | N | N | N | N | N |
| ATK-200 Cold boot key extraction | N | N | Y | N | N | N | N | N | N |
| ATK-300 VP replay | N | N | N | Y | N | N | N | N | N |
| ATK-400 Guardian collusion | N | N | N | N | Y | N | N | N | N |
| ATK-403 VSS share pollution | N | N | N | N | P | Y | N | N | N |
| ATK-404 Recovery loop deadlock | N | N | N | N | N | N | Y | N | N |
| ATK-440 fROST nonce reuse | N | N | N | N | N | N | N | Y | N |
| ATK-501 Resolver log correlation | N | N | N | N | N | N | N | N | Y |

*Y = directly addresses; P = partially addresses; N = not addressed*

---

## PART VI — Compliance & Interoperability

### 27. Regulatory and Framework Alignment

#### 27.1 NIST SP 800-63 Digital Identity Guidelines

| Assurance Level | Relevant DID-TM Requirements | Notes |
|-----------------|------------------------------|-------|
| IAL2 | REQ-303, REQ-304 (credential subject binding) | Identity evidence verification referenced by REQ-500 |
| AAL2 | REQ-205 (hardware-backed biometrics), REQ-206 (MFA) | DID method key binding satisfies "something you have" |
| AAL3 | REQ-461 (hardware security), REQ-200 (secure enclave) | Hardware cryptographic module requirement |
| FAL2 | REQ-300 (nonce binding), REQ-302 (nonce cache) | VP with nonce binding satisfies FAL2 replay resistance |

#### 27.2 ISO/IEC 27001 and SOC 2

DID-TM requirements applicable to infrastructure operators map to ISO 27001 controls and SOC 2 Trust Services Criteria. Annex A control A.12.2 maps to REQ-201 and REQ-203. A.14.2.8 maps to test assertions in Appendix A. SOC 2 CC6.1 maps to REQ-200 through REQ-206.

#### 27.3 eIDAS 2.0 / European Digital Identity Wallet

REQ-461 (hardware wallet certification) aligns with eIDAS 2.0 QEAA requirements. Credential format requirements of the EUDI Architecture Reference Framework are satisfied by conformance to REQ-303 through REQ-308.

#### 27.4 W3C DID Core §10–11 Gap Analysis

This specification extends each consideration in DID Core §10–11 into normative requirements with specific attack identifiers and measurable test assertions. The primary gap filled by DID-TM is the absence of a formal threat taxonomy in DID Core — addressed by STRIDE-DID in §4–5.

---

### 28. DID Method Security Profiles

Different DID methods have materially different security properties.

| Method | Registry Trust Model | Highest Exposure Threat Classes | K-Class Profile | Quantum Exposure |
|--------|---------------------|--------------------------------|-----------------|------------------|
| did:web | DNS + HTTPS (centralized) | S (DNS hijack), T (host compromise) | Low; no on-chain key material | High; TLS PKI quantum-vulnerable |
| did:key | None; key material is the DID | K (no rotation possible), D (permanent key loss = DID loss) | Critical; key loss = permanent DID loss | Critical; Ed25519/X25519 broken by quantum |
| did:ion (Sidetree/Bitcoin) | Bitcoin blockchain (PoW) | T (limited; high reorg cost), D (fee griefing) | Medium; recovery key loss is permanent | Medium; ECDSA key exposure quantum-vulnerable |
| did:peer | Out-of-band exchange | S (peer impersonation), R (no audit trail) | High; rotation requires peer re-establishment | Medium; offline key material |

---

## Appendix A: Test Assertions

The following test assertions are normative. A conforming implementation MUST pass all applicable assertions.

```json
{
  "testSuite": "DID-TM-v1",
  "assertions": [
    {
      "id": "DID-TM-TA-001",
      "scope": ["W"],
      "requirement": "REQ-200",
      "description": "Wallet MUST store private keys in OS secure storage",
      "method": "static-analysis",
      "passCriteria": "No private key bytes in cleartext heap or swap",
      "attack": "DID-TM-ATK-200"
    },
    {
      "id": "DID-TM-TA-002",
      "scope": ["V"],
      "requirement": "REQ-300",
      "description": "Verifier MUST reject VP without verifier-issued nonce",
      "method": "protocol-test",
      "passCriteria": "HTTP 400 response when presentation.proof.challenge absent",
      "attack": "DID-TM-ATK-300"
    },
    {
      "id": "DID-TM-TA-003",
      "scope": ["W"],
      "requirement": "REQ-412",
      "description": "VSS reconstruction MUST verify all shares before interpolation",
      "method": "unit-test",
      "passCriteria": "Reconstruction aborts when any share fails Feldman verification",
      "attack": "DID-TM-ATK-403"
    },
    {
      "id": "DID-TM-TA-004",
      "scope": ["M"],
      "requirement": "REQ-415",
      "description": "DID method MUST reject DID Documents with cyclic recovery dependencies",
      "method": "protocol-test",
      "passCriteria": "DID update rejected when recovery dependency graph contains cycle",
      "attack": "DID-TM-ATK-404"
    },
    {
      "id": "DID-TM-TA-005",
      "scope": ["W"],
      "requirement": "REQ-450",
      "description": "fROST implementation MUST use deterministic nonce per RFC 6979",
      "method": "unit-test",
      "passCriteria": "Same (message, key) pair produces identical nonce across invocations",
      "attack": "DID-TM-ATK-440"
    }
  ]
}
```

---

## Appendix B: Threat Register Template

Implementers SHOULD maintain a threat register using the following JSON schema.

```json
{
  "$schema": "https://sirraya.org/schemas/did-tm-threat-register/v1",
  "system": "Example DID Wallet v2.1",
  "assessmentDate": "2026-01-15",
  "assessor": "Security Team, Example Corp",
  "threats": [
    {
      "attackId": "DID-TM-ATK-200",
      "attackName": "Cold Boot Seed Phrase Extraction",
      "class": "K",
      "cvss_did": "9.6",
      "inherentRisk": "Critical",
      "controlsImplemented": ["REQ-200", "REQ-201", "REQ-202"],
      "residualRisk": "Low",
      "residualRiskJustification": "iOS Secure Enclave stores key material; seed cleared from memory; mlock applied to buffers",
      "reviewDate": "2026-07-15"
    }
  ]
}
```

---

## Appendix C: JSON-LD Context

Available at: `https://sirraya.org/ns/did/threat-model/v1.jsonld`

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,
    "id": "@id",
    "type": "@type",
    "ThreatModel": "https://sirraya.org/ns/did/threat-model#ThreatModel",
    "ThreatEntry": "https://sirraya.org/ns/did/threat-model#ThreatEntry",
    "AttackCatalogEntry": "https://sirraya.org/ns/did/threat-model#AttackCatalogEntry",
    "threatModel": { "@id": "https://sirraya.org/ns/did/threat-model#threatModel", "@type": "@id" },
    "attackId": { "@id": "https://sirraya.org/ns/did/threat-model#attackId", "@type": "xsd:string" },
    "threatClass": { "@id": "https://sirraya.org/ns/did/threat-model#threatClass", "@type": "xsd:string" },
    "cvssDid": { "@id": "https://sirraya.org/ns/did/threat-model#cvssDid", "@type": "xsd:decimal" },
    "mitigationRefs": { "@id": "https://sirraya.org/ns/did/threat-model#mitigationRefs", "@type": "xsd:string", "@container": "@list" },
    "residualRisk": { "@id": "https://sirraya.org/ns/did/threat-model#residualRisk", "@type": "xsd:string" },
    "assessmentDate": { "@id": "https://sirraya.org/ns/did/threat-model#assessmentDate", "@type": "xsd:date" }
  }
}
```

---

## Appendix D: References

### Normative References

- **[DID-CORE]** W3C. "Decentralized Identifiers (DIDs) v1.0." W3C Recommendation, 2022.
- **[DID-KR]** Mir, A. H. "DID Key Recovery Specification v1.0.0." Sirraya Labs, 2026.
- **[VC-DATA-MODEL]** W3C. "Verifiable Credentials Data Model 2.0." W3C Recommendation, 2024.
- **[RFC2119]** Bradner, S. "Key words for use in RFCs." IETF RFC 2119, 1997.
- **[RFC8174]** Leiba, B. "Ambiguity of Uppercase vs Lowercase in RFC 2119." IETF RFC 8174, 2017.
- **[RFC6979]** Thomas, P. "Deterministic Usage of DSA and ECDSA." IETF RFC 6979, 2013.
- **[CVSS-31]** FIRST.org. "Common Vulnerability Scoring System v3.1." 2019.
- **[NIST-PQC-2024]** NIST. "Post-Quantum Cryptography Standards." FIPS 203-205, 2024.
- **[NIST-SP-800-63]** NIST. "Digital Identity Guidelines." SP 800-63-3, 2017.

### Informative References

- **[STRIDE-ORIGINAL]** Kohnfelder, L. & Garg, P. "The threats to our products." Microsoft, 1999.
- **[DENG-2011]** Deng, M. et al. "A privacy threat analysis framework." *Requirements Engineering*, 2011.
- **[FELDMAN-1987]** Feldman, P. "A Practical Scheme for Non-interactive VSS." *FOCS*, 1987.
- **[SHAMIR-1979]** Shamir, A. "How to Share a Secret." *CACM*, 1979.
- **[HERZBERG-1995]** Herzberg, A. et al. "Proactive Secret Sharing." *CRYPTO*, 1995.
- **[BONEH-2018]** Boneh, D. et al. "Verifiable Delay Functions." *CRYPTO*, 2018.
- **[BONNEAU-2012]** Bonneau, J. et al. "The Quest to Replace Passwords." *IEEE S&P*, 2012.
- **[HALDERMAN-2008]** Halderman, J. A. et al. "Lest We Remember: Cold Boot Attacks." *USENIX Security*, 2008.
- **[FETT-DID-2019]** Fett, D. et al. "Formal Security Analysis of OpenID Financial-grade API." *IEEE S&P*, 2019.
- **[ATZEI-2017]** Atzei, N. et al. "A Survey of Attacks on Ethereum Smart Contracts." *ICPSS*, 2017.
- **[HEILMAN-2015]** Heilman, E. et al. "Eclipse Attacks on Bitcoin." *USENIX Security*, 2015.
- **[CHAUM-1985]** Chaum, D. "Security without identification." *CACM*, 1985.
- **[MUHLE-2018]** Mühle, A. et al. "A Survey on Self-Sovereign Identity." *Computer Science Review*, 2018.
- **[PEDERSEN-1992]** Pedersen, T. P. "Non-Interactive and Information-Theoretic Secure VSS." *CRYPTO*, 1991.
- **[GENNARO-1996]** Gennaro, R. et al. "Robust Threshold DSS Signatures." *EUROCRYPT*, 1996.

---

## Appendix E: Acknowledgements

The editor wishes to acknowledge the foundational contributions of the cryptographic research community whose work is cited throughout this specification, particularly the authors of the Feldman VSS, proactive secret sharing, and VDF literature. The DID-TM specification builds directly on the security work of the W3C Verifiable Credentials Working Group, the Decentralized Identity Foundation (DIF), and the Trust Over IP Foundation.

Special acknowledgement is due to the researchers whose work established the theoretical foundations that make formal DID Key Recovery Threat Modeling possible: the formalization of Schnorr proofs and their use in threshold schemes (Schnorr 1991), the Fiat-Shamir heuristic (Fiat & Shamir 1987), and the proactive secret sharing framework that underpins MPC-mediated recovery security (Herzberg et al. 1995).

The K-class taxonomy was developed in conjunction with the DID Key Recovery Extension (DID-KR), and the authors of that specification's cryptographic constructions directly informed the K2, K3, and K4 sub-category definitions.

---

© 2026 Sirraya Labs. Licensed under the MIT License.  
**Document identifier:** did-tm-v1.0.0-editors-draft  
**Editor:** Amir Hameed Mir · [amir@sirraya.org](mailto:amir@sirraya.org) · [github.com/sirraya-labs/did-tm](https://github.com/sirraya-labs/did-tm)
```

