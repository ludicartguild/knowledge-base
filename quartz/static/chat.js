// "Ask this wiki" widget: a labeled button + right-side drawer on every page, calling the
// knowledge-base-chat Worker. Only public values here (Worker URL + Turnstile SITE key).
// Turnstile (managed): the check shows when the drawer opens; once cleared it hides and the
// token is stored, then silently re-verifies after each answer.
// Re-injects on Quartz's SPA "nav" event so it survives client-side navigation.
(function () {
  var WORKER_URL = "https://knowledge-base-chat.ludicartguild.workers.dev";
  var SITE_KEY = "0x4AAAAAAD1aCZsis-PIlXSA";
  var tsWidgetId = null;
  var tsToken = "";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function errMsg(code) {
    switch (code) {
      case "daily_limit": return "The assistant hit its usage limit for now. Please try again later.";
      case "rate_limited": return "You're sending requests too quickly — please wait a moment.";
      case "challenge_failed": return "Couldn't verify you're human — please complete the check and try again.";
      case "forbidden": return "This assistant only works from the wiki site.";
      default: return "Something went wrong. Please try again.";
    }
  }

  function renderCitations(cits) {
    if (!cits || !cits.length) return "";
    var items = cits
      .map(function (c) {
        var href = "/" + String(c.note_path).replace(/\.md$/, "");
        return '<li><a href="' + href + '">' + esc(c.title) + "</a>" + (c.heading ? " &rsaquo; " + esc(c.heading) : "") + "</li>";
      })
      .join("");
    return '<div class="kbc-cites"><p>Sources</p><ul>' + items + "</ul></div>";
  }

  function renderTS(root) {
    if (tsWidgetId !== null || !window.turnstile) return;
    var el = root.querySelector(".kbc-ts");
    if (!el) return;
    tsWidgetId = window.turnstile.render(el, {
      sitekey: SITE_KEY,
      callback: function (t) { tsToken = t; el.style.display = "none"; },
      "error-callback": function () { tsToken = ""; el.style.display = ""; },
      "expired-callback": function () {
        tsToken = "";
        el.style.display = "";
        try { window.turnstile.reset(tsWidgetId); } catch (_) {}
      },
    });
  }

  function build() {
    if (document.getElementById("kb-chat-root")) return;
    var root = document.createElement("div");
    root.id = "kb-chat-root";
    root.innerHTML =
      '<button class="kbc-open" aria-controls="kbc-drawer" aria-expanded="false">Ask this wiki</button>' +
      '<aside id="kbc-drawer" class="kbc-drawer" aria-hidden="true" aria-label="Ask this wiki">' +
      '<div class="kbc-head"><strong>Ask this wiki</strong>' +
      '<button class="kbc-close" aria-label="Close">✕</button></div>' +
      '<div class="kbc-answer" aria-live="polite"><p class="kbc-hint">Ask a question and get an answer grounded in this wiki, with sources.</p></div>' +
      '<form class="kbc-form">' +
      '<textarea class="kbc-q" maxlength="600" rows="2" placeholder="Ask a question about this wiki…" required></textarea>' +
      '<div class="kbc-ts"></div>' +
      '<button type="submit" class="kbc-send">Ask</button>' +
      "</form></aside>";
    document.body.appendChild(root);

    var openBtn = root.querySelector(".kbc-open");
    var drawer = root.querySelector("#kbc-drawer");
    var out = root.querySelector(".kbc-answer");
    var qEl = root.querySelector(".kbc-q");

    function setOpen(o) {
      drawer.classList.toggle("open", o);
      drawer.setAttribute("aria-hidden", String(!o));
      openBtn.setAttribute("aria-expanded", String(o));
      if (o) renderTS(root);
    }
    openBtn.addEventListener("click", function () { setOpen(true); });
    root.querySelector(".kbc-close").addEventListener("click", function () { setOpen(false); });

    async function ask() {
      var q = qEl.value.trim();
      if (!q) return;
      renderTS(root);
      var tsEl = root.querySelector(".kbc-ts");
      if (!tsToken) {
        if (tsEl) tsEl.style.display = "";
        out.innerHTML = '<p class="kbc-hint">Please complete the quick check below, then Ask.</p>';
        return;
      }
      qEl.value = "";
      var token = tsToken;
      tsToken = "";
      var qHtml = '<div class="kbc-you">' + esc(q) + "</div>";
      out.innerHTML = qHtml + '<p class="kbc-loading">Thinking…</p>';
      try {
        var r = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, turnstileToken: token }),
        });
        var j = await r.json();
        if (!r.ok || j.error) {
          out.innerHTML = qHtml + '<p class="kbc-err">' + esc(errMsg(j.error)) + "</p>";
        } else {
          out.innerHTML = qHtml + '<div class="kbc-text">' + esc(j.answer).replace(/\n/g, "<br>") + "</div>" + renderCitations(j.citations);
        }
      } catch (_) {
        out.innerHTML = qHtml + '<p class="kbc-err">Something went wrong. Please try again.</p>';
      }
      // token is single-use: silently re-verify for the next question
      if (tsWidgetId !== null && window.turnstile) {
        try { window.turnstile.reset(tsWidgetId); } catch (_) {}
      }
      if (tsEl) tsEl.style.display = "";
    }
    root.querySelector(".kbc-form").addEventListener("submit", function (e) { e.preventDefault(); ask(); });
    qEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var d = document.getElementById("kbc-drawer");
    if (d) { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); }
  });

  document.addEventListener("nav", function () {
    tsWidgetId = null;
    tsToken = "";
    build();
  });
  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
