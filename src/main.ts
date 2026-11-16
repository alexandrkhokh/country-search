import "./styles/main.scss";
import createCachedSearch from "./search/createCachedSearch.ts";
import createSearchController, {
  type SearchState,
} from "./search/createSearchController.ts";
import { addToHistory, loadHistory, saveHistory } from "./search/history.ts";
import showCountryDetails from "./ui/countryDetails.ts";
import renderSearchHistory from "./ui/searchHistory.ts";
import renderSearchResults from "./ui/searchResults.ts";
import createEl from "./utilities/createEl.ts";

const input = createEl({
  tag: "input",
  type: "search",
  className: "search-input",
  placeholder: "Country name, e.g. Spain",
  "aria-label": "Country name",
  autocomplete: "off",
});

const historyBar = createEl({ className: "history" });
const results = createEl({ className: "results", "aria-live": "polite" });

let history = loadHistory();

const searchFromHistory = (query: string): void => {
  input.value = query;
  controller.searchNow(query);
};

const renderHistory = (): void => {
  historyBar.replaceChildren(
    ...renderSearchHistory(history, searchFromHistory),
  );
};

const renderResults = (state: SearchState): void => {
  results.replaceChildren(
    renderSearchResults(state, {
      onRetry: () => controller.retry(),
      onSelect: showCountryDetails,
    }),
  );
};

const rememberQuery = (query: string): void => {
  history = addToHistory(history, query);
  saveHistory(history);
  renderHistory();
};

const controller = createSearchController({
  search: createCachedSearch(),
  onChange: (state) => {
    renderResults(state);

    if (state.status === "success") {
      rememberQuery(state.query);
    }
  },
});

input.addEventListener("input", () => controller.setQuery(input.value));

renderHistory();
renderResults(controller.getState());

document.body.prepend(
  createEl({ tag: "main", className: "app" }, [
    createEl({ tag: "h1" }, ["Country Search"]),
    input,
    historyBar,
    results,
  ]),
);

input.focus();
