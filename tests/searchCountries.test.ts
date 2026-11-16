import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HttpError from "../src/functions/HttpError.ts";
import searchCountries from "../src/functions/searchCountries.ts";
import { rawSpain } from "./fixtures/countries.ts";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("searchCountries", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("should request countries by the encoded query", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await searchCountries("south africa", new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://countries.dev/name/south%20africa",
    );
  });

  it("should resolve with mapped countries", async () => {
    fetchMock.mockResolvedValue(jsonResponse([rawSpain]));

    const countries = await searchCountries(
      "spain",
      new AbortController().signal,
    );

    expect(countries).toHaveLength(1);
    expect(countries[0]).toMatchObject({ name: "Spain", capital: "Madrid" });
  });

  it("should resolve with an empty array when nothing is found (404)", async () => {
    fetchMock.mockResolvedValue(
      new Response("Country not found", { status: 404 }),
    );

    const countries = await searchCountries(
      "zzzz",
      new AbortController().signal,
    );

    expect(countries).toEqual([]);
  });

  it("should reject with HttpError on other unsuccessful statuses", async () => {
    fetchMock.mockResolvedValue(new Response("Oops", { status: 500 }));

    const error: unknown = await searchCountries(
      "spain",
      new AbortController().signal,
    ).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
    expect((error as HttpError).status).toBe(500);
  });

  it("should abort the request when the given signal is aborted", async () => {
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          signal?.addEventListener("abort", () => reject(signal.reason));
        }),
    );
    const controller = new AbortController();

    const promise = searchCountries("spain", controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
