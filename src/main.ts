import "./styles/main.scss";
import createCachedSearch from "./search/createCachedSearch.ts";
import createSearchController from "./search/createSearchController.ts";
import showCountryDetails from "./ui/countryDetails.ts";
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

const results = createEl({ className: "results", "aria-live": "polite" });

const controller = createSearchController({
  search: createCachedSearch(),
  onChange: (state) => {
    results.replaceChildren(
      renderSearchResults(state, {
        onRetry: () => controller.retry(),
        onSelect: showCountryDetails,
      }),
    );
  },
});

input.addEventListener("input", () => controller.setQuery(input.value));

results.append(
  renderSearchResults(controller.getState(), {
    onRetry: () => controller.retry(),
    onSelect: showCountryDetails,
  }),
);

document.body.prepend(
  createEl({ tag: "main", className: "app" }, [
    createEl({ tag: "h1" }, ["Country Search"]),
    input,
    results,
  ]),
);

input.focus();
