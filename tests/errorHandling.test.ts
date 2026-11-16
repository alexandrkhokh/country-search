import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import getErrorKind from "../src/functions/getErrorKind.ts";
import HttpError from "../src/functions/HttpError.ts";
import searchCountries from "../src/functions/searchCountries.ts";

const TIMEOUT = 20;

const fetchMock = vi.fn<typeof fetch>();

/** A fetch that never answers, but rejects when its signal is aborted. */
const hangingFetch: typeof fetch = (_input, init) =>
  new Promise((_resolve, reject) => {
    const signal = init?.signal;
    signal?.addEventListener("abort", () => reject(signal.reason));
  });

function catchError(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((reason: unknown) => reason);
}

describe("getErrorKind", () => {
  it("should recognize the cancellation of our own request", () => {
    const error = new DOMException("Aborted", "AbortError");

    expect(getErrorKind(error)).toBe("aborted");
  });

  it("should recognize a timeout separately from the cancellation", () => {
    const error = new DOMException("Timed out", "TimeoutError");

    expect(getErrorKind(error)).toBe("timeout");
  });

  it("should recognize an HTTP error", () => {
    expect(getErrorKind(new HttpError(500))).toBe("http");
  });

  it("should treat any other failure as a network error", () => {
    expect(getErrorKind(new TypeError("Failed to fetch"))).toBe("network");
    expect(getErrorKind("something strange")).toBe("network");
  });
});

describe("searchCountries errors", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("should reject with TimeoutError when there is no answer for too long", async () => {
    fetchMock.mockImplementation(hangingFetch);

    const error = await catchError(
      searchCountries("spain", new AbortController().signal, TIMEOUT),
    );

    expect(error).toMatchObject({ name: "TimeoutError" });
    expect(getErrorKind(error)).toBe("timeout");
  });

  it("should reject with AbortError when the caller aborts before the timeout", async () => {
    fetchMock.mockImplementation(hangingFetch);
    const controller = new AbortController();

    const promise = catchError(
      searchCountries("spain", controller.signal, TIMEOUT),
    );
    controller.abort();
    const error = await promise;

    expect(error).toMatchObject({ name: "AbortError" });
    expect(getErrorKind(error)).toBe("aborted");
  });

  it("should reject with an http kind of error on a server failure", async () => {
    fetchMock.mockResolvedValue(new Response("Oops", { status: 500 }));

    const error = await catchError(
      searchCountries("spain", new AbortController().signal, TIMEOUT),
    );

    expect(getErrorKind(error)).toBe("http");
  });

  it("should reject with a network kind of error when the connection is lost", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await catchError(
      searchCountries("spain", new AbortController().signal, TIMEOUT),
    );

    expect(getErrorKind(error)).toBe("network");
  });

  it("should not treat 404 as an error", async () => {
    fetchMock.mockResolvedValue(
      new Response("Country not found", { status: 404 }),
    );

    await expect(
      searchCountries("zzzz", new AbortController().signal, TIMEOUT),
    ).resolves.toEqual([]);
  });
});
