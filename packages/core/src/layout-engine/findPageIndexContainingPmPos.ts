import type { Layout } from './types';

/**
 * Page index (0-based) whose layout fragments cover `pmPos`, or null if none.
 * Used when the painted DOM may not yet have `[data-pm-start]` for this position (virtualization).
 */
export function findPageIndexContainingPmPos(layout: Layout, pmPos: number): number | null {
  for (let pi = 0; pi < layout.pages.length; pi++) {
    for (const frag of layout.pages[pi].fragments) {
      const start = frag.pmStart ?? 0;
      const end = frag.pmEnd ?? start + 1;
      if (pmPos >= start && pmPos <= end) {
        return pi;
      }
    }
  }
  return null;
}
