/** A country as it comes from countries.dev. */
export interface RawCountry {
  name: string;
  alpha3Code: string;
  nativeName?: string;
  flags?: { svg?: string; png?: string };
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: { name: string }[];
  currencies?: { code: string; name: string }[];
}

/** A country prepared for the card and the detail view. */
export interface Country {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  borders: string[];
  languages: string[];
  currencies: string[];
}
