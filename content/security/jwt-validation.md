---
title: "JWT Validation Done Right"
tags: [security, auth]
level: deep
type: reference
reviewed: 2026-07-12
---

## TL;DR

A JSON Web Token (JWT) lets a resource server verify a caller's identity and permissions **without calling the issuer on every request**: the token is signed, and the server checks the signature and claims locally. That statelessness is the whole point, and also the whole danger. Validation done wrong (trusting the token's own `alg` header, skipping audience checks, accepting `alg: none`) turns "verify the token" into "believe whatever the attacker sent." Doing it right is a fixed checklist: verify the signature with a key and algorithm *you* pin, then validate every registered claim, and fail closed on anything missing.

## Why it exists

Session cookies require the server to keep session state and look it up on every request. In a distributed system with many services, that shared lookup becomes a bottleneck and a coupling point. A signed token inverts this: the authorization server signs a small set of claims once, and any service holding the issuer's **public** key can verify the token offline, as many times as it likes, with no callback.

The tradeoff is that a signed token cannot be un-issued before it expires (there is no central session to delete), which is why access tokens are short-lived and why validation must be exactly right: the signature is the only thing standing between a real token and a forged one.

## How it works

### Anatomy of a signed JWT

A JWT is three base64url-encoded parts joined by dots: `header.payload.signature`. This signed form is a **JWS** (JSON Web Signature).

- **Header**: metadata, including `alg` (the signing algorithm the issuer claims it used) and usually `kid` (which key).
- **Payload**: the **claims**, a JSON object (`iss`, `aud`, `exp`, and so on).
- **Signature**: the issuer's signature over `header.payload`.

Only the signature is secret-bearing; the header and payload are merely encoded, not encrypted. Never put secrets in a JWT, and never trust a claim you have not cryptographically verified.

### Signatures: asymmetric vs symmetric

- **Symmetric (HS256)**: one shared secret signs and verifies. Every verifier must hold the secret, which means every verifier could also *forge* tokens. Poor fit for multi-service verification.
- **Asymmetric (RS256, ES256)**: the issuer signs with a **private** key; verifiers hold only the **public** key. A verifier can check tokens but cannot mint them. This is the right model for resource servers, and why public keys are published openly.

### Getting the keys: JWKS and rotation

The issuer publishes its public keys as a **JWK Set** (JWKS): a JSON document with a `keys` array, each entry a JWK carrying `kty` (key type, e.g. RSA/EC), optionally `use` (`sig`) and `alg`, and a `kid`.

Validation resolves the key by `kid`: read the token header's `kid`, find the matching JWK in the set. **Key rotation** works precisely because a JWKS can publish the old and new keys *at the same time*: the issuer starts signing with the new `kid` while the old one remains published until all its tokens expire, so nothing breaks mid-rotation. Verifiers therefore **cache the JWKS but refresh it** (on a TTL, and on encountering an unknown `kid`), rather than pinning a single key forever.

### Verifying: pin the algorithm, never trust the header

The single most important rule (RFC 8725): the verifier decides the acceptable algorithm(s); the token's own `alg` header is an attacker-controlled input, not an instruction.

- **Reject `alg: none`.** A token can declare it is unsigned; a naive library then "verifies" it trivially. Configure the verifier to reject `none`.
- **Prevent algorithm-confusion (RS/HS) attacks.** If a server expects `RS256` but blindly honors the header, an attacker can switch it to `HS256` and sign with the *public* RSA key as if it were an HMAC secret, since the public key is, by definition, public. RFC 8725's rule: "each key MUST be used with exactly one algorithm, and this MUST be checked." Pin the expected algorithm to the key.
- **Give the library an explicit allowlist of algorithms** and no others.

### Validating the claims

After the signature verifies, check the registered claims (RFC 7519). Missing or wrong: reject.

- **`exp`** (expiry): reject if past, allowing only small clock skew (a minute or two).
- **`nbf`** / **`iat`**: not before / issued at; reject tokens not yet valid or implausibly old.
- **`iss`** (issuer): must equal the expected issuer, and RFC 8725 adds that the verifying key must actually *belong* to that issuer (which the JWKS-by-issuer discovery guarantees).
- **`aud`** (audience): must include *this* service. RFC 8725: if the audience "is not present or not associated with the recipient, it MUST reject the JWT." Skipping this makes the service a confused deputy that accepts tokens minted for someone else.

