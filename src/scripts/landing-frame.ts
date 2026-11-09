import { isTransitionBeforeSwapEvent, navigate } from "astro:transitions/client";

const storageKey = "landing-view-preference";
const preferenceTtl = 10 * 60 * 1000;
const transitionDuration = 350;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
type Section = "projects" | "misc";
let activeSection: Section | null = null;
const asSection = (value: unknown): Section | null =>
  value === "projects" || value === "misc" ? value : null;
const sectionForURL = (url: URL) => url.origin === location.origin
  ? asSection(url.pathname.replace(/^\/|\/$/g, "")) : null;
const sectionForLink = (link: HTMLAnchorElement) =>
  asSection(link.dataset.landingSection) ?? sectionForURL(new URL(link.href));
const sectionLinks = "[data-landing-row] a, [data-site-navigation] a";
const enhanceSectionLinks = () => {
  document.querySelectorAll<HTMLAnchorElement>(sectionLinks).forEach((link) => {
    const section = sectionForLink(link);
    if (!section) return;
    link.dataset.landingSection = section;
    link.href = "/";
  });
};
const hasInlineSections = () => !!document.querySelector("[data-landing-panels]");
const isCollapsedPage = () => activeSection !== null;
const getFrame = () => document.querySelector<HTMLElement>("[data-landing-frame]");
const getShift = (element: HTMLElement, axis: "x" | "y" = "y") => {
  const transform = getComputedStyle(element).transform;
  if (transform === "none") return 0;
  const matrix = new DOMMatrixReadOnly(transform);
  return axis === "x" ? matrix.m41 : matrix.m42;
};

const readView = (): "hero" | "sidebar" => {
  const restoredView = history.state?.landingFrame?.view;
  const section = asSection(history.state?.landingSection) ?? sectionForURL(new URL(location.href));
  if (section && (restoredView === "hero" || restoredView === "sidebar")) return restoredView;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (value && typeof value.expiresAt === "number" && value.expiresAt > Date.now()
      && (value.view === "hero" || value.view === "sidebar")) return value.view;
    localStorage.removeItem(storageKey);
  } catch {
    // The landing layout also works when storage is unavailable.
  }
  return "hero";
};

const applyView = (view: "hero" | "sidebar") => {
  document.documentElement.dataset.landingView = view;
  document.getElementById("hero-view")?.classList.toggle("hidden", view !== "hero");
  document.getElementById("sidebar-view")?.classList.toggle("hidden", view !== "sidebar");
  document.querySelectorAll("[data-layout-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(view === "sidebar"));
  });
};

const visibleRow = (frame: HTMLElement) =>
  Array.from(frame.querySelectorAll<HTMLElement>("[data-landing-row]"))
    .find((row) => row.getBoundingClientRect().height > 0);

