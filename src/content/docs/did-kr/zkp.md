---
title: DataIntegrityGroth16Proof2026 Cryptosuite Specification v1.0
---



---


**Editors:**  
Amir Hameed Mir Sirraya Labs
Irtiqa Latif Sirraya Labs


---

## Abstract

This specification defines the `DataIntegrityGroth16Proof2026` cryptographic suite for the purpose of creating, verifying, and presenting Verifiable Credentials with selective disclosure capabilities. The suite utilizes Groth16 zero-knowledge Succinct Non-interactive ARguments of Knowledge (zk-SNARKs) over the BN254 elliptic curve in combination with Poseidon hashing for circuit-efficient commitments and Ed25519 signatures for issuer authentication. The specification provides perfect zero-knowledge, cryptographic unlinkability, and non-malleability for credential presentations while maintaining full conformance with the W3C Verifiable Credentials Data Model v2.0 [[VC-DATA-MODEL-2.0]] and Data Integrity [[VC-DATA-INTEGRITY]] specifications. Support for composite credentials, social recovery of holder contexts, scalable nonce tracking, and on-chain verification via EIP-197 precompiles is defined.



---

## 1. Introduction

### 1.1 Background

*This section is non-normative.*

The Verifiable Credentials Data Model v2.0 [[VC-DATA-MODEL-2.0]] establishes a standard for expressing credentials on the Web in a manner that is cryptographically secure, privacy-respecting, and machine-verifiable. The Data Integrity specification [[VC-DATA-INTEGRITY]] provides mechanisms for securing Verifiable Credentials and Verifiable Presentations using cryptographic proofs.

Traditional Data Integrity suites such as `eddsa-2022` and `ecdsa-rdfc-2019` provide integrity and authentication guarantees but require full disclosure of all credential claims during presentation. This creates privacy challenges in scenarios requiring minimal disclosure, such as age verification or attribute-specific authorization.

The `DataIntegrityGroth16Proof2026` suite addresses these limitations by incorporating zero-knowledge proofs that enable holders to selectively disclose credential attributes while maintaining cryptographic verifiability. The suite achieves this through a combination of Groth16 zk-SNARKs for privacy-preserving proofs, Poseidon hashing for efficient arithmetic circuit operations, and Ed25519 signatures for issuer binding.

### 1.2 Use Cases and Requirements

*This section is non-normative.*

The following use cases outline scenarios where this suite provides privacy and security benefits beyond traditional signature-based cryptosuites.

**Age Verification:** A holder needs to prove they meet a minimum age requirement to access a service. The credential contains the holder's birthdate, but the holder only needs to disclose whether they meet the age threshold. This suite enables proving the predicate without revealing the underlying birthdate.

**Identity Verification with Minimal Disclosure:** A holder needs to prove their legal name to complete a transaction but does not wish to reveal their address, identification number, or other personal information contained in the same credential. The suite enables selecting specific attributes for disclosure while keeping others cryptographically hidden.

**Healthcare Credential Presentation:** A patient needs to prove vaccination status to travel internationally. The credential contains vaccination dates, lot numbers, administering facility, and patient identifiers. The suite enables presenting only the vaccination status and date while keeping all other medical information private.

**Digital Rights Management:** A subscriber needs to prove active subscription status to access content. The credential contains account creation date, payment history, and subscription tier. The suite enables proving only the active status without revealing billing or account details.

**Regulatory Compliance:** A financial institution needs to verify customer accreditation status without accessing the customer's full financial profile. The suite enables proving accreditation qualification while keeping asset values and income details confidential.

**On-Chain Credential Verification:** Smart contracts need to verify credential presentations on-chain for decentralized governance or token-gated access. The BN254 curve selection enables efficient verification via EIP-197 precompiled contracts.

### 1.3 Design Philosophy and Goals

*This section is non-normative.*

The `DataIntegrityGroth16Proof2026` suite is designed according to the following principles:

**Privacy by Design:** Zero-knowledge properties are enforced at the cryptographic layer rather than through policy controls. This ensures that even if a verifier acts maliciously, they cannot extract information beyond what is explicitly disclosed.

**Standard Compatibility:** The suite operates within the existing W3C Verifiable Credentials framework, using standard proof structures, verification methods, and status mechanisms. Verifiers that do not support this suite can reject proofs through standard error pathways.

**Minimal Trust Assumptions:** The only trust assumption is in the Groth16 common reference string generation, which can be distributed through multi-party computation ceremonies. The issuing, holding, and verification processes do not require trust between parties.

**Provable Security:** All privacy and security properties are reducible to well-established cryptographic assumptions: the q-type assumption over BN254 for soundness, the random oracle model for Poseidon, EUF-CMA security for Ed25519, and authenticated encryption security for AES-256-GCM.

**Operational Practicality:** While privacy is prioritized, the specification acknowledges real-world constraints including proving time, verification latency, credential size, holder recovery mechanisms, and revocation management.

**Post-Quantum Awareness:** While not post-quantum secure (as with all current pairing-based schemes), the specification is designed to accommodate future migration to post-quantum ZK systems as they mature.

### 1.4 Terminology

*This section is normative.*

The following terms are used throughout this specification with the meanings defined in [[VC-DATA-MODEL-2.0]]: *claim*, *credential*, *credential subject*, *decentralized identifier*, *holder*, *issuer*, *presentation*, *verifiable credential*, *verifiable presentation*, and *verifier*.

The following terms are defined in [[VC-DATA-INTEGRITY]]: *cryptosuite*, *data integrity proof*, *proof options*, *proof purpose*, *proof type*, and *verification method*.

This specification defines the following additional terms:

**Attribute Commitment:** A single elliptic curve scalar field element that cryptographically binds a set of attributes with a random blinding factor such that the commitment reveals no information about the attributes while preventing modification. Computed using Poseidon hash over all attributes and the blinding factor.

**Selective Disclosure:** The ability of a holder to reveal a subset of credential attributes to a verifier while keeping other attributes cryptographically hidden, with mathematical guarantees that the revealed attributes match those in the original commitment.

**Zero-Knowledge Proof:** A cryptographic proof that demonstrates knowledge of hidden attributes and their relationship to a commitment without revealing the attributes themselves. In this suite, implemented via Groth16 zk-SNARKs.

**Common Reference String (CRS):** Public parameters generated during a trusted setup ceremony that are required for generating and verifying Groth16 proofs. Consists of a proving key (used by holders) and verifying key (used by verifiers).

**Selection Mask:** A binary vector of length 16 indicating which attributes are revealed (value 1) and which remain hidden (value 0) in a given presentation.

**Toxic Waste:** Secret random values generated by participants during the trusted setup ceremony. If retained, these values would enable forgery of zero-knowledge proofs. Proper ceremony execution requires destruction of toxic waste after contribution.

**Composite Credential:** A credential that splits attributes across multiple component credentials when the total attribute count exceeds the 16-attribute per-commitment limit. Components are cryptographically linked via a linking commitment.

**Linking Commitment:** A Poseidon hash over all component commitments in a composite credential, ensuring that all components belong to the same original credential.

**Social Recovery:** A mechanism enabling holders to recover their encrypted context if the primary passphrase is lost, using Shamir Secret Sharing to distribute recovery shares among trusted contacts.

**Nonce Tracker:** A verifier-side component that records used nonces to prevent replay attacks within the 300-second proof validity window.

### 1.5 Conformance

*This section is normative.*

As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.

The key words *MUST*, *MUST NOT*, *REQUIRED*, *SHALL*, *SHALL NOT*, *SHOULD*, *SHOULD NOT*, *RECOMMENDED*, *MAY*, and *OPTIONAL* in this document are to be interpreted as described in [[RFC2119]].

A **conforming implementation** is an implementation that satisfies all normative statements in Sections 3 through 10 of this specification.

A conforming implementation:

- *MUST* implement all cryptographic parameters as specified in Section 3.
- *MUST* implement the trusted setup procedures described in Section 4.
- *MUST* implement the credential issuance algorithm in Section 5.
- *MUST* implement the presentation generation algorithm in Section 6.
- *MUST* implement the verification algorithm in Section 7.
- *SHOULD* implement the revocation mechanism in Section 8.
- *MUST* implement the composite credential handling in Section 9.
- *SHOULD* implement the holder recovery architecture in Section 10.
- *MUST* implement all required constant-time operations specified in Section 11.5.

A **conforming document** is either:

- A Verifiable Credential secured with a proof of type `DataIntegrityGroth16Proof2026` that satisfies all requirements in Section 5.
- A Verifiable Presentation containing a proof of type `DataIntegrityGroth16Proof2026` that satisfies all requirements in Section 6.

A **conforming processor** is a software module that produces conforming documents when following the algorithms in this specification and correctly verifies conforming documents using the verification algorithm.

---

## 2. Data Model

### 2.1 Suite Identifier

*This section is normative.*

The cryptosuite identifier for this specification is the URI:

```
https://w3id.org/security/suites/groth16-2026/v1
```

The proof type identifier is the string:

```
DataIntegrityGroth16Proof2026
```

### 2.2 Proof Representation

*This section is normative.*

A data integrity proof using this suite *MUST* be represented as a JSON object with the following properties:

| Property | Description | Required | JSON Type |
|----------|-------------|----------|-----------|
| `type` | The proof type identifier | Yes | String |
| `created` | ISO 8601 datetime of proof creation | Yes | String (datetime) |
| `verificationMethod` | URI identifying the verification method | Yes | String (URI) |
| `proofPurpose` | The purpose of the proof | Yes | String |
| `proofValue` | Base64-encoded proof data | Yes | String |
| `domain` | Domain parameters object | Yes | Object |

**Proof Type:** The `type` property *MUST* equal `"DataIntegrityGroth16Proof2026"`.

**Created:** The `created` property *MUST* be an [[ISO8601]] datetime string in UTC timezone, accurate to at least one second. Format: `YYYY-MM-DDTHH:MM:SSZ`.

**Verification Method:** The `verificationMethod` property *MUST* be a URI that dereferences to an Ed25519 public key for issuer signature verification. The URI *SHOULD* use the `did:key` method or equivalent resolvable DID method.

**Proof Purpose:** For credential issuance, the `proofPurpose` *MUST* be `"assertionMethod"`. For presentations, the `proofPurpose` *MUST* be `"authentication"`.

**Proof Value:** For issuance proofs, the `proofValue` *MUST* contain the Base64-encoded Ed25519 signature (64 bytes before encoding). For presentation proofs, the `proofValue` *MUST* contain the Base64-encoded compressed Groth16 proof (192 bytes before encoding).

**Domain:** The `domain` object *MUST* be present and contain the properties defined in Section 2.3.

### 2.3 Domain Parameters

*This section is normative.*

The `domain` object within a proof *MUST* contain the following properties:

| Property | Description | Required | JSON Type |
|----------|-------------|----------|-----------|
| `commitment` | Hex-encoded attribute commitment (32 bytes) | Yes | String |
| `credentialId` | Credential identifier | Yes | String (URI) |

For presentation proofs, the `domain` object *MUST* additionally contain:

| Property | Description | Required | JSON Type |
|----------|-------------|----------|-----------|
| `nonce` | Hex-encoded 32-byte random value | Yes | String |
| `timestamp` | UNIX timestamp (seconds since epoch) | Yes | Integer |

For composite credential presentations, the `domain` object *MUST* additionally contain:

| Property | Description | Required | JSON Type |
|----------|-------------|----------|-----------|
| `linkingCommitment` | Hex-encoded linking commitment (32 bytes) | Yes | String |

### 2.4 Presentation-Specific Properties

*This section is normative.*

Presentation proofs *MUST* include the following additional properties beyond those in Section 2.2:

| Property | Description | Required | JSON Type |
|----------|-------------|----------|-----------|
| `challenge` | Verifier-provided challenge string | Yes | String |
| `revealedAttributes` | Map of disclosed attribute URIs to values | Yes | Object |
| `issuerSignature` | Base64-encoded issuer's Ed25519 signature | Yes | String |
| `issuer` | Issuer's DID | Yes | String (URI) |

### 2.5 Revocation Status

*This section is normative.*

When revocation support is enabled, the issuance proof *MUST* include a `credentialStatus` property conforming to the StatusList2021 specification [[VC-STATUS-LIST]]:

```json
{
  "credentialStatus": {
    "id": "https://issuer.example/status/123#0",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListIndex": "0",
    "statusListCredential": "https://issuer.example/status/123"
  }
}
```

### 2.6 Credential Composition for Extended Attributes

*This section is normative.*

When a credential schema requires more attributes than the maximum supported by a single commitment (16 attributes), issuers *MUST* use credential composition to split attributes across multiple component credentials.

A composite credential *MUST* structure its subject as follows:

```json
{
  "credentialSubject": {
    "components": [
      {
        "id": "urn:credential:component:1",
        "type": "DataIntegrityGroth16Proof2026Component",
        "commitment": "hex-encoded-32-byte-commitment"
      },
      {
        "id": "urn:credential:component:2",
        "type": "DataIntegrityGroth16Proof2026Component",
        "commitment": "hex-encoded-32-byte-commitment"
      }
    ],
    "linkingCommitment": "hex-encoded-poseidon-hash-of-all-component-commitments"
  }
}
```

Each component credential *MUST* be independently issued and contain no more than 16 attributes. The linking commitment *MUST* be computed as:

```
linkingCommitment = Poseidon(component_commitments[0], ..., component_commitments[n-1], "CompositeLinking")
```

Presentations *MAY* include proofs from multiple components in a single Verifiable Presentation. The linking commitment *MUST* be included in every presentation proof's public inputs to ensure verifiers can cryptographically verify that all components belong to the same original credential.

### 2.7 Holder Recovery Metadata

*This section is normative.*

When social recovery is enabled, the holder context encryption *SHOULD* include recovery metadata:

```json
{
  "recovery": {
    "type": "ShamirSecretSharing",
    "threshold": 2,
    "totalShares": 3,
    "shareCommitments": [
      "sha256-hash-of-share-1",
      "sha256-hash-of-share-2",
      "sha256-hash-of-share-3"
    ],
    "recoveryService": "https://recovery.example/api/v1/recover",
    "timelockPeriod": "P30D",
    "notificationContacts": [
      "mailto:holder@example.com",
      "did:example:trusted-contact-a",
      "did:example:trusted-contact-b"
    ]
  }
}
```

