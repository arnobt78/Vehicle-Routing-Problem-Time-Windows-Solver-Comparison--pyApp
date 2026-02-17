export const PERSIST_SCHEMA_VERSION = 1;
export const PERSIST_TTL_MS = 24 * 60 * 60 * 1000;

export function isFresh(savedAt: number): boolean {
  return Number.isFinite(savedAt) && Date.now() - savedAt <= PERSIST_TTL_MS;
}