const measureFrame = () => {
  const frame = getFrame();
  const shift = frame?.querySelector<HTMLElement>("[data-landing-shift]");
  const row = frame && visibleRow(frame);
  if (!frame || !shift || !row) return;
  // Measure the original layout independently of both animated transforms.
  const origin = frame.getBoundingClientRect().top + getShift(shift);
  const rowTop = row.getBoundingClientRect().top - origin - getShift(row);
  const contentBottom = Math.max(rowTop, ...Array.from(
    frame.querySelectorAll<HTMLElement>("[data-landing-blur]"),
  ).filter((element) => element.getBoundingClientRect().height > 0)
    .map((element) => element.getBoundingClientRect().bottom - origin));
  const headerTop = 42;
  const content = document.querySelector<HTMLElement>("[data-landing-content]");
  let navShiftX = 0;
  if (content) {
    const targetLeft = content.getBoundingClientRect().left;
    const rowLeft = row.getBoundingClientRect().left - getShift(row, "x");
    navShiftX = targetLeft - rowLeft;
  }
  // Lift all content out, including content below the navigation in the more view.
  // The row counteracts the extra lift so it still lands at the header position.
  frame.style.setProperty("--landing-rise", `${headerTop - contentBottom}px`);
  frame.style.setProperty("--landing-nav-offset", `${contentBottom - rowTop}px`);
  frame.style.setProperty("--landing-nav-shift-x", `${navShiftX}px`);
  frame.style.setProperty("--landing-expanded-height", `${shift.offsetHeight}px`);
  frame.style.setProperty("--landing-compact-height", `${headerTop + row.offsetHeight + 24}px`);
  if (activeSection) {
    // Keep enough layout information to render a reload in its final state before
    // the deferred navigation script loads, without exposing the expanded index.
    const landingFrame = {
      view: document.documentElement.dataset.landingView,
      width: innerWidth,
      height: innerHeight,
      rise: headerTop - contentBottom,
      navOffset: contentBottom - rowTop,
      navShiftX,
      expandedHeight: shift.offsetHeight,
      compactHeight: headerTop + row.offsetHeight + 24,
    };
    if (JSON.stringify(history.state?.landingFrame) !== JSON.stringify(landingFrame)) {
      history.replaceState({ ...history.state, landingFrame }, "");
    }
  }
};

const setCollapsed = (frame: HTMLElement, collapsed: boolean) => {
  frame.dataset.collapsed = String(collapsed);
  frame.querySelectorAll<HTMLButtonElement>("[data-landing-back]").forEach((button) => {
    button.hidden = !collapsed;
  });
  frame.querySelectorAll<HTMLElement>("[data-landing-blur]").forEach((element) => {
    element.inert = collapsed;
    if (collapsed) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  });
  frame.querySelectorAll<HTMLAnchorElement>("[data-landing-row] a").forEach((link) => {
    const section = sectionForLink(link);
    const active = section !== null && section === activeSection;
    link.classList.toggle("text-accent-color", active);
    if (active && !hasInlineSections()) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
    if (section && hasInlineSections()) {
      link.setAttribute("aria-controls", `landing-${section}`);
      link.setAttribute("aria-expanded", String(active));
    } else {
      link.removeAttribute("aria-controls");
      link.removeAttribute("aria-expanded");
    }
  });
};

let currentFrame: HTMLElement | null = null;
let observer: ResizeObserver | undefined;
let contentAnimation: Animation | undefined;
let navigationAnimation: Animation | undefined;
let motionVersion = 0;
let layoutMotion: AbortController | undefined;
let previous: { collapsed: boolean; height: number; shift: number; rowShift: number; rowShiftX: number; scroll: number } | undefined;