---

## 3. Cryptographic Parameters

### 3.1 Elliptic Curve and Groups

*This section is normative.*

This suite operates over the BN254 elliptic curve (also known as AltBN128), a pairing-friendly Barreto-Naehrig curve with a 254-bit prime field.

**Curve Equation:**

```
E: y² = x³ + 3
```

**Base Field Fp (for curve point coordinates):**

```
p = 21888242871839275222246405745257275088548364400416034343698204186575808495617
  = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47
```

**Scalar Field Fr (subgroup order, for witnesses and hash inputs):**

```
r = 21888242871839275222246405745257275088548364400416034343698204186575808495617
  = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
```

**Important Distinction:** The base field modulus `p` and scalar field modulus `r` are distinct values. Field element validation for witness values *MUST* use `r` (the subgroup order), while validation of point coordinates *MUST* use `p` (the base field modulus). Conflating these values can lead to incorrect rejection of valid scalars or acceptance of invalid field elements.

**Group Definitions:**

- **G₁:** The subgroup of E(Fp) of order r. G₁ points are represented in compressed form as 32 bytes (x-coordinate with sign bit).
- **G₂:** The subgroup of E'(Fp²) of order r, where E' is the sextic twist of E. G₂ points are represented in compressed form as 64 bytes.
- **Gₜ:** The subgroup of r-th roots of unity in the multiplicative group of Fp¹².

**Group Generators:**

```
G₁ Generator (compressed, hex):
  0x0000000000000000000000000000000000000000000000000000000000000001

G₂ Generator (compressed, hex):
  0x0000000000000000000000000000000000000000000000000000000000000001
  0x0000000000000000000000000000000000000000000000000000000000000002
```

**Cofactor:** The cofactor for G₁ is 1 (BN254 G₁ has prime order). Implementations *SHOULD* verify this property during curve initialization.

**Pairing:** The optimal Ate pairing `e: G₁ × G₂ → Gₜ` is used for Groth16 proof verification. This pairing is compatible with EIP-197 precompiled contracts at address `0x08` on Ethereum and compatible networks.

**Serialization Format:**

- G₁ points: 32-byte compressed form (x-coordinate only, with top bit of y encoded in sign bit)
- G₂ points: 64-byte compressed form (x-coordinate over Fp²)
- Fr elements: 32-byte big-endian for external representation, little-endian internally

### 3.2 Poseidon Hash Function

*This section is normative.*

The Poseidon hash function [[POSEIDON]] is used for all arithmetic-circuit-compatible hashing operations including attribute commitment and challenge binding.

**Poseidon Configuration:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| Full rounds (RF) | 8 | Number of full S-box rounds |
| Partial rounds (RP) | 56 | Number of partial S-box rounds |
| S-box exponent (α) | 5 | S-box function x^α |
| State width (t) | 3 | State elements (rate = 2, capacity = 1) |
| Security level | 128 bits | Target security level against Gröbner basis attacks |
| Field | Fr | BN254 scalar field |

**Parameter Integrity Verification:**

Conforming implementations *MUST* verify the Poseidon parameter hash before any use. The verification procedure is:

```
1. Serialize Poseidon parameters using canonical compressed representation
2. Compute SHA-256 over the canonical little-endian byte representation
3. Compare against reference hash:
   0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
4. If mismatch, ABORT with "PARAMETER_CORRUPTION" error
```

For environments where parameters are embedded at compile time, a build-time check *MAY* replace the runtime verification:

```rust
// Compile-time verification (optional alternative)
const POSEIDON_PARAMS_HASH: [u8; 32] = sha256_const(include_bytes!("poseidon_params.bin"));
const EXPECTED_HASH: [u8; 32] = hex!("7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
const _: () = assert!(constant_time_eq(&POSEIDON_PARAMS_HASH, &EXPECTED_HASH));
```

**Parameters Initialization:**

Implementations *MUST* instantiate Poseidon parameters exactly once and cache them for all subsequent operations. The parameters *MUST NOT* be regenerated for each hash operation. Implementations *SHOULD* use a thread-safe lazy initialization pattern (e.g., `OnceLock` in Rust, `static` with `sync.Once` in Go, or `lazy_static` in C++).

### 3.3 Blake2b Hash Function

*This section is normative.*

Blake2b [[RFC7693]] is used for domain separation, attribute preprocessing, and all non-circuit hashing operations.

**Blake2b Configuration:**

| Parameter | Value |
|-----------|-------|
| Output length | 32 bytes (256 bits) |
| Key length | 0 bytes (unkeyed mode) |
| Personalization string | "DI-Groth16" (exactly 10 bytes, zero-padded to 16) |

**Usage Pattern:**

```
hash = Blake2b(DOMAIN_SEP || domain_tag || data)
```

The personalization string ensures domain separation from other Blake2b uses.

### 3.4 Ed25519 Signature Algorithm

*This section is normative.*

Ed25519 [[RFC8032]] is used for issuer authentication and commitment signing.

**Ed25519 Parameters:**

| Parameter | Value |
|-----------|-------|
| Algorithm | EdDSA over Curve25519 |
| Private key length | 32 bytes |
| Public key length | 32 bytes |
| Signature length | 64 bytes |
| Hash function | SHA-512 |
| Security level | 128 bits |

**Signature Domain Separation:**

All signatures *MUST* use domain separation as follows:

```
message = DOMAIN_SEP || "IssuerSignature" || FieldToBytes(commitment) || UTF8(credentialId)
signature = Ed25519.Sign(privateKey, message)
```

The `FieldToBytes` function is defined in Section 3.9. The `DOMAIN_SEP` constant is defined in Section 3.8.

**Signature Verification:**

```
message = DOMAIN_SEP || "IssuerSignature" || FieldToBytes(commitment) || UTF8(credentialId)
valid = Ed25519.Verify(publicKey, message, signature)
```

### 3.5 Groth16 Zero-Knowledge Proof System

*This section is normative.*

The Groth16 proving system [[GROTH16]] is used for generating and verifying zero-knowledge proofs of selective disclosure.

**Groth16 Parameters:**

| Parameter | Value |
|-----------|-------|
| Number of public inputs | 37 (commitment, challenge, challengeHash, nonce, timestamp, 16 masks, 16 revealed hashes) |
| Number of private witnesses | 17 (16 attributes, 1 blinding factor) |
| Number of constraints | Approximately 83 R1CS constraints (see Section 4.2) |
| Proof size (compressed) | 192 bytes (2 × G₁ points + 1 × G₂ point) |
| Proving key size (compressed) | ~2 MB (for 16 attributes) |
| Verifying key size (prepared) | ~1 KB |
| Proof generation time (desktop) | 500–800 ms |
| Proof verification time | 10–20 ms (constant in number of attributes) |

**Proof Serialization:**

Groth16 proofs *MUST* be serialized using compressed representation:

```
Proof bytes = Compress(G₁_A) || Compress(G₂_B) || Compress(G₁_C)
Total: 32 + 64 + 32 = 128 bytes (uncompressed points)
       32 + 64 + 32 = 128 bytes (compressed for BN254)
       Actual: 192 bytes due to compression overhead for G₂
```

### 3.6 Argon2id Key Derivation Function

*This section is normative.*

Argon2id [[RFC9106]] is used for deriving encryption keys from holder passphrases.

**Argon2id Configuration:**

| Parameter | Value |
|-----------|-------|
| Algorithm variant | Argon2id |
| Memory cost (m) | 65,536 KiB (64 MiB) |
| Time cost (t) | 3 iterations |
| Parallelism (p) | 4 lanes |
| Output length (T) | 64 bytes (split into encryption key and nonce) |
| Version | 0x13 |
| Salt length | 32 bytes (256 bits) |

**Key Derivation with Domain Separation:**

To prevent accidental nonce reuse under salt collision, the KDF output is split with domain separation:

```
raw_output = Argon2id(
    password: passphrase,
    salt: salt || "DI-Groth16-KDF",
    m: 65536, t: 3, p: 4, T: 64
)

encryption_key = raw_output[0:32]   // AES-256 key
gcm_nonce = raw_output[32:44]       // 96-bit GCM nonce
verification_hash = raw_output[44:64] // For integrity verification
```

This decouples the encryption key and nonce derivation, ensuring that even under accidental salt reuse, the GCM nonce does not repeat with the same key.

**Security Rationale:** The 64 MiB memory requirement protects against GPU-based brute-force attacks on holder passphrases. The moderate iteration count balances security with usability on mobile devices. The domain separation prevents cross-context key derivation.

### 3.7 AES-256-GCM Authenticated Encryption

*This section is normative.*

AES-256-GCM [[NIST-SP-800-38D]] is used for authenticated encryption of holder contexts.

**AES-256-GCM Configuration:**

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Key length | 256 bits (32 bytes) |
| Nonce length | 96 bits (12 bytes) |
| Authentication tag length | 128 bits (16 bytes) |

**Nonce Derivation:** The GCM nonce *MUST* be derived from the Argon2id output as specified in Section 3.6, not directly from the salt. This ensures that even under CSPRNG failure leading to salt reuse, the nonce does not repeat with the same encryption key.

**Additional Authenticated Data (AAD):** The credential ID *SHOULD* be included as AAD to bind the ciphertext to the specific credential:

```
ciphertext = AES256GCM.Encrypt(
    key: encryption_key,
    nonce: gcm_nonce,
    plaintext: serialized_context,
    additionalData: UTF8(credential_id)
)
```

### 3.8 Constants

*This section is normative.*

The following constants are used throughout this specification:

```
DOMAIN_SEP = "DataIntegrityGroth16Proof2026::v1.0::"
MAX_ATTRIBUTES = 16
DEFAULT_PROOF_TIMEOUT_SECS = 300
DRIFT_TOLERANCE_SECS = 30
GRACE_PERIOD_SECS = 60
```

**Domain Separation Tags:**

| Tag | Purpose |
|-----|---------|
| `"Commitment"` | Attribute commitment hashing |
| `"ChallengeBinding"` | Challenge-to-proof binding in circuit |
| `"IssuerSignature"` | Ed25519 signature domain |
| `"AttributeHash"` | Individual attribute hashing |
| `"NonceBinding"` | Nonce processing |
| `"HolderEncryption"` | Context encryption |
| `"CompositeLinking"` | Linking commitment for composite credentials |

### 3.9 Field Element Conversion

*This section is normative.*

Conversion between byte arrays and BN254 scalar field elements (Fr) *MUST* follow these rules:

**Fr to Bytes (Serialization for External Representation):**

```
FieldToBytes(element):
  1. Serialize element to little-endian bytes using compressed canonical representation
  2. Reverse bytes to big-endian order for external representation
  3. Output: 32-byte big-endian array
```

**Bytes to Fr (Deserialization from External Representation):**

```
BytesToFieldElement(bytes):
  1. Assert bytes.length == 32
  2. Validate bytes < r (subgroup order) in constant-time (see Section 11.5)
  3. Reverse bytes to little-endian order
  4. Deserialize using compressed canonical representation
  5. Output: Fr element
```

**String to Fr (Attribute Hashing):**

```
StringToFieldElement(string):
  1. domain_tag ← DOMAIN_SEP || "AttributeHash"
  2. hash ← Blake2b(personalization="DI-Groth16", input=domain_tag || UTF8(string))
  3. Reduce hash modulo r (subgroup order)
  4. Output: Fr element
```

**Field Element Validation (Constant-Time):**

```
IsValidFieldElement(bytes):
  // Constant-time comparison of bytes against r (subgroup order)
  // Returns true if 0 ≤ bytes < r, false otherwise
  // Uses only constant-time operations (no early returns)
  // See Section 11.5 for reference implementation
```

### 3.10 Attribute Commitment Scheme

*This section is normative.*

An attribute commitment is computed as follows:

```
Algorithm: ComputeCommitment(attributes, blinding)
Inputs:
  attributes  - Array of exactly 16 field elements (Fr)
  blinding    - Random field element (Fr)
  
Output: commitment (Fr)

Steps:
  1. Assert attributes.length == 16
  2. Assert blinding is non-zero
  3. inputs ← [attributes[0], ..., attributes[15], blinding]
  4. commitment ← Poseidon(inputs, "Commitment")
  5. Return commitment
```

**Security Properties:**

- **Hiding:** The commitment reveals no information about any individual attribute or the blinding factor. This reduces to the random oracle property of Poseidon.
- **Binding:** It is computationally infeasible to find two different sets of (attributes, blinding) that produce the same commitment. This reduces to collision resistance of Poseidon.
- **Zero-Knowledge:** The commitment can be opened selectively via Groth16 proof without revealing unrevealed attributes.

---

## 4. Trusted Setup

### 4.1 Overview

*This section is normative.*

The Groth16 proving system requires a one-time trusted setup procedure that generates a Common Reference String (CRS) consisting of a proving key and verifying key. The security of all proofs depends on the integrity of this setup.

Implementations *MUST* use parameters generated through a Multi-Party Computation (MPC) ceremony for any production deployment. Single-party setup is permitted *ONLY* for testing and development purposes and *MUST NOT* be used with credentials carrying real-world value.

### 4.2 Circuit Specification

*This section is normative.*

The setup circuit is defined as the `HolderPresentationCircuit` implementing the `ConstraintSynthesizer` trait. The circuit enforces the following constraints:

**Constraint 1: Commitment Binding**

```
Poseidon(attrs[0], ..., attrs[15], blinding) == publicCommitment
```

This ensures the holder knows all 16 attributes and the blinding factor that produced the issuer-signed commitment. Violation means the holder is attempting to prove knowledge of a different set of attributes than those committed.

**Constraint 2: Binary Mask Validation**

```
For i = 0 to 15:
  mask[i] × (1 - mask[i]) == 0
```

This enforces that each mask element is either 0 (hidden) or 1 (revealed), preventing fractional disclosure attacks where a holder could reveal partial information about an attribute.

**Constraint 3: Selection Correctness**

```
For i = 0 to 15:
  revealed[i] == (mask[i] == 1) ? attrs[i] : 0
```

This cryptographically binds each revealed hash to its corresponding committed attribute. The conditional selection is implemented via an R1CS gadget that computes:

```
revealed[i] = mask[i] × attrs[i]
```

This prevents attribute injection attacks where a holder substitutes a different attribute value for what was originally committed. Because the commitment binds all attributes simultaneously, any substitution would require finding a collision in Poseidon.

