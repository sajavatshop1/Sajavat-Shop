import { useEffect, useRef } from 'react';

/**
 * useScrollReveal – Attaches an IntersectionObserver to the returned ref's element,
 * toggling the `visible` class when it enters the viewport. Pair with CSS classes:
 *   .reveal, .reveal-left, .reveal-right, .reveal-scale
 * and optionally .stagger-children for grid/list items.
 */
export function useScrollReveal<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on reduced-motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          // Once visible, no need to keep observing
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * useScrollRevealAll – Observes all children matching a selector,
 * useful for staggered grid reveals.
 */
export function useScrollRevealAll(
  selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale',
  options?: IntersectionObserverInit
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      container.querySelectorAll<HTMLElement>(selector).forEach(el =>
        el.classList.add('visible')
      );
      return;
    }

    const els = container.querySelectorAll<HTMLElement>(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -32px 0px',
        ...options,
      }
    );

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}
