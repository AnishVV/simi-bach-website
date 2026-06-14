/**
 * main.js — Simi's Bachelorette · CDMX
 *
 * Modules (all IIFEs, no globals):
 *   1. Nav hamburger overlay + body-scroll lock
 *   2. Nav solid-on-scroll (IntersectionObserver, falls back to scroll event)
 *   3. Active nav link marking
 *   4. Guide accordion (mobile category expand/collapse)
 *   5. Scroll reveal (fade-up via data-reveal attribute)
 *   6. Portrait strip scroll-dot indicators
 */

'use strict';


/* ============================================================
   1. NAV — HAMBURGER OVERLAY + BODY-SCROLL LOCK
   Targets: .nav-hamburger, .nav-links, body.nav-open
   The CSS overlay transition is driven entirely by body.nav-open.
   JS only toggles that class and manages scroll locking.
============================================================ */
(function initNavHamburger() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (!hamburger || !navLinks) return;

  // Scroll position saved before locking so we can restore on close
  var savedScrollY = 0;

  function openNav() {
    savedScrollY = window.scrollY;
    document.body.classList.add('nav-open');
    // position:fixed resets scroll to 0 — compensate with negative top
    document.body.style.top = '-' + savedScrollY + 'px';
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation');
    // Move focus to first link after transition starts
    var firstLink = navLinks.querySelector('.nav-link');
    if (firstLink) setTimeout(function () { firstLink.focus(); }, 50);
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
  }

  hamburger.addEventListener('click', function () {
    document.body.classList.contains('nav-open') ? closeNav() : openNav();
  });

  // Close when any nav link is tapped (navigates away; also catches same-page anchors)
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Escape key closes overlay and returns focus to hamburger
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
      hamburger.focus();
    }
  });
})();


/* ============================================================
   2. NAV SOLID-ON-SCROLL
   Adds .site-nav--solid once hero leaves viewport.
   Uses IntersectionObserver (performance); falls back to passive
   scroll event when IO is unavailable.
============================================================ */
(function initNavSolid() {
  var siteNav = document.querySelector('.site-nav');
  if (!siteNav) return;

  var hero = document.querySelector('.hero');

  if (hero && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        // Hero leaving viewport → add solid class
        siteNav.classList.toggle('site-nav--solid', !entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );
    obs.observe(hero);
  } else {
    // Fallback: scroll event
    var THRESHOLD = window.innerHeight * 0.8;
    function onScroll() {
      siteNav.classList.toggle('site-nav--solid', window.scrollY > THRESHOLD);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();


/* ============================================================
   3. ACTIVE NAV LINK
   Compares href filenames to current page, sets aria-current="page"
   so CSS can highlight with --color-candle-gold.
============================================================ */
(function initActiveNavLink() {
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var linkPath = (link.getAttribute('href') || '').split('/').pop();
    if (linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();


/* ============================================================
   4. GUIDE ACCORDION — MOBILE ONLY
   .guide-category elements have a .guide-category__trigger button.
   On mobile (<768px): single-open accordion, JS sets data-open="true/false".
   On tablet/desktop: CSS keeps all panels open; JS stays idle.
============================================================ */
(function initGuideAccordion() {
  var categories = document.querySelectorAll('.guide-category');
  if (!categories.length) return;

  var TABLET = 768;

  function isMobile() {
    return window.innerWidth < TABLET;
  }

  function open(cat) {
    cat.setAttribute('data-open', 'true');
    var trigger = cat.querySelector('.guide-category__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function close(cat) {
    cat.setAttribute('data-open', 'false');
    var trigger = cat.querySelector('.guide-category__trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggle(cat) {
    var isOpen = cat.getAttribute('data-open') === 'true';
    if (isOpen) {
      close(cat);
    } else {
      // Single-open: close all others
      categories.forEach(function (other) { if (other !== cat) close(other); });
      open(cat);
    }
  }

  function initState() {
    categories.forEach(function (cat) {
      isMobile() ? close(cat) : open(cat);
    });
  }

  categories.forEach(function (cat) {
    var trigger = cat.querySelector('.guide-category__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      if (isMobile()) toggle(cat);
    });
  });

  // Debounced resize: re-evaluate state when crossing breakpoint
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initState, 150);
  }, { passive: true });

  initState();
})();


/* ============================================================
   5. SCROLL REVEAL — FADE-UP
   Add data-reveal to any element to opt into the fade-up entrance.
   Optional: data-reveal-delay="200" (milliseconds).
   Skipped entirely when prefers-reduced-motion is set.
============================================================ */
(function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  // Inject base animation styles
  var style = document.createElement('style');
  style.textContent =
    '[data-reveal]{opacity:0;transform:translateY(20px);' +
    'transition:opacity .55s ease,transform .55s cubic-bezier(.16,1,.3,1);' +
    'transition-delay:var(--_rd,0ms)}' +
    '[data-reveal].is-visible{opacity:1;transform:none}';
  document.head.appendChild(style);

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.dataset.revealDelay || '0';
        entry.target.style.setProperty('--_rd', delay + 'ms');
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el) { obs.observe(el); });
})();


/* ============================================================
   6. PORTRAIT STRIP — SCROLL-DOT INDICATORS
   Adds small dot pips below .group-portraits on mobile.
   Auto-hides at desktop (CSS display:none via injected style).
============================================================ */
(function initPortraitDots() {
  var strip = document.querySelector('.group-portraits');
  if (!strip) return;

  var portraits = strip.querySelectorAll('.group-portrait');
  if (portraits.length < 2) return;

  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'portrait-dots';
  dotsWrap.setAttribute('aria-hidden', 'true');

  var style = document.createElement('style');
  style.textContent =
    '.portrait-dots{display:flex;justify-content:center;gap:6px;margin-top:.875rem}' +
    '@media(min-width:1024px){.portrait-dots{display:none}}' +
    '.portrait-dot{width:6px;height:6px;border-radius:50%;background:var(--color-sand);' +
    'transition:background .2s ease,transform .2s ease}' +
    '.portrait-dot.is-active{background:var(--color-candle-gold);transform:scale(1.4)}';
  document.head.appendChild(style);

  portraits.forEach(function () {
    var dot = document.createElement('span');
    dot.className = 'portrait-dot';
    dotsWrap.appendChild(dot);
  });

  strip.parentNode.insertBefore(dotsWrap, strip.nextSibling);
  var dots = dotsWrap.querySelectorAll('.portrait-dot');
  if (dots[0]) dots[0].classList.add('is-active');

  strip.addEventListener('scroll', function () {
    var portrait = strip.querySelector('.group-portrait');
    if (!portrait) return;
    var itemW = portrait.offsetWidth;
    var gap   = parseInt(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 16;
    var activeIdx = Math.round(strip.scrollLeft / (itemW + gap));
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIdx);
    });
  }, { passive: true });
})();
