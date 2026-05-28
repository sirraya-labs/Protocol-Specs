
---
title: Trust Decay Framework Specification (TDF)
description: A Confidence-Based Classification System for Digital Credentials — Time-Decay Mechanics, Cryptographic Heartbeats, Zero-Knowledge Risk Proofs, and Privacy-Preserving Trust Assessment
---

# Trust Decay Framework Specification (TDF)

**A Confidence-Based Classification System for Digital Credentials**  
**Time-Decay Mechanics, Cryptographic Heartbeats, Zero-Knowledge Risk Proofs, and Privacy-Preserving Trust Assessment**

**Sirraya Labs** • Open Specification • April 2026  
*Version 1.0.0* — `Editor's Draft`

---

### Navigation
- [Abstract](#abstract)
- [1. Introduction](#1-introduction)
- [2. Core Concepts](#2-core-concepts)
- [3. Trust Levels](#3-trust-levels)
- [4. Credential Format](#4-credential-format)
- [5. Trust Decay Calculation](#5-trust-decay-calculation)
- [6. Proofs and Heartbeats](#6-proofs-and-heartbeats)
- [7. Risk Signals](#7-risk-signals)
- [8. Cryptographic Requirements](#8-cryptographic-requirements)
- [9. Privacy Considerations](#9-privacy-considerations)
- [10. Implementation Guidelines](#10-implementation-guidelines)
- [11. Security Considerations](#11-security-considerations)
- [12. References](#12-references)

---

## Abstract

The **Trust Decay Framework (TDF)** defines a standardized approach for assessing and expressing the current trustworthiness of a digital credential over time. Trust is not static—it naturally diminishes without ongoing evidence of security and identity consistency. This specification provides a mechanism for credentials to carry a confidence level that decays according to predictable rules and can be refreshed through cryptographic proofs, heartbeat mechanisms, and risk assessment.

Built on established standards including W3C Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs), TDF enables issuers to create credentials with an initial trust level, and verifiers to evaluate the current trust level based on age, cryptographic strength, zero-knowledge proofs, and risk signals.

> **About This Document**
> This is an open specification developed by Sirraya Labs. It is intended for implementation experimentation and community feedback. All content is licensed under the MIT License.

---

## 1. Introduction

In digital identity systems, trust in a credential must not be treated as permanent. A credential issued today may demonstrate diminished trustworthiness tomorrow if the holder's device changes, if suspicious activity is detected, or simply because time has elapsed without re-verification.

The Trust Decay Framework addresses this challenge by introducing:
- **Confidence Levels** — A four-tier trust hierarchy (Levels 1-4)
- **Time-Based Decay** — Trust naturally diminishes according to defined half-life parameters
- **Refresh Mechanisms** — Heartbeats and cryptographic proofs restore or maintain trust
- **Risk Signals** — Anomalous events trigger immediate trust reduction
- **Privacy Preservation** — Pairwise identifiers and zero-knowledge proofs prevent correlation

### 1.1 Design Principles
- **Privacy by Default** — No global identifiers; only pairwise relationships are established
- **Decentralized Trust** — No central authority is required for verification
- **Cryptographic Agility** — Support for both classical and post-quantum algorithms
- **Deterministic Calculation** — Trust levels are computed algorithmically, not subjectively assigned
- **Open Standard** — Freely implementable without licensing restrictions

> **Example: Financial Services Application**
> A banking institution requires Level 3 (High Trust) for wire transfers. A user holds a Level 4 (Maximum Trust) credential active for 45 days. The system calculates the current trust level, determines it has decayed to Level 3, and grants access accordingly.

---

## 2. Core Concepts

### 2.1 Terminology
- **Confidence Level**
  A four-tier classification (Level 1 through Level 4) indicating the current trustworthiness of a credential. Level 4 represents the highest degree of trust.

- **Trust Half-Life**
  The period after which confidence decreases by 50% in the absence of refreshment activity.

- **Heartbeat**
  A cryptographic proof demonstrating that the credential holder retains control, serving to slow or reverse trust decay.

- **Risk Signal**
  An observable event that may indicate compromised security, triggering immediate trust reduction according to severity classification.

- **Zero-Knowledge Proof (ZKP)**
  A cryptographic method enabling proof of a statement's validity without revealing the underlying data. Applied to verify risk status while preserving information confidentiality.

- **Pairwise Identifier**
  A unique identifier derived for each relationship context, preventing correlation across different services.

---

## 3. Trust Levels

The framework defines four confidence levels. Each level possesses distinct characteristics, proof requirements, and decay properties.

| Level | Name | Half-Life | Typical Use Cases | Required Proofs |
| :--- | :--- | :--- | :--- | :--- |
| Level 1 | Basic Trust | 7 days | Anonymous access, low-risk services | None |
| Level 2 | Standard Trust | 90 days | Standard enterprise, retail banking | No recent high-risk activity (24h) |
| Level 3 | High Trust | 90 days | High-value banking, corporate access | No high-risk + device consistency (7d) |
| Level 4 | Maximum Trust | 30 days | Government services, critical systems | No high-risk + device consistency (30d) + stable location (72h) |

> **Rationale for Variable Half-Lives**
> Higher trust levels mandate more frequent refreshment because they authorize access to increasingly sensitive resources. Level 4 decays within 30 days, whereas Level 2 may persist for 90 days without renewal.

### 3.1 Trust Operations
**Demotion:** When trust decays or risk signals are detected, the confidence level decreases. A Level 4 credential transitions to Level 3 after sufficient decay has accumulated.

**Promotion:** When valid heartbeats are provided, trust may increase. A Level 2 credential accompanied by a valid biometric heartbeat may be promoted to Level 3.

> Promotion is bounded by the credential's original issuance level. A Level 2 credential cannot attain Level 4 through heartbeat mechanisms alone.

---

## 4. Credential Format

A Trust Decay credential extends the standard Verifiable Credential format with confidence level parameters.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://spec.sirraya.com/tdf/v1"
  ],
  "id": "urn:uuid:3c4c7e5d-8b2a-4f1e-9c6d-7a3b8e2f5c1d",
  "type": ["VerifiableCredential", "TrustDecayCredential"],
  "issuer": "did:example:issuer123",
  "issuanceDate": "2026-04-01T10:00:00Z",
  "expirationDate": "2027-04-01T10:00:00Z",
  "credentialSubject": {
    "id": "did:example:holder456",
    "confidenceLevel": "Level4",
    "assessmentPolicy": "https://spec.sirraya.com/tdf/policies/v1",
    "validFrom": "2026-04-01T10:00:00Z",
    "validUntil": "2027-04-01T10:00:00Z"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-04-01T10:00:00Z",
    "verificationMethod": "did:example:issuer123#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5hNqKjVkG8P3qR2sT1uVwX9yZ4aB6cD7eF8gH9iJ0kL1"
  }
}
```

### 4.1 Credential Fields
- `confidenceLevel` — The initial trust level assigned at issuance (Level1, Level2, Level3, Level4)
- `assessmentPolicy` — URL referencing the policy employed for trust assessment
- `validFrom` — Timestamp from which trust decay calculation commences
- `validUntil` — Absolute expiration timestamp after which the credential becomes invalid

---

## 5. Trust Decay Calculation

The current trust level is derived through a deterministic formula accounting for credential age, cryptographic strength, and available proofs.

### 5.1 Decay Formula

```
DecayFactor = 2 ^ (-(EffectiveAge × CryptoMultiplier) / HalfLife)
```

Where:
- **EffectiveAge** — Actual age minus time offset from valid heartbeats
- **CryptoMultiplier** — 1 for quantum-resistant algorithms, 5 for quantum-vulnerable algorithms
- **HalfLife** — Determined by initial confidence level (30, 90, or 180 days)

The resulting trust level mapping:
- `DecayFactor > 0.75` — No demotion
- `DecayFactor > 0.5` — Demote one level
- `DecayFactor > 0.25` — Demote two levels
- `DecayFactor ≤ 0.25` — Demote three levels (minimum trust)

> **Decay Calculation Example**
> A Level 4 credential (half-life 30 days) issued 45 days prior with no heartbeats recorded:
>
> ```
> EffectiveAge = 45 days
> HalfLife = 30 days
> DecayExponent = -(45 × 1) / 30 = -1.5
> DecayFactor = 2 ^ (-1.5) = 0.3535
> ```
>
> Since 0.3535 exceeds 0.25, the credential is demoted two levels: Level 4 to Level 2.

---

## 6. Proofs and Heartbeats

Credential holders may furnish cryptographic proofs to decelerate decay or restore trust levels.

### 6.1 Proof Types

| Proof Type | What It Proves | Effect on Trust | Validity Period |
| :--- | :--- | :--- | :--- |
| No High-Risk Activity | No security alerts in the last 24 hours | Required for Level 2 and above | 24 hours |
| Device Consistency (7d) | Same device used for 7 days | Enables Level 3 | 7 days |
| Device Consistency (30d) | Same device used for 30 days | Enables Level 4 | 30 days |
| Stable Location (72h) | Geographic location stable for 72 hours | Enables Level 4 | 72 hours |

### 6.2 Heartbeat Types
- **Biometric Heartbeat** — Zero-knowledge proof confirming recent biometric verification. Resets trust decay (maximum three resets permitted).
- **Proof of Possession** — Demonstrates continued control of private key material. May promote trust by one level.
- **Liveness Check** — Confirms physical presence of the holder. Restores trust to the initial issuance level.

```json
{
  "method": "ZkBiometric",
  "issuedAt": "2026-04-01T12:00:00Z",
  "validUntil": "2026-04-08T12:00:00Z",
  "walletSignature": "0x7a3b8e2f5c1d9e4f...",
  "nonce": "0x8b2a4f1e9c6d...",
  "zkCommitment": "0x3c4c7e5d8b2a..."
}
```

---

## 7. Risk Signals

Risk signals indicate potential security concerns and may trigger immediate trust reduction according to severity classification.

### 7.1 Signal Types

| Signal Type | Description | Default Action |
| :--- | :--- | :--- |
| Device Change | Authentication from a previously unseen device | Demote to Level 2 |
| Geographic Anomaly | Location inconsistent with established behavioral patterns | Temporary demotion (2 hours) |
| Behavioral Anomaly | Unusual usage patterns detected | Require heartbeat verification (15 min) |
| Concurrent Session | Multiple simultaneous authentication sessions | Depends on severity assessment |
| Velocity Anomaly | Unusually rapid sequence of actions | Depends on severity assessment |

### 7.2 Severity Levels
- **Low** — Minor anomaly; additional verification required
- **Medium** — Notable deviation from baseline; temporary demotion applied
- **High** — Significant risk indicator; immediate demotion enforced
- **Critical** — Severe threat detected; immediate demotion to Level 1

---

## 8. Cryptographic Requirements

### 8.1 Supported Algorithms

| Algorithm | Status | Quantum Resistance | Requirement |
| :--- | :--- | :--- | :--- |
| Ed25519 | Approved | No | REQUIRED |
| ML-DSA-44 | Quantum Resistant | Yes | RECOMMENDED |
| ML-DSA-65 | Quantum Resistant | Yes | OPTIONAL |
| Hybrid Ed25519-ML-DSA | Hybrid | Yes | OPTIONAL |

### 8.2 Quantum Considerations
Implementations SHOULD support hybrid cryptographic modes combining traditional and quantum-resistant algorithms. Cryptographic profiles affect trust calculations as follows:

- **Quantum-Resistant** — No additional decay multiplier applied
- **Quantum-Vulnerable** — 5× decay multiplier enforced (trust decays five times faster)
- **Deprecated/Revoked** — Immediate demotion to Level 1

---

## 9. Privacy Considerations

Privacy constitutes a foundational concern in trust assessment. This framework incorporates privacy-preserving mechanisms throughout its design.

### 9.1 Pairwise Identifiers
Implementers SHOULD employ pairwise identifiers unique to each relationship rather than global identifiers. This prevents correlation across different services.

```
PairwiseID = HMAC(RootKey, RelationshipContext || ServiceIdentifier)
```

The same holder interacting with distinct services presents different identifiers, rendering cross-service correlation infeasible without access to the root key.

### 9.2 Zero-Knowledge Proofs
Risk proofs SHOULD be implemented as zero-knowledge proofs:

- **NoHighRisk24h** — Proves no high-risk alerts exist without disclosing the nature or absence of specific alerts
- **DeviceConsistency** — Proves device stability without revealing device fingerprinting data
- **GeoStable** — Proves location stability without exposing actual geographic coordinates

### 9.3 Nullifiers
Each proof includes a nullifier to prevent replay attacks while preserving unlinkability. Nullifiers are derived from the holder's root key and a context value, ensuring they cannot be correlated across different contexts.

---

## 10. Implementation Guidelines

### 10.1 State Management
Implementations SHOULD maintain credential state including:
- The credential object and its current trust level
- All active ZK risk proofs with their respective validity periods
- Heartbeat proofs and reset counts
- Active risk indicators and temporary demotion records
- Timestamps of the most recent evaluation

### 10.2 Caching Strategy
- **L1 (Memory)** — Frequently accessed credentials; retrieval under 1ms
- **L2 (Local)** — Recently accessed credentials; retrieval under 10ms
- **L3 (Distributed)** — Network-accessible cache; retrieval under 100ms

### 10.3 Policy Evaluation

```json
{
  "serviceId": "HighValueBanking",
  "requiredLevel": "Level3",
  "requiredProofs": ["NoHighRisk24h", "DeviceConsistency30d"],
  "maxCredentialAge": 604800,
  "acceptHeartbeats": true,
  "requireQuantumReady": false
}
```

### 10.4 Decision Types
- **Granted** — All requirements satisfied. Access permitted.
- **Reauthentication Required** — Credentials expired or required proofs absent.
- **Denied** — Access refused. Fallback action initiated.

---

## 11. Security Considerations

### 11.1 Attack Mitigations

| Attack Type | Mitigation |
| :--- | :--- |
| Replay Attacks | Nonces in heartbeats, timestamp validation, nullifiers in ZK proofs |
| Key Compromise | Key rotation protocol with defined grace periods and revocation mechanisms |
| Sybil Attacks | Proof-of-work requirements for node identifiers, reputation systems |
| Man-in-the-Middle | End-to-end encryption with authenticated key exchange |

### 11.2 Key Rotation Protocol
1. **Pre-rotation** — Generate new key material; create updated DID Document
2. **Rotation** — Sign rotation proof; accept both old and new keys during transition
3. **Post-rotation** — Remove old key after grace period elapses (7 days)

---

## 12. References

### 12.1 Normative References
- [W3C Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA)](https://www.rfc-editor.org/rfc/rfc8032)

### 12.2 Informative References
- [Sirraya Labs — Trust Decay Framework Repository](https://github.com/sirrayalabs/trust-decay-framework)
- [W3C Verifiable Credentials with Zero-Knowledge Proofs](https://www.w3.org/TR/vc-zkp/)

---

*Trust Decay Framework (TDF) — Version 1.0.0*  
*Developed by Sirraya Labs • Open Source • MIT License*  
[GitHub Repository](https://github.com/sirrayalabs/trust-decay-framework) | [Specification Home](https://spec.sirraya.com/tdf)
```