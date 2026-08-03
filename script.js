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
        onDark = p.classList.contains("panel-dark") || p.classList.contains("hero");
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

  /* ── About: particle network background ──────────────
     Drifting red particles connected by lines when close together —
     brighten and lengthen their reach near the pointer ("grab"), and a
     click seeds a small burst that fades out. Pauses while off-screen
     and freezes to a static frame under prefers-reduced-motion. ────── */
  (function initAboutParticles() {
    var canvas = document.getElementById("aboutGrid");
    if (!canvas) return;
    var section = canvas.closest(".panel");
    var ctx = canvas.getContext("2d");

    var LINK_DIST   = 150;   // px, particles closer than this get a line
    var GRAB_DIST   = 220;   // px, pointer reach for brightened links
    var SPEED       = 14;    // px / second, base drift speed
    var MAX_LIFE    = 5.5;   // seconds a click-burst particle lives
    var BASE_COUNT_PER_AREA = 1 / 9000; // particles per px^2, clamped below

    var RED      = "200,16,46";
    var RED_DEEP = "150,0,31";

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var pointer = { x: -9999, y: -9999, active: false };
    var particles = [];
    var running = false;
    var rafId = null;
    var lastT = null;

    function rand(min, max) { return min + Math.random() * (max - min); }

    function makeParticle(x, y, burst) {
      var angle = rand(0, Math.PI * 2);
      var speed = burst ? rand(SPEED, SPEED * 4) : rand(SPEED * 0.3, SPEED);
      return {
        x: x == null ? rand(0, w) : x,
        y: y == null ? rand(0, h) : y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: burst ? rand(1.6, 2.6) : rand(1.2, 2.2),
        life: burst ? 0 : -1,   // -1 = permanent ambient particle
        burst: !!burst
      };
    }

    function seed() {
      var count = Math.round(Math.min(90, Math.max(28, w * h * BASE_COUNT_PER_AREA)));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(makeParticle());
    }

    function resize() {
      w = section.clientWidth;
      h = section.clientHeight;

      // Layout isn't always settled the instant this script runs (e.g. web
      // fonts still swapping in). Retry next frame rather than locking in a
      // 0x0 canvas.
      if (w === 0 || h === 0) {
        requestAnimationFrame(resize);
        return;
      }

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) seed();
      draw(0);
    }

    function step(dt) {
      particles.forEach(function (p) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.min(Math.max(p.x, 0), w);
        p.y = Math.min(Math.max(p.y, 0), h);
        if (p.life >= 0) p.life += dt;
      });
      particles = particles.filter(function (p) { return p.life < MAX_LIFE; });
    }

    function draw(dt) {
      if (dt) step(dt);
      ctx.clearRect(0, 0, w, h);

      // Links between nearby particles, brighter/longer-reaching near the pointer.
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var reach = LINK_DIST;

          if (pointer.active) {
            var midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
            var pd = Math.hypot(midX - pointer.x, midY - pointer.y);
            if (pd < GRAB_DIST) reach = LINK_DIST + (1 - pd / GRAB_DIST) * (GRAB_DIST - LINK_DIST);
          }

          if (dist < reach) {
            var alpha = (1 - dist / reach) * 0.32;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(" + RED + "," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Particles themselves.
      particles.forEach(function (p) {
        var fade = p.life < 0 ? 1 : Math.max(0, 1 - p.life / MAX_LIFE);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + RED + "," + (0.55 * fade).toFixed(3) + ")";
        ctx.fill();
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = "rgba(" + RED_DEEP + "," + (0.35 * fade).toFixed(3) + ")";
        ctx.stroke();
      });
    }

    function frame(t) {
      if (!running) return;
      var dt = lastT ? (t - lastT) / 1000 : 0;
      lastT = t;
      draw(dt);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastT = null;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    window.addEventListener("resize", function () { resize(); }, { passive: true });

    if (prefersReduced) {
      resize();
      return; // static frame, no drift/pointer/burst animation
    }

    section.addEventListener("mousemove", function (e) {
      var r = section.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    });
    section.addEventListener("mouseleave", function () {
      pointer.active = false;
    });
    section.addEventListener("click", function (e) {
      var r = section.getBoundingClientRect();
      var cx = e.clientX - r.left, cy = e.clientY - r.top;
      for (var i = 0; i < 5; i++) particles.push(makeParticle(cx, cy, true));
      if (!running) start();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.05 }).observe(section);
    } else {
      start();
    }

    resize();
  })();

  /* ── Google Form embed ────────────────────────────── */
  // Only load the iframe if a real URL has been filled in, so the styled
  // fallback shows instead of a broken/blank frame.
  var frame = document.getElementById("interestForm");
  if (frame) {
    var src = frame.getAttribute("data-form-src") || "";
    var looksReal = /^https:\/\/docs\.google\.com\/forms\//.test(src);
    if (looksReal) {
      frame.src = src;
      frame.parentNode.classList.add("has-form");
    }
  }
})();
