---
title: "OAuth2 & OIDC Flows"
tags: [security, auth]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

[[glossary#o|OAuth2]] is a framework for **delegated authorization**: it lets a client obtain limited access to a resource without ever seeing the resource owner's password. OpenID Connect ([[glossary#o|OIDC]]) is a thin **authentication** layer on top of OAuth2 that adds a verifiable identity token. The grant type you pick encodes *who is present and what is being delegated*: authorization-code + [[glossary#p|PKCE]] for a user signing in, client-credentials for a service acting as itself, and token-exchange (RFC 8693) for a service acting on a user's behalf downstream. Modern practice (RFC 9700) narrows the safe set of flows sharply: no implicit grant, no password grant, PKCE everywhere.

## Why it exists

Before OAuth2, letting one system act against another on your behalf usually meant handing over your username and password (the "password anti-pattern"). That gives the third party unlimited, non-expiring, non-scoped access and makes revocation impossible short of a password reset.

OAuth2 solves this by introducing a **token** the resource owner authorizes once, that is scoped (only certain permissions), time-bound (it expires), and revocable, without the client ever holding the user's credentials. OAuth2 answers *authorization* ("this client may read the calendar"). It deliberately says nothing about *authentication* ("who the user is"), which is why OIDC exists as a companion.

## How it works

### The four roles (RFC 6749)

- **Resource owner**: the user (or the service itself) who owns the data.
- **Client**: the application requesting access.
- **Authorization server (AS)**: authenticates the resource owner and issues tokens. This is the identity provider ([[glossary#i|IdP]]).
- **Resource server (RS)**: the [[glossary#a|API]] that holds the protected data and accepts tokens.

The client obtains an **access token** from the AS and presents it to the RS, typically as an [[glossary#h|HTTP]] `Authorization: Bearer <token>` header (RFC 6750). The access token is the currency of OAuth2; everything else exists to issue, scope, refresh, or verify it.

### Grant types: choosing by who is present

A "grant" (or flow) is the procedure for getting a token. The right one depends on whether a human is present and whose authority the token carries.

| Grant | Who is present | Use it for |
| --- | --- | --- |
| Authorization code + PKCE | A user, via a browser | User sign-in to web apps, SPAs, native/mobile apps |
| Client credentials | No user; a service acting as itself | Service-to-service / machine-to-machine calls |
| Token exchange (RFC 8693) | A user, upstream; a service acting for them downstream | Propagating user identity across service hops |
| Refresh token | (renewal) | Getting a fresh access token without re-prompting |
| Device authorization (RFC 8628) | A user, on an input-constrained device | Sign-in on TVs, CLIs, and IoT where typing a password is impractical |

Two legacy grants are now discouraged and should not appear in new systems (see Pitfalls): the **implicit** grant and the **resource-owner password credentials** grant.

### Authorization code + PKCE (user sign-in)

This is the default flow whenever a human logs in. The insight is that the token is delivered through a **back channel** (a server-to-server call), never through the browser URL.

1. The client redirects the browser to the AS `/authorize` endpoint with `response_type=code`, its `client_id`, requested `scope`, a `redirect_uri`, a random `state` ([[glossary#c|CSRF]] defense), and a PKCE `code_challenge`.
2. The AS authenticates the user and obtains consent, then redirects back to `redirect_uri` with a short-lived **authorization code**.
3. The client calls the AS `/token` endpoint, exchanging the code plus the PKCE `code_verifier` (and, for a confidential client, its own credentials) for an **access token** (and often a refresh token, and for OIDC an ID token).

**PKCE** (Proof Key for Code Exchange, RFC 7636) binds the authorization code to the client instance that started the flow. The client generates a random `code_verifier`, sends its hash (`code_challenge`) in step 1, and reveals the verifier in step 3. An attacker who intercepts the code cannot redeem it without the verifier. PKCE was created for public clients (SPAs, mobile) that cannot hold a secret, but current best practice applies it to confidential clients too.

![[oauth-authorization-code-pkce.drawio.svg]]

### Client credentials (service-to-service)

When no user is involved, a service authenticates as itself and receives a token representing the *service's* identity.

The client calls `/token` with `grant_type=client_credentials` and its credentials, and receives an access token. There is no user, no refresh token, and no consent screen. Because these calls are hot paths, the token is normally **cached and reused until shortly before expiry**, with a **single-flight** lock so that concurrent callers trigger only one refresh rather than a stampede, and a forced refresh on a `401` in case the token was revoked early.

### Token exchange / on-behalf-of (RFC 8693)

A common need in a service mesh: a user calls service A, and A must call service B *as that user*, so B can enforce the user's own permissions rather than A's. Passing A's own service token would lose the user's identity; replaying the user's original token to B is discouraged because it was not issued for B.

Token exchange solves this. Service A calls `/token` with `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`, presenting the user's token as the `subject_token` and naming B via `audience`. The AS returns a new token scoped for B that still carries the user's identity. RFC 8693 distinguishes two semantics:

- **Impersonation**: only a `subject_token` is sent; the new token makes A indistinguishable from the user (A "is" the user to B).
- **Delegation**: a `subject_token` plus an `actor_token` are sent; the resulting token records *both* parties, adding an `act` (actor) claim so B can see "this is the user, as acted upon by service A."

![[oauth-token-exchange.drawio.svg]]

### Refresh tokens

Access tokens are short-lived by design so that a leaked one expires quickly. A **refresh token** lets the client obtain a new access token without re-prompting the user, by calling `/token` with `grant_type=refresh_token`. Because a refresh token is long-lived and powerful, RFC 9700 requires it to be **sender-constrained or rotated** for public clients: rotation issues a new refresh token on each use and revokes the family if an old one is replayed, which detects theft. *Sender-constraining* instead binds the token to a key the client holds (via DPoP, RFC 9449, or mutual-[[glossary#t|TLS]]), so a stolen token is useless to anyone who lacks that key.

### OIDC: the identity layer

OAuth2 alone never tells the client *who* the user is; a raw access token is opaque to the client. OIDC ("a simple identity layer on top of the OAuth 2.0 protocol") adds an **ID token**: a signed [[glossary#j|JWT]] with standard identity claims (`iss`, `sub`, `aud`, `exp`, `iat`, and `nonce` for replay defense). Request it by adding the `openid` scope to an authorization-code flow.

The distinction that trips people up:

- **ID token**: proves *authentication* to the **client**. The client validates it and reads who the user is. It is not meant to be sent to APIs.
- **Access token**: grants *authorization* at the **resource server**. The client treats it as opaque and simply forwards it to the API.

OIDC also standardizes **discovery**: the AS publishes its endpoints and signing keys at `/.well-known/openid-configuration`, so clients configure themselves from the issuer URL rather than hardcoding endpoints.

### Concrete example: Okta as the OIDC provider

Okta is a widely used hosted IdP; its public model illustrates the concepts. Okta exposes two kinds of authorization server:

- **Org authorization server** (`https://{yourOktaDomain}`): built in, issues tokens for Okta's own APIs. Its access tokens are for Okta and their contents "are subject to change," so your own resource servers should not try to validate them.
- **Custom authorization server** (`https://{yourOktaDomain}/oauth2/{authorizationServerId}`): part of API Access Management; here you define your own `scope`s, `claim`s, and access policies. These tokens are meant to be validated by *your* APIs.

Either way the endpoints follow the standard shape: `/authorize` (start the flow), `/token` (exchange code or get a client-credentials token), `/keys` (the [[glossary#j|JWKS]] of public signing keys), and `/.well-known/openid-configuration` (discovery). This maps one-to-one onto the flows above: an [[glossary#s|SPA]] does authorization-code + PKCE against `/authorize` then `/token`; a backend job does client-credentials against `/token`; every consumer fetches `/keys` to verify token signatures (see [[jwt-validation]]).

## Trade-offs & when to use

- **User signing into any app** (web, SPA, mobile): authorization-code + PKCE. Non-negotiable default.
- **A cron job, worker, or backend calling another API as itself**: client-credentials.
- **A service calling a downstream API as the calling user**: token-exchange (delegation if the downstream should see both identities, impersonation if it should see only the user).
- **Avoiding constant re-login**: refresh tokens, rotated.
- **Knowing who the user is** (not just what they can access): add OIDC (`openid` scope, validate the ID token).

The cost of OAuth2/OIDC is real complexity (redirects, key rotation, token lifetimes, discovery), so for a single trusted service with no user delegation, a simpler signed-token scheme can be enough. The moment a *user's* authority must cross a trust boundary, OAuth2 is the standard answer.

## Pitfalls / done-right checklist

- **Do not use the implicit grant** (`response_type=token`). RFC 9700 says clients `SHOULD NOT` use it; it returns access tokens in the browser URL where they leak via history, referrer headers, and logs. Use authorization-code + PKCE instead.
- **Never use the resource-owner password grant.** RFC 9700 says it `MUST NOT` be used; it reintroduces the password anti-pattern.
- **Always send `state` and PKCE** on authorization-code flows; validate `state` on return to block CSRF.
- **Keep tokens out of the browser** where possible: prefer a server-side session that holds the tokens and forwards them (see [[web-session-and-token-handling]]).
- **Validate the audience.** A resource server must reject tokens minted for a different audience, or it becomes a confused deputy.
- **Do not validate opaque provider-internal tokens.** As Okta's org server illustrates, some access tokens are private to the issuer and may change format; only validate tokens issued for you.
- **Rotate refresh tokens** and revoke the family on replay.
- **Cache client-credentials tokens** with single-flight refresh; do not fetch a new token per call.

## Mental model

OAuth2 is a **valet key**. You do not hand the valet your house keys (your password); you hand over a key that only starts the car, only for now, and that you can invalidate. The *grant type* is how you decide which valet key to cut: one for a person standing at the door (authorization-code), one for a trusted machine with its own key (client-credentials), and one that says "act for this person, but on my authority" (token-exchange). OIDC clips a **photo ID** to the valet key so the client also learns *who* the person is, not just what door the key opens.

## Practice & self-check

**Practice**

* Trace an authorization-code + PKCE sign-in end to end against any standard OIDC provider: generate a `code_verifier` and its `code_challenge`, build the `/authorize` URL with `state` and the challenge, complete consent, then exchange the code plus verifier at `/token`. Confirm the code alone cannot be redeemed without the verifier.
* Fetch a provider's `/.well-known/openid-configuration`, follow the `jwks_uri` to its JWKS, and identify the `/authorize`, `/token`, and keys endpoints from discovery alone rather than hardcoding them.
* Configure a confidential client to obtain a client-credentials token, then add caching with a single-flight lock so concurrent callers trigger one refresh, plus a forced refresh on a `401`.

**Check yourself** (you should be able to answer these from this note):

* Which grant type fits each of: a user signing in to a mobile app, a cron job calling an API as itself, and a service calling downstream as the calling user?
* Why is the authorization code delivered through the back channel rather than the browser URL, and what does PKCE add on top of that?
* What is the difference between an ID token and an access token, and which one should never be sent to an API?
* Why must a resource server validate the audience, and what failure mode occurs if it does not?

## Cross-links

- [[jwt-validation]]: how a resource server actually verifies the tokens these flows issue.
- [[web-session-and-token-handling]]: keeping the issued tokens server-side in web apps.
- [[backends-bff-and-apis]]: the backend-for-frontend that commonly owns the token exchange.

## Sources

- OAuth 2.0 Authorization Framework, RFC 6749: https://datatracker.ietf.org/doc/html/rfc6749
- Bearer Token Usage, RFC 6750: https://datatracker.ietf.org/doc/html/rfc6750
- Proof Key for Code Exchange (PKCE), RFC 7636: https://datatracker.ietf.org/doc/html/rfc7636
- OAuth 2.0 Token Exchange, RFC 8693: https://datatracker.ietf.org/doc/html/rfc8693
- OAuth 2.0 Security Best Current Practice, RFC 9700 (BCP 240): https://datatracker.ietf.org/doc/html/rfc9700
- OpenID Connect Core 1.0: https://openid.net/specs/openid-connect-core-1_0.html
- Okta, Authorization servers (org vs custom, endpoints): https://developer.okta.com/docs/concepts/auth-servers/
