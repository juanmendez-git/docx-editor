/**
 * Unit tests for findStartPosForParaId (Word paraId → ProseMirror position).
 */

import { describe, test, expect } from 'bun:test';
import { Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { findEndPosForParaId, findStartPosForParaId } from './findStartPosForParaId';

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      attrs: {
        paraId: { default: null },
      },
      toDOM: () => ['p', 0],
    },
    text: { group: 'inline' },
  },
});

function docFromParas(...paras: Array<{ text: string; paraId?: string | null }>) {
  return schema.node(
    'doc',
    null,
    paras.map((p) =>
      schema.node('paragraph', { paraId: p.paraId ?? null }, p.text ? [schema.text(p.text)] : [])
    )
  );
}

describe('findStartPosForParaId', () => {
  test('returns null for empty paraId', () => {
    const doc = docFromParas({ text: 'Hi', paraId: 'A1' });
    expect(findStartPosForParaId(doc, '')).toBeNull();
  });

  test('returns null when no paragraph has the paraId', () => {
    const doc = docFromParas({ text: 'A', paraId: 'P1' }, { text: 'B', paraId: 'P2' });
    expect(findStartPosForParaId(doc, 'MISSING')).toBeNull();
  });

  test('returns PM pos before the first matching textblock', () => {
    const doc = docFromParas({ text: 'First', paraId: 'P1' }, { text: 'Second', paraId: 'P2' });
    const p2Pos = findStartPosForParaId(doc, 'P2');
    expect(p2Pos).not.toBeNull();
    const node = doc.nodeAt(p2Pos!);
    expect(node?.type.name).toBe('paragraph');
    expect(node?.attrs.paraId).toBe('P2');
  });

  test('returns first match when duplicate paraId (defensive)', () => {
    const doc = docFromParas({ text: 'A', paraId: 'SAME' }, { text: 'B', paraId: 'SAME' });
    const first = findStartPosForParaId(doc, 'SAME');
    expect(first).toBe(0);
  });

  test('paraId match is trim + case-insensitive', () => {
    const doc = docFromParas({ text: 'x', paraId: 'Ab12' });
    expect(findStartPosForParaId(doc, 'ab12')).toBe(0);
    expect(findStartPosForParaId(doc, '  Ab12  ')).toBe(0);
    expect(findStartPosForParaId(doc, 'Ab12')).toBe(0);
  });

  test('finds paragraph with empty text', () => {
    const doc = docFromParas({ text: '', paraId: 'EMPTY' });
    expect(findStartPosForParaId(doc, 'EMPTY')).toBe(0);
  });
});

describe('findEndPosForParaId', () => {
  test('returns null when paragraph is missing', () => {
    const doc = docFromParas({ text: 'A', paraId: 'P1' });
    expect(findEndPosForParaId(doc, 'MISSING')).toBeNull();
  });

  test('collapsed selection at end is valid (non-empty)', () => {
    const doc = docFromParas({ text: 'Hi', paraId: 'P1' });
    const end = findEndPosForParaId(doc, 'P1');
    expect(end).not.toBeNull();
    expect(() => TextSelection.create(doc, end!, end!)).not.toThrow();
    const start = findStartPosForParaId(doc, 'P1')!;
    expect(end! > start).toBe(true);
  });

  test('empty paragraph: end is inside block', () => {
    const doc = docFromParas({ text: '', paraId: 'EMPTY' });
    const start = findStartPosForParaId(doc, 'EMPTY');
    const end = findEndPosForParaId(doc, 'EMPTY');
    expect(start).toBe(0);
    expect(end).toBe(1);
    expect(() => TextSelection.create(doc, end!, end!)).not.toThrow();
  });

  test('paraId match is case-insensitive like findStart', () => {
    const doc = docFromParas({ text: 'x', paraId: 'Ab12' });
    const end = findEndPosForParaId(doc, 'ab12');
    expect(end).not.toBeNull();
  });
});
