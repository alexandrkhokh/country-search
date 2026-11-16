import type { Country } from "../types.ts";
import createEl from "../utilities/createEl.ts";
import createModal from "../utilities/Modal.ts";
import { formatList, formatNumber, formatText } from "./format.ts";

function describeCountry(country: Country): string {
  const nativeName =
    country.nativeName !== "" && country.nativeName !== country.name
      ? ` (${country.nativeName})`
      : "";
  const place = [country.subregion, country.region]
    .filter((part) => part !== "")
    .join(", ");
  const location = place === "" ? "" : ` is located in ${place}`;
  const capital =
    country.capital === "" ? "" : ` Its capital is ${country.capital}.`;

  return `${country.name}${nativeName}${location}.${capital}`;
}

function createRow(label: string, value: string): HTMLElement[] {
  return [createEl({ tag: "dt" }, [label]), createEl({ tag: "dd" }, [value])];
}

function createCountryDetails(country: Country): HTMLElement {
  return createEl({ className: "details" }, [
    createEl({
      tag: "img",
      className: "details-flag",
      src: country.flag,
      alt: `Flag of ${country.name}`,
    }),
    createEl({ tag: "h2", className: "details-title" }, [country.name]),
    createEl({ tag: "p" }, [describeCountry(country)]),
    createEl({ tag: "dl", className: "details-facts" }, [
      ...createRow("Area", `${formatNumber(country.area)} km²`),
      ...createRow("Population", formatNumber(country.population)),
      ...createRow("Borders", formatList(country.borders)),
      ...createRow("Languages", formatList(country.languages)),
      ...createRow("Currency", formatList(country.currencies)),
      ...createRow("Region", formatText(country.region)),
    ]),
  ]);
}

export default function showCountryDetails(country: Country): void {
  createModal(createCountryDetails(country));
}
