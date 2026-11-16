import type { Country, RawCountry } from "../types.ts";
import HttpError from "./HttpError.ts";
import mapCountryResponse from "./mapCountryResponse.ts";

const API_URL = "https://countries.dev/name";
const NOT_FOUND_STATUS = 404;
export const REQUEST_TIMEOUT = 8000;

export default async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT,
): Promise<Country[]> {
  // one signal for both sources: the caller aborts with AbortError,
  // the timeout aborts with TimeoutError
  const requestSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(timeoutMs),
  ]);
  const response = await fetch(`${API_URL}/${encodeURIComponent(query)}`, {
    signal: requestSignal,
  });

  // countries.dev answers 404 when nothing matches: an empty result, not an error
  if (response.status === NOT_FOUND_STATUS) {
    return [];
  }

  // fetch does not reject on HTTP errors, so the status is checked by hand
  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const raw = (await response.json()) as RawCountry[];

  return mapCountryResponse(raw);
}
