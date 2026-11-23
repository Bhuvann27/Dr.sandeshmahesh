/* Dr. Sandesh site: reveal sections safely without loading the legacy hero controller.
   The old main.js targets a different homepage DOM and must not be used here. */
(function () {
  "use strict";

  function revealAll(root) {
    (root || document).querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!("IntersectionObserver" in window)) {
    revealAll(document);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px 60px 0px" });

  function observeReveals(root) {
    (root || document).querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      observer.observe(el);
    });
  }

  observeReveals(document);

  // Story cards and other content may be inserted after data loads.
  var mutations = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(".reveal")) observer.observe(node);
        observeReveals(node);
      });
    });
  });
  mutations.observe(document.body, { childList: true, subtree: true });

  // Safety net: content must never stay hidden if an observer is interrupted.
  window.setTimeout(function () {
    revealAll(document);
    mutations.disconnect();
    observer.disconnect();
  }, 4000);
})();