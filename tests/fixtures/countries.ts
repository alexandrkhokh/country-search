// Samples of the countries.dev response (GET https://countries.dev/name/{query})

export const rawSpain = {
  area: 505992,
  cioc: "ESP",
  flag: "🇪🇸",
  gini: 34.7,
  name: "Spain",
  flags: {
    png: "https://flagcdn.com/w320/es.png",
    svg: "https://flagcdn.com/es.svg",
  },
  latlng: [40, -4],
  region: "Europe",
  borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
  capital: "Madrid",
  demonym: "Spanish",
  languages: [
    { name: "Spanish", iso639_1: "es", iso639_2: "spa", nativeName: "Español" },
  ],
  subregion: "Southern Europe",
  timezones: ["UTC", "UTC+01:00"],
  alpha2Code: "ES",
  alpha3Code: "ESP",
  currencies: [{ code: "EUR", name: "Euro", symbol: "€" }],
  nativeName: "España",
  population: 47351567,
  independent: true,
  numericCode: "724",
  callingCodes: ["34"],
  topLevelDomain: [".es"],
  populationDensity: 93.58,
};

// A territory without capital, borders, languages and currencies
export const rawAntarctica = {
  name: "Antarctica",
  flags: {
    png: "https://flagcdn.com/w320/aq.png",
    svg: "https://flagcdn.com/aq.svg",
  },
  region: "Polar",
  alpha2Code: "AQ",
  alpha3Code: "ATA",
  nativeName: "Antarctica",
  population: 1000,
};
