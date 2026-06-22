/**
 * Registry of page sections — single source of truth for order and metadata.
 * Used by assemble.ts and the split script (scripts/split-boxen-content.mjs).
 */
export const BOXEN_SECTIONS = [
  {
    id: "hero",
    file: "01-hero.html",
    title: "Hero — Welcome slideshow",
  },
  {
    id: "intro",
    file: "02-intro.html",
    title: "Intro — Brand statement",
  },
  {
    id: "fighting-spirit",
    file: "03-fighting-spirit.html",
    title: "Features — Fighting spirit",
  },
  {
    id: "programs",
    file: "04-programs.html",
    title: "Programs — Get fit while having fun",
  },
  {
    id: "pricing",
    file: "05-pricing.html",
    title: "Pricing — Training plans",
  },
  {
    id: "benefits",
    file: "06-benefits.html",
    title: "Benefits — Stay fit and strong",
  },
  {
    id: "coaches",
    file: "07-coaches.html",
    title: "Coaches — Meet our team",
  },
  {
    id: "news",
    file: "08-news.html",
    title: "News — Good news about Boxen",
  },
  {
    id: "blog",
    file: "09-blog.html",
    title: "Blog — Articles about boxing",
  },
  {
    id: "contact",
    file: "10-contact.html",
    title: "Contact — Further info",
  },
  {
    id: "cta",
    file: "11-cta.html",
    title: "CTA — Final call to action",
  },
] as const;

export const BOXEN_NAVIGATION = {
  header: "navigation/header-menu.html",
  footer: "navigation/footer-menu.html",
} as const;

export const BOXEN_LAYOUT = {
  head: "layout/head.html",
  bodyOpen: "layout/body-open.html",
  mainOpen: "layout/main-open.html",
  mainClose: "layout/main-close.html",
  bodyClose: "layout/body-close.html",
} as const;

export const BOXEN_PARTIALS = {
  headerBeforeNav: "partials/header-before-nav.html",
  headerAfterNav: "partials/header-after-nav.html",
  footerBeforeNav: "partials/footer-before-nav.html",
  footerAfterNav: "partials/footer-after-nav.html",
} as const;
