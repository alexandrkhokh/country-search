import HttpError from "./HttpError.ts";

export type ErrorKind = "aborted" | "timeout" | "http" | "network";

function hasName(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

export default function getErrorKind(error: unknown): ErrorKind {
  // our own cancellation (new input / cleared field): not a failure
  if (hasName(error, "AbortError")) {
    return "aborted";
  }

  // AbortSignal.timeout fired: a real failure, unlike the cancellation above
  if (hasName(error, "TimeoutError")) {
    return "timeout";
  }

  if (error instanceof HttpError) {
    return "http";
  }

  return "network";
}
