import type { TransparentMode } from '@/types/engine';

/**
 * Resolves which transport mode to use.
 * Uses SAB mode when cross-origin isolation is available (crossOriginIsolated),
 * falling back to message mode otherwise.
 */
export function resolveTransparentMode(): TransparentMode {
  return crossOriginIsolated ? 'sab' : 'message';
}
