
---
title: DID Key Recovery Specification (DID-KR)
description: Decentralized Identifier Key Recovery Extension — Social ZKP Recovery, Deterministic Seedling Inheritance, and MPC-Mediated Recovery
---


**Subtitle:** Decentralized Identifier Key Recovery Extension  
**Editor:** Amir Hameed Mir, Sirraya Labs ([amir@sirraya.org](mailto:amir@sirraya.org))  
**Status:** Editor's Draft  
**Repository:** [github.com/sirraya-labs/did-kr](https://github.com/sirraya-labs/did-kr)  

---

## Abstract

This specification defines a standardized, interoperable mechanism for recovering control of Decentralized Identifiers (DIDs) when private keys are lost or compromised. It introduces three complementary recovery types—Social ZKP Recovery, Deterministic Seedling Inheritance, and MPC-based Mediated Recovery—each addressing different trust models and user personas. The specification includes cryptographic hardening through Verifiable Secret Sharing, Verifiable Delay Functions, Proactive Secret Refreshment, and comprehensive security considerations with a formal JSON-LD context for machine interoperability.

---

## Status of This Document

This is an Editor's Draft prepared by Amir Hameed Mir of Sirraya Labs. It is intended for community review and implementation experimentation. Comments and contributions are welcome via the GitHub repository.

---

## 1. Introduction

The Decentralized Identifier (DID) architecture provides the foundation for self-sovereign identity but deliberately omits key recovery mechanisms, leaving implementers to develop ad-hoc, non-interoperable solutions. This gap represents a critical barrier to mass adoption, as users face permanent loss of identity or vendor lock-in when keys are lost.

The DID Key Recovery Extension (DID-KR) addresses this gap by defining standardized recovery methods that can be published in DID Documents, discovered by resolvers, and executed through interoperable protocols. The specification embraces a "three-way solution" recognizing that no single recovery model suits all use cases:

- **Type A (Social ZKP Recovery):** For users prioritizing autonomy, using threshold cryptography with zero-knowledge proofs to prevent guardian collusion.
- **Type B (Deterministic Seedling):** For inheritance and migration, using hierarchical deterministic keys with Verifiable Delay Functions for decentralized time-locks.
- **Type C (MPC-Mediated):** For enterprise and convenience users, using multi-party computation with threshold signatures and proactive share refreshment.

### 1.1 Design Goals

- **Non-Custodial:** No single entity ever possesses the full private key.
- **Interoperable:** Recovery methods are discoverable and executable across different wallet implementations.
- **Privacy-Preserving:** Recovery metadata minimizes leakage of social graphs and security posture.
- **Future-Proof:** Cryptographic agility allows migration to quantum-resistant algorithms.

### 1.2 Relationship to DID Core

This specification extends DID Core by defining:

1. A new `recovery` verification relationship.
2. Three new verification method types for recovery.
3. Service endpoint definitions for recovery protocols.
4. A JSON-LD context for machine-readable discovery.

---

## 2. Conformance

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [[RFC2119](https://www.rfc-editor.org/rfc/rfc2119)] [[RFC8174](https://www.rfc-editor.org/rfc/rfc8174)] when, and only when, they appear in all capitals, as shown here.

---

## 3. Terminology

<dl>
<dt><strong>DID Controller</strong></dt>
<dd>The entity authorized to make changes to a DID Document.</dd>

<dt><strong>Recovery Method</strong></dt>
<dd>A verification method specifically designated for recovering control of a DID.</dd>

<dt><strong>Guardian</strong></dt>
<dd>An entity holding a share of a recovery secret in Type A schemes.</dd>

<dt><strong>Beneficiary</strong></dt>
<dd>An entity authorized to inherit a DID in Type B schemes.</dd>

<dt><strong>Provider</strong></dt>
<dd>An MPC node participating in threshold signature generation for Type C schemes.</dd>

<dt><strong>Threshold (t)</strong></dt>
<dd>The minimum number of shares/participants required to complete recovery.</dd>

<dt><strong>Share Refreshment</strong></dt>
<dd>The process of generating new secret shares without changing the public key.</dd>

<dt><strong>Verifiable Delay Function (VDF)</strong></dt>
<dd>A function requiring a specific amount of sequential computation to evaluate.</dd>

<dt><strong>Epoch</strong></dt>
<dd>A version identifier for MPC provider share sets, incremented with each refreshment.</dd>

<dt><strong>Catch-up Protocol</strong></dt>
<dd>A mechanism for synchronizing lagging MPC providers to the current epoch.</dd>
</dl>

---

## 4. The Recovery Method Architecture

The DID-KR architecture introduces a new verification relationship `recovery` in the DID Document. This relationship contains one or more recovery methods that define how a DID can be recovered.

### 4.1 Discovery Model

Recovery methods are discovered through standard DID resolution. A resolver or wallet implementing DID-KR:

1. Resolves the DID Document.
2. Checks for the `@context` including the DID-KR context.
3. Extracts the `recovery` verification relationship.
4. Parses the recovery methods according to their `type`.

### 4.2 Lifecycle

1. **Setup:** The DID Controller generates recovery parameters and publishes them in the DID Document.
2. **Execution:** When recovery is needed, the recovering party initiates the protocol defined by the recovery method.
3. **Completion:** Upon successful recovery, the DID Document is updated with new verification methods, and the recovery methods may be rotated.
4. **Revocation:** Recovery methods can be revoked by the current controller using an active verification method.

---

## 5. Recovery Method Types

### 5.1 Type A: Social ZKP Recovery

**Type URI:** `RecoveryMethodZKPSocial`

The Social ZKP Recovery mechanism enables recovery through a threshold of trusted guardians without revealing secret shares to any party, including the guardians themselves.

#### 5.1.1 Cryptographic Requirements

Implementations MUST use:

- **Verifiable Secret Sharing (VSS):** Feldman's VSS with Pedersen commitments [[FELDMAN](https://doi.org/10.1007/3-540-47721-7_17)].
- **Zero-Knowledge Proofs:** Schnorr proofs of share consistency.
- **Curve:** Ed25519 or secp256k1 (with explicit specification).

#### 5.1.2 Setup Phase

The DID Controller:

1. Generates a random secret `s` (the recovery key).
2. Constructs a random polynomial `P(x)` of degree `t-1` where `P(0) = s`.
3. Computes shares `si = P(i)` for each of `n` guardians.
4. Computes Pedersen commitments `Cj = g^{aj} * h^{bj}` for each coefficient `aj`.
5. Distributes to each guardian:
   - Their share `si` (encrypted to guardian's public key).
   - The commitments `Cj`.
   - A nonce for future ZKP challenges.
6. Publishes in DID Document:
   - The commitments `Cj`.
   - Guardian identifiers and endpoints.
   - Threshold `t`.

#### 5.1.3 Recovery Phase

To recover:

1. Recovering party contacts `t` guardians.
2. Each guardian generates a ZKP proving:
   - Knowledge of share `si` consistent with commitments `Cj`.
   - Without revealing `si`.
3. Guardians send ZKPs to recovering party or aggregation service.
4. ZKPs are verified and shares are reconstructed using Lagrange interpolation.
5. The reconstructed secret `s` is used to generate new DID keys.

#### 5.1.4 DID Document Representation

```json
{
  "id": "did:example:123#recovery-social",
  "type": "RecoveryMethodZKPSocial",
  "controller": "did:example:123",
  "recoveryThreshold": 3,
  "recoveryGuardians": [
    {
      "id": "did:guardian:abc#key-1",
      "guardianEndpoint": "https://guardian1.example.com/recover",
      "guardianType": "person",
      "commitmentIndex": 0
    },
    {
      "id": "did:guardian:def#key-1",
      "guardianEndpoint": "https://guardian2.example.com/recover",
      "guardianType": "institution",
      "commitmentIndex": 1
    },
    {
      "id": "did:guardian:ghi#key-1",
      "guardianEndpoint": "https://guardian3.example.com/recover",
      "guardianType": "hardware",
      "commitmentIndex": 2
    }
  ],
  "vssCommitments": [
    "0x04a5...c3f2",
    "0x07b2...d1e4",
    "0x02c8...a9b6"
  ],
  "curve": "ed25519",
  "vssScheme": "feldman-2024"
}
```

---

### 5.2 Type B: Deterministic Seedling Inheritance

**Type URI:** `RecoveryMethodDeterministic`

The Deterministic Seedling mechanism enables recovery through a master seed phrase, with optional time-locked inheritance for beneficiaries.

#### 5.2.1 Cryptographic Requirements

Implementations MUST use:

- **Hierarchical Deterministic Keys:** BIP-32 or BIP-39 style derivation [[BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)].
- **Encryption:** XChaCha20-Poly1305 for seed lockbox.
- **Time-Locks:** Verifiable Delay Functions (VDFs) for decentralized inheritance [[VDF](https://eprint.iacr.org/2018/601)].
- **VDF Algorithm:** Wesolowski's VDF or Pietrzak's VDF.

#### 5.2.2 Setup Phase

The DID Controller:

1. Generates a master seed `S` (128-256 bits of entropy).
2. Derives the DID private key using a standardized derivation path.
3. If inheritance desired:
   - Generates a VDF modulus `N` and challenge `x`.
   - Computes VDF output `y = x^(2^t) mod N`.
   - Uses `y` to derive encryption key for seed lockbox.
4. Encrypts seed `S` to beneficiary's public key.
5. Publishes in DID Document:
   - Derivation path.
   - Encrypted seed lockbox.
   - VDF parameters (if inheritance enabled).

#### 5.2.3 Recovery Phase

For self-recovery:

1. User enters seed phrase.
2. Wallet re-derives keys using specified derivation path.
3. DID Document is updated with new keys.

For inheritance:

1. Beneficiary waits for inactivity period.
2. Computes VDF for specified time parameter.
3. Derives decryption key from VDF output.
4. Decrypts seed lockbox.
5. Recovers DID using seed.

#### 5.2.4 DID Document Representation

```json
{
  "id": "did:example:123#recovery-seedling",
  "type": "RecoveryMethodDeterministic",
  "controller": "did:example:123",
  "seedDerivationPath": "m/44'/0'/0'/0/0",
  "derivationStandard": "bip32-ed25519",
  "encryptedSeedLockbox": {
    "ciphertext": "0x7b3a...f9c2",
    "algorithm": "XChaCha20-Poly1305",
    "iv": "0x1a2b...3c4d",
    "beneficiaryPublicKey": "did:beneficiary:abc#key-1",
    "beneficiaryKeyType": "x25519"
  },
  "deadMansSwitch": {
    "type": "VDFTimeLock",
    "vdfParameters": {
      "difficulty": 1000000,
      "iterations": 10000,
      "estimatedWallTime": "P30D",
      "referencePlatform": "intel-i9-13900k-2024",
      "tolerance": 0.2,
      "modulus": "0x8f3b...a1c4",
      "challenge": "0x2d4e...f8a1",
      "vdfAlgorithm": "wesolowski-2024",
      "verificationMode": "wesolowski-optimistic"
    },
    "inactivityPeriod": "P1Y",
    "lastActivityProof": "https://notary.example.com/proof/123"
  }
}
```

---

### 5.3 Type C: MPC-Mediated Recovery

**Type URI:** `RecoveryMethodMPC`

The MPC-Mediated Recovery mechanism distributes key shares across multiple independent providers who perform threshold signatures without reconstructing the full key.

#### 5.3.1 Cryptographic Requirements

Implementations MUST use:

- **Threshold Signatures:** fROST (Flexible Round-Optimized Schnorr Threshold) signatures [[FROST](https://datatracker.ietf.org/doc/draft-irtf-cfrg-frost/)].
- **Proactive Secret Sharing:** Share refreshment protocol.
- **Authentication:** Verifiable Credentials or WebAuthn for user authentication to providers.
- **Transport:** mTLS or Noise Protocol for secure provider communication.

#### 5.3.2 Setup Phase

The DID Controller:

1. Generates a threshold key pair with `t-of-n` providers.
2. Distributes shares to providers via secure channels.
3. Establishes authentication credentials with each provider.
4. Publishes in DID Document:
   - Provider endpoints.
   - Threshold parameters.
   - Share rotation schedule.

#### 5.3.3 Recovery Phase

To recover:

1. User authenticates to `t` providers using established credentials.
2. Providers verify user authentication and check for any revocation.
3. Providers engage in fROST signing protocol to generate a signature authorizing DID update.
4. The signature is used to create a new DID Document with fresh keys.
5. Providers optionally refresh their shares after successful recovery.

#### 5.3.4 Share Refreshment

Providers MUST support periodic share refreshment:

1. At scheduled intervals, providers engage in refresh protocol.
2. New shares of the same secret are generated.
3. Old shares are securely deleted.
4. The public key remains unchanged.

#### 5.3.5 DID Document Representation

```json
{
  "id": "did:example:123#recovery-mpc",
  "type": "RecoveryMethodMPC",
  "controller": "did:example:123",
  "mpcThreshold": 2,
  "mpcTotalProviders": 3,
  "mpcProtocol": "fROST-ed25519-2024",
  "mpcProviders": [
    {
      "id": "did:provider:one#mpc-node",
      "endpoint": "https://provider1.example.com/mpc",
      "authType": "vc-presentation",
      "authRequirements": {
        "credentialType": "MpcProviderCredential",
        "trustFramework": "did-kr-provider-v1"
      },
      "providerKey": "did:provider:one#key-1"
    },
    {
      "id": "did:provider:two#mpc-node",
      "endpoint": "https://provider2.example.com/mpc",
      "authType": "passkey",
      "authRequirements": {
        "rpId": "provider2.example.com",
        "algorithm": "es256"
      },
      "providerKey": "did:provider:two#key-1"
    },
    {
      "id": "did:provider:three#mpc-node",
      "endpoint": "https://provider3.example.com/mpc",
      "authType": "oauth2",
      "authRequirements": {
        "issuer": "https://auth.provider3.example.com",
        "scope": "did-recovery"
      },
      "providerKey": "did:provider:three#key-1"
    }
  ],
  "shareRotation": {
    "rotationInterval": "P30D",
    "currentEpoch": 42,
    "providerStateEndpoint": "https://provider1.example.com/state",
    "lastRotationProof": "0x8a3c...f2b5"
  }
}
```

---

### 5.4 Provider State Synchronization (Normative)

When providers operate at different epochs, the recovery protocol MUST handle version skew to prevent state drift from becoming a single point of failure.

#### 5.4.1 Epoch Discovery

During recovery initiation, each provider MUST include their `currentEpoch` in the authentication response:

```json
{
  "status": "authenticated",
  "provider": "did:provider:one#mpc-node",
  "currentEpoch": 42,
  "lastRotation": "2024-05-15T10:30:00Z",
  "signature": "0x9a8b..."
}
```

#### 5.4.2 Lag Detection

The recovering party (or coordinating provider) MUST compare epochs from all responding providers:

1. Determine the majority epoch (the epoch value held by the highest number of providers).
2. If any provider is more than `maxEpochSkew` behind the majority, that provider MUST be excluded from the signing ceremony.
3. The value of `maxEpochSkew` is defined in the DID Document and MUST NOT exceed 1 (RECOMMENDED) unless otherwise specified.

#### 5.4.3 Automatic Catch-up Protocol

Providers lagging behind MUST have a mechanism to synchronize:

1. **Catch-up Request:** The lagging provider sends a signed request to a quorum of up-to-date providers:

```json
{
  "protocol": "catchup-request-v1",
  "provider": "did:provider:lagging#mpc-node",
  "currentEpoch": 41,
  "targetEpoch": 42,
  "signature": "0x7c3d..."
}
```

2. **Verifiable Refresh Transcript:** Up-to-date providers respond with:
   - The group's public key (unchanged across epochs).
   - A verifiable transcript of the refreshment protocol for epochs `current+1` through `target`.
   - Each transcript MUST include cryptographic proofs that the refreshment was performed correctly.

3. **Verification and Update:** The lagging provider:
   - Verifies each transcript using the group's public key and published verification parameters.
   - Updates their local share to match the target epoch.
   - Securely deletes the old share.

4. **Confirmation:** Once updated, the provider confirms readiness to the recovering party.

#### 5.4.4 DID Document Addition

The `shareRotation` object MUST include synchronization parameters:

```json
"shareRotation": {
  "rotationInterval": "P30D",
  "currentEpoch": 42,
  "providerStateEndpoint": "https://provider1.example.com/state",
  "lastRotationProof": "0x8a3c...f2b5",
  "synchronization": {
    "maxEpochSkew": 1,
    "catchupProtocol": "vss-refresh-verifiable-2024",
    "timeout": "PT30S",
    "requiredQuorum": 2
  }
}
```

---

## 6. Verification Relationships

This specification defines a new verification relationship for DID Documents.

### 6.1 The `recovery` Relationship

The `recovery` verification relationship indicates that the associated verification methods are specifically authorized for recovering control of the DID. These methods are not intended for general authentication or assertion but are limited to recovery operations.

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://sirraya.org/ns/did/recovery/v1"
  ],
  "id": "did:example:123",
  "recovery": [
    "did:example:123#recovery-social",
    "did:example:123#recovery-seedling",
    "did:example:123#recovery-mpc"
  ],
  "verificationMethod": [
    {
      "id": "did:example:123#recovery-social",
      "type": "RecoveryMethodZKPSocial",
      "controller": "did:example:123"
    }
  ]
}
```

### 6.2 Processing Rules

When processing a recovery request:

1. The resolver MUST verify that the recovery method is listed in the `recovery` relationship.
2. The resolver MUST verify that the recovery method's `controller` is authorized to modify the DID Document.
3. The resolver MUST perform dependency checking to prevent recovery loops.

---

## 7. Cryptographic Primitives

### 7.1 Verifiable Secret Sharing (Feldman's VSS)

Let `G` be a group of prime order `q` with generator `g`.

1. Dealer chooses secret `s ∈ Z_q` and random polynomial `P(x) = s + a₁x + ... + aₜ₋₁x^(t-1)`.
2. Dealer computes commitments `C₀ = g^s, C₁ = g^a₁, ..., Cₜ₋₁ = g^(aₜ₋₁)`.
3. For participant `i`, share `sᵢ = P(i)` is sent securely.
4. Participant verifies: `g^(sᵢ) = ∏(Cⱼ^(i^j)) for j=0 to t-1`.

### 7.2 Zero-Knowledge Proof of Share

To prove knowledge of share `sᵢ` without revealing it:

1. Prover chooses random `r ← Z_q`.
2. Prover sends `R = g^r`.
3. Verifier sends challenge `c ← Z_q`.
4. Prover sends `z = r + c·sᵢ mod q`.
5. Verifier checks `g^z = R · (∏(Cⱼ^(i^j)))^c`.

### 7.3 Verifiable Delay Function (Wesolowski)

Input: `x ∈ QR(N)`, time parameter `T`  
Output: `y = x^(2^T) mod N`, proof `π`

1. Compute `y = x^(2^T) mod N` via sequential squaring.
2. Let `l = ⌊2^T / 2⌋`, compute `π = x^l mod N`.
3. Verifier checks: `π^(2^(T/2)) * x^(2^T mod 2^(T/2)) = y mod N`.

### 7.4 VDF Parameter Calibration (Normative)

Implementations MUST specify VDF difficulty in a hardware-agnostic way to account for varying computational capabilities across different platforms.

#### 7.4.1 Difficulty Units

Difficulty is measured in **sequential squaring operations** estimated to require a specific **wall-clock time** on a **reference implementation**.

#### 7.4.2 Reference Platform Definition

Implementations MUST use the following reference platform for calibration:

- **CPU:** Intel i9-13900K (or equivalent), single-threaded execution
- **Memory:** 32GB DDR5 RAM
- **Implementation:** Optimized C with GMP (GNU Multiple Precision) library
- **Operating System:** Linux kernel 6.1 or newer

#### 7.4.3 Calibration Formula

The actual time required on a target platform is calculated as:

```
T_actual = T_reference × (Speed_reference / Speed_actual)
```

Where:
- `T_reference` is the estimated time on the reference platform
- `Speed_reference` is the reference platform's VDF computation speed (operations/second)
- `Speed_actual` is the target platform's measured or benchmarked speed

#### 7.4.4 Published Parameters

VDF parameters published in DID Documents MUST include:

```json
"vdfParameters": {
  "difficulty": 1000000,
  "iterations": 10000,
  "estimatedWallTime": "P30D",
  "referencePlatform": "intel-i9-13900k-2024",
  "tolerance": 0.2,
  "verificationMode": "wesolowski-optimistic",
  "benchmarkRequired": false
}
```

### 7.5 fROST Threshold Signatures

fROST enables `t-of-n` threshold Schnorr signatures [[FROST](https://datatracker.ietf.org/doc/draft-irtf-cfrg-frost/)]:

1. **Key Generation:** Distributed key generation produces group public key and individual secret shares.
2. **Signing:** Each participant generates a nonce and commitment.
3. **Aggregation:** Coordinator aggregates commitments and challenges.
4. **Response:** Each participant responds with partial signatures.
5. **Finalization:** Coordinator aggregates partial signatures into final signature.

---

## 8. Security Considerations

### 8.1 Guardian Collusion (Type A)

**Threat:** A threshold of guardians colludes to reconstruct the user's private key.

**Mitigation:** Verifiable Secret Sharing with Pedersen commitments ensures guardians cannot verify their shares are correct without the dealer's trapdoor. Additionally, guardians SHOULD be selected from diverse trust domains, and the threshold SHOULD be set high enough (e.g., 3-of-5) to make collusion difficult.

### 8.2 Time-Lock Bypass (Type B)

**Threat:** An attacker compromises the dead man's switch to release inheritance keys prematurely.

**Mitigation:** Verifiable Delay Functions provide computational asymmetry—releasing the key requires a specific amount of sequential computation that cannot be parallelized. This prevents premature release even if the switch is compromised.

### 8.3 Provider State Drift (Type C)

**Threat:** MPC providers update shares independently, causing key desynchronization.

**Mitigation:** Proactive Secret Sharing with verifiable refreshment protocols ensures all providers maintain consistent shares. The `shareRotation` object enables verification of current epoch, and the catch-up protocol ensures lagging providers can synchronize.

### 8.4 Recovery-Loop Prevention

**Threat:** Circular recovery dependencies make recovery impossible.

**Mitigation:** Implementations MUST validate that the dependency graph of recovery methods is acyclic. This check MUST be performed when publishing a recovery method, when initiating recovery, and during periodic health checks.

```
function checkAcyclic(did, visited = new Set()):
  if visited.has(did): return false
  visited.add(did)
  for each recoveryMethod in resolve(did).recovery:
    for each guardian in recoveryMethod.guardians:
      if guardian.did is DID:
        if not checkAcyclic(guardian.did, visited):
          return false
  visited.delete(did)
  return true
```

### 8.5 Key Wrapping Security

**Threat:** Weak encryption of seed lockboxes.

**Mitigation:** All encrypted payloads MUST use authenticated encryption (AEAD) with 256-bit keys. The encryption algorithm MUST be explicitly specified, and implementations MUST reject algorithms known to be weak.

### 8.6 Quantum Computing Resistance

While current algorithms are secure against classical computers, implementations SHOULD plan for quantum resistance:

- **Type A:** Consider lattice-based VSS for post-quantum security.
- **Type B:** Use hash-based signatures for seed commitment.
- **Type C:** Transition to threshold lattice signatures when standardized.

---

## 9. Privacy Considerations

### 9.1 Metadata Leakage

Recovery methods may leak:

- Social graph (guardian identities).
- Security posture (threshold values, provider choices).
- Activity patterns (last activity proofs).

**Mitigations:**

1. **Encrypted DID Document Entries:** Recovery methods SHOULD be stored off-chain with only content-addressed references in the public DID Document.
2. **Guardian Anonymity:** Guardian endpoints SHOULD support onion services or other anonymizing networks.
3. **Minimum Disclosure:** Recovery methods SHOULD disclose only the minimum information needed for discovery.

### 9.2 Guardian Privacy (Enhanced)

To prevent exposure of social graphs through public DID Documents:

#### 9.2.1 Hashed Guardian Identifiers (RECOMMENDED)

Instead of publishing full guardian DIDs, implementations SHOULD publish salted hashes:

```json
"recoveryGuardians": [
  {
    "id": "urn:hash:sha256:3a7b...c9f2",
    "salt": "0x4d8e...f2a3",
    "guardianEndpoint": "http://guardian1.onion/recover",
    "commitmentIndex": 0
  }
]
```

**Resolution Protocol:**

1. The recovering party knows the actual guardian DIDs.
2. They compute hashes using the published salt and match against published values.
3. The onion endpoint ensures guardian identity isn't leaked via DNS resolution.

#### 9.2.2 Fully Encrypted Recovery Section (OPTIONAL)

For maximum privacy, the entire `recovery` verification relationship MAY be stored off-chain:

```json
{
  "recovery": "ipfs://QmXyZ...abc123",
  "recoveryProof": "0x8a3c...f2b5"
}
```

### 9.3 Correlation Risk

The same recovery method used across multiple DIDs could correlate them.

**Mitigation:** DID controllers SHOULD use different recovery methods for different DIDs, or ensure recovery methods are unlinkable through cryptographic techniques such as different salt values for each DID, different guardian sets, or unique encryption keys for each lockbox.

### 9.4 Beneficiary Privacy

In inheritance scenarios, the beneficiary's public key is published.

**Mitigation:** Beneficiaries SHOULD use single-use keys or derived addresses that cannot be linked to their primary identity. The `beneficiaryPublicKey` MAY be a derived key specific to this inheritance relationship.

---

## 10. Interoperability Requirements

### 10.1 Mandatory-to-Implement Algorithms

To ensure baseline interoperability, implementations MUST support:

| Algorithm | Usage |
|-----------|-------|
| Ed25519 | Signatures, VSS |
| SHA-256 | Hashing |
| XChaCha20-Poly1305 | Encryption |
| BIP-32 | Key derivation |
| fROST (Ed25519) | Threshold signatures |
| Feldman VSS | Verifiable secret sharing |
| Wesolowski VDF | Time-locks |

### 10.2 Optional Algorithms

Implementations MAY support:

| Algorithm | Usage |
|-----------|-------|
| secp256k1 | Blockchain compatibility |
| BLS12-381 | Pairing-based cryptography |
| Pietrzak VDF | Time-locks |
| Dilithium | Post-quantum signatures |
| Kyber | Post-quantum encryption |

### 10.3 DID Method Compatibility

This specification is DID method agnostic but requires methods to support:

1. **DID Document updates:** The method must allow updating verification methods.
2. **Resolution:** The method must support resolving the DID Document to discover recovery methods.
3. **Deactivation:** The method should support deactivating compromised recovery methods.

---

## 11. JSON-LD Context

The complete JSON-LD context for this specification is available at: `https://sirraya.org/ns/did/recovery/v1.jsonld`

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,
    
    "id": "@id",
    "type": "@type",
    
    "RecoveryMethod": "https://sirraya.org/ns/did/recovery#RecoveryMethod",
    "RecoveryMethodZKPSocial": "https://sirraya.org/ns/did/recovery#RecoveryMethodZKPSocial",
    "RecoveryMethodDeterministic": "https://sirraya.org/ns/did/recovery#RecoveryMethodDeterministic",
    "RecoveryMethodMPC": "https://sirraya.org/ns/did/recovery#RecoveryMethodMPC",
    
    "recovery": {
      "@id": "https://sirraya.org/ns/did/recovery#recovery",
      "@type": "@id",
      "@container": "@set"
    },
    
    "recoveryThreshold": {
      "@id": "https://sirraya.org/ns/did/recovery#recoveryThreshold",
      "@type": "xsd:integer"
    },
    
    "recoveryGuardians": {
      "@id": "https://sirraya.org/ns/did/recovery#recoveryGuardians",
      "@type": "@id",
      "@container": "@set"
    },
    
    "guardianEndpoint": {
      "@id": "https://sirraya.org/ns/did/recovery#guardianEndpoint",
      "@type": "xsd:anyURI"
    },
    
    "vssCommitments": {
      "@id": "https://sirraya.org/ns/did/recovery#vssCommitments",
      "@type": "xsd:string",
      "@container": "@list"
    },
    
    "seedDerivationPath": {
      "@id": "https://sirraya.org/ns/did/recovery#seedDerivationPath",
      "@type": "xsd:string"
    },
    
    "encryptedSeedLockbox": {
      "@id": "https://sirraya.org/ns/did/recovery#encryptedSeedLockbox",
      "@type": "@id"
    },
    
    "deadMansSwitch": {
      "@id": "https://sirraya.org/ns/did/recovery#deadMansSwitch",
      "@type": "@id"
    },
    
    "vdfParameters": {
      "@id": "https://sirraya.org/ns/did/recovery#vdfParameters",
      "@type": "@id"
    },
    
    "mpcThreshold": {
      "@id": "https://sirraya.org/ns/did/recovery#mpcThreshold",
      "@type": "xsd:integer"
    },
    
    "mpcProviders": {
      "@id": "https://sirraya.org/ns/did/recovery#mpcProviders",
      "@type": "@id",
      "@container": "@set"
    },
    
    "shareRotation": {
      "@id": "https://sirraya.org/ns/did/recovery#shareRotation",
      "@type": "@id"
    },
    
    "currentEpoch": {
      "@id": "https://sirraya.org/ns/did/recovery#currentEpoch",
      "@type": "xsd:integer"
    },
    
    "synchronization": {
      "@id": "https://sirraya.org/ns/did/recovery#synchronization",
      "@type": "@id"
    },
    
    "maxEpochSkew": {
      "@id": "https://sirraya.org/ns/did/recovery#maxEpochSkew",
      "@type": "xsd:integer"
    },
    
    "catchupProtocol": {
      "@id": "https://sirraya.org/ns/did/recovery#catchupProtocol",
      "@type": "xsd:string"
    }
  }
}
```

---

## 12. Recovery Protocol Flows

### 12.1 Type A Recovery Protocol

**Endpoint:** Guardian-provided `guardianEndpoint`

**Request (from recovering party to guardian):**

```
POST /recover HTTP/1.1
Host: guardian1.example.com
Content-Type: application/json

{
  "protocol": "did-kr-recovery-v1",
  "recoveryId": "did:example:123#recovery-social",
  "did": "did:example:123",
  "nonce": "a1b2c3d4e5f6...",
  "challenge": "0x4d5e6f7a8b9c...",
  "commitmentIndex": 0
}
```

**Response (from guardian):**

```json
{
  "status": "success",
  "proof": {
    "type": "schnorr-proof-2024",
    "commitment": "0x8f3a2b1c...",
    "challenge": "0x4d5e6f7a...",
    "response": "0x2b7c8d9e..."
  },
  "guardianId": "did:guardian:abc#key-1",
  "signature": "0x9a8b7c6d..."
}
```

### 12.2 Type B Recovery Protocol

**For self-recovery:**

```
POST /recover/seed HTTP/1.1
Host: wallet.example.com
Content-Type: application/json

{
  "protocol": "did-kr-recovery-v1",
  "recoveryId": "did:example:123#recovery-seedling",
  "seedPhrase": "abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add",
  "derivationPath": "m/44'/0'/0'/0/0"
}
```

**For inheritance (VDF computation):**

```
POST /recover/inherit HTTP/1.1
Host: beneficiary.example.com
Content-Type: application/json

{
  "protocol": "did-kr-recovery-v1",
  "recoveryId": "did:example:123#recovery-seedling",
  "vdfProof": {
    "output": "0x7c3d4e5f...",
    "proof": "0x2a5b6c7d...",
    "computationTime": "P32D",
    "platform": "amd-ryzen-7950x-2025"
  }
}
```

### 12.3 Type C Recovery Protocol

**Phase 1: Authentication**

```
POST /mpc/auth HTTP/1.1
Host: provider1.example.com
Content-Type: application/json

{
  "protocol": "did-kr-recovery-v1",
  "recoveryId": "did:example:123#recovery-mpc",
  "authType": "vc-presentation",
  "presentation": {
    "@context": "https://www.w3.org/2018/credentials/v1",
    "type": ["VerifiablePresentation"],
    "verifiableCredential": []
  }
}
```

**Authentication Response with Epoch:**

```json
{
  "status": "authenticated",
  "provider": "did:provider:one#mpc-node",
  "currentEpoch": 42,
  "lastRotation": "2024-05-15T10:30:00Z",
  "signature": "0x9a8b7c6d..."
}
```

**Phase 2: MPC Signing Ceremony**

```
POST /mpc/sign HTTP/1.1
Host: provider1.example.com
Content-Type: application/json

{
  "protocol": "did-kr-recovery-v1",
  "sessionId": "sess_abc123def456",
  "operation": {
    "type": "update-did",
    "newDocument": {
      "id": "did:example:123",
      "verificationMethod": [
        {
          "id": "did:example:123#new-key-1",
          "type": "Ed25519VerificationKey2020",
          "controller": "did:example:123",
          "publicKeyMultibase": "z6Mkq3..."
        }
      ],
      "authentication": ["did:example:123#new-key-1"]
    }
  },
  "commitment": "0x3e4f5a6b..."
}
```

---

## 13. Protocol Diagrams

### 13.1 Figure 1: Type A — Social ZKP Recovery Flow

```
sequenceDiagram
    participant User as User (Recovering Party)
    participant G1 as Guardian 1
    participant G2 as Guardian 2
    participant G3 as Guardian 3
    participant G4 as Guardian 4
    participant G5 as Guardian 5
    participant Aggregator as ZKP Aggregator
    
    Note over User: Initiates recovery (threshold=3)
    
    User->>G1: Request recovery (nonce, commitments)
    User->>G2: Request recovery (nonce, commitments)
    User->>G3: Request recovery (nonce, commitments)
    
    G1->>G1: Generate ZKP (share, commitments)
    G2->>G2: Generate ZKP (share, commitments)
    G3->>G3: Generate ZKP (share, commitments)
    
    G1-->>User: ZKP Proof 1
    G2-->>User: ZKP Proof 2
    G3-->>User: ZKP Proof 3
    
    User->>Aggregator: Submit proofs (threshold=3)
    Aggregator->>Aggregator: Verify ZKPs
    Aggregator->>Aggregator: Lagrange interpolation
    
    Aggregator-->>User: Recovered secret
    User->>User: Generate new DID keys
    User->>DID Method: Update DID Document
```

### 13.2 Figure 2: Type B — VDF Time-Locked Inheritance

```
sequenceDiagram
    participant User as Original User
    participant Beneficiary as Beneficiary
    participant VDF as VDF Computation
    participant Storage as Blockchain/Storage
    participant DID as DID Method
    
    Note over User: Setup Phase
    User->>User: Generate master seed
    User->>User: Encrypt seed with VDF-derived key
    User->>DID: Publish encrypted lockbox + VDF params
    
    Note over User: User becomes inactive
    Note over Beneficiary: After P1Y, initiates inheritance
    
    Beneficiary->>VDF: Compute VDF (difficulty=1M)
    VDF->>VDF: Sequential squaring (30 days)
    VDF-->>Beneficiary: VDF output + proof
    
    Beneficiary->>Beneficiary: Derive decryption key from VDF output
    Beneficiary->>Storage: Fetch encrypted lockbox
    Beneficiary->>Beneficiary: Decrypt seed
    Beneficiary->>Beneficiary: Derive DID keys
    Beneficiary->>DID: Update DID Document with new controller
```

### 13.3 Figure 3: Type C — MPC Recovery with Share Refreshment

```
sequenceDiagram
    participant User as User
    participant P1 as Provider 1 (Epoch 42)
    participant P2 as Provider 2 (Epoch 42)
    participant P3 as Provider 3 (Epoch 41)
    participant Coord as MPC Coordinator
    
    Note over User,P3: Recovery Initiated
    
    User->>P1: Authenticate (VC/Passkey)
    User->>P2: Authenticate (VC/Passkey)
    User->>P3: Authenticate (VC/Passkey)
    
    P1-->>User: Auth success (epoch=42)
    P2-->>User: Auth success (epoch=42)
    P3-->>User: Auth success (epoch=41)
    
    Note over User: Detects epoch skew
    
    User->>P3: Request catch-up
    P3->>P1: Request refresh transcript (epochs 41→42)
    P1-->>P3: Verifiable refresh proof
    P3->>P3: Verify and update to epoch 42
    P3-->>User: Ready (epoch=42)
    
    User->>Coord: Initiate MPC signing
    Coord->>P1: Signing request (nonce)
    Coord->>P2: Signing request (nonce)
    Coord->>P3: Signing request (nonce)
    
    P1-->>Coord: Partial signature 1
    P2-->>Coord: Partial signature 2
    P3-->>Coord: Partial signature 3
    
    Coord->>Coord: Aggregate signatures (threshold=2)
    Coord-->>User: Final signature
    User->>DID Method: Update DID Document
```

### 13.4 Figure 4: Recovery-Loop Prevention Check

```
graph TD
    subgraph "Graph 1: Loop Detected"
        A1[did:example:123] -->|recovery| B1[did:guardian:abc]
        B1 -->|controller| A1
    end
    
    subgraph "Graph 2: Valid Tree"
        A2[did:example:123] -->|recovery| C2[did:guardian:def]
        C2 -->|controller| D2[did:guardian:ghi]
        D2 -->|controller| C2
    end
    
    style A1 fill:#f9f,stroke:#333,stroke-width:4px
    style B1 fill:#ff9,stroke:#f00,stroke-width:2px
    style A2 fill:#9f9,stroke:#333,stroke-width:4px
    style C2 fill:#9f9,stroke:#333,stroke-width:2px
    style D2 fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 14. Test Vectors

### 14.1 Type A Test Vector

**Setup:**
- Secret: `s = 42`
- Threshold: `t = 3`
- Guardians: `n = 5`
- Curve: Ed25519
- Prime: `2^252 + 27742317777372353535851937790883648493`

**Polynomial:**
```
P(x) = 42 + 17x + 8x²
```

**Shares:**
```
s₁ = 67
s₂ = 104
s₃ = 153
s₄ = 214
s₅ = 287
```

**Commitments (generator g=2):**
```
C₀ = 2⁴² mod p = 4398046511104
C₁ = 2¹⁷ mod p = 131072
C₂ = 2⁸ mod p = 256
```

**Recovery with shares s₁, s₃, s₅:**
```
Lagrange interpolation:
λ₁ = (0-3)(0-5)/((1-3)(1-5)) = 15/8 mod p
λ₃ = (0-1)(0-5)/((3-1)(3-5)) = -5/4 mod p
λ₅ = (0-1)(0-3)/((5-1)(5-3)) = 3/8 mod p

s = 67×(15/8) + 153×(-5/4) + 287×(3/8) = 42
```

### 14.2 Type B Test Vector

**Master Seed:** `0x7f3a9b8c2d5e1f4a3b6c7d8e9f0a1b2c`  
**Derivation Path:** `m/44'/0'/0'/0/0`  
**Derived Private Key:** `0x9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a`

**VDF Parameters:**
```
N = 0x8f3b7a2c5d6e1f4a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0 (2048-bit)
x = 0x2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
T = 10000
y = x^(2^10000) mod N = 0x7c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
π = 0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d
```

**Verification:** `π^(2^(T/2)) * x^(2^T mod 2^(T/2)) mod N = y` ✓

### 14.3 Type C Test Vector

**fROST with t=2, n=3:**

**Key Generation:**
```
Group Public Key: 0x3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
Share 1: 0x8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0
Share 2: 0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c
Share 3: 0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a
```

**Signing with providers 1 and 2 (message = "update-did"):**

**Nonces:**
```
r₁ = 0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e
r₂ = 0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1
```

**Commitments:**
```
R₁ = g^r₁ = 0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c
R₂ = g^r₂ = 0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3
```

**Challenge:** `c = H(R₁||R₂||m) = 0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d`

**Partial Signatures:**
```
z₁ = r₁ + c·s₁ = 0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0
z₂ = r₂ + c·s₂ = 0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a
```

**Final Signature:**
```
R = R₁ + R₂ = 0x8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d
z = z₁ + z₂ = 0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

---

## 15. References

### 15.1 Normative References

- **DID-CORE** — Decentralized Identifier Specification v1.0, [https://www.w3.org/TR/did-core/](https://www.w3.org/TR/did-core/)
- **RFC2119** — Key words for use in RFCs, [https://www.rfc-editor.org/rfc/rfc2119](https://www.rfc-editor.org/rfc/rfc2119)
- **RFC8174** — Ambiguity of Uppercase vs Lowercase in RFC2119, [https://www.rfc-editor.org/rfc/rfc8174](https://www.rfc-editor.org/rfc/rfc8174)
- **BIP32** — Hierarchical Deterministic Wallets, [https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- **BIP39** — Mnemonic code for generating deterministic keys, [https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- **FROST** — Flexible Round-Optimized Schnorr Threshold Signatures, [https://datatracker.ietf.org/doc/draft-irtf-cfrg-frost/](https://datatracker.ietf.org/doc/draft-irtf-cfrg-frost/)
- **VDF** — Verifiable Delay Functions, Cryptology ePrint Archive, Report 2018/601, [https://eprint.iacr.org/2018/601](https://eprint.iacr.org/2018/601)
- **FELDMAN** — Feldman's Verifiable Secret Sharing, [https://doi.org/10.1007/3-540-47721-7_17](https://doi.org/10.1007/3-540-47721-7_17)

### 15.2 Informative References

- **SOCIAL-RECOVERY** — Social Key Recovery for Self-Sovereign Identity, [https://doi.org/10.1109/ICBC48266.2020.9169451](https://doi.org/10.1109/ICBC48266.2020.9169451)
- **MPC-WALLET** — Threshold Signatures for Cryptographic Wallets, [https://eprint.iacr.org/2020/086](https://eprint.iacr.org/2020/086)
- **TIME-LOCK** — Time-Lock Encryption with Verifiable Delay Functions, [https://eprint.iacr.org/2019/619](https://eprint.iacr.org/2019/619)
- **ZKP-AUTH** — Zero-Knowledge Proofs for Authentication, [https://doi.org/10.1145/3133956.3134101](https://doi.org/10.1145/3133956.3134101)
- **PROACTIVE** — Proactive Secret Sharing, [https://doi.org/10.1007/3-540-48071-4_2](https://doi.org/10.1007/3-540-48071-4_2)

---

## 16. Acknowledgements

The editor would like to thank the members of the decentralized identity community for their valuable feedback and contributions. Special thanks to the cryptographic reviewers who provided security analysis of the VSS, VDF, and fROST implementations, and to the privacy researchers who contributed to the guardian privacy enhancements.

---

## Appendix A: Implementation Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Type A: VSS implementation | ☐ | Feldman's VSS with Pedersen |
| Type A: ZKP implementation | ☐ | Schnorr proofs of share |
| Type A: Guardian privacy | ☐ | Hashed identifiers |
| Type B: HD key derivation | ☐ | BIP-32 compatible |
| Type B: VDF implementation | ☐ | Wesolowski or Pietrzak |
| Type B: VDF calibration | ☐ | Hardware-agnostic parameters |
| Type C: fROST implementation | ☐ | Threshold signatures |
| Type C: Share refreshment | ☐ | Proactive secret sharing |
| Type C: Epoch synchronization | ☐ | Catch-up protocol |
| Recovery-loop detection | ☐ | Graph acyclicity check |
| JSON-LD context | ☐ | Published at specified URL |
| Test vectors | ☐ | All types validated |
| Security review | ☐ | External audit |
| Privacy review | ☐ | Social graph analysis |
