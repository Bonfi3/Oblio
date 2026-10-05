// Client-side navigation state shared between the header and the home page.
// Module state survives client navigations and resets on a full page load.
export const navState = {
  /** True once any page has rendered: the intro only plays on a fresh load of the home page. */
  introPlayed: false,
  /** Section the home page should scroll to after a client navigation from another page. */
  pendingSection: null as string | null,
};

export const smoothScrollTo = (top: number) => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
};

export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) smoothScrollTo(el.getBoundingClientRect().top + window.scrollY);
};
