/**
 * Global motion layer.
 * Everything is opt-in through data attributes so pages stay readable
 * without JavaScript, and everything is skipped for reduced-motion users.
 *
 *  data-split          headline: lines rise in when entering the viewport
 *  data-reveal         block: fade + rise (data-reveal="stagger" for children)
 *  data-scrub-text     paragraph: words light up as you scroll through it
 *  data-count="301"    number counts up (data-count-decimals, -suffix)
 *  data-parallax="0.2" element drifts against the scroll
 *  data-magnetic       element leans toward the pointer
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const motion = { gsap, ScrollTrigger, SplitText, reduce, lenis: null as Lenis | null };
(window as any).__nacademy = motion;

/* ---------- Smooth scroll ---------- */
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  motion.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Header: glass on scroll, hide on scroll down ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
let lastY = window.scrollY;
const onScroll = () => {
  const y = window.scrollY;
  if (!header) return;
  header.classList.toggle('is-scrolled', y > 12);
  const menuOpen = document.documentElement.classList.contains('menu-open');
  header.classList.toggle('is-hidden', !menuOpen && y > 240 && y > lastY + 4);
  if (y < lastY - 4 || y < 240) header.classList.remove('is-hidden');
  lastY = y;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
if (toggle && menu) {
  const links = menu.querySelectorAll<HTMLElement>('[data-menu-link] span');
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      motion.lenis?.stop();
      if (!reduce) gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 });
    } else {
      menu.hidden = true;
      motion.lenis?.start();
    }
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
}

/* ---------- Page transitions (curtain) ---------- */
const curtain = document.querySelector<HTMLElement>('[data-curtain]');
if (curtain && !reduce) {
  // Enter: curtain lifts away
  if (sessionStorageSafe('get') === '1') {
    gsap.set(curtain, { yPercent: 0, visibility: 'visible' });
    document.documentElement.classList.remove('is-entering');
    gsap.to(curtain, {
      yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05,
      onComplete: () => { gsap.set(curtain, { visibility: 'hidden' }); },
    });
    sessionStorageSafe('del');
  }
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (url.pathname === location.pathname && !url.hash) return;
    e.preventDefault();
    sessionStorageSafe('set');
    gsap.fromTo(curtain, { yPercent: 100, visibility: 'visible' }, {
      yPercent: 0, duration: 0.65, ease: 'expo.inOut',
      onComplete: () => { location.href = url.href; },
    });
  });
  // bfcache: make sure the curtain is gone when going back
  window.addEventListener('pageshow', (ev) => { if (ev.persisted) gsap.set(curtain, { yPercent: 100, visibility: 'hidden' }); });
}
function sessionStorageSafe(op: 'get' | 'set' | 'del') {
  try {
    if (op === 'get') return sessionStorage.getItem('nac-curtain');
    if (op === 'set') sessionStorage.setItem('nac-curtain', '1');
    if (op === 'del') sessionStorage.removeItem('nac-curtain');
  } catch { /* storage blocked: no curtain, no problem */ }
  return null;
}

/* ---------- Generic scroll effects ---------- */
function initEffects() {
  if (reduce) {
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      el.textContent = formatCount(el, Number(el.dataset.count));
    });
    return;
  }

  // Headlines: split into lines and rise
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, {
      yPercent: 105,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Blocks
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const targets = el.dataset.reveal === 'stagger' ? Array.from(el.children) : [el];
    gsap.from(targets, {
      y: 48,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Scroll-scrubbed reading
  document.querySelectorAll<HTMLElement>('[data-scrub-text]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'split-word' });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });

  // Counters
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const state = { v: 0 };
    el.textContent = formatCount(el, 0);
    gsap.to(state, {
      v: target,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = formatCount(el, state.v); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Parallax
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amt = Number(el.dataset.parallax || 0.15);
    gsap.fromTo(el, { yPercent: -amt * 100 }, {
      yPercent: amt * 100,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Magnetic
  if (finePointer) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }
}

function formatCount(el: HTMLElement, v: number) {
  const d = Number(el.dataset.countDecimals || 0);
  return v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.countSuffix || '');
}

// Wait for webfonts so line splits measure the real typeface
const ready = (document as any).fonts?.ready ?? Promise.resolve();
let isReady = false;
const queue: Array<() => void> = [];
/** Run page-specific motion after fonts are in and global effects exist. */
export function onReady(cb: () => void) {
  if (isReady) cb();
  else queue.push(cb);
}
Promise.race([ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  initEffects();
  isReady = true;
  queue.splice(0).forEach((cb) => cb());
  ScrollTrigger.refresh();
});
