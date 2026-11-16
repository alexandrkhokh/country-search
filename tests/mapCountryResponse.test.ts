import { describe, expect, it } from "vitest";
import mapCountryResponse from "../src/functions/mapCountryResponse.ts";
import { rawAntarctica, rawSpain } from "./fixtures/countries.ts";

describe("mapCountryResponse", () => {
  it("should map an API response to card data", () => {
    expect(mapCountryResponse([rawSpain])).toEqual([
      {
        code: "ESP",
        name: "Spain",
        nativeName: "España",
        flag: "https://flagcdn.com/es.svg",
        capital: "Madrid",
        region: "Europe",
        subregion: "Southern Europe",
        population: 47351567,
        area: 505992,
        borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
        languages: ["Spanish"],
        currencies: ["Euro (EUR)"],
      },
    ]);
  });

  it("should use defaults for missing fields", () => {
    expect(mapCountryResponse([rawAntarctica])).toEqual([
      {
        code: "ATA",
        name: "Antarctica",
        nativeName: "Antarctica",
        flag: "https://flagcdn.com/aq.svg",
        capital: "",
        region: "Polar",
        subregion: "",
        population: 1000,
        area: 0,
        borders: [],
        languages: [],
        currencies: [],
      },
    ]);
  });

  it("should keep the order of countries", () => {
    const names = mapCountryResponse([rawSpain, rawAntarctica]).map(
      (country) => country.name,
    );

    expect(names).toEqual(["Spain", "Antarctica"]);
  });

  it("should return an empty array for an empty response", () => {
    expect(mapCountryResponse([])).toEqual([]);
  });

  it("should not mutate the response", () => {
    const raw = structuredClone([rawSpain]);

    mapCountryResponse(raw);

    expect(raw).toEqual([rawSpain]);
  });
});