**Constraint 4: Challenge Binding**

```
Poseidon(challenge, nonce, timestamp, publicCommitment) == challengeHash
```

This binds the proof to the specific verifier challenge, nonce, and timestamp, preventing replay across different sessions and verifiers. The inclusion of `publicCommitment` ensures the challenge hash is unique per credential.

**Constraint 5: Timestamp Presence**

```
timestamp × inv(timestamp) == 1
```

This prevents omission attacks where a holder generates a proof without a timestamp to evade freshness checks. The prover must supply the multiplicative inverse of timestamp as a witness, which is only possible if timestamp ≠ 0.

**Circuit Summary:**

```
Public Inputs (37 total):
  - commitment (1 Fr element)
  - challenge (1 Fr element)
  - challengeHash (1 Fr element)
  - nonce (1 Fr element)
  - timestamp (1 Fr element)
  - mask[0..15] (16 Fr elements)
  - revealed[0..15] (16 Fr elements)

Private Witnesses (17 total):
  - attrs[0..15] (16 Fr elements)
  - blinding (1 Fr element)

Constraint Count Breakdown:
  - Poseidon (commitment): ~55 constraints
  - Poseidon (challenge): ~55 constraints
  - Binary mask checks: 16 constraints
  - Selection gadgets: 16 constraints
  - Timestamp non-zero: 1 constraint
  - Total: ~83 constraints (may vary by Poseidon optimization)
```

### 4.3 Multi-Party Computation Ceremony

*This section is normative.*

Production deployments *MUST* conduct an MPC ceremony with the following phases:

**Phase 1: Initial Contribution**

```
1. Coordinator generates initial parameters:
   circuit ← HolderPresentationCircuit.dummy()
   (pk₀, vk₀) ← Groth16.CircuitSpecificSetup(circuit, Csprng)
   
2. Compute hash commitment:
   h₀ ← SHA-256(Serialize(pk₀) || Serialize(vk₀))
   
3. Publish h₀ to append-only log (e.g., transparency log, blockchain)
4. Securely store (pk₀, vk₀) for next participant
```

**Phase 2: Sequential Contributions**

For each participant i from 1 to n (where n ≥ 3):

```
1. Retrieve and verify all previous contributions:
   For j = 0 to i-1:
     Verify h_j matches published commitment
     Verify update proof π_j (for j > 0)
     
2. Generate toxic waste:
   τᵢ ←$ Fr (using high-entropy CSPRNG)
   
3. Update parameters:
   (pkᵢ, vkᵢ) ← Groth16.Update(pk_{i-1}, τᵢ)
   
4. Generate update proof:
   πᵢ ← Groth16.ProveUpdate(τᵢ, pk_{i-1}, pkᵢ)
   
5. Compute hash commitment:
   hᵢ ← SHA-256(Serialize(pkᵢ) || Serialize(vkᵢ))
   
6. Publish (hᵢ, πᵢ) to append-only log
   
7. Securely destroy τᵢ:
   Overwrite τᵢ memory with zeros
   Verify no copies remain in memory, swap, or logs
   
8. Provide out-of-band attestation:
   Signed statement: "I, [identity], contributed to ceremony round i
   at timestamp T using machine fingerprint F"
```

**Phase 3: Finalization**

```
1. Verify hash chain:
   For i = 1 to n:
     Assert SHA-256(Serialize(pkᵢ) || Serialize(vkᵢ)) == hᵢ
     
2. Verify all update proofs:
   For i = 1 to n:
     Assert Groth16.VerifyUpdate(πᵢ, pk_{i-1}, pkᵢ) == true
     
3. Assert minimum participants:
   Assert n ≥ 3
   
4. Verify contribution independence:
   For i ≠ j:
     Assert contributors[i] and contributors[j] are independent entities
     (Validated through out-of-band attestation, legal identity verification)
     
5. Publish final parameters:
   proving_key ← pkₙ
   verifying_key ← vkₙ
   
6. Compute parameter integrity hash:
   integrity_hash ← SHA-256(Serialize(proving_key) || Serialize(verifying_key))
   
7. Publish (proving_key, verifying_key, integrity_hash) with full ceremony transcript
```

**Contribution Independence:** Each participant *MUST* be an independent entity with no shared control. Implementations *SHOULD* require out-of-band attestation including:
- Signed statement with government-issued identity verification
- Video recording of contribution session
- Unique machine fingerprint
- Geographic distribution (participants in different jurisdictions)

**Minimum Participants:** The ceremony *MUST* include at least three (3) independent participants. Ceremonies with fewer participants *MUST NOT* be used for production deployments. High-value deployments *SHOULD* target 10+ participants.

**Toxic Waste Destruction:** After contributing, participants *MUST*:
1. Overwrite τᵢ memory locations with cryptographically random data
2. Verify no copies in process memory, swap files, or core dumps
3. Reboot the contribution machine if possible
4. Provide attestation of destruction

### 4.4 Ceremony Verification

*This section is normative.*

Before accepting parameters from a ceremony, implementations *MUST*:

1. Verify the complete hash chain: h₀ → h₁ → ... → hₙ
2. Verify all update proofs πᵢ for i ∈ [1, n]
3. Verify the number of unique participants n ≥ 3
4. Verify contribution independence through out-of-band attestations
5. Verify the final parameter integrity hash matches published value
6. Verify the final parameters produce valid proofs using known test vectors (Appendix C)
7. Verify that no participant is on any known sanctions or prohibited parties list (for regulatory compliance)

### 4.5 Single-Party Setup (Testing Only)

*This section is normative.*

For testing and development purposes *ONLY*, a single-party setup *MAY* be performed:

```
1. Generate dummy circuit:
   circuit ← HolderPresentationCircuit.dummy()
   
2. Generate parameters:
   (pk, vk) ← Groth16.CircuitSpecificSetup(circuit, Csprng)
   
3. Compute integrity hash:
   h ← SHA-256(Serialize(pk) || Serialize(vk))
   
4. Output: (pk, vk, h) with metadata:
   {
     "ceremonyPhase": 1,
     "contributors": ["test-generator"],
     "warning": "NOT FOR PRODUCTION USE",
     "createdAt": ISO8601(CurrentTime())
   }
```

**WARNING:** Single-party setup is **NOT SECURE** for production use. Parameters generated this way contain toxic waste known to the generator, enabling proof forgery. Such parameters *MUST NOT* be used with credentials conveying real-world value, legal authority, or financial significance.

Implementations *MUST* include runtime checks that prevent accidental use of test parameters in production:

```
If parameters.ceremony_phase < 2 or parameters.contributors.length < 3:
  Log severe warning: "TEST PARAMETERS DETECTED - NOT FOR PRODUCTION USE"
  If environment == PRODUCTION:
    ABORT with error "INSECURE_PARAMETERS"
```

### 4.6 Parameter Integrity Verification

*This section is normative.*

Implementations *MUST* verify parameter integrity before every use by computing:

```
integrity_hash = SHA-256(Serialize(proving_key) || Serialize(verifying_key))
```

and comparing against the published value in constant-time. Mismatched hashes indicate parameter corruption or tampering and *MUST* cause the implementation to abort with error.

### 4.7 Parameter Storage and Distribution

*This section is normative.*

Setup parameters *MUST* be stored with complete metadata:

```json
{
  "provingKey": "<compressed bytes, base64-encoded>",
  "verifyingKey": "<compressed bytes, base64-encoded>",
  "parameterHash": "<hex-encoded SHA-256>",
  "ceremonyPhase": 2,
  "contributors": [
    {
      "name": "Organization A",
      "did": "did:web:org-a.example",
      "timestamp": "2026-01-15T10:00:00Z",
      "attestation": "ipfs://Qm..."
    },
    {
      "name": "Organization B",
      "did": "did:web:org-b.example",
      "timestamp": "2026-01-15T14:00:00Z",
      "attestation": "ipfs://Qm..."
    },
    {
      "name": "Organization C",
      "did": "did:web:org-c.example",
      "timestamp": "2026-01-16T09:00:00Z",
      "attestation": "ipfs://Qm..."
    }
  ],
  "createdAt": "2026-01-16T09:30:00Z",
  "circuitHash": "<hex-encoded SHA-256 of circuit definition>",
  "specVersion": "1.0"
}
```

Parameters *SHOULD* be distributed via content-addressable storage (IPFS, content hashes) to enable verification of parameter provenance. Verifiers *MAY* pin a specific parameter hash rather than relying on mutable distribution endpoints.

---

## 5. Credential Issuance

### 5.1 Issuance Overview

*This section is normative.*

Credential issuance is the process by which an issuer creates a Verifiable Credential with an attribute commitment and Ed25519 signature. The issuer:
1. Extracts attributes from the credential subject
2. Validates types against the attribute registry
3. Canonicalizes and hashes each attribute
4. Generates a random blinding factor
5. Computes the Poseidon commitment
6. Signs the commitment with Ed25519
7. Optionally registers in the revocation registry
8. Constructs the W3C-compliant secured credential
9. Encrypts the holder context with Argon2id + AES-256-GCM

### 5.2 Prerequisites

*This section is normative.*

Before issuance, the following *MUST* be established:

1. An attribute registry mapping URIs to (index, expected JSON type) pairs
2. An Ed25519 key pair for the issuer, generated from CSPRNG
3. A credential schema defining required and optional attributes
4. A trusted setup parameter file (proving and verifying keys) from an MPC ceremony
5. If revocation is enabled: a StatusRegistry instance with available capacity

### 5.3 Attribute Processing

*This section is normative.*

Attributes are processed into field elements through canonicalization and hashing:

```
Algorithm: ProcessAttribute(value, domainTag)
Inputs:
  value     - JSON value to process
  domainTag - Domain separation tag (e.g., "AttributeHash")
  
Output: Field element (Fr)

Steps:
  1. Validate JSON type matches registered type:
     If TypeOf(value) ≠ registeredType:
       Raise TYPE_MISMATCH error
       
  2. Canonicalize using RFC 8785 JCS:
     canonical ← RFC8785_Canonicalize(value)
     
  3. Construct domain-separated input:
     input ← DOMAIN_SEP || domainTag || UTF8(canonical)
     
  4. Hash with Blake2b:
     hash ← Blake2b(
       personalization: "DI-Groth16",
       input: input,
       outputLength: 32
     )
     
  5. Reduce to field element:
     element ← Fr.from_bytes_mod_order(hash)
     
  6. Return element
```

**Type Validation:** The JSON type of each attribute value *MUST* match the registered type for that attribute URI. The following type mappings apply:

| Registered Type | Valid JSON Types | Example |
|----------------|------------------|---------|
| `"string"` | JSON string | `"Alice"` |
| `"number"` | JSON number (integer or float) | `25`, `3.14` |
| `"boolean"` | JSON boolean | `true`, `false` |
| `"array"` | JSON array | `["red", "green"]` |
| `"object"` | JSON object | `{"street": "Main St"}` |

**Canonicalization:** All attribute values *MUST* be canonicalized using JSON Canonicalization Scheme (JCS) [[RFC8785]] before hashing. This ensures that semantically equivalent JSON values produce identical hashes across implementations. The canonicalization *MUST*:
- Sort object keys by UTF-16 code unit
- Use specific number formatting (no exponential notation for integers in safe range)
- Escape control characters consistently
- Remove insignificant whitespace

**Cross-Platform Consistency:** Implementations *MUST* validate canonicalization consistency across platforms using the test vectors in Appendix C.3. Any platform-specific deviations *MUST* be documented and resolved.

### 5.4 Issuance Algorithm

*This section is normative.*

```
Algorithm: issue(credential, issuerKey, options)
Inputs:
  credential          - Unsigned Verifiable Credential (Map)
  issuerKey           - Issuer's Ed25519 SigningKey
  options             - Issuance options (Map)
    options.attributeRegistry - Map<URI, (index: Integer, type: String)>
    options.issuerDID         - Issuer's DID (String)
    options.holderDID         - Holder's DID (String)
    options.revocationEnabled - Boolean (default: false)
    options.statusRegistry    - StatusRegistry instance (if revocation enabled)
    options.enableRecovery    - Boolean (default: false)
    options.recoveryContacts  - List of contact identifiers (if recovery enabled)
    options.recoveryThreshold - Integer (if recovery enabled)
    
Output: (securedCredential, encryptedContext)

Steps:

  1. Initialize attribute arrays (size 16):
     attrs ← array[16] of Fr initialized to Fr(0)
     canonicalStrings ← array[16] of String initialized to ""
     rawValues ← array[16] of JSON initialized to null
     uris ← array[16] of String initialized to ""
     
  2. Process credential subject:
     subject ← credential.credentialSubject
     If subject is undefined or not an Object:
       Raise MISSING_SUBJECT error
       
     For each (uri, value) in subject:
       2.1 Skip non-attribute properties:
           If uri starts with "id" or "type":
             Continue
             
       2.2 Lookup attribute metadata:
           entry ← options.attributeRegistry[uri]
           If entry is undefined:
             Raise UNREGISTERED_ATTRIBUTE error: "URI not in registry: " + uri
           (index, expectedType) ← entry
           
       2.3 Validate index bounds:
           If index < 0 or index ≥ MAX_ATTRIBUTES (16):
             Raise INDEX_OUT_OF_RANGE error
             
       2.4 Validate JSON type:
           actualType ← TypeOf(value) per type mapping table
           If actualType ≠ expectedType:
             Raise TYPE_MISMATCH error:
               "Expected " + expectedType + " for " + uri + 
               ", got " + actualType
               
       2.5 Process attribute:
           canonical ← RFC8785_Canonicalize(value)
           attrHash ← ProcessAttribute(value, "AttributeHash")
           
       2.6 Store attribute:
           attrs[index] ← attrHash
           canonicalStrings[index] ← canonical
           rawValues[index] ← value
           uris[index] ← uri
           
  3. Validate at least one attribute was processed:
     If all attrs[i] == Fr(0):
       Raise NO_ATTRIBUTES error
       
  4. Generate blinding factor:
     r ←$ Fr  (uniformly random from CSPRNG)
     Assert r ≠ Fr(0)
     
  5. Compute commitment:
     commitment ← ComputeCommitment(attrs, r)
     
  6. Determine credential identifier:
     id ← credential.id
     If id is undefined or empty:
       id ← "urn:uuid:" || UUIDv4()
       
  7. Sign commitment with domain separation:
     commitmentBytes ← FieldToBytes(commitment)
     message ← DOMAIN_SEP || "IssuerSignature" || commitmentBytes || UTF8(id)
     signature ← Ed25519.Sign(issuerKey, message)
     
  8. Register in revocation system (if enabled):
     statusIndex ← undefined
     If options.revocationEnabled:
       statusIndex ← options.statusRegistry.Register(id)
       
  9. Build proof object:
     proof ← {
       "type": "DataIntegrityGroth16Proof2026",
       "created": ISO8601(CurrentTime()),
       "verificationMethod": options.issuerDID || "#key-1",
       "proofPurpose": "assertionMethod",
       "proofValue": Base64Encode(signature),
       "domain": {
         "commitment": HexEncode(commitmentBytes),
         "credentialId": id
       }
     }
     
  10. Add revocation status (if applicable):
      If statusIndex is defined:
        proof["credentialStatus"] ← {
          "id": options.issuerDID || "#status-" || String(statusIndex),
          "type": "StatusList2021Entry",
          "statusPurpose": "revocation",
          "statusListIndex": String(statusIndex),
          "statusListCredential": options.issuerDID || "#status-list"
        }
        
  11. Assemble secured credential:
      secured ← shallowCopy(credential)
      secured["proof"] ← proof
      
  12. Build holder context:
      context ← {
        attributes: attrs,
        canonicalStrings: canonicalStrings,
        rawValues: rawValues,
        uris: uris,
        blinding: r,
        commitment: commitment,
        credentialId: id,
        issuerDID: options.issuerDID,
        holderDID: options.holderDID,
        issuerSignature: signature,
        issuanceDate: ISO8601(CurrentTime()),
        expirationDate: credential.expirationDate,
        statusIndex: statusIndex
      }
      
  13. Encrypt holder context:
      encryptedContext ← EncryptContext(
        context: context,
        passphrase: holderPassphrase,
        options: {
          enableRecovery: options.enableRecovery,
          recoveryContacts: options.recoveryContacts,
          recoveryThreshold: options.recoveryThreshold
        }
      )
      
  14. Return (secured, encryptedContext)
```

