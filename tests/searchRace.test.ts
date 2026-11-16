import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createSearchController, {
  DEBOUNCE_DELAY,
  type SearchState,
} from "../src/search/createSearchController.ts";
import { rawAntarctica, rawSpain } from "./fixtures/countries.ts";

type PendingRequest = {
  url: string;
  signal: AbortSignal;
  respond: (body: unknown) => void;
};

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

/**
 * A fetch whose answers are released by hand, in any order.
 * It reacts to the signal: abort() before the answer rejects with AbortError.
 */
function createControlledFetch() {
  const requests: PendingRequest[] = [];

  const fetchMock: typeof fetch = (input, init) =>
    new Promise((resolve, reject) => {
      const signal = init?.signal;
      if (!signal) {
        throw new Error("fetch was called without a signal");
      }

      signal.addEventListener("abort", () => reject(signal.reason));
      requests.push({
        url: String(input),
        signal,
        respond: (body) => resolve(jsonResponse(body)),
      });
    });

  return { fetchMock, requests };
}

const flushPromises = () => vi.advanceTimersByTimeAsync(0);

describe("request race", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should show only the result of the last query when an earlier answer comes later", async () => {
    const { fetchMock, requests } = createControlledFetch();
    vi.stubGlobal("fetch", fetchMock);
    const states: SearchState[] = [];
    const controller = createSearchController({
      onChange: (state) => states.push(state),
    });

    // "sp" goes to the network and hangs there
    controller.setQuery("sp");
    await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toContain("/sp");

    // new input: the first request is aborted right away, before the debounce fires
    controller.setQuery("spain");
    expect(requests[0].signal.aborted).toBe(true);
    expect(requests).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
    expect(requests).toHaveLength(2);
    expect(requests[1].url).toContain("/spain");

    // inverted order: the later request is answered first, the earlier one after it
    requests[1].respond([rawSpain]);
    await flushPromises();
    requests[0].respond([rawAntarctica]);
    await flushPromises();

    const finalState = controller.getState();
    expect(finalState).toMatchObject({ status: "success", query: "spain" });
    expect(
      finalState.status === "success" &&
        finalState.countries.map((country) => country.name),
    ).toEqual(["Spain"]);

    // the stale answer was never rendered and the abort was not shown as an error
    expect(states.some((state) => state.status === "error")).toBe(false);
    expect(
      states.some(
        (state) => state.status === "success" && state.query === "sp",
      ),
    ).toBe(false);
  });
});
