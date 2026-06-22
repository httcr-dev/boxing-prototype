/**
 * Assembles the full Boxen page HTML from modular partials.
 *
 * @see manifest.ts — section registry and file map
 */
import head from "./layout/head.html?raw";
import bodyOpen from "./layout/body-open.html?raw";
import mainOpen from "./layout/main-open.html?raw";
import mainClose from "./layout/main-close.html?raw";
import bodyClose from "./layout/body-close.html?raw";

import headerBeforeNav from "./partials/header-before-nav.html?raw";
import headerAfterNav from "./partials/header-after-nav.html?raw";
import footerBeforeNav from "./partials/footer-before-nav.html?raw";
import footerAfterNav from "./partials/footer-after-nav.html?raw";

import headerMenu from "./navigation/header-menu.html?raw";
import footerMenu from "./navigation/footer-menu.html?raw";

import section01 from "./sections/01-hero.html?raw";
import section02 from "./sections/02-intro.html?raw";
import section03 from "./sections/03-fighting-spirit.html?raw";
import section04 from "./sections/04-programs.html?raw";
import section05 from "./sections/05-pricing.html?raw";
import section06 from "./sections/06-benefits.html?raw";
import section07 from "./sections/07-coaches.html?raw";
import section08 from "./sections/08-news.html?raw";
import section09 from "./sections/09-blog.html?raw";
import section10 from "./sections/10-contact.html?raw";
import section11 from "./sections/11-cta.html?raw";

/** Page sections in render order (matches manifest.ts). */
const PAGE_SECTIONS = [
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
  section07,
  section08,
  section09,
  section10,
  section11,
] as const;

export function assembleBoxenHtml(): string {
  return [
    head,
    bodyOpen,
    headerBeforeNav,
    headerMenu,
    headerAfterNav,
    mainOpen,
    ...PAGE_SECTIONS,
    mainClose,
    footerBeforeNav,
    footerMenu,
    footerAfterNav,
    bodyClose,
  ].join("");
}

export default assembleBoxenHtml;
