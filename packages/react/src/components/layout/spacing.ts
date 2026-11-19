import type { theme } from '../../theme/tokens.js';

export type LayoutGap = keyof typeof theme.space;

export function spacing(gap: LayoutGap) {
  return `var(--nf-space-${gap})`;
}
