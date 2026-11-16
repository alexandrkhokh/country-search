import searchCountries from "../functions/searchCountries.ts";
import type { Country } from "../types.ts";

type Search = (query: string, signal: AbortSignal) => Promise<Country[]>;

type InFlightRequest = {
  promise: Promise<Country[]>;
  controller: AbortController;
  callers: number;
};

const toKey = (query: string): string => query.trim().toLowerCase();

/**
 * Wraps a search with a cache by query and deduplication of in-flight requests.
 *
 * The network request has its own AbortController, not tied to any caller:
 * a caller that aborts only rejects its own promise. The request itself is
 * aborted when no callers are left waiting for it.
 */
export default function createCachedSearch(
  search: Search = searchCountries,
): Search {
  const cache = new Map<string, Country[]>();
  const inFlight = new Map<string, InFlightRequest>();

  const startRequest = (key: string, query: string): InFlightRequest => {
    const controller = new AbortController();
    const promise = search(query, controller.signal)
      .then((countries) => {
        cache.set(key, countries);
        return countries;
      })
      .finally(() => {
        if (inFlight.get(key) === request) {
          inFlight.delete(key);
        }
      });
    const request: InFlightRequest = { promise, controller, callers: 0 };

    // every caller handles the failure itself, see waitFor()
    promise.catch(() => {});
    inFlight.set(key, request);

    return request;
  };

  const waitFor = (
    key: string,
    request: InFlightRequest,
    signal: AbortSignal,
  ): Promise<Country[]> =>
    new Promise((resolve, reject) => {
      const onAbort = (): void => {
        reject(signal.reason);
        request.callers -= 1;

        if (request.callers === 0) {
          inFlight.delete(key);
          request.controller.abort();
        }
      };

      request.callers += 1;
      signal.addEventListener("abort", onAbort, { once: true });
      request.promise
        .then(resolve, reject)
        .finally(() => signal.removeEventListener("abort", onAbort));
    });

  return (query, signal) => {
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }

    const key = toKey(query);
    const cached = cache.get(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    const request = inFlight.get(key) ?? startRequest(key, query);

    return waitFor(key, request, signal);
  };
}
