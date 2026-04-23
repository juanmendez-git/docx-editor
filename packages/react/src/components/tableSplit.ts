/**
 * Re-export from @juanmendez90/docx-core where the implementation now lives.
 * Kept for backward compatibility with in-package imports.
 */
export {
  type SplitCellDialogConfig,
  getSplitCellDialogConfig,
  splitActiveTableCell,
} from '@juanmendez90/docx-core/prosemirror/commands/tableSplit';