### 5.5 Holder Context Encryption

*This section is normative.*

The holder context contains sensitive material (all attribute values, blinding factor, issuer signature) and *MUST* be encrypted before storage or transmission.

```
Algorithm: EncryptContext(context, passphrase, options)
Inputs:
  context    - HolderContext object
  passphrase - Holder's secret passphrase (String)
  options    - Encryption options (Map)
    options.enableRecovery    - Boolean
    options.recoveryContacts  - List of contacts
    options.recoveryThreshold - Integer
    
Output: encrypted data (Byte Array) or RecoverableEncryptedContext

Steps:
  1. Generate salt:
     salt ← CSPRNG(32 bytes)
     
  2. Derive key material with domain separation:
     raw_output ← Argon2id(
       password: UTF8(passphrase),
       salt: salt || "DI-Groth16-KDF",
       memoryCost: 65536,
       timeCost: 3,
       parallelism: 4,
       outputLength: 64
     )
     encryption_key ← raw_output[0:32]
     gcm_nonce ← raw_output[32:44]
     verification_hash ← raw_output[44:64]
     
  3. Serialize context:
     plaintext ← BincodeSerialize(context)
     
  4. Encrypt with AAD binding:
     ciphertext ← AES256GCM.Encrypt(
       key: encryption_key,
       nonce: gcm_nonce,
       plaintext: plaintext,
       additionalData: UTF8(context.credentialId)
     )
     
  5. If recovery is enabled:
     recovery_key ← CSPRNG(32 bytes)
     shares ← ShamirSplit(recovery_key, options.recoveryThreshold, options.recoveryContacts.length)
     backup_encrypted ← AES256GCM.Encrypt(
       key: recovery_key,
       nonce: CSPRNG(12 bytes),
       plaintext: plaintext,
       additionalData: UTF8(context.credentialId)
     )
     
     Return RecoverableEncryptedContext {
       primaryEncrypted: salt || verification_hash || ciphertext,
       backupEncrypted: backup_nonce || backup_encrypted,
       recoveryShares: shares,
       shareCommitments: [SHA-256(share₁), ..., SHA-256(shareₙ)],
       threshold: options.recoveryThreshold,
       contacts: options.recoveryContacts,
       timelockPeriod: "P30D"
     }
     
  6. If recovery is disabled:
     Return salt || verification_hash || ciphertext
```

### 5.6 Holder Context Decryption

*This section is normative.*

```
Algorithm: DecryptContext(encryptedData, passphrase)
Inputs:
  encryptedData - Encrypted context (with or without recovery data)
  passphrase    - Holder's secret passphrase (String)
  
Output: HolderContext

Steps:
  1. Parse header:
     If encryptedData is RecoverableEncryptedContext:
       salt ← encryptedData.primaryEncrypted[0:32]
       verification_hash ← encryptedData.primaryEncrypted[32:52]
       ciphertext ← encryptedData.primaryEncrypted[52:]
     Else:
       salt ← encryptedData[0:32]
       verification_hash ← encryptedData[32:52]
       ciphertext ← encryptedData[52:]
       
  2. Derive key material:
     raw_output ← Argon2id(
       password: UTF8(passphrase),
       salt: salt || "DI-Groth16-KDF",
       memoryCost: 65536,
       timeCost: 3,
       parallelism: 4,
       outputLength: 64
     )
     encryption_key ← raw_output[0:32]
     gcm_nonce ← raw_output[32:44]
     computed_verification ← raw_output[44:64]
     
  3. Verify passphrase (constant-time):
     If ConstantTimeNotEqual(computed_verification, verification_hash):
       Raise INCORRECT_PASSPHRASE error
       
  4. Decrypt:
     plaintext ← AES256GCM.Decrypt(
       key: encryption_key,
       nonce: gcm_nonce,
       ciphertext: ciphertext,
       additionalData: UTF8(credentialId)  // From context header
     )
     If decryption fails:
       Raise DECRYPTION_FAILED error
       
  5. Deserialize:
     context ← BincodeDeserialize(plaintext)
     If deserialization fails:
       Raise CORRUPTED_DATA error
       
  6. Verify context integrity:
     If context.credentialId is empty or context.commitment is zero:
       Raise CORRUPTED_CONTEXT error
       
  7. Return context
```

### 5.7 Recovery Decryption

*This section is normative.*

When the primary passphrase is lost, the holder *MAY* recover their context using the social recovery mechanism:

```
Algorithm: RecoverContext(recoverableContext, shares)
Inputs:
  recoverableContext - RecoverableEncryptedContext
  shares            - List of at least threshold recovery shares
  
Output: HolderContext

Steps:
  1. Verify minimum shares:
     If shares.length < recoverableContext.threshold:
       Raise INSUFFICIENT_SHARES error
       
  2. Verify share commitments:
     For each share in shares:
       commitment ← SHA-256(share)
       If commitment not in recoverableContext.shareCommitments:
         Raise INVALID_SHARE error
         
  3. Reconstruct recovery key:
     recovery_key ← ShamirCombine(shares)
     
  4. Decrypt backup:
     nonce ← recoverableContext.backupEncrypted[0:12]
     backup_ciphertext ← recoverableContext.backupEncrypted[12:]
     
     plaintext ← AES256GCM.Decrypt(
       key: recovery_key,
       nonce: nonce,
       ciphertext: backup_ciphertext,
       additionalData: UTF8(credentialId)
     )
     
  5. Deserialize and verify:
     context ← BincodeDeserialize(plaintext)
     If context.credentialId is empty:
       Raise CORRUPTED_RECOVERY error
       
  6. Notify holder and contacts:
     Send notification to recoverableContext.notificationContacts
     
  7. Return context
```

**Timelock Period:** If the recovery service holds one share, the recovery *SHOULD* be subject to a timelock period (default: 30 days) during which the original holder can cancel the recovery if they retain control of their primary passphrase. This prevents malicious recovery by a subset of contacts without the holder's knowledge.

### 5.8 Issuance Examples

*This section is non-normative.*

**Example 1: Simple Age Credential**

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/suites/groth16-2026/v1"
  ],
  "id": "urn:uuid:123e4567-e89b-12d3-a456-426614174000",
  "type": ["VerifiableCredential", "AgeCredential"],
  "issuer": "did:example:issuer",
  "issuanceDate": "2026-05-21T10:30:00Z",
  "credentialSubject": {
    "givenName": "Alice",
    "familyName": "Chen",
    "age": 25,
    "isOver18": true
  },
  "proof": {
    "type": "DataIntegrityGroth16Proof2026",
    "created": "2026-05-21T10:30:00Z",
    "verificationMethod": "did:example:issuer#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "ZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcA...",
    "domain": {
      "commitment": "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
      "credentialId": "urn:uuid:123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

**Example 2: Composite Credential**

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/suites/groth16-2026/v1"
  ],
  "id": "urn:uuid:composite-001",
  "type": ["VerifiableCredential", "FullIdentityCredential"],
  "issuer": "did:example:issuer",
  "issuanceDate": "2026-05-21T10:30:00Z",
  "credentialSubject": {
    "components": [
      {
        "id": "urn:credential:personal-info",
        "type": "DataIntegrityGroth16Proof2026Component",
        "commitment": "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809"
      },
      {
        "id": "urn:credential:financial-info",
        "type": "DataIntegrityGroth16Proof2026Component",
        "commitment": "2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a"
      }
    ],
    "linkingCommitment": "3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b"
  },
  "proof": {
    "type": "DataIntegrityGroth16Proof2026",
    "created": "2026-05-21T10:30:00Z",
    "verificationMethod": "did:example:issuer#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "...",
    "domain": {
      "commitment": "3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b",
      "credentialId": "urn:uuid:composite-001",
      "linkingCommitment": "3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b"
    }
  }
}
```

---

## 6. Presentation Generation

### 6.1 Presentation Overview

*This section is normative.*

Presentation generation is the process by which a holder creates a Verifiable Presentation containing a selective disclosure proof. The holder selects which attributes to reveal, constructs a Groth16 zero-knowledge proof demonstrating knowledge of all attributes and their relationship to the issuer-signed commitment, and assembles a W3C-compliant presentation.

### 6.2 Prerequisites

*This section is normative.*

Before generating a presentation, the following *MUST* be available:

1. A decrypted holder context from the original issuance
2. The Groth16 proving key from the trusted setup
3. A list of attribute URIs to reveal (non-empty subset of registered URIs)
4. A verifier-provided challenge string (opaque to the holder)
5. A freshly generated 32-byte CSPRNG nonce
6. A reasonably synchronized system clock (via NTP)

### 6.3 Presentation Algorithm

*This section is normative.*

```
Algorithm: present(context, revealURIs, challenge, nonce, options)
Inputs:
  context      - Decrypted HolderContext
  revealURIs   - List of attribute URIs to reveal (String[])
  challenge    - Verifier-provided challenge (String)
  nonce        - 32-byte random value (Byte[32])
  options      - Presentation options (Map)
    options.provingKey       - Groth16 ProvingKey
    options.holderDID        - Holder's DID (String)
    options.timestamp        - UNIX timestamp (Integer, optional)
    options.attributeRegistry - Map<URI, (index, type)>
    
Output: Verifiable Presentation (Map)

Steps:
  1. Validate credential status:
     If context has statusIndex and revocation is enabled:
       If StatusRegistry.IsRevoked(context.credentialId):
         Raise CREDENTIAL_REVOKED error
         
  2. Validate reveal URIs:
     If revealURIs is empty:
       Raise MUST_REVEAL_AT_LEAST_ONE error
       
     For each uri in revealURIs:
       If uri not in options.attributeRegistry:
         Raise UNKNOWN_ATTRIBUTE error: "URI not registered: " + uri
         
  3. Build selection mask:
     mask ← array[16] of Integer initialized to 0
     For each uri in revealURIs:
       (index, _) ← options.attributeRegistry[uri]
       If index ≥ 16:
         Raise INDEX_OUT_OF_RANGE error
       mask[index] ← 1
       
  4. Build revealed hashes:
     revealed ← array[16] of Fr initialized to Fr(0)
     For i from 0 to 15:
       If mask[i] == 1:
         revealed[i] ← context.attributes[i]
         
  5. Set timestamp with drift consideration:
     If options.timestamp is defined:
       timestamp ← options.timestamp
     Else:
       timestamp ← GetSynchronizedTimestamp()
       
  6. Convert to field elements:
     challengeFr ← StringToFieldElement(challenge)
     nonceFr ← BytesToFieldElement(nonce)
     timestampFr ← IntegerToFieldElement(timestamp)
     
  7. Compute challenge hash:
     challengeHash ← Poseidon(
       [challengeFr, nonceFr, timestampFr, context.commitment],
       "ChallengeBinding"
     )
     
  8. Construct circuit instance:
     circuit ← HolderPresentationCircuit {
       // Public inputs
       signed_commitment: context.commitment,
       challenge: challengeFr,
       challenge_hash: challengeHash,
       mask: mask,
       revealed_hashes: revealed,
       nonce: nonceFr,
       timestamp: timestampFr,
       // Private witnesses
       private_attributes: context.attributes,
       blinding: context.blinding
     }
     
  9. Generate Groth16 proof:
     π ← Groth16.Prove(options.provingKey, circuit, CSPRNG)
     
  10. Serialize proof:
      proofBytes ← π.SerializeCompressed()
      
  11. Collect revealed values:
      revealedMap ← {}
      For each uri in revealURIs:
        (index, _) ← options.attributeRegistry[uri]
        revealedMap[uri] ← context.rawValues[index]
        
  12. Build presentation:
      presentation ← {
        "@context": [
          "https://www.w3.org/ns/credentials/v2",
          "https://w3id.org/security/suites/groth16-2026/v1"
        ],
        "type": "VerifiablePresentation",
        "holder": options.holderDID,
        "proof": {
          "type": "DataIntegrityGroth16Proof2026",
          "created": ISO8601(CurrentTime()),
          "verificationMethod": options.holderDID || "#key-1",
          "proofPurpose": "authentication",
          "challenge": challenge,
          "domain": {
            "commitment": HexEncode(FieldToBytes(context.commitment)),
            "credentialId": context.credentialId,
            "nonce": HexEncode(nonce),
            "timestamp": timestamp
          },
          "revealedAttributes": revealedMap,
          "proofValue": Base64Encode(proofBytes),
          "issuerSignature": Base64Encode(context.issuerSignature),
          "issuer": context.issuerDID
        }
      }
      
  13. Return presentation
