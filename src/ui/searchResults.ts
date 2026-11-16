import type { ErrorKind } from "../functions/getErrorKind.ts";
import type { SearchState } from "../search/createSearchController.ts";
import type { Country } from "../types.ts";
import createEl from "../utilities/createEl.ts";
import createCountryCard from "./countryCard.ts";

type Handlers = {
  onRetry: () => void;
  onSelect: (country: Country) => void;
};

const ERROR_MESSAGES: Record<Exclude<ErrorKind, "aborted">, string> = {
  timeout: "The server did not answer in time.",
  http: "The server answered with an error.",
  network: "Could not reach the server. Check your connection.",
};

function createMessage(className: string, children: (Node | string)[]) {
  return createEl({ className: `message ${className}` }, children);
}

function createLoading(query: string): HTMLElement {
  return createMessage("message-loading", [
    createEl({ className: "spinner", "aria-hidden": "true" }),
    createEl({ tag: "p" }, [`Searching for “${query}”…`]),
  ]);
}

function createError(
  state: Extract<SearchState, { status: "error" }>,
  onRetry: () => void,
): HTMLElement {
  const retryButton = createEl(
    { tag: "button", type: "button", className: "btn btn-primary" },
    ["Retry"],
  );
  retryButton.addEventListener("click", onRetry);

  return createMessage("message-error", [
    createEl({ tag: "p", className: "message-title" }, [
      "Something went wrong",
    ]),
    createEl({ tag: "p" }, [
      `${ERROR_MESSAGES[state.kind]} The search for “${state.query}” failed.`,
    ]),
    retryButton,
  ]);
}

export default function renderSearchResults(
  state: SearchState,
  { onRetry, onSelect }: Handlers,
): HTMLElement {
  switch (state.status) {
    case "idle":
      return createMessage("message-idle", [
        createEl({ tag: "p" }, ["Start typing a country name."]),
      ]);
    case "loading":
      return createLoading(state.query);
    case "empty":
      return createMessage("message-empty", [
        createEl({ tag: "p", className: "message-title" }, ["Nothing found"]),
        createEl({ tag: "p" }, [
          `No countries match “${state.query}”. Try another name.`,
        ]),
      ]);
    case "error":
      return createError(state, onRetry);
    case "success":
      return createEl(
        { className: "cards" },
        state.countries.map((country) => createCountryCard(country, onSelect)),
      );
  }
}
