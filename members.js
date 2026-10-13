/* Renders the roster and curriculum on members.html from members-data.js.
   Runs before script.js so the rendered .reveal elements get picked up by
   the shared scroll-reveal observer. */
(function () {
  "use strict";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) {
      return w.charAt(0).toUpperCase();
    }).join("");
  }

  var LI_PATH = "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 11.02-4.12 2.06 2.06 0 01-.02 4.12zM7.11 20.45H3.56V9h3.55v11.45z";

  function svgIcon(path) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", path);
    svg.appendChild(p);
    return svg;
  }

  /* ── Roster ───────────────────────────────────────── */
  var grid = document.getElementById("rosterGrid");
  if (grid && typeof ROSTER !== "undefined") {
    var seats = Math.max(ROSTER_SEATS || 0, ROSTER.length);
    var filled = 0;

    for (var i = 0; i < seats; i++) {
      var m = ROSTER[i];
      var hasName = m && m.name;
      var card = el("li", "seat reveal" + (hasName ? "" : " seat-open"));

      var avatar = el("div", "seat-avatar");
      if (hasName && m.photo) {
        var img = document.createElement("img");
        img.src = m.photo;
        img.alt = "";
        img.loading = "lazy";
        avatar.appendChild(img);
      } else {
        avatar.appendChild(el("span", null, hasName ? initials(m.name) : pad(i + 1)));
      }
      card.appendChild(avatar);

      var text = el("div", "seat-text");
      text.appendChild(el("p", "seat-name", hasName ? m.name : "Coming soon"));
      text.appendChild(el("p", "seat-detail", hasName ? (m.detail || "Member") : "Member " + pad(i + 1)));
      card.appendChild(text);

      if (hasName && m.linkedin) {
        var a = el("a", "li li-sm");
        a.href = m.linkedin;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", m.name + " on LinkedIn (opens in a new tab)");
        a.appendChild(svgIcon(LI_PATH));
        card.appendChild(a);
      }

      if (hasName) filled++;
      grid.appendChild(card);
    }

    var count = document.getElementById("rosterCount");
    if (count) count.textContent = filled ? filled + " of " + seats + " members listed" : seats + " members";
  }

  /* ── Curriculum timeline ──────────────────────────── */
  var list = document.getElementById("timeline");
  if (list && typeof CURRICULUM !== "undefined") {
    var week = 0;

    CURRICULUM.forEach(function (w, idx) {
      if (!w.event) week++;
      var item = el("li", "tl-item reveal" + (w.event ? " tl-event" : "") + (w.tba ? " tl-tba" : ""));
      item.appendChild(el("span", "tl-dot"));

      var card = el("div", "tl-card");
      var tag = w.event ? w.date : "Week " + pad(week);

      if (w.tba) {
        var row = el("div", "tl-head");
        row.appendChild(el("span", "tl-num", tag));
        var t = el("span", "tl-main");
        t.appendChild(el("span", "tl-title", "To be announced"));
        row.appendChild(t);
        card.appendChild(row);
      } else {
        var bodyId = "tl-body-" + idx;
        var h = el("h3", "tl-h");
        var btn = el("button", "tl-head");
        btn.type = "button";
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", bodyId);

        btn.appendChild(el("span", "tl-num", tag));
        var main = el("span", "tl-main");
        main.appendChild(el("span", "tl-title", w.title));
        main.appendChild(el("span", "tl-sum", w.summary));
        btn.appendChild(main);
        btn.appendChild(el("span", "tl-chev"));
        h.appendChild(btn);
        card.appendChild(h);

        var body = el("div", "tl-body");
        body.id = bodyId;
        body.inert = true;
        var clip = el("div", "tl-clip");
        var inner = el("div", "tl-inner");

        (w.sections || []).forEach(function (s) {
          var sec = el("div", "tl-sec");
          sec.appendChild(el("p", "tl-label", s.label));
          var ul = el("ul", "tl-list");
          s.items.forEach(function (it) {
            var li = el("li");
            if (Array.isArray(it)) {
              li.appendChild(el("strong", null, it[0] + ":"));
              li.appendChild(document.createTextNode(" " + it[1]));
              li.className = "tl-pair";
            } else {
              li.textContent = it;
            }
            ul.appendChild(li);
          });
          sec.appendChild(ul);
          inner.appendChild(sec);
        });

        if (w.link) {
          var cta = el("a", "btn btn-primary btn-sm tl-cta", w.link.text);
          cta.href = w.link.href;
          cta.target = "_blank";
          cta.rel = "noopener noreferrer";
          inner.appendChild(cta);
        }

        clip.appendChild(inner);
        body.appendChild(clip);
        card.appendChild(body);

        btn.addEventListener("click", function () { setOpen(item, btn, body, btn.getAttribute("aria-expanded") !== "true"); });
      }

      item.appendChild(card);
      list.appendChild(item);
    });

    function setOpen(item, btn, body, open) {
      btn.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
      body.inert = !open;
    }

    var toggleAll = document.getElementById("timelineToggle");
    if (toggleAll) {
      toggleAll.addEventListener("click", function () {
        var open = toggleAll.getAttribute("aria-pressed") !== "true";
        [].slice.call(list.querySelectorAll(".tl-item")).forEach(function (item) {
          var btn = item.querySelector("button.tl-head");
          var body = item.querySelector(".tl-body");
          if (btn && body) setOpen(item, btn, body, open);
        });
        toggleAll.setAttribute("aria-pressed", String(open));
        toggleAll.textContent = open ? "Collapse all" : "Expand all";
      });
    }
  }
})();
