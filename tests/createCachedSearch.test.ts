import { describe, expect, it, vi } from "vitest";
import createCachedSearch from "../src/search/createCachedSearch.ts";
import type { Country } from "../src/types.ts";

type Search = (query: string, signal: AbortSignal) => Promise<Country[]>;

const spain = { code: "ESP", name: "Spain" } as Country;

/** A search that answers by hand and rejects when its signal is aborted. */
function createControlledSearch() {
  const calls: {
    signal: AbortSignal;
    resolve: (countries: Country[]) => void;
    reject: (reason: unknown) => void;
  }[] = [];

  const search = vi.fn<Search>(
    (_query, signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
        calls.push({ signal, resolve, reject });
      }),
  );

  return { search, calls };
}

const newSignal = () => new AbortController().signal;

describe("createCachedSearch", () => {
  it("should take a repeated query from the cache", async () => {
    const search = vi.fn<Search>().mockResolvedValue([spain]);
    const cachedSearch = createCachedSearch(search);

    const first = await cachedSearch("spain", newSignal());
    const second = await cachedSearch("Spain", newSignal());

    expect(search).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("should not start a second request while the same one is in flight", async () => {
    const { search, calls } = createControlledSearch();
    const cachedSearch = createCachedSearch(search);

    const first = cachedSearch("spain", newSignal());
    const second = cachedSearch("spain", newSignal());
    calls[0].resolve([spain]);

    expect(search).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toEqual([spain]);
    await expect(second).resolves.toEqual([spain]);
  });

  it("should not break the shared request when one of the callers aborts", async () => {
    const { search, calls } = createControlledSearch();
    const cachedSearch = createCachedSearch(search);
    const impatient = new AbortController();

    const first = cachedSearch("spain", impatient.signal);
    const second = cachedSearch("spain", newSignal());
    impatient.abort();

    await expect(first).rejects.toMatchObject({ name: "AbortError" });
    expect(calls[0].signal.aborted).toBe(false);

    calls[0].resolve([spain]);

    await expect(second).resolves.toEqual([spain]);
  });

  it("should really abort the request when every caller has aborted", async () => {
    const { search, calls } = createControlledSearch();
    const cachedSearch = createCachedSearch(search);
    const controller = new AbortController();

    const promise = cachedSearch("spain", controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    expect(calls[0].signal.aborted).toBe(true);

    // an aborted request leaves nothing behind: the next one goes to the network
    void cachedSearch("spain", newSignal());
    expect(search).toHaveBeenCalledTimes(2);
  });

  it("should not cache failures", async () => {
    const search = vi
      .fn<Search>()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce([spain]);
    const cachedSearch = createCachedSearch(search);

    await expect(cachedSearch("spain", newSignal())).rejects.toThrow(
      "Failed to fetch",
    );
    await expect(cachedSearch("spain", newSignal())).resolves.toEqual([spain]);
    expect(search).toHaveBeenCalledTimes(2);
  });
});