```

### 6.4 Composite Presentations

*This section is normative.*

When a credential is composed of multiple components (Section 2.6), the holder *MUST* generate separate proofs for each component from which attributes are revealed. All proofs *MUST* share the same challenge, nonce, and timestamp.

```
Algorithm: presentComposite(components, revealSpecs, challenge, nonce, options)
Inputs:
  components   - Array of HolderContext (one per component)
  revealSpecs  - Map<componentId, String[] revealURIs>
  challenge    - Verifier-provided challenge
  nonce        - 32-byte random value
  options      - Presentation options (as in present())
  
Output: Verifiable Presentation

Steps:
  1. Validate each component:
     For each component in components:
       Verify component is not revoked
       Verify component belongs to the same composite credential
       
  2. Verify linking commitment:
     component_commitments ← [c.commitment for c in components]
     computed_linking ← Poseidon(component_commitments, "CompositeLinking")
     Assert computed_linking == expected_linking_commitment
     
  3. Generate proofs for each component:
     proofs ← []
     For each (componentId, revealURIs) in revealSpecs:
       component ← FindComponent(components, componentId)
       If revealURIs is not empty:
         proof ← present(component, revealURIs, challenge, nonce, options)
         proof["componentId"] ← componentId
         proofs.append(proof)
         
  4. Build composite presentation:
     presentation ← {
       "@context": [
         "https://www.w3.org/ns/credentials/v2",
         "https://w3id.org/security/suites/groth16-2026/v1"
       ],
       "type": "VerifiablePresentation",
       "holder": options.holderDID,
       "linkingCommitment": HexEncode(computed_linking),
       "proofs": proofs
     }
     
  5. Return presentation
```

**Critical Requirement:** The linking commitment *MUST* be included in every component proof's public inputs or in the top-level presentation. This ensures verifiers can cryptographically verify that all components belong to the same original credential, even if proofs from some components are omitted.

### 6.5 Security Considerations for Holders

*This section is normative.*

**Nonce Generation:** The nonce *MUST* be generated from a cryptographically secure pseudorandom number generator (CSPRNG) immediately before each presentation. Nonce reuse across presentations *MUST NOT* occur, as this enables correlation attacks and may weaken replay protection.

**Timestamp Accuracy:** The timestamp *SHOULD* be accurate to within ±30 seconds of actual time. Implementations *SHOULD* synchronize system clocks via NTP before generating presentations. If NTP synchronization is unavailable, the implementation *SHOULD* use a trusted time source or warn the holder about potential verification failures.

**Challenge Processing:** The challenge string *SHOULD* be treated as opaque and *MUST NOT* be modified by the holder. The challenge *SHOULD* be provided by the verifier through a secure, authenticated channel to prevent challenge substitution attacks.

**Attribute Selection:** Holders *SHOULD* carefully consider which attributes to reveal, as the combination of revealed attributes may enable correlation even if individual proofs are unlinkable. Holders *SHOULD* minimize the number of revealed attributes when unlinkability is a concern.

### 6.6 Presentation Examples

*This section is non-normative.*

**Example: Selective Disclosure of Age Verification**

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/suites/groth16-2026/v1"
  ],
  "type": "VerifiablePresentation",
  "holder": "did:example:alice",
  "proof": {
    "type": "DataIntegrityGroth16Proof2026",
    "created": "2026-05-21T10:35:00Z",
    "verificationMethod": "did:example:alice#key-1",
    "proofPurpose": "authentication",
    "challenge": "verifier-session-abc123",
    "domain": {
      "commitment": "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
      "credentialId": "urn:uuid:123e4567-e89b-12d3-a456-426614174000",
      "nonce": "f1e2d3c4b5a69788796a5b4c3d2e1f0a1b2c3d4e5f60718293a4b5c6d7e8f90",
      "timestamp": 1716284100
    },
    "revealedAttributes": {
      "age": 25,
      "isOver18": true
    },
    "proofValue": "QWJjRGVmR2hJaktsTW5PcFFyU3R1Vld4WXpaMTIzNDU2Nzg5MEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFla...",
    "issuerSignature": "ZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcA...",
    "issuer": "did:example:issuer"
  }
}
```

---

## 7. Verification

### 7.1 Verification Overview

*This section is normative.*

Verification is the process by which a verifier validates a Verifiable Presentation containing a `DataIntegrityGroth16Proof2026` proof. The verifier checks the issuer signature, validates the zero-knowledge proof, ensures timeliness and nonce uniqueness, and optionally checks revocation status.

### 7.2 Prerequisites

*This section is normative.*

Before verification, the following *MUST* be available:

1. The presentation to verify (conforming document)
2. The expected challenge string (matching the one sent to the holder)
3. The issuer's Ed25519 public key (resolved from the issuer's DID)
4. The prepared Groth16 verifying key from the trusted setup
5. An attribute registry matching the one used during issuance
6. A scalable nonce tracker instance for replay detection (Section 7.6)
7. Optional: Status registry for revocation checking

### 7.3 Verification Algorithm

*This section is normative.*

```
Algorithm: verify(presentation, expectedChallenge, issuerPublicKey, options)
Inputs:
  presentation        - Verifiable Presentation (Map)
  expectedChallenge   - Expected challenge string (String)
  issuerPublicKey     - Issuer's Ed25519 VerifyingKey
  options             - Verification options (Map)
    options.verifyingKey      - Prepared Groth16 VerifyingKey
    options.attributeRegistry  - Map<URI, (index, type)>
    options.nonceTracker      - ScalableNonceTracker instance
    options.statusRegistry    - StatusRegistry instance (optional)
    options.currentTime       - Current UNIX timestamp (optional)
    options.linkingCommitment - Expected linking commitment (for composites)
    
Output: VerificationResult {
  valid: Boolean,
  revealed: Map<String, Value>,
  proofTimestamp: Integer,
  credentialStatus: String ("valid" | "revoked" | "unknown"),
  error: String (if invalid),
  retryAfter: Integer (optional, for soft-expired proofs)
}

Steps:

  1. PARSE AND VALIDATE PROOF STRUCTURE:
     proof ← presentation.proof
     If proof is undefined:
       Return Invalid("Missing proof object")
       
     If proof.type ≠ "DataIntegrityGroth16Proof2026":
       Return Invalid("Invalid proof type: " + proof.type)
       
     If proof.proofPurpose ≠ "authentication":
       Return Invalid("Invalid proof purpose: " + proof.proofPurpose)
       
  2. VERIFY CHALLENGE (CONSTANT-TIME):
     proofChallenge ← UTF8(proof.challenge)
     expectedChallengeBytes ← UTF8(expectedChallenge)
     If ConstantTimeNotEqual(proofChallenge, expectedChallengeBytes):
       Return Invalid("Challenge mismatch")
       
  3. EXTRACT AND VALIDATE DOMAIN PARAMETERS:
     domain ← proof.domain
     If domain is undefined:
       Return Invalid("Missing domain parameters")
       
  4. DECODE AND VALIDATE COMMITMENT:
     commitmentHex ← domain.commitment
     If commitmentHex is undefined or empty:
       Return Invalid("Missing commitment")
       
     commitmentBytes ← HexDecode(commitmentHex)
     If commitmentBytes is error or length ≠ 32:
       Return Invalid("Invalid commitment length")
       
     If not IsValidFieldElement(commitmentBytes):
       Return Invalid("Commitment exceeds field modulus")
       
     C ← BytesToFieldElement(commitmentBytes)
     
  5. EXTRACT CREDENTIAL IDENTIFIER:
     credentialId ← domain.credentialId
     If credentialId is undefined or empty:
       Return Invalid("Missing credential identifier")
       
  6. VERIFY ISSUER SIGNATURE:
     signatureB64 ← proof.issuerSignature
     If signatureB64 is undefined:
       Return Invalid("Missing issuer signature")
       
     signatureBytes ← Base64Decode(signatureB64)
     If signatureBytes is error or length ≠ 64:
       Return Invalid("Invalid signature length")
       
     message ← DOMAIN_SEP || "IssuerSignature" || commitmentBytes || UTF8(credentialId)
     σ ← Ed25519.SignatureFromBytes(signatureBytes)
     
     If not Ed25519.Verify(issuerPublicKey, message, σ):
       Return Invalid("Invalid issuer signature")
       
  7. EXTRACT AND VALIDATE NONCE:
     nonceHex ← domain.nonce
     If nonceHex is undefined:
       Return Invalid("Missing nonce")
       
     nonce ← HexDecode(nonceHex)
     If nonce is error or length ≠ 32:
       Return Invalid("Invalid nonce length")
       
  8. EXTRACT AND VALIDATE TIMESTAMP:
     timestamp ← domain.timestamp
     If timestamp is undefined or timestamp ≤ 0:
       Return Invalid("Missing or invalid timestamp")
       
  9. VERIFY TIMESTAMP FRESHNESS (WITH DRIFT TOLERANCE):
     now ← options.currentTime or CurrentUnixTimestamp()
     absDiff ← |now - timestamp|
     
     If absDiff ≤ DEFAULT_PROOF_TIMEOUT_SECS (300):
       // Valid
     Else if absDiff ≤ (DEFAULT_PROOF_TIMEOUT_SECS + DRIFT_TOLERANCE_SECS) (330):
       Log warning: "Clock skew detected"
     Else if absDiff ≤ (DEFAULT_PROOF_TIMEOUT_SECS + DRIFT_TOLERANCE_SECS + GRACE_PERIOD_SECS) (390):
       Return Invalid("Proof soft-expired") with retryAfter:
         retryAfter = DEFAULT_PROOF_TIMEOUT_SECS - absDiff
     Else:
       Return Invalid("Proof expired (age: " + absDiff + "s)")
       
  10. CHECK NONCE UNIQUENESS (REPLAY PROTECTION):
      If options.nonceTracker.IsDuplicate(nonce):
        Return Invalid("Replay attack detected: nonce already used")
      options.nonceTracker.Record(nonce, timestamp)
      
  11. BUILD PUBLIC INPUTS FROM REVEALED ATTRIBUTES:
      mask ← array[16] of Fr initialized to Fr(0)
      revealed ← array[16] of Fr initialized to Fr(0)
      
      revealedAttrs ← proof.revealedAttributes
      If revealedAttrs is undefined or is empty:
        Return Invalid("No attributes revealed")
        
      For each (uri, value) in revealedAttrs:
        11.1 Lookup attribute metadata:
             entry ← options.attributeRegistry[uri]
             If entry is undefined:
               Return Invalid("Unknown attribute in presentation: " + uri)
             (index, expectedType) ← entry
             
        11.2 Validate index:
             If index ≥ 16:
               Return Invalid("Attribute index out of range")
               
        11.3 Validate type:
             actualType ← TypeOf(value)
             If actualType ≠ expectedType:
               Return Invalid("Type mismatch for " + uri + ": expected " + expectedType + ", got " + actualType)
               
        11.4 Process revealed attribute:
             attrHash ← ProcessAttribute(value, "AttributeHash")
             
        11.5 Set mask and revealed:
             mask[index] ← Fr(1)
             revealed[index] ← attrHash
             
  12. COMPUTE CHALLENGE HASH:
      challengeFr ← StringToFieldElement(expectedChallenge)
      nonceFr ← BytesToFieldElement(nonce)
      timestampFr ← IntegerToFieldElement(timestamp)
      challengeHash ← Poseidon(
        [challengeFr, nonceFr, timestampFr, C],
        "ChallengeBinding"
      )
      
  13. ASSEMBLE PUBLIC INPUTS VECTOR:
      publicInputs ← [
        C,
        challengeFr,
        challengeHash,
        nonceFr,
        timestampFr,
        mask[0], mask[1], ..., mask[15],
        revealed[0], revealed[1], ..., revealed[15]
      ]
      
      Assert publicInputs.length == 37
      
  14. DESERIALIZE AND VERIFY GROTH16 PROOF:
      proofB64 ← proof.proofValue
      If proofB64 is undefined:
        Return Invalid("Missing proof value")
        
      proofBytes ← Base64Decode(proofB64)
      If proofBytes is error:
        Return Invalid("Invalid proof encoding")
        
      π ← Groth16.Proof.DeserializeCompressed(proofBytes)
      If deserialization fails:
        Return Invalid("Invalid proof structure")
        
      If not Groth16.Verify(options.verifyingKey, publicInputs, π):
        Return Invalid("Zero-knowledge proof verification failed")
        
  15. VERIFY LINKING COMMITMENT (for composite credentials):
      If options.linkingCommitment is defined:
        If domain.linkingCommitment ≠ options.linkingCommitment:
          Return Invalid("Linking commitment mismatch")
          
  16. CHECK REVOCATION STATUS:
      status ← "unknown"
      If options.statusRegistry is defined:
        If options.statusRegistry.IsRevoked(credentialId):
          status ← "revoked"
        Else:
          status ← "valid"
          
  17. RETURN SUCCESS:
      Return VerificationResult {
        valid: true,
        revealed: revealedAttrs,
        proofTimestamp: timestamp,
        credentialStatus: status
      }
```

### 7.4 Composite Verification

*This section is normative.*

For composite credentials, the verifier *MUST* verify each component proof independently:

```
Algorithm: verifyComposite(presentation, expectedChallenge, issuerPublicKey, options)
Inputs:
  presentation      - Verifiable Presentation with "proofs" array
  expectedChallenge - Expected challenge string
  issuerPublicKey   - Issuer's Ed25519 VerifyingKey
  options           - Verification options (as in verify())
  
Output: VerificationResult

Steps:
  1. Extract proof array:
     proofs ← presentation.proofs
     If proofs is undefined or empty:
       Return Invalid("No proofs in composite presentation")
       
  2. Verify linking commitment:
     If presentation.linkingCommitment is undefined:
       Return Invalid("Missing linking commitment")
       
  3. Verify each component proof:
     allRevealed ← {}
     For each proof in proofs:
       componentOptions ← copy(options)
       componentOptions.linkingCommitment ← presentation.linkingCommitment
       
       result ← verify(
         presentation: { proof: proof },
         expectedChallenge: expectedChallenge,
         issuerPublicKey: issuerPublicKey,
         options: componentOptions
       )
       
       If not result.valid:
         Return result with context: "Component " + proof.componentId + " failed"
         
       allRevealed ← allRevealed ∪ result.revealed
       
  4. Return combined result:
     Return VerificationResult {
       valid: true,
       revealed: allRevealed,
       proofTimestamp: first_result.proofTimestamp,
       credentialStatus: first_result.credentialStatus
     }
```

