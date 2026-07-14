// "Ask this wiki" widget: a labeled button + right-side drawer on every page, calling the
// knowledge-base-chat Worker. Only public values here (Worker URL + Turnstile SITE key).
// Turnstile runs in INVISIBLE mode: no visible widget; a token is fetched silently on submit.
// Re-injects on Quartz's SPA "nav" event so it survives client-side navigation.
(function () {
  var WORKER_URL = "https://knowledge-base-chat.ludicartguild.workers.dev";
  var SITE_KEY = "0x4AAAAAAD1ZPJFSkixgcU8V";
  var tsWidgetId = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function errMsg(code) {
    switch (code) {
      case "daily_limit": return "The assistant hit its usage limit for now. Please try again later.";
      case "rate_limited": return "You're sending requests too quickly — please wait a moment.";
      case "challenge_failed": return "Couldn't verify you're human — please try again.";
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

  // Render a fresh invisible widget each time and let it auto-run; resolve the token via
  // its callback. The sitekey's server-side "invisible" mode keeps it silent.
  function getToken(root) {
    return new Promise(function (resolve) {
      if (!window.turnstile) { resolve(""); return; }
      var el = root.querySelector(".kbc-ts");
      if (!el) { resolve(""); return; }
      if (tsWidgetId !== null) { try { window.turnstile.remove(tsWidgetId); } catch (_) {} tsWidgetId = null; }
      el.innerHTML = "";
      var done = false;
      function finish(t) { if (!done) { done = true; resolve(t || ""); } }
      try {
        tsWidgetId = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          callback: function (t) { finish(t); },
          "error-callback": function () { finish(""); },
          "timeout-callback": function () { finish(""); },
        });
      } catch (_) { finish(""); }
      setTimeout(function () { finish(""); }, 10000);
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

    function setOpen(o) {
      drawer.classList.toggle("open", o);
      drawer.setAttribute("aria-hidden", String(!o));
      openBtn.setAttribute("aria-expanded", String(o));
    }
    openBtn.addEventListener("click", function () { setOpen(true); });
    root.querySelector(".kbc-close").addEventListener("click", function () { setOpen(false); });

    var qEl = root.querySelector(".kbc-q");
    async function ask() {
      var q = qEl.value.trim();
      if (!q) return;
      qEl.value = "";
      var qHtml = '<div class="kbc-you">' + esc(q) + "</div>";
      out.innerHTML = qHtml + '<p class="kbc-loading">Thinking…</p>';
      var token = await getToken(root);
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
    build();
  });
  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
