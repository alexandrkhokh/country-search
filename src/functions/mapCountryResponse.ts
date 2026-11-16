import type { Country, RawCountry } from "../types.ts";

function mapCountry(raw: RawCountry): Country {
  return {
    code: raw.alpha3Code,
    name: raw.name,
    nativeName: raw.nativeName ?? "",
    flag: raw.flags?.svg ?? raw.flags?.png ?? "",
    capital: raw.capital ?? "",
    region: raw.region ?? "",
    subregion: raw.subregion ?? "",
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    borders: [...(raw.borders ?? [])],
    languages: (raw.languages ?? []).map((language) => language.name),
    currencies: (raw.currencies ?? []).map(
      (currency) => `${currency.name} (${currency.code})`,
    ),
  };
}

export default function mapCountryResponse(raw: RawCountry[]): Country[] {
  return raw.map(mapCountry);
}
