---
title: "Web Session & Token Handling"
tags: [security, auth, web]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

The browser is a hostile place to keep an OAuth token: any script on the page, including one an attacker injects, has the same access to `localStorage` and JavaScript-readable cookies that your own code does. The durable answer is to **keep tokens on the server** and give the browser only an opaque, `HttpOnly` session cookie. A backend-for-frontend (BFF) holds the access and refresh tokens, the browser holds a ticket, and the BFF attaches the real token to upstream calls. Every protected action is then authorized on the server, never on the strength of "the browser said so."

## Why it exists

Single-page apps naturally want to store the access token in the browser (`localStorage`, memory, or a script-readable cookie) and send it themselves. The problem is the **cross-site scripting (XSS)** threat model: injected script "has the same privileges as legitimate application code," so any token the legitimate code can read, an attacker's code can steal. Once stolen, a bearer token is usable anywhere until it expires.

Keeping the token out of the browser entirely removes that attack surface. The browser cannot leak what it never holds. This is why current guidance (the OAuth 2.0 for Browser-Based Apps BCP) recommends the BFF pattern for business, sensitive, and personal-data applications.

## How it works

### The backend-for-frontend (BFF) model

A small server-side component sits between the browser and the APIs. During login it runs the authorization-code flow (see [[oauth2-and-oidc-flows]]) and **keeps the resulting access and refresh tokens server-side, in the context of a cookie-based session**. The browser receives only a session cookie. When the frontend calls a protected resource, it calls the BFF; the BFF looks up the session's tokens and "augments the request with the correct access token before forwarding" it to the resource server.

![[bff-token-custody.drawio.svg]]

### Securing the session cookie

The cookie is the browser's entire credential, so its attributes matter (per the `Set-Cookie` semantics):

- **`HttpOnly`**: JavaScript cannot read it via `document.cookie`. This is what defuses XSS token theft; a script can still trigger requests, but it cannot exfiltrate the cookie.
- **`Secure`**: sent only over HTTPS, so it cannot leak over plaintext to a network attacker.
- **`SameSite`** (`Lax` or `Strict`): limits or blocks the cookie on cross-site requests, mitigating CSRF. `None` requires `Secure` and should be used only when cross-site sending is genuinely needed. Treat `SameSite` as **defense-in-depth, not a complete CSRF control**: `Lax` still permits top-level GET navigations and browser coverage varies, so a cookie-session app still needs an explicit anti-CSRF mechanism (a double-submit token, or requiring a custom header that cross-site forms cannot set) on state-changing requests.
- **`__Host-` name prefix**: the browser enforces that the cookie was set over HTTPS, has `Path=/`, and has **no `Domain`**, binding it to the exact host and not its subdomains. It is the closest thing to treating the origin as a hard security boundary.

Session data can exceed the roughly 4 KB per-cookie limit, so implementations sometimes **chunk** the cookie across several, reassembling server-side.

### Bearer forwarding and the two-tier gate

The browser never sends a bearer token; it sends the cookie. The BFF exchanges that for the stored access token and forwards it as `Authorization: Bearer` to upstream APIs. Those APIs still validate the token fully (signature, `aud`, `exp`, claims) on every request, as in [[jwt-validation]].

A useful division of labor: a cheap **edge/middleware check** can gate on mere cookie presence to bounce obviously-unauthenticated traffic early, but it is not authorization. **Authoritative validation happens server-side on every request**, and every state-changing action re-checks the user's claims and roles. The edge check is a bouncer glancing at the door; the real ID check happens inside.

### Logout that actually ends the session

Deleting the local cookie logs the user out of *your* app but leaves them signed in at the identity provider, so the next login silently succeeds. **RP-initiated logout** (OIDC) closes this: the app redirects the browser to the provider's `end_session_endpoint`, passing an `id_token_hint` (identifying which session to end) and a registered `post_logout_redirect_uri` (where to land afterward). This ends the session at the provider too.

## Trade-offs & when to use

- **BFF (tokens server-side)**: strongest against XSS token theft; needs a stateful-ish server component and a session store. The default for anything sensitive.
- **SPA holds the token**: simpler, no backend session, but the token is exposed to any script on the page. Acceptable only for low-value, public-data apps, and even then short lifetimes and strict content-security policies are essential.

The deciding question is blast radius: if a stolen token would expose personal or privileged data, keep it off the browser.

## Pitfalls / done-right checklist

- **Never store access or refresh tokens in `localStorage`** or any JavaScript-readable location.
- **Set `HttpOnly`, `Secure`, `SameSite`** on the session cookie; prefer the **`__Host-`** prefix.
- **Do not treat cookie presence as authorization**; validate server-side on every request and re-check roles on every mutation.
- **Add explicit CSRF protection** (a double-submit token or a required custom header) on state-changing requests; do not rely on `SameSite` alone.
- **Forward tokens server-side only**; the browser sees the cookie, never the bearer token.
- **Use RP-initiated logout** so signing out actually ends the provider session, not just the local one.
- **Scope cookies tightly** (host-bound, `Path=/`), and chunk rather than overflow the size limit.
- **Fail closed** on a missing or invalid session: no session means no access, never a default-allow.

## Mental model

Think of a **coat check**. You hand your coat and valuables (the tokens) to the cloakroom (the BFF) and walk around holding only a numbered ticket (the session cookie). The ticket is worthless to a pickpocket: it is not your coat, and only the cloakroom can turn it back into your coat, and only from behind the counter. `HttpOnly` is the rule that you cannot photograph the ticket to hand around; `__Host-` is that the ticket works only at this one cloakroom. Logout is telling the cloakroom to forget the ticket, and RP-initiated logout is also telling the building's front desk you have left.

## Practice & self-check

**Practice**

* Configure a session cookie with `HttpOnly`, `Secure`, `SameSite`, and the `__Host-` prefix, then verify in browser dev tools that `document.cookie` cannot read it and that the cookie is rejected if set without `Path=/` or with a `Domain` attribute.
* Build a minimal backend-for-frontend that runs the authorization-code flow at login, keeps the access and refresh tokens server-side keyed to the session, hands the browser only an opaque cookie, and attaches the real bearer token to upstream calls.
* Add explicit CSRF protection (a double-submit token or a required custom header) on a state-changing endpoint and confirm a cross-site form submission is rejected even though the cookie is sent.

**Check yourself** (you should be able to answer these from this note):

* Why is storing an access token in `localStorage` unsafe under the XSS threat model, and how does keeping it server-side remove that surface?
* What does the `HttpOnly` attribute defend against, and what does it not stop?
* Why is `SameSite` treated as defense-in-depth rather than a complete CSRF control?
* What does RP-initiated logout accomplish that simply deleting the local session cookie does not?

## Cross-links

- [[oauth2-and-oidc-flows]]: the flow the BFF runs at login to obtain the tokens it stores.
- [[jwt-validation]]: what the upstream API does with the bearer token the BFF forwards.
- [[backends-bff-and-apis]]: the BFF as an architectural pattern beyond auth.

## Sources

- OAuth 2.0 for Browser-Based Apps (BFF pattern, token storage), IETF draft: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
- MDN, `Set-Cookie` (HttpOnly, Secure, SameSite, `__Host-`/`__Secure-` prefixes): https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
- HTTP State Management (cookies), RFC 6265bis: https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis
- OpenID Connect RP-Initiated Logout 1.0: https://openid.net/specs/openid-connect-rpinitiated-1_0.html
