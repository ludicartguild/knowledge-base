// "Ask this wiki" widget: a labeled button + right-side drawer on every page, calling the
// knowledge-base-chat Worker. Only public values here (Worker URL + Turnstile SITE key).
// Re-injects on Quartz's SPA "nav" event so it survives client-side navigation.
(function () {
  var WORKER_URL = "https://knowledge-base-chat.ludicartguild.workers.dev";
  var SITE_KEY = "0x4AAAAAAD1WvGGAinbVCTtf";
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
      case "challenge_failed": return "Please complete the verification and try again.";
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

  function build() {
    if (document.getElementById("kb-chat-root")) return;
    var root = document.createElement("div");
    root.id = "kb-chat-root";
    root.innerHTML =
      '<button class="kbc-open" aria-controls="kbc-drawer" aria-expanded="false">Ask this wiki</button>' +
      '<aside id="kbc-drawer" class="kbc-drawer" aria-hidden="true" aria-label="Ask this wiki">' +
      '<div class="kbc-head"><strong>Ask this wiki</strong>' +
      '<button class="kbc-close" aria-label="Close">✕</button></div>' +
      '<div class="kbc-body">' +
      '<form class="kbc-form">' +
      '<textarea class="kbc-q" maxlength="600" placeholder="Ask a question about this wiki…" required></textarea>' +
      '<div class="kbc-ts"></div>' +
      '<button type="submit" class="kbc-send">Ask</button>' +
      "</form>" +
      '<div class="kbc-answer" aria-live="polite"></div>' +
      "</div></aside>";
    document.body.appendChild(root);

    var openBtn = root.querySelector(".kbc-open");
    var drawer = root.querySelector("#kbc-drawer");
    var out = root.querySelector(".kbc-answer");
    var tsEl = root.querySelector(".kbc-ts");

    function setOpen(o) {
      drawer.classList.toggle("open", o);
      drawer.setAttribute("aria-hidden", String(!o));
      openBtn.setAttribute("aria-expanded", String(o));
      if (o && tsWidgetId === null && window.turnstile) {
        tsWidgetId = window.turnstile.render(tsEl, { sitekey: SITE_KEY });
      }
    }
    openBtn.addEventListener("click", function () { setOpen(true); });
    root.querySelector(".kbc-close").addEventListener("click", function () { setOpen(false); });

    root.querySelector(".kbc-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var q = root.querySelector(".kbc-q").value.trim();
      if (!q) return;
      var token = window.turnstile && tsWidgetId !== null ? window.turnstile.getResponse(tsWidgetId) : "";
      out.innerHTML = '<p class="kbc-loading">Thinking…</p>';
      try {
        var r = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, turnstileToken: token }),
        });
        var j = await r.json();
        if (!r.ok || j.error) {
          out.innerHTML = '<p class="kbc-err">' + esc(errMsg(j.error)) + "</p>";
        } else {
          out.innerHTML = '<div class="kbc-text">' + esc(j.answer).replace(/\n/g, "<br>") + "</div>" + renderCitations(j.citations);
        }
      } catch (_) {
        out.innerHTML = '<p class="kbc-err">Something went wrong. Please try again.</p>';
      }
      if (window.turnstile && tsWidgetId !== null) window.turnstile.reset(tsWidgetId);
    });
  }

  // Escape closes the drawer (attached once).
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var d = document.getElementById("kbc-drawer");
    if (d) {
      d.classList.remove("open");
      d.setAttribute("aria-hidden", "true");
    }
  });

  // Quartz SPA morphs the body on navigation, removing our node -> rebuild + reset Turnstile.
  document.addEventListener("nav", function () {
    tsWidgetId = null;
    build();
  });
  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