const initializeFrame = () => {
  contentAnimation?.cancel();
  contentAnimation = undefined;
  navigationAnimation?.cancel();
  navigationAnimation = undefined;
  enhanceSectionLinks();
  const frame = getFrame();
  const shift = frame?.querySelector<HTMLElement>("[data-landing-shift]");
  observer?.disconnect();
  currentFrame = frame;
  const version = ++motionVersion;
  if (!frame || !shift) {
    previous = undefined;
    activeSection = null;
    return;
  }

  activeSection = hasInlineSections()
    ? asSection(history.state?.landingSection)
    : sectionForURL(new URL(location.href));
  document.querySelectorAll<HTMLElement>("[data-landing-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.landingPanel !== activeSection;
  });
  layoutMotion?.abort();
  frame.querySelectorAll(".view-fly-in, .view-fly-out").forEach((view) => {
    view.classList.remove("view-fly-in", "view-fly-out");
  });
  applyView(readView());
  const row = visibleRow(frame);
  const collapsed = isCollapsedPage();
  const animate = previous && previous.collapsed !== collapsed && !reducedMotion();
  if (animate && previous) {
    // Preserve the visible position even when navigation resets page scrolling.
    frame.dataset.instant = "";
    frame.style.height = `${previous.height}px`;
    shift.style.transform = `translateY(${previous.shift + scrollY - previous.scroll}px)`;
    if (row) row.style.transform = `translate(${previous.rowShiftX}px, ${previous.rowShift}px)`;
    measureFrame();
    frame.getBoundingClientRect();
    delete frame.dataset.instant;
    requestAnimationFrame(() => {
      if (version !== motionVersion) return;
      setCollapsed(frame, collapsed);
      frame.style.removeProperty("height");
      shift.style.removeProperty("transform");
      row?.style.removeProperty("transform");
    });
  } else {
    frame.dataset.instant = "";
    frame.style.removeProperty("height");
    shift.style.removeProperty("transform");
    row?.style.removeProperty("transform");
    measureFrame();
    setCollapsed(frame, collapsed);
    frame.getBoundingClientRect();
    requestAnimationFrame(() => {
      if (version === motionVersion) delete frame.dataset.instant;
    });
  }
  frame.dataset.ready = "";
  delete frame.dataset.booting;
  delete document.documentElement.dataset.landingRestoring;

  const content = document.querySelector<HTMLElement>("[data-landing-content]");
  if (previous && collapsed && content && !reducedMotion()) {
    // In the more view, finish fading the index before moving its navigation.
    const fadeFirstDuration = document.documentElement.dataset.landingView === "sidebar"
      ? transitionDuration : 0;
    contentAnimation = content.animate(
      [{ opacity: 0, transform: "translateY(15px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: transitionDuration, delay: animate ? fadeFirstDuration + transitionDuration : 0, easing: "ease", fill: "backwards" },
    );
  }
  previous = undefined;
  observer = new ResizeObserver(measureFrame);
  observer.observe(shift);
  if (row) observer.observe(row);
};

document.addEventListener("astro:before-swap", (event) => {
  if (!isTransitionBeforeSwapEvent(event)) return;
  const frame = getFrame();
  const shift = frame?.querySelector<HTMLElement>("[data-landing-shift]");
  if (!frame || !shift || !event.newDocument.querySelector("[data-landing-frame]")) return;
  const row = visibleRow(frame);
  previous = {
    collapsed: frame.dataset.collapsed === "true",
    height: frame.getBoundingClientRect().height,
    shift: getShift(shift),
    rowShift: row ? getShift(row) : 0,
    rowShiftX: row ? getShift(row, "x") : 0,
    scroll: scrollY,
  };
  event.newDocument.documentElement.dataset.landingView = readView();
  // The same index DOM survives the swap and moves itself; no replacement header.
  event.viewTransition.ready.catch(() => {});
  event.viewTransition.skipTransition();
});

document.addEventListener("astro:after-swap", initializeFrame);
document.addEventListener("astro:page-load", () => {
  if (getFrame() !== currentFrame) initializeFrame();
});
window.addEventListener("resize", measureFrame);
document.fonts.ready.then(measureFrame);

// Handle these sections before Astro's navigation listener runs. The server's
// original hrefs remain useful fallbacks when JavaScript is unavailable.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
    || event.shiftKey || event.altKey) return;
  const backButton = event.target instanceof Element
    ? event.target.closest("[data-landing-back]") : null;
  if (backButton && activeSection) {
    event.preventDefault();
    if (!hasInlineSections()) {
      void navigate("/", { state: { landingSection: null } });
      return;
    }
    const section = activeSection;
    void selectInlineSection(null);
    const frame = getFrame();
    if (frame) {
      visibleRow(frame)?.querySelector<HTMLElement>(`[data-landing-section="${section}"]`)
        ?.focus({ preventScroll: true });
    }
    return;
  }
  const link = event.target instanceof Element
    ? event.target.closest<HTMLAnchorElement>(sectionLinks) : null;
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const section = sectionForLink(link);
  if (!section) return;
  if (!hasInlineSections()) {
    event.preventDefault();
    void navigate("/", { state: { landingSection: section } });
    return;
  }
  event.preventDefault();
  void selectInlineSection(activeSection === section ? null : section);
}, { capture: true });

