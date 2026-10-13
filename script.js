(function () {
  "use strict";

  var snap       = document.getElementById("snap");
  var topnav     = document.getElementById("topnav");
  var navToggle  = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var rail       = document.querySelector(".scroll-rail");
  var railDots   = [].slice.call(document.querySelectorAll(".rail-dot"));
  var panels     = [].slice.call(document.querySelectorAll(".panel"));

  /* ── Reveal on scroll ─────────────────────────────── */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || prefersReduced) {
    showAll();
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var siblings = [].slice.call(e.target.parentNode.children).filter(function (n) {
          return n.classList.contains("reveal");
        });
        var i = siblings.indexOf(e.target);
        e.target.style.transitionDelay = Math.min(i, 6) * 55 + "ms";
        e.target.classList.add("in");
        revealIO.unobserve(e.target);
      });
    }, { root: snap, threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealEls.forEach(function (el) { revealIO.observe(el); });

    // Failsafe: if the observer hasn't revealed anything shortly after load
    // (hidden tab, non-compositing renderer, odd browser), show everything.
    // Content visibility must never depend on an animation firing.
    window.setTimeout(function () {
      if (!document.querySelector(".reveal.in")) showAll();
    }, 1600);
  }

  /* ── Nav background + rail theme on scroll ────────── */
  function syncChrome() {
    if (!snap) return;

    // Solid nav once we're past the hero's top edge
    if (snap.scrollTop > 60) topnav.classList.add("solid");
    else topnav.classList.remove("solid");

    // Rail inverts when the panel behind it is dark
    var midY = window.innerHeight / 2;
    var onDark = false;
    panels.forEach(function (p) {
      var r = p.getBoundingClientRect();
      if (r.top <= midY && r.bottom >= midY) {
        onDark = p.classList.contains("panel-dark") || p.classList.contains("hero") ||
                 p.classList.contains("team-panel");
      }
    });
    if (rail) rail.classList.toggle("on-dark", onDark);
  }

  if (snap) {
    var ticking = false;
    snap.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { syncChrome(); ticking = false; });
    }, { passive: true });
    syncChrome();
  }

  /* ── Rail active state + click-to-scroll ──────────── */
  var dotById = {};
  railDots.forEach(function (dot) {
    dotById[dot.getAttribute("data-target")] = dot;
    dot.addEventListener("click", function () {
      scrollToId(dot.getAttribute("data-target"));
    });
  });

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var dot = dotById[e.target.id];
        if (dot && e.isIntersecting) {
          railDots.forEach(function (d) { d.classList.remove("is-active"); });
          dot.classList.add("is-active");
        }
      });
    }, { root: snap, threshold: 0.5 });
    panels.forEach(function (p) { if (dotById[p.id]) sectionIO.observe(p); });
  }

  /* ── Anchor links inside the snap container ───────── */
  [].slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });

  [].slice.call(document.querySelectorAll("[data-scroll-to]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToId(btn.getAttribute("data-scroll-to"));
    });
  });

  /* ── Mobile menu ──────────────────────────────────── */
  function closeMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileMenu.classList.toggle("open", !open);
      mobileMenu.setAttribute("aria-hidden", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ── Magnetic buttons ─────────────────────────────── */
  // Real CTAs (.btn) pull slightly toward the cursor within a padded zone
  // around each button, and spring back on leave. Skipped entirely under
  // prefers-reduced-motion and on touch devices (no hover, nothing to track).
  if (!prefersReduced && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var MAGNET_PAD = 26;    // px beyond the button's own box that still pulls
    var MAGNET_MAX = 10;    // px, cap on how far a button can shift

    [].slice.call(document.querySelectorAll(".btn")).forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = e.clientX - cx, dy = e.clientY - cy;
        var mx = Math.max(dx, -(r.width / 2 + MAGNET_PAD));
        var my = Math.max(dy, -(r.height / 2 + MAGNET_PAD));
        var tx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * 0.32));
        var ty = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * 0.32));
        btn.style.transition = "transform 60ms linear";
        btn.style.transform = "translate(" + tx + "px, " + (ty - 1.5) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transition = "transform 320ms cubic-bezier(.22,1.4,.36,1)";
        btn.style.transform = "";
      });
    });
  }

  /* ── Photo tilt on hover ──────────────────────────── */
  // Team headshots and the Farmer School photos tilt in 3D toward the
  // cursor. Same reduced-motion / hover-capable gating as magnetic buttons.
  if (!prefersReduced && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var TILT_MAX = 8; // degrees

    [].slice.call(document.querySelectorAll(".member-photo, .photo-frame")).forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;   // 0..1
        var rotY = (px - 0.5) * TILT_MAX * 2;
        var rotX = (0.5 - py) * TILT_MAX * 2;
        card.style.transition = "transform 60ms linear";
        card.style.transform =
          "perspective(600px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) scale3d(1.03,1.03,1.03)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 420ms cubic-bezier(.22,1,.36,1)";
        card.style.transform = "";
      });
    });
  }

  /* ── Count-up numbers ─────────────────────────────── */
  // Any element with data-count="2000" counts up from 0 the first time it
  // scrolls into view. The real number is already in the HTML, so no-JS and
  // reduced-motion visitors just see it.
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && !prefersReduced && "IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        var node = e.target;
        var end = parseInt(node.getAttribute("data-count"), 10) || 0;
        var t0 = null, DUR = 1100;
        (function tick(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / DUR, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          node.textContent = Math.round(end * eased).toLocaleString("en-US");
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      });
    }, { root: snap, threshold: 0.6 });
    counters.forEach(function (c) { countIO.observe(c); });
  }

  /* ── Curriculum timeline: spine fill + week counter ── */
  // The red line down the timeline fills to wherever the reader is, the dots
  // behind that point turn red, and the big number tracks the current week.
  var tlFill   = document.getElementById("tlFill");
  var tlList   = document.getElementById("timeline");
  var currWeek = document.getElementById("currWeek");

  function syncTimeline() {
    if (!tlFill || !tlList) return;
    var spine = tlFill.parentNode.getBoundingClientRect();
    if (!spine.height) return;
    var mark = window.innerHeight * 0.58;
    var p = Math.max(0, Math.min(1, (mark - spine.top) / spine.height));
    tlFill.style.transform = "scaleY(" + p.toFixed(4) + ")";

    var weeks = 0;
    [].slice.call(tlList.children).forEach(function (item) {
      var dot = item.querySelector(".tl-dot");
      var passed = dot && dot.getBoundingClientRect().top <= mark;
      item.classList.toggle("is-passed", !!passed);
      if (passed && !item.classList.contains("tl-event")) weeks++;
    });
    if (currWeek) currWeek.textContent = Math.max(weeks, 1);
  }

  /* ── Reading progress bar ─────────────────────────── */
  var progressBar = document.getElementById("progressBar");

  function syncProgress() {
    if (!progressBar || !snap) return;
    var max = snap.scrollHeight - snap.clientHeight;
    progressBar.style.transform = "scaleX(" + (max > 0 ? snap.scrollTop / max : 0).toFixed(4) + ")";
  }

  if (snap && (progressBar || tlFill)) {
    var ticking2 = false;
    var onScroll2 = function () {
      if (ticking2) return;
      ticking2 = true;
      requestAnimationFrame(function () { syncProgress(); syncTimeline(); ticking2 = false; });
    };
    snap.addEventListener("scroll", onScroll2, { passive: true });
    window.addEventListener("resize", onScroll2, { passive: true });
    // Opening a week changes the timeline's height, so re-measure as it animates.
    if (tlList) {
      tlList.addEventListener("click", function () {
        var n = 0;
        (function again() { syncTimeline(); if (++n < 24) requestAnimationFrame(again); })();
      });
    }
    onScroll2();
  }
})();
