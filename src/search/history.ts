import StorageHelper from "../utilities/StorageHelper.ts";

export const HISTORY_LIMIT = 8;

const STORAGE_KEY = "country-search:history";

const isHistory = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** Puts the query first, drops its older duplicate and keeps the list short. */
export function addToHistory(
  history: readonly string[],
  query: string,
  limit: number = HISTORY_LIMIT,
): string[] {
  const key = query.toLowerCase();
  const rest = history.filter((item) => item.toLowerCase() !== key);

  return [query, ...rest].slice(0, limit);
}

export function loadHistory(): string[] {
  try {
    const stored = StorageHelper.get<unknown>(STORAGE_KEY);
    return isHistory(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: readonly string[]): void {
  try {
    StorageHelper.set(STORAGE_KEY, history);
  } catch (error) {
    console.error(error);
  }
}
