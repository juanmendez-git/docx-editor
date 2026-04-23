import type { Node as PMNode } from 'prosemirror-model';

function normalizeParaId(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s.toLowerCase() : null;
}

/**
 * ProseMirror position immediately before the first textblock whose `paraId`
 * attribute equals `paraId` (Word `w14:paraId` / OOXML paragraph id).
 *
 * Match is **trim + case-insensitive** so API / sidebar `paragraph_id` strings align with PM
 * attrs (Word often uses mixed-case hex). Strict `===` previously made `scrollToParaId` a no-op
 * and left the caret in the wrong paragraph.
 */
export function findStartPosForParaId(doc: PMNode, paraId: string): number | null {
  const needle = normalizeParaId(paraId);
  if (!needle) return null;
  let found: number | null = null;
  doc.descendants((node, pos) => {
    if (found !== null) return true;
    const pid = normalizeParaId(node.attrs?.paraId);
    if (pid === needle && node.isTextblock) {
      found = pos;
      return false;
    }
    return true;
  });
  return found;
}

/**
 * ProseMirror position for a **collapsed** caret at the **end** of the first textblock
 * whose `paraId` matches (same normalization as {@link findStartPosForParaId}).
 */
export function findEndPosForParaId(doc: PMNode, paraId: string): number | null {
  const start = findStartPosForParaId(doc, paraId);
  if (start == null) return null;
  const para = doc.resolve(start).nodeAfter;
  if (!para || !para.isTextblock) return null;
  return start + para.nodeSize - 1;
}
