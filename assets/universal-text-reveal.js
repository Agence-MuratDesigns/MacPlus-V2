/**
 * Universal Text Reveal (Titles + Paragraphs)
 * - Headings (h1-h6): fade + translateY
 * - Paragraphs (p): simple fade
 * - Hero visible animation with delayed reveal
 * - Respects prefers-reduced-motion
 */

(() => {
  const DESKTOP_ONLY = false; // true = >= 992px uniquement
  const DESKTOP_QUERY = "(min-width: 992px)";

  const INITIAL_REVEAL_DELAY_MS = 120;
  const STAGGER_MS = 70;
  const MAX_STAGGER_ITEMS = 10;

  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) return;
  if (DESKTOP_ONLY && !isDesktop) return;

  /* ------------------------------------------------------------------
     Inject CSS once
  ------------------------------------------------------------------ */
  if (!document.querySelector('[data-universal-text-reveal="true"]')) {
    const css = `
      .utr-heading {
        opacity: 0;
        transform: translate3d(0,14px,0);
        transition: opacity 520ms ease, transform 760ms cubic-bezier(.2,.8,.2,1);
        will-change: opacity, transform;
      }
      .utr-heading.is-revealed {
        opacity: 1;
        transform: translate3d(0,0,0);
      }

      .utr-paragraph {
        opacity: 0;
        transition: opacity 520ms ease;
        will-change: opacity;
      }
      .utr-paragraph.is-revealed {
        opacity: 1;
      }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-universal-text-reveal", "true");
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------ */
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const mark = (el, cls) => el && !el.classList.contains(cls) && el.classList.add(cls);
  const reveal = (el) => el && !el.classList.contains("is-revealed") && el.classList.add("is-revealed");

  const isInView = (el, vh, vw) => {
    const r = el.getBoundingClientRect();
    return r.top < vh * 0.92 && r.bottom > 0 && r.left < vw && r.right > 0;
  };

  /* ------------------------------------------------------------------
     Mark elements
  ------------------------------------------------------------------ */
  const headings = $$("h1, h2, h3, h4, h5, h6");
  const paragraphs = $$("p");

  headings.forEach(h => mark(h, "utr-heading"));
  paragraphs.forEach(p => mark(p, "utr-paragraph"));

  /* ------------------------------------------------------------------
     Observer for scroll reveals
  ------------------------------------------------------------------ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.style.transitionDelay = el.classList.contains("utr-paragraph") ? "25ms" : "0ms";
      reveal(el);
      io.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px"
  });

  $$(".utr-heading, .utr-paragraph").forEach(el => io.observe(el));

  /* ------------------------------------------------------------------
     Delayed reveal for hero (above-the-fold)
  ------------------------------------------------------------------ */
  const delayedInitialReveal = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;

    const inViewItems = $$(".utr-heading, .utr-paragraph")
      .filter(el => !el.classList.contains("is-revealed"))
      .filter(el => isInView(el, vh, vw))
      .slice(0, MAX_STAGGER_ITEMS);

    inViewItems.forEach((el, idx) => {
      try { io.unobserve(el); } catch (e) {}
      el.style.transitionDelay = `${INITIAL_REVEAL_DELAY_MS + idx * STAGGER_MS}ms`;
      setTimeout(() => reveal(el), INITIAL_REVEAL_DELAY_MS + idx * STAGGER_MS);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(() => requestAnimationFrame(delayedInitialReveal));
    }, { once: true });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(delayedInitialReveal));
  }

  window.addEventListener("load", () => setTimeout(delayedInitialReveal, 60), { once: true });

})();