async function selectInlineSection(section: Section | null) {
  const frame = getFrame();
  const shift = frame?.querySelector<HTMLElement>("[data-landing-shift]");
  if (!frame || !shift) return;
  const content = document.querySelector<HTMLElement>("[data-landing-content]");
  if (activeSection && section !== activeSection && content && !reducedMotion()) {
    // Preserve the old page's fly-out before swapping sections or restoring the index.
    const { opacity, transform } = getComputedStyle(content);
    contentAnimation?.cancel();
    const outgoing = content.animate(
      [{ opacity, transform }, { opacity: 0, transform: "translateY(10px)" }],
      { duration: transitionDuration, easing: "ease", fill: "forwards" },
    );
    contentAnimation = outgoing;
    try {
      await outgoing.finished;
    } catch {
      return;
    }
    if (contentAnimation !== outgoing || getFrame() !== frame) return;

    const returningRow = visibleRow(frame);
    if (section === null && returningRow?.closest("#sidebar-view")) {
      // Return the navigation horizontally while the index remains hidden above it.
      // Restoring the frame afterward brings the content down and fades it in.
      const transform = getComputedStyle(returningRow).transform;
      const rowShift = getShift(returningRow);
      navigationAnimation?.cancel();
      const returning = returningRow.animate(
        [{ transform }, { transform: `translate(0px, ${rowShift}px)` }],
        { duration: transitionDuration, easing: "ease", fill: "forwards" },
      );
      navigationAnimation = returning;
      try {
        await returning.finished;
      } catch {
        return;
      }
      if (navigationAnimation !== returning || contentAnimation !== outgoing || getFrame() !== frame) return;
    }
  }
  const row = visibleRow(frame);
  previous = {
    collapsed: frame.dataset.collapsed === "true",
    height: frame.getBoundingClientRect().height,
    shift: getShift(shift),
    rowShift: row ? getShift(row) : 0,
    rowShiftX: row ? getShift(row, "x") : 0,
    scroll: scrollY,
  };
  history.replaceState({
    ...history.state,
    landingSection: section,
    landingFrame: activeSection && section ? history.state?.landingFrame : undefined,
  }, "");
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  initializeFrame();
}

document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-layout-toggle]") : null;
  if (!button || isCollapsedPage()) return;
  const hero = document.getElementById("hero-view");
  const sidebar = document.getElementById("sidebar-view");
  if (!hero || !sidebar || hero.classList.contains("view-fly-out") || sidebar.classList.contains("view-fly-out")) return;
  layoutMotion?.abort();
  layoutMotion = new AbortController();
  const signal = layoutMotion.signal;
  hero.classList.remove("view-fly-in");
  sidebar.classList.remove("view-fly-in");
  const view = sidebar.classList.contains("hidden") ? "sidebar" : "hero";
  try {
    localStorage.setItem(storageKey, JSON.stringify({ view, expiresAt: Date.now() + preferenceTtl }));
  } catch {
    // Storage is optional.
  }
  const outgoing = view === "sidebar" ? hero : sidebar;
  const incoming = view === "sidebar" ? sidebar : hero;
  const reveal = () => {
    outgoing.classList.remove("view-fly-out");
    applyView(view);
    measureFrame();
    if (!reducedMotion()) {
      incoming.classList.add("view-fly-in");
      incoming.addEventListener("animationend", () => {
        incoming.classList.remove("view-fly-in");
        measureFrame();
      }, { once: true, signal });
    }
    incoming.querySelector<HTMLElement>("[data-layout-toggle]")?.focus();
  };
  if (reducedMotion()) reveal();
  else {
    outgoing.classList.add("view-fly-out");
    outgoing.addEventListener("animationend", reveal, { once: true, signal });
  }
});

initializeFrame();
