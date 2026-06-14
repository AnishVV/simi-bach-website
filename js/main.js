(function () {
  "use strict";

  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var links = document.querySelector("[data-nav-links]");

  function setSolidNav() {
    if (!nav) return;
    nav.classList.toggle("is-solid", window.scrollY > 20);
  }

  function closeNav() {
    if (!toggle) return;
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  document.querySelectorAll(".nav-link").forEach(function (link) {
    var current = window.location.pathname.split("/").pop() || "index.html";
    var target = (link.getAttribute("href") || "").split("/").pop();
    if (target === current) link.setAttribute("aria-current", "page");
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  setSolidNav();
  window.addEventListener("scroll", setSolidNav, { passive: true });
})();
