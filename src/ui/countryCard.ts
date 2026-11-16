import type { Country } from "../types.ts";
import createEl from "../utilities/createEl.ts";
import { formatNumber, formatText } from "./format.ts";

function createFact(label: string, value: string): HTMLElement {
  return createEl({ className: "card-fact" }, [
    createEl({ tag: "dt" }, [label]),
    createEl({ tag: "dd" }, [value]),
  ]);
}

export default function createCountryCard(
  country: Country,
  onSelect: (country: Country) => void,
): HTMLElement {
  const card = createEl({ tag: "button", type: "button", className: "card" }, [
    createEl({
      tag: "img",
      className: "card-flag",
      src: country.flag,
      alt: `Flag of ${country.name}`,
      loading: "lazy",
    }),
    createEl({ className: "card-body" }, [
      createEl({ tag: "h2", className: "card-title" }, [country.name]),
      createEl({ tag: "dl", className: "card-facts" }, [
        createFact("Capital", formatText(country.capital)),
        createFact("Region", formatText(country.region)),
        createFact("Population", formatNumber(country.population)),
      ]),
    ]),
  ]);

  card.addEventListener("click", () => onSelect(country));

  return card;
}