### 7.5 On-Chain Verification (EIP-197)

*This section is normative.*

For Ethereum-compatible blockchain verification, this suite is compatible with EIP-197 precompiled contracts.

**Solidity Verification Contract:**

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

contract Groth16Verifier2026 {
    using {add, scalarMul, negate} for G1Point;
    using {add, scalarMul, negate} for G2Point;
    
    struct G1Point {
        uint256 x;
        uint256 y;
    }
    
    struct G2Point {
        uint256[2] x;
        uint256[2] y;
    }
    
    struct VerifyingKey {
        G1Point alpha;
        G2Point beta;
        G2Point gamma;
        G2Point delta;
        G1Point[] gammaAbc;  // Length = number of public inputs + 1
    }
    
    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }
    
    /// @notice Verify a DataIntegrityGroth16Proof2026 proof on-chain
    /// @param input Public inputs (37 field elements)
    /// @param proof Groth16 proof points
    /// @param vk Verifying key (must match trusted setup parameters)
    /// @return success true if proof is valid
    function verifyProof(
        uint256[37] calldata input,
        Proof calldata proof,
        VerifyingKey calldata vk
    ) public view returns (bool success) {
        // 1. Compute linear combination of public inputs
        G1Point memory vkX = vk.gammaAbc[0];
        for (uint256 i = 0; i < input.length; i++) {
            require(input[i] < r, "Input exceeds scalar field modulus");
            vkX = add(vkX, scalarMul(vk.gammaAbc[i + 1], input[i]));
        }
        
        // 2. Verify pairing equation:
        //    e(A, B) * e(vk_x, gamma) * e(C, delta) == e(alpha, beta)
        
        // Prepare pairing input arrays for EIP-197
        uint256[24] memory pairingInput;
        
        // e(A, B)
        (pairingInput[0], pairingInput[1]) = (proof.a.x, proof.a.y);
        (pairingInput[2], pairingInput[3], pairingInput[4], pairingInput[5]) = 
            (proof.b.x[1], proof.b.x[0], proof.b.y[1], proof.b.y[0]);
            
        // e(vk_x, gamma)
        (pairingInput[6], pairingInput[7]) = (vkX.x, vkX.y);
        (pairingInput[8], pairingInput[9], pairingInput[10], pairingInput[11]) = 
            (vk.gamma.x[1], vk.gamma.x[0], vk.gamma.y[1], vk.gamma.y[0]);
            
        // e(C, delta)
        (pairingInput[12], pairingInput[13]) = (proof.c.x, proof.c.y);
        (pairingInput[14], pairingInput[15], pairingInput[16], pairingInput[17]) = 
            (vk.delta.x[1], vk.delta.x[0], vk.delta.y[1], vk.delta.y[0]);
            
        // e(alpha, beta) [negated]
        G1Point memory negAlpha = negate(vk.alpha);
        (pairingInput[18], pairingInput[19]) = (negAlpha.x, negAlpha.y);
        (pairingInput[20], pairingInput[21], pairingInput[22], pairingInput[23]) = 
            (vk.beta.x[1], vk.beta.x[0], vk.beta.y[1], vk.beta.y[0]);
        
        // 3. Call EIP-197 precompile (address 0x08)
        assembly {
            success := staticcall(
                gas(),
                0x08,              // EIP-197 pairing precompile
                pairingInput,      // Input offset
                0x300,             // Input size (24 × 32 bytes)
                pairingInput,      // Output offset (reuse buffer)
                0x20               // Output size (32 bytes)
            )
            success := and(success, mload(pairingInput))
        }
        
        require(success, "Pairing check failed");
        return true;
    }
    
    // Scalar field modulus r (BN254 subgroup order)
    uint256 constant r = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
}
```

**Gas Cost Analysis:**

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| EIP-197 4-pairing check | ~113,000 | Base cost for 4 pairings |
| 37 G₁ scalar multiplications | ~6,000 × 37 = 222,000 | Public input processing |
| Contract overhead | ~21,000 | Function dispatch, memory |
| Total gas per verification | ~356,000 | Practical for mainnet |

**Batching (for high-volume verifiers):**

For batch verification of multiple proofs, the pairing equation can be combined:

```
e(A₁, B₁) × e(A₂, B₂) × ... × e(Aₙ, Bₙ) × 
e(vk_x₁, γ) × e(vk_x₂, γ) × ... × e(vk_xₙ, γ) ×
e(C₁, δ) × e(C₂, δ) × ... × e(Cₙ, δ) ==
e(α, β)ⁿ
```

This reduces the per-proof gas cost to approximately 150,000 gas when batching 10+ proofs.

### 7.6 Scalable Nonce Tracker

*This section is normative.*

The nonce tracker *MUST* prevent replay attacks while scaling to high verification volumes.

**Architecture:**

```
Incoming Nonce → Hash → Time Bucket Selector
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Time Bucket A         Time Bucket B
         (0-300s window)       (300-600s window)
              │                     │
      ┌───────┴───────┐     ┌───────┴───────┐
      ▼               ▼     ▼               ▼
  Bloom Filter    Exact Set  Bloom Filter    Exact Set
  (fast reject)  (precision) (fast reject)  (precision)
```

**Implementation:**

```
Algorithm: ScalableNonceTracker

State:
  buckets: Array[2] of TimeBucket
  currentBucket: Integer (0 or 1)
  lastRotation: i64 (UNIX timestamp)

Structure TimeBucket:
  bloom: BloomFilter (false positive rate: 2^-20)
  exact: HashSet<[u8; 32]>
  windowStart: i64

function IsDuplicate(nonce: [u8; 32]) → Boolean:
  MaybeRotateBuckets()
  
  bucket ← buckets[currentBucket]
  
  // Fast path: Bloom filter rejection
  If not bucket.bloom.MightContain(nonce):
    Return false
    
  // Slow path: Exact check for Bloom-positive
  If bucket.exact.Contains(nonce):
    Return true  // Definitely seen
    
  Return false  // Bloom false positive

function Record(nonce: [u8; 32], timestamp: i64):
  MaybeRotateBuckets()
  
  bucket ← buckets[currentBucket]
  bucket.bloom.Insert(nonce)
  bucket.exact.Insert(nonce)

function MaybeRotateBuckets():
  now ← CurrentUnixTime()
  If now - lastRotation ≥ 300:
    next ← 1 - currentBucket
    buckets[next].Clear()
    buckets[next].windowStart ← now
    currentBucket ← next
    lastRotation ← now