### The validation flow

![[jwt-validation-flow.drawio.svg]]

## Trade-offs & when to use

Self-verified JWTs shine when many services must check auth cheaply and independently. Their cost is **revocation lag**: a compromised token is valid until `exp`. Mitigations: keep lifetimes short, pair with refresh-token rotation (see [[oauth2-and-oidc-flows]]), and for high-value operations, use **opaque tokens + introspection** (the resource server calls the issuer to check validity in real time) where immediate revocation matters more than offline verification. Many systems do both: short-lived JWTs for most calls, introspection for sensitive ones.

## Pitfalls / done-right checklist

- **Pin the algorithm**; pass the library an explicit allowlist; never derive it from the token header.
- **Reject `alg: none`.**
- **Bind key to algorithm** so an RSA public key can never be accepted as an HMAC secret.
- **Validate `aud`** against this service, and **`iss`** against the expected issuer.
- **Enforce `exp`/`nbf`** with only minimal clock skew.
- **Resolve keys by `kid` from a cached-but-refreshable JWKS**; never hardcode a single key.
- **Fail closed**: any missing claim, unknown `kid`, fetch failure, or verification error rejects the request. Never "allow on error."
- **Check `typ` / prevent cross-JWT confusion**: RFC 8725 recommends explicit typing (e.g. `at+jwt` for access tokens) so a token minted for one purpose (say an ID token) cannot be accepted where another (an access token) is expected.
- **Treat `kid` as attacker-controlled**: use it only to *select* among keys in the trusted, issuer-pinned JWKS; never fetch a key from a URL or location the token itself supplies (a `kid`-injection / SSRF vector).
- **Do not put secrets in the payload**; it is readable by anyone.

## Mental model

A JWT is a **tamper-evident sealed envelope**, not a locked box. Anyone can read what is written on it (the claims are just encoded), but the wax seal (the signature) proves who sent it and that it was not altered. Validation is checking the seal against a seal-stamp you already trust (the issuer's public key), then reading the letter. The classic failures are all forms of not really checking the seal: accepting an envelope stamped "no seal needed" (`alg: none`), or letting the sender tell you which stamp to compare against (trusting the header `alg`).

## Practice & self-check

**Practice**

* Implement a minimal JWT validator that takes an explicit algorithm allowlist, rejects `alg: none`, resolves the key by `kid` from a cached JWKS, and then checks `exp`, `nbf`, `iss`, and `aud`. Feed it a token with a tampered payload and confirm it fails closed.
* Demonstrate the RS/HS algorithm-confusion attack against a naive verifier: sign a token with `HS256` using the RSA public key as the HMAC secret, show a header-trusting verifier accepts it, then pin the algorithm to the key and show the fixed verifier rejects it.
* Simulate key rotation: publish two keys in a JWKS with different `kid` values, sign with the new one, and confirm verifiers refresh the JWKS on an unknown `kid` rather than failing.

**Check yourself** (you should be able to answer these from this note):

* Why must the verifier pin the accepted algorithm instead of trusting the token's `alg` header?
* Why is asymmetric signing (RS256/ES256) a better fit than HS256 for multi-service verification?
* How does publishing old and new keys in a JWKS at the same time let key rotation happen without breaking valid tokens?
* What is the cost of self-verified JWTs compared to opaque tokens plus introspection, and when would you reach for introspection?

## Cross-links

- [[oauth2-and-oidc-flows]]: where these tokens come from and what `iss`/`aud`/`client_id` mean.
- [[web-session-and-token-handling]]: how a web app holds these tokens and forwards them.
- [[backends-bff-and-apis]]: the API layer that performs this validation on each request.

## Sources

- JSON Web Token (JWT), RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
- JSON Web Signature (JWS), RFC 7515: https://datatracker.ietf.org/doc/html/rfc7515
- JSON Web Key (JWK) and JWK Set, RFC 7517: https://datatracker.ietf.org/doc/html/rfc7517
- JSON Web Token Best Current Practices, RFC 8725: https://datatracker.ietf.org/doc/html/rfc8725
- OAuth 2.0 Security Best Current Practice, RFC 9700: https://datatracker.ietf.org/doc/html/rfc9700
- Okta, authorization servers and the keys (JWKS) endpoint: https://developer.okta.com/docs/concepts/auth-servers/
