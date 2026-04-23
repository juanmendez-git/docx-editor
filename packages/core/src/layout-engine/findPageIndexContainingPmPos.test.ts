/**
 * Unit tests for findPageIndexContainingPmPos.
 */

import { describe, test, expect } from 'bun:test';
import type { Layout, Page, ParagraphFragment } from './types';
import { findPageIndexContainingPmPos } from './findPageIndexContainingPmPos';

const margins = { top: 96, right: 96, bottom: 96, left: 96 };
const size = { w: 816, h: 1056 };

function paraFrag(pmStart: number, pmEnd: number, blockId = 1): ParagraphFragment {
  return {
    kind: 'paragraph',
    blockId,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    fromLine: 0,
    toLine: 1,
    pmStart,
    pmEnd,
  };
}

function page(number: number, fragments: ParagraphFragment[]): Page {
  return { number, fragments, margins, size };
}

function layoutFromPages(pages: Page[]): Layout {
  return {
    pageSize: size,
    pages,
  };
}

describe('findPageIndexContainingPmPos', () => {
  test('returns null for empty layout', () => {
    const layout = layoutFromPages([]);
    expect(findPageIndexContainingPmPos(layout, 5)).toBeNull();
  });

  test('finds page 0 when pmPos is inside first fragment range', () => {
    const layout = layoutFromPages([page(1, [paraFrag(10, 50)])]);
    expect(findPageIndexContainingPmPos(layout, 10)).toBe(0);
    expect(findPageIndexContainingPmPos(layout, 30)).toBe(0);
    expect(findPageIndexContainingPmPos(layout, 50)).toBe(0);
  });

  test('finds page 1 when pmPos is on second page only', () => {
    const layout = layoutFromPages([
      page(1, [paraFrag(1, 5)]),
      page(2, [paraFrag(100, 200)]),
    ]);
    expect(findPageIndexContainingPmPos(layout, 100)).toBe(1);
    expect(findPageIndexContainingPmPos(layout, 150)).toBe(1);
  });

  test('uses default end when pmEnd is missing (end = start + 1)', () => {
    const frag: ParagraphFragment = {
      kind: 'paragraph',
      blockId: 1,
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fromLine: 0,
      toLine: 1,
      pmStart: 42,
    };
    const layout = layoutFromPages([page(1, [frag])]);
    expect(findPageIndexContainingPmPos(layout, 42)).toBe(0);
    expect(findPageIndexContainingPmPos(layout, 43)).toBe(0);
    expect(findPageIndexContainingPmPos(layout, 44)).toBeNull();
  });

  test('returns first matching page when ranges overlap on consecutive fragments', () => {
    const layout = layoutFromPages([
      page(1, [paraFrag(10, 100), paraFrag(50, 120)]),
    ]);
    expect(findPageIndexContainingPmPos(layout, 60)).toBe(0);
  });

  test('returns null when pmPos is outside all fragments', () => {
    const layout = layoutFromPages([page(1, [paraFrag(10, 20)])]);
    expect(findPageIndexContainingPmPos(layout, 9)).toBeNull();
    expect(findPageIndexContainingPmPos(layout, 21)).toBeNull();
  });
});