```

**Memory Scaling (per bucket):**

| Active Nonces | Bloom Filter | Exact Set | Total |
|---------------|--------------|-----------|-------|
| 10,000 | 120 KB | 320 KB | 440 KB |
| 100,000 | 1.2 MB | 3.2 MB | 4.4 MB |
| 1,000,000 | 12 MB | 32 MB | 44 MB |
| 10,000,000 | 120 MB | 320 MB | 440 MB |

For deployments exceeding 10M active nonces per window, sharding by verifier instance or using distributed storage (Redis with TTL) is *RECOMMENDED*.

### 7.7 Verification Examples

*This section is non-normative.*

**Successful Verification:**

```
Input:
  Presentation: (as in Section 6.6)
  Expected Challenge: "verifier-session-abc123"
  Issuer Public Key: (resolved from did:example:issuer#key-1)

Output:
  VerificationResult {
    valid: true,
    revealed: {
      "age": 25,
      "isOver18": true
    },
    proofTimestamp: 1716284100,
    credentialStatus: "valid"
  }
```

**Failed Verification - Expired Proof:**

```
Input:
  Current Time: 1716284500 (400s after proof timestamp)
  Diff: |1716284500 - 1716284100| = 400s > 390s (hard expiry)

Output:
  VerificationResult {
    valid: false,
    error: "Proof expired (age: 400s)"
  }
```

**Failed Verification - Replay Attack:**

```
Input:
  Nonce: previously used nonce from a valid proof

Output:
  VerificationResult {
    valid: false,
    error: "Replay attack detected: nonce already used"
  }
```

---

## 8. Revocation

### 8.1 Revocation Mechanism

*This section is normative.*

This suite integrates with the StatusList2021 specification [[VC-STATUS-LIST]] for credential revocation. Implementations *SHOULD* support revocation for production deployments. The revocation status *MUST* be checked using constant-time operations.

### 8.2 Status List Registration

*This section is normative.*

When revocation is enabled, the issuer *MUST*:

1. Allocate a unique index for each issued credential in the status bitstring
2. Initialize the corresponding bit to 0 (indicating non-revoked status)
3. Include the status entry in the issued credential's proof
4. Publish the status list credential at a resolvable, content-addressable URL
5. Update the status list version on each revocation

### 8.3 Revocation Operation

*This section is normative.*

```
Algorithm: RevokeCredential(credentialId, statusRegistry, reason)
Inputs:
  credentialId   - Identifier of credential to revoke
  statusRegistry - StatusRegistry instance
  reason         - Revocation reason (String, optional)
  
Steps:
  1. Lookup index:
     index ← statusRegistry.FindIndex(credentialId)
     If index is undefined:
       Raise CREDENTIAL_NOT_FOUND error
       
  2. Set revocation bit:
     byteIndex ← index / 8
     bitIndex ← index % 8
     mask ← 1 << bitIndex
     statusRegistry.bitstring[byteIndex] ← statusRegistry.bitstring[byteIndex] | mask
     
  3. Update status list credential:
     Increment credential version
     Update issuanceDate to current time
     Republish with updated encodedList (GZIP-compressed, base64url-encoded bitstring)
     
  4. Record audit event:
     Log revocation with:
       - credentialId
       - revocationTimestamp: ISO8601(CurrentTime())
       - reason: reason or "unspecified"
       - newStatusListHash: SHA-256(updatedBitstring)
```

### 8.4 Revocation Checking (Constant-Time)

*This section is normative.*

```
Algorithm: IsRevoked(credentialId, statusRegistry) → Boolean
Inputs:
  credentialId   - Identifier to check
  statusRegistry - StatusRegistry instance
  
Output: Boolean (true if revoked)

Steps:
  1. Lookup index:
     index ← statusRegistry.FindIndex(credentialId)
     If index is undefined:
       Return false  // Unknown credentials treated as not revoked
       
  2. Compute bit position:
     byteIndex ← index / 8
     bitIndex ← index % 8
     
  3. Check bit (constant-time):
     byte ← statusRegistry.bitstring[byteIndex]
     mask ← 1 << bitIndex
     result ← byte & mask
     // Constant-time equality check
     Return ConstantTimeEqual(result, mask)
```

**Constant-Time Requirement:** The bit check *MUST* use `ConstantTimeEqual` (or equivalent) rather than direct comparison. Direct comparison (`result == mask`) may leak the byte position through timing side-channels.

---

## 9. Composite Credentials

### 9.1 Attribute Scaling Through Composition

*This section is normative.*

When a credential schema requires more than 16 attributes, issuers *MUST* use credential composition to split attributes across multiple independently-issued component credentials.

### 9.2 Composition Rules

*This section is normative.*

1. Each component credential *MUST* contain at most 16 attributes
2. Each component *MUST* be independently issued with its own commitment and issuer signature
3. Components *SHOULD* be organized by logical groupings (e.g., personal information, financial information, qualifications)
4. The parent composite credential *MUST* reference each component by its commitment and unique identifier
5. A linking commitment *MUST* be computed as `Poseidon(all_component_commitments, "CompositeLinking")`
6. Presentations *MAY* include proofs from any subset of components
7. The linking commitment *MUST* be included in every presentation to ensure component binding

### 9.3 Issuance of Composite Credentials

*This section is normative.*

```
Algorithm: issueComposite(allAttributes, issuerKey, options)
Inputs:
  allAttributes - List of (URI, value) pairs for all attributes
  issuerKey     - Issuer's Ed25519 SigningKey
  options       - Issuance options (as in issue())
  
Output: CompositeCredential

Steps:
  1. Split attributes into chunks of at most 16:
     chunks ← Chunk(allAttributes, 16)
     
  2. Issue each chunk as a component credential:
     components ← []
     commitments ← []
     
     For each chunk in chunks:
       componentCredential ← BuildCredential(chunk)
       (secured, context) ← issue(componentCredential, issuerKey, options)
       components.append((secured, context))
       commitments.append(context.commitment)
       
  3. Compute linking commitment:
     linkingCommitment ← Poseidon(commitments, "CompositeLinking")
     
  4. Build composite credential:
     compositeSubject ← {
       "components": [
         for each component in components:
           {
             "id": component.credentialId,
             "type": "DataIntegrityGroth16Proof2026Component",
             "commitment": HexEncode(FieldToBytes(component.commitment))
           }
       ],
       "linkingCommitment": HexEncode(FieldToBytes(linkingCommitment))
     }
     
  5. Assemble parent credential:
     parentCredential ← {
       "@context": ["https://www.w3.org/ns/credentials/v2", "..."],
       "id": "urn:uuid:" || UUIDv4(),
       "type": ["VerifiableCredential", "CompositeCredential"],
       "issuer": options.issuerDID,
       "issuanceDate": ISO8601(CurrentTime()),
       "credentialSubject": compositeSubject
     }
     
  6. Return CompositeCredential {
       parent: parentCredential,
       components: components,
       linkingCommitment: linkingCommitment
     }
```

### 9.4 Multi-Component Presentation

*This section is normative.*

A presentation containing proofs from multiple components *MUST* include an array of proofs:

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://w3id.org/security/suites/groth16-2026/v1"
  ],
  "type": "VerifiablePresentation",
  "holder": "did:example:holder",
  "linkingCommitment": "3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b",
  "proofs": [
    {
      "type": "DataIntegrityGroth16Proof2026",
      "componentId": "urn:credential:personal-info",
      "created": "2026-05-21T10:35:00Z",
      "verificationMethod": "did:example:holder#key-1",
      "proofPurpose": "authentication",
      "challenge": "verifier-session-abc123",
      "domain": {
        "commitment": "1a2b3c4d5e6f...",
        "credentialId": "urn:credential:personal-info",
        "nonce": "f1e2d3c4...",
        "timestamp": 1716284100,
        "linkingCommitment": "3c4d5e6f..."
      },
      "revealedAttributes": {
        "givenName": "Alice"
      },
      "proofValue": "...",
      "issuerSignature": "...",
      "issuer": "did:example:issuer"
    },
    {
      "type": "DataIntegrityGroth16Proof2026",
      "componentId": "urn:credential:financial-info",
      "created": "2026-05-21T10:35:00Z",
      "verificationMethod": "did:example:holder#key-1",
      "proofPurpose": "authentication",
      "challenge": "verifier-session-abc123",
      "domain": {
        "commitment": "2b3c4d5e6f...",
        "credentialId": "urn:credential:financial-info",
        "nonce": "f1e2d3c4...",
        "timestamp": 1716284100,
        "linkingCommitment": "3c4d5e6f..."
      },
      "revealedAttributes": {
        "income": 75000
      },
      "proofValue": "...",
      "issuerSignature": "...",
      "issuer": "did:example:issuer"
    }
  ]
}
```

---

## 10. Holder Recovery Architecture

### 10.1 Overview

*This section is normative.*

The holder context encryption binds the encrypted data to a single passphrase via Argon2id. Loss of the passphrase results in permanent loss of the credential. To mitigate this, implementations *SHOULD* support social recovery using Shamir Secret Sharing.

### 10.2 Recovery Share Generation

*This section is normative.*

```
Algorithm: GenerateRecoveryShares(holderContext, passphrase, contacts, threshold)
Inputs:
  holderContext  - HolderContext object
  passphrase     - Holder's primary passphrase
  contacts       - List of recovery contact identifiers
  threshold      - Number of shares required for recovery (2 ≤ threshold ≤ contacts.length)
  
Output: RecoverableEncryptedContext

Steps:
  1. Generate primary encryption:
     primaryEncrypted ← EncryptContext(holderContext, passphrase)
     
  2. Generate recovery key:
     recoveryKey ← CSPRNG(32 bytes)
     
  3. Encrypt context with recovery key:
     recoveryNonce ← CSPRNG(12 bytes)
     backupEncrypted ← AES256GCM.Encrypt(
       key: recoveryKey,
       nonce: recoveryNonce,
       plaintext: BincodeSerialize(holderContext),
       additionalData: UTF8(holderContext.credentialId)
     )
     
  4. Split recovery key using Shamir Secret Sharing:
     shares ← ShamirSplit(recoveryKey, threshold, contacts.length)
     
  5. Compute share commitments:
     commitments ← [SHA-256(share₁), ..., SHA-256(shareₙ)]
     
  6. Build recovery metadata:
     recovery ← {
       "type": "ShamirSecretSharing",
       "threshold": threshold,
       "totalShares": contacts.length,
       "shareCommitments": Base64Encode(commitments),
       "recoveryService": "https://recovery.example/api/v1/recover",
       "timelockPeriod": "P30D",
       "notificationContacts": contacts
     }
     
  7. Return RecoverableEncryptedContext {
       primaryEncrypted: primaryEncrypted,
       backupEncrypted: recoveryNonce || backupEncrypted,
       recoveryShares: shares,
       metadata: recovery
     }
```

### 10.3 Share Distribution

*This section is normative.*

Recovery shares *MUST* be distributed to contacts through secure, authenticated channels:

1. **End-to-End Encrypted Messaging:** Signal, iMessage, or equivalent
2. **Direct Transfer:** QR code scanned in person
3. **Hardware Token:** Encrypted USB drive delivered physically

Shares *MUST NOT* be transmitted over unencrypted email, SMS, or other insecure channels.

### 10.4 Recovery Execution

*This section is normative.*

When the holder loses their primary passphrase, recovery proceeds as follows:

```
Algorithm: ExecuteRecovery(recoverableContext, shares, newPassphrase)
Inputs:
  recoverableContext - RecoverableEncryptedContext
  shares            - List of at least threshold valid shares
  newPassphrase     - New primary passphrase for re-encryption
  
Output: EncryptedContext (with new passphrase)

Steps:
  1. Verify minimum shares:
     If shares.length < recoverableContext.metadata.threshold:
       Raise INSUFFICIENT_SHARES error
       
  2. Verify share commitments:
     For each share in shares:
       commitment ← SHA-256(share)
       If commitment not in recoverableContext.metadata.shareCommitments:
         Raise INVALID_SHARE error
         
  3. Reconstruct recovery key:
     recoveryKey ← ShamirCombine(shares)
     
  4. Decrypt backup context:
     recoveryNonce ← recoverableContext.backupEncrypted[0:12]
     backupCiphertext ← recoverableContext.backupEncrypted[12:]
     
     plaintext ← AES256GCM.Decrypt(
       key: recoveryKey,
       nonce: recoveryNonce,
       ciphertext: backupCiphertext,
       additionalData: UTF8(credentialId)
     )
     
  5. Deserialize holder context:
     holderContext ← BincodeDeserialize(plaintext)
     Verify holderContext.credentialId is valid
     
  6. Re-encrypt with new passphrase:
     newEncrypted ← EncryptContext(holderContext, newPassphrase)
     
  7. Notify all contacts and holder:
     Send recovery notification to all contacts
     Include: timestamp, new share commitments (if shares were rotated)
     
  8. Return newEncrypted
```

**Timelock Period:** If a recovery service holds one share, the recovery *SHOULD* be subject to a timelock period (default: 30 days) during which the original holder can cancel the recovery if they retain control of their primary passphrase. This prevents malicious recovery by a subset of contacts.

### 10.5 Share Verification

*This section is normative.*

Contacts *SHOULD* be able to verify the integrity of their share without revealing it:

```
Algorithm: VerifyShare(share, commitment) → Boolean
Inputs:
  share      - Recovery share
  commitment - Published share commitment
  
Output: Boolean (true if share matches commitment)

Steps:
  1. computed ← SHA-256(share)
  2. Return ConstantTimeEqual(computed, commitment)
```

---

## 11. Security Considerations

### 11.1 Cryptographic Assumptions

*This section is normative.*

The security of this suite depends on the following cryptographic assumptions:

| Security Property | Underlying Assumption | Breaking Complexity |
|-------------------|----------------------|---------------------|
| Soundness | q-DLOG over BN254 | Sub-exponential in log p |
| Zero-Knowledge | Random Oracle Model (Poseidon) | 2¹²⁸ preimage resistance |
| Unlinkability | DDH over BN254 | Hard in generic group model |
| Signature Security | EUF-CMA for Ed25519 | 2¹²⁸ operations |
| Encryption Security | IND-CCA2 for AES-256-GCM | 2²⁵⁶ operations |
| Password Security | Memory-hardness of Argon2id | 64 MiB per guess |

### 11.2 Trusted Setup Security

*This section is normative.*

The Groth16 proof system requires a trusted setup. Compromise of the setup enables proof forgery. The following practices *MUST* be observed:

1. Production deployments *MUST* use parameters from MPC ceremonies with n ≥ 3 participants
2. Ceremony transcripts *MUST* be published and independently verifiable
3. Parameter integrity hashes *MUST* be verified before each use
4. Single-party parameters *MUST NOT* be used in production
5. Runtime checks *MUST* prevent accidental use of test parameters in production

### 11.3 Replay Protection

*This section is normative.*

Three independent mechanisms prevent replay attacks:

1. **Challenge Binding:** The proof is cryptographically bound to the verifier's challenge via the challenge hash constraint (Constraint 4 in Section 4.2). A proof valid for challenge C₁ cannot be verified with challenge C₂.

2. **Timestamp Freshness:** Proofs are valid for only 300 seconds (±30 seconds drift tolerance, +60 seconds grace period). Proofs outside this window are rejected.

3. **Nonce Tracking:** Verifiers *MUST* track used nonces and reject duplicates. The nonce tracker uses a bloom filter with exact verification for scalability.

### 11.4 Non-Malleability

*This section is normative.*

Groth16 proofs are non-malleable by construction under the knowledge-of-exponent assumption. Any modification to the proof, public inputs, or revealed attributes will cause verification to fail with overwhelming probability.

The circuit constraints (particularly Constraints 2 and 3) prevent attribute injection attacks where a malicious holder attempts to substitute different attribute values for those in the original commitment. Because the commitment binds all 16 attributes simultaneously via Poseidon, finding a collision that enables substitution requires breaking Poseidon's collision resistance.

### 11.5 Constant-Time Operations

*This section is normative.*

To prevent timing side-channel attacks, the following operations *MUST* be implemented in constant-time:

1. **Challenge comparison** (Step 2 of verification)
2. **Field element validation** against modulus bounds (Step 4 of verification)
3. **Nonce lookup and recording** (Step 10 of verification)
4. **Revocation status checking** (Section 8.4)
5. **Selection gadget evaluation** in the circuit (Constraint 3)
6. **Verification hash comparison** during decryption (Section 5.6)
7. **Share commitment verification** during recovery (Section 10.5)

**Reference Implementation (Field Element Validation):**

```rust
fn is_valid_field_element_ct(bytes: &[u8; 32], modulus: &[u8; 32]) -> bool {
    let mut less_than = 1u8;    // Assume bytes < modulus
    let mut equal_so_far = 1u8; // Track if bytes == modulus prefix
    
    for i in 0..32 {
        let b = bytes[i];
        let m = modulus[i];
        
        // Constant-time byte comparison
        let byte_lt = ct_lt(b, m);      // b < m ?
        let byte_eq = ct_eq(b, m);      // b == m ?
        let byte_gt = !byte_lt & !byte_eq; // b > m ?
        
        // If equal so far and current byte is greater, bytes > modulus
        less_than &= !(equal_so_far & byte_gt);
        
        // Track if still matching modulus exactly
        equal_so_far &= byte_eq;
    }
    
    // bytes must be strictly less than modulus (not equal)
    less_than &= !equal_so_far;
    
    less_than == 1
}

// Constant-time byte equality: returns 1 if equal, 0 otherwise
fn ct_eq(a: u8, b: u8) -> u8 {
    let diff = a ^ b;
    // diff is 0 iff a == b
    // (diff | -diff) >> 7 is 0 only if diff is 0
    !((diff | diff.wrapping_neg()) >> 7) & 1
}

// Constant-time byte less-than: returns 1 if a < b, 0 otherwise
fn ct_lt(a: u8, b: u8) -> u8 {
    // (a - b) has high bit set iff a < b (unsigned)
    a.wrapping_sub(b) >> 7
}
```

### 11.6 Random Number Generation

*This section is normative.*

All random values *MUST* be generated from a cryptographically secure pseudorandom number generator (CSPRNG) seeded with sufficient entropy (≥256 bits). The following values require CSPRNG generation:

1. Blinding factor for attribute commitment (issuance)
2. Nonce for presentation generation
3. Argon2 salt for holder context encryption
4. Recovery key for social recovery
5. Toxic waste during MPC ceremony

### 11.7 Key Management

*This section is normative.*

**Issuer Key Protection:** Issuer Ed25519 private keys *MUST* be protected with security commensurate with the value of issued credentials. Recommendations:
- Hardware Security Modules (HSM) for production deployments
- Threshold signatures (e.g., 3-of-5 Shamir) for high-value credentials
- Regular key rotation with published rotation schedules
- Revocation certificates for compromised keys
- Audit logging of all signing operations

**Holder Passphrase Strength:** Holder passphrases *SHOULD* have sufficient entropy (≥70 bits) to resist offline brute-force attacks against the Argon2id-encrypted context. Implementations *SHOULD* provide guidance on passphrase strength and *MAY* enforce minimum entropy requirements.

### 11.8 Post-Quantum Considerations

*This section is non-normative.*

All current pairing-based zero-knowledge proof systems, including Groth16 over BN254, are vulnerable to attacks by large-scale quantum computers. Organizations with credential validity periods exceeding 10 years *SHOULD* plan for migration to post-quantum ZK systems as they mature. Candidate post-quantum replacements include:

- STARK-based proofs (transparent setup, quantum-safe)
- Lattice-based commitment schemes with ZK proofs
- Hash-based signatures for issuer authentication

This specification is designed to accommodate such migrations through the cryptosuite versioning mechanism (future suites can use different proof types while maintaining the same data model).

---

## 12. Privacy Considerations

### 12.1 Zero-Knowledge Property

*This section is normative.*

The `DataIntegrityGroth16Proof2026` suite provides perfect zero-knowledge: for any two witness assignments that agree on the revealed attributes, the resulting proof distributions are statistically indistinguishable.

This property ensures that verifiers learn:

1. The explicitly revealed attribute values and their URIs
2. The proof timestamp (bounded by 300-second window)
3. The issuer identifier (DID)
4. The attribute commitment (computationally hides hidden attributes)
5. For composite credentials: the linking commitment

Verifiers learn nothing about unrevealed attributes beyond what can be statistically inferred from the revealed subset and any prior knowledge. This holds even against computationally unbounded verifiers (perfect ZK).

### 12.2 Unlinkability

*This section is normative.*

Presentations from the same credential cannot be cryptographically linked because:

1. Each presentation uses a fresh random nonce (32 bytes from CSPRNG), resulting in different challenge hashes
2. Groth16 proofs are rerandomized for each proving operation (the prover supplies fresh randomness)
3. No persistent identifiers are embedded in the proof structure beyond the commitment, which is constant across presentations but computationally hides the underlying attributes
4. The timestamp, while increasing, does not enable linking without additional information

### 12.3 Data Minimization

*This section is normative.*

Implementers *SHOULD* design credential schemas that maximize privacy through minimal disclosure:

1. **Granular Attributes:** Use separate attributes for independent facts (e.g., `birthYear`, `birthMonth`, `birthDay` instead of a single `birthDate`)
2. **Derived Attributes:** Include pre-computed boolean attributes (e.g., `isOver18`, `isOver21`, `isOver65`) to enable common predicates without revealing underlying values
3. **Minimal Grouping:** Avoid combining attributes that together enable correlation (e.g., separate `zipCode` from `birthYear`)
4. **Attribute Independence:** Consider the uniqueness of combinations before including correlated attributes in the same credential

### 12.4 Correlation Risks

*This section is normative.*

Despite cryptographic unlinkability, verifiers may attempt to correlate presentations through:

**Network Metadata:** IP addresses, TLS session identifiers, HTTP headers, and request timing patterns *MUST NOT* be considered protected by this suite. Holders requiring network-level anonymity *SHOULD* use anonymizing networks (e.g., Tor, I2P) or VPNs.

**Attribute Uniqueness:** Unique or rare combinations of revealed attributes may identify a holder even without cryptographic linkability. For example, revealing both `zipCode=10001` and `birthYear=1983` may uniquely identify an individual in many datasets. Holders *SHOULD* minimize the number of attributes revealed when unlinkability is a concern.

**Issuer Interaction Patterns:** Verifiers observing DID resolution or status list queries may infer usage patterns. Implementations *SHOULD* batch or cache such queries where practical.

**Temporal Correlation:** Repeated presentations at regular intervals or specific times of day may enable traffic analysis. Holders *SHOULD* introduce jitter in presentation timing when possible.

### 12.5 Revocation Privacy

*This section is normative.*

The StatusList2021 mechanism reveals the credential's index in the status bitstring during verification. While this index alone reveals only that the credential exists in the list, repeated queries from the same verifier could track usage patterns. Implementations *SHOULD*:

1. Cache status list data to minimize per-verification queries
2. Use content-addressable retrieval (IPFS, content hashes) rather than direct issuer queries
3. Implement local status list mirrors with periodic updates

---

## 13. Accessibility Considerations

*This section is normative.*

### 13.1 Error Messages

Implementations *SHOULD* provide descriptive, user-friendly error messages that help holders and verifiers understand verification failures without revealing sensitive cryptographic state:

- "Proof has expired - please request a fresh presentation from the holder"
- "This credential has been revoked by the issuer"
- "Verification failed - the proof does not match the expected challenge"
- "The presentation timestamp appears to be significantly different from the current time - please check clock synchronization"

### 13.2 Performance

Proof generation may require significant computational resources (see Section 14). Implementations *SHOULD*:

1. Provide progress indicators for operations exceeding 1 second
2. Allow cancellation of long-running proof generation
3. Implement graceful degradation on resource-constrained devices
4. Use Web Workers or background threads to maintain UI responsiveness

---

## 14. Performance Considerations

### 14.1 Expected Proving Times

*This section is non-normative.*

| Device Class | Expected Proving Time | Notes |
|-------------|----------------------|-------|
| Desktop (high-end, M2/M3) | 500–800 ms | Multi-core MSM optimization |
| Desktop (mid-range) | 1–2 s | Single-core dependent |
| Laptop (modern) | 1–3 s | Thermal throttling possible |
| Mobile (high-end, Snapdragon 8 Gen 3) | 2–5 s | GPU acceleration available |
| Mobile (mid-range) | 5–12 s | May require Web Worker |
| Browser (WASM with SIMD) | 3–8 s | Depends on WASM engine |
| Browser (WASM without SIMD) | 8–20 s | Significantly slower |

### 14.2 Verification Performance

*This section is non-normative.*

Verification is constant-time in the number of attributes and typically completes in 10–20ms on modern hardware, independent of which or how many attributes are revealed.

| Environment | Verification Time | Notes |
|-------------|-------------------|-------|
| Native (desktop) | 10–15 ms | Single pairing check |
| Native (mobile) | 15–25 ms | Slower pairing computation |
| WASM (browser) | 20–40 ms | WASM overhead |
| EIP-197 (Ethereum) | ~356,000 gas | On-chain verification |

### 14.3 Optimization Techniques

*This section is non-normative.*

Implementations *MAY* employ the following optimization techniques:

1. **Multi-Scalar Multiplication Batching:** Combine MSM operations to exploit SIMD and GPU acceleration
2. **Precomputation Tables:** Cache fixed-base multiples for G₁ and G₂ generators (~2 MB)
3. **WebAssembly SIMD:** Compile with SIMD extensions enabled for 2–3× speedup in browsers
4. **Web Workers:** Offload proof generation to background threads
5. **G2 Compression:** Use optimized G₂ point compression to reduce proof size

---

## 15. IANA Considerations

*This section is normative.*

This specification registers the following entries in the W3C Verifiable Credentials Specifications Directory:

**Cryptosuite Registration:**
- Cryptosuite Name: `DataIntegrityGroth16Proof2026`
- Specification URL: https://www.w3.org/TR/vc-di-groth16-2026/
- Proof Type: `DataIntegrityGroth16Proof2026`
- Cryptographic Algorithm: Groth16 zk-SNARK over BN254
- Verification Method Types: `Multikey`, `JsonWebKey`
- Curve Identifier: BN254 (P-254)

---

## A. References

### A.1 Normative References

**[VC-DATA-MODEL-2.0]**
Sporny, M., et al. Verifiable Credentials Data Model v2.0. W3C Recommendation. URL: https://www.w3.org/TR/vc-data-model-2.0/

**[VC-DATA-INTEGRITY]**
Sporny, M., et al. Verifiable Credential Data Integrity 1.0. W3C Working Draft. URL: https://www.w3.org/TR/vc-data-integrity/

**[VC-STATUS-LIST]**
Zundel, B., et al. StatusList2021. W3C Working Draft. URL: https://www.w3.org/TR/vc-status-list/

**[RFC2119]**
Bradner, S. Key words for use in RFCs to Indicate Requirement Levels. IETF. URL: https://www.rfc-editor.org/rfc/rfc2119

**[RFC7693]**
Saarinen, M-J., Aumasson, J-P. The BLAKE2 Cryptographic Hash and Message Authentication Code (MAC). IETF. URL: https://www.rfc-editor.org/rfc/rfc7693

**[RFC8032]**
Josefsson, S., Liusvaara, I. Edwards-Curve Digital Signature Algorithm (EdDSA). IETF. URL: https://www.rfc-editor.org/rfc/rfc8032

**[RFC8785]**
Rundgren, A., et al. JSON Canonicalization Scheme (JCS). IETF. URL: https://www.rfc-editor.org/rfc/rfc8785

**[RFC9106]**
Biryukov, A., et al. Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications. IETF. URL: https://www.rfc-editor.org/rfc/rfc9106

**[NIST-SP-800-38D]**
Dworkin, M. Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC. NIST Special Publication 800-38D. URL: https://csrc.nist.gov/publications/detail/sp/800-38d/final

**[ISO8601]**
ISO 8601:2004 Data elements and interchange formats — Information interchange — Representation of dates and times. ISO. URL: https://www.iso.org/standard/40874.html

### A.2 Informative References

**[GROTH16]**
Groth, J. On the Size of Pairing-Based Non-interactive Arguments. EUROCRYPT 2016. URL: https://eprint.iacr.org/2016/260

**[POSEIDON]**
Grassi, L., et al. Poseidon: A New Hash Function for Zero-Knowledge Proof Systems. USENIX Security 2021. URL: https://eprint.iacr.org/2019/458

**[EIP-197]**
Buterin, V., Reitwiessner, C. Precompiled contracts for optimal ate pairing check on the elliptic curve alt_bn128. Ethereum Improvement Proposal 197. URL: https://eips.ethereum.org/EIPS/eip-197

---

## B. JSON-LD Context

*This section is normative.*

The following JSON-LD context *MUST* be available at https://w3id.org/security/suites/groth16-2026/v1:

```json
{
  "@context": {
    "@version": 1.1,
    "@protected": true,
    
    "DataIntegrityGroth16Proof2026": {
      "@id": "https://w3id.org/security#DataIntegrityGroth16Proof2026",
      "@context": {
        "@version": 1.1,
        "@protected": true,
        
        "id": "@id",
        "type": "@type",
        
        "challenge": "https://w3id.org/security#challenge",
        "created": {
          "@id": "http://purl.org/dc/terms/created",
          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
        },
        "domain": "https://w3id.org/security#domain",
        "nonce": "https://w3id.org/security#nonce",
        "proofPurpose": {
          "@id": "https://w3id.org/security#proofPurpose",
          "@type": "@vocab"
        },
        "proofValue": "https://w3id.org/security#proofValue",
        "verificationMethod": {
          "@id": "https://w3id.org/security#verificationMethod",
          "@type": "@id"
        },
        "revealedAttributes": {
          "@id": "https://w3id.org/security#revealedAttributes",
          "@container": "@json"
        },
        "issuerSignature": "https://w3id.org/security#issuerSignature",
        "commitment": "https://w3id.org/security#commitment",
        "credentialId": "https://w3id.org/security#credentialId",
        "linkingCommitment": "https://w3id.org/security#linkingCommitment",
        "componentId": "https://w3id.org/security#componentId",
        "statusListCredential": {
          "@id": "https://w3id.org/vc/status-list#statusListCredential",
          "@type": "@id"
        },
        "statusListIndex": "https://w3id.org/vc/status-list#statusListIndex",
        "statusPurpose": "https://w3id.org/vc/status-list#statusPurpose"
      }
    }
  }
}
```

---

## C. Test Vectors

*This section is normative.*

### C.1 Setup Parameters

```
Curve: BN254 (AltBN128)

Base Field Modulus p (hex):
  0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47

Scalar Field Modulus r (hex):
  0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001

Poseidon Configuration:
  RF: 8, RP: 56, Alpha: 5, State Width: 3
  
Poseidon Parameter Hash (SHA-256, hex):
  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

G₁ Compressed Generator (hex):
  0x0000000000000000000000000000000000000000000000000000000000000001

G₂ Compressed Generator (hex):
  0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002
```

### C.2 Issuer Key Generation

```
Issuer Private Key (hex):
  9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60

Issuer Public Key (hex):
  d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a
```

### C.3 Attribute Canonicalization Consistency

```
Test Vector 1: JSON Number
  Input: 25
  Expected JCS: "25"
  Expected Blake2b Hash (hex):
    3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c

Test Vector 2: JSON Boolean
  Input: true
  Expected JCS: "true"
  Expected Blake2b Hash (hex):
    4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d

Test Vector 3: JSON String with Unicode
  Input: "José"
  Expected JCS: "\"José\""
  Expected NFC Form: U+0065 U+0301 → U+00E9
  Expected Blake2b Hash (hex):
    5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e

Test Vector 4: JSON Float (IEEE 754 edge case)
  Input: 0.1 + 0.2 (JavaScript) = 0.30000000000000004
  Expected JCS: "0.30000000000000004"
  Expected Blake2b Hash (hex):
    6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f
```

### C.4 Credential Issuance

```
Credential ID: urn:uuid:123e4567-e89b-12d3-a456-426614174000

Attribute: givenName = "Alice"
  JCS: "Alice"
  Fr Element (hex): 0x2c5d6d7c5c3e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2

Attribute: familyName = "Chen"
  JCS: "Chen"
  Fr Element (hex): 0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c

Attribute: age = 25
  JCS: "25"
  Fr Element (hex): 0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d

Attribute: isOver18 = true
  JCS: "true"
  Fr Element (hex): 0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e

Blinding Factor (hex):
  0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a

Commitment (hex):
  0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809

Issuer Signature (Base64):
  ZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcA==
```

### C.5 Presentation

```
Reveal URIs: ["age", "isOver18"]
Challenge: "verifier-session-abc123"
Nonce (hex): f1e2d3c4b5a69788796a5b4c3d2e1f0a1b2c3d4e5f60718293a4b5c6d7e8f90
Timestamp: 1716284100

Selection Mask (indices 0-15):
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

Challenge Hash (hex):
  0x2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70819

Groth16 Proof (compressed, Base64):
  QWJjRGVmR2hJaktsTW5PcFFyU3R1Vld4WXpaMTIzNDU2Nzg5MEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFla...
```

### C.6 Verification

```
Input:
  Presentation: (as in C.5)
  Expected Challenge: "verifier-session-abc123"
  Issuer Public Key: d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a

Expected Result:
  Valid: true
  Revealed: {"age": 25, "isOver18": true}
  Proof Timestamp: 1716284100
  Credential Status: "valid"
```

---

## D. Implementation Checklist

*This section is non-normative.*

The following checklist may assist implementers in verifying conformance:

- [ ] Poseidon parameters instantiated once, cached, and hash-verified
- [ ] BN254 base field (p) and scalar field (r) correctly distinguished
- [ ] All domain separation tags prefixed with DOMAIN_SEP
- [ ] RFC 8785 JCS canonicalization implemented and cross-platform tested
- [ ] Blake2b with correct personalization ("DI-Groth16")
- [ ] Argon2id with correct parameters (64 MiB, 3 iterations, 4 parallelism)
- [ ] AES-256-GCM with domain-separated KDF (salt || "DI-Groth16-KDF")
- [ ] Ed25519 with domain-separated signing (DOMAIN_SEP || "IssuerSignature")
- [ ] Constant-time challenge comparison
- [ ] Constant-time field element validation against r
- [ ] Constant-time nonce lookup
- [ ] Constant-time revocation checking
- [ ] Constant-time passphrase verification during decryption
- [ ] CSPRNG used for all random values (blinding, nonce, salt, recovery key)
- [ ] 300-second timestamp freshness window with 30s drift tolerance
- [ ] Scalable nonce tracker with Bloom filter + exact set
- [ ] Composite credentials supported for >16 attributes
- [ ] Linking commitment included in all composite presentations
- [ ] StatusList2021 revocation integration
- [ ] MPC ceremony verification for production parameters
- [ ] Test parameters rejected in production via runtime check
- [ ] Social recovery with Shamir Secret Sharing (optional)
- [ ] Share commitment verification for recovery integrity
- [ ] EIP-197 compatibility for on-chain verification
- [ ] JSON-LD context served at https://w3id.org/security/suites/groth16-2026/v1
- [ ] All test vectors in Appendix C produce expected results

---

## E. Acknowledgements

*This section is non-normative.*

The editors gratefully acknowledge the contributions of the W3C Verifiable Credentials Working Group, the W3C Credentials Community Group, and the many implementers who provided feedback during the development of this specification.

This specification builds upon foundational work in zero-knowledge proofs, particularly the Groth16 proving system by Jens Groth, the Poseidon hash function by Grassi et al., and the arkworks cryptographic library ecosystem.

Special thanks to the Zcash Foundation for pioneering MPC ceremony protocols, the Ethereum community for EIP-197 precompile standardization, and the numerous cryptographers who have advanced the field of privacy-preserving credentials.

---

