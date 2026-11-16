import debounce from "../functions/debounce.ts";
import getErrorKind, { type ErrorKind } from "../functions/getErrorKind.ts";
import searchCountries from "../functions/searchCountries.ts";
import type { Country } from "../types.ts";

export const DEBOUNCE_DELAY = 300;

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; query: string; countries: Country[] }
  | { status: "empty"; query: string }
  | { status: "error"; query: string; kind: Exclude<ErrorKind, "aborted"> };

type SearchControllerOptions = {
  onChange: (state: SearchState) => void;
  delay?: number;
  search?: (query: string, signal: AbortSignal) => Promise<Country[]>;
};

export type SearchController = {
  /** Search as the user types: debounced. */
  setQuery: (value: string) => void;
  /** Search right now, without the debounce (e.g. a click on a history item). */
  searchNow: (value: string) => void;
  retry: () => void;
  getState: () => SearchState;
};

export default function createSearchController({
  onChange,
  delay = DEBOUNCE_DELAY,
  search = searchCountries,
}: SearchControllerOptions): SearchController {
  let state: SearchState = { status: "idle" };
  let lastQuery = "";
  let activeRequest: AbortController | null = null;

  const setState = (next: SearchState): void => {
    state = next;
    onChange(state);
  };

  const abortActiveRequest = (): void => {
    activeRequest?.abort();
    activeRequest = null;
  };

  const run = async (query: string): Promise<void> => {
    abortActiveRequest();

    // the field was cleared while the debounce timer was ticking
    if (query === "") {
      return;
    }

    const request = new AbortController();
    activeRequest = request;
    setState({ status: "loading", query });

    try {
      const countries = await search(query, request.signal);

      setState(
        countries.length > 0
          ? { status: "success", query, countries }
          : { status: "empty", query },
      );
    } catch (error) {
      const kind = getErrorKind(error);

      // cancelled by ourselves (new input / cleared field): nothing to show
      if (kind === "aborted") {
        return;
      }

      setState({ status: "error", query, kind });
    }
  };

  const runDebounced = debounce((query: string) => {
    // the query was replaced by searchNow() while the timer was ticking
    if (query !== lastQuery) {
      return;
    }

    void run(query);
  }, delay);

  return {
    setQuery(value: string): void {
      lastQuery = value.trim();

      // cancel on every input change, without waiting for the debounce
      abortActiveRequest();
      setState(
        lastQuery === ""
          ? { status: "idle" }
          : { status: "loading", query: lastQuery },
      );
      runDebounced(lastQuery);
    },

    searchNow(value: string): void {
      lastQuery = value.trim();
      void run(lastQuery);
    },

    retry(): void {
      void run(lastQuery);
    },

    getState: () => state,
  };
}
