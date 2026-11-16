import createEl from "../utilities/createEl.ts";

export default function renderSearchHistory(
  history: readonly string[],
  onSelect: (query: string) => void,
): HTMLElement[] {
  if (history.length === 0) {
    return [];
  }

  const items = history.map((query) => {
    const button = createEl(
      { tag: "button", type: "button", className: "btn history-item" },
      [query],
    );
    button.addEventListener("click", () => onSelect(query));

    return createEl({ tag: "li" }, [button]);
  });

  return [
    createEl({ tag: "span", className: "history-label" }, ["Recent:"]),
    createEl({ tag: "ul", className: "history-list" }, items),
  ];
}
