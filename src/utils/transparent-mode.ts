import type { ResolvedTransparentMode, TransparentMode } from '@/types/engine';

export function resolveTransparentMode(mode: TransparentMode): ResolvedTransparentMode {
  if (mode === 'sab') return 'sab';
  if (mode === 'message') return 'message';
  return typeof SharedArrayBuffer !== 'undefined' ? 'sab' : 'message';
}
