const numberFormat = new Intl.NumberFormat("en-US");

export const EMPTY_VALUE = "—";

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatText(value: string): string {
  return value === "" ? EMPTY_VALUE : value;
}

export function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : EMPTY_VALUE;
}
