import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import debounce from "../src/functions/debounce.ts";

const DELAY = 300;

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not call fn before the delay has passed", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY - 1);

    expect(fn).not.toHaveBeenCalled();
  });

  it("should call fn once after the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should reset the timer when called again during the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced();
    vi.advanceTimersByTime(DELAY - 1);
    debounced();
    vi.advanceTimersByTime(DELAY - 1);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should call fn with the arguments of the last call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, DELAY);

    debounced("s");
    debounced("sp");
    debounced("spain");
    vi.advanceTimersByTime(DELAY);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("spain");
  });
});
