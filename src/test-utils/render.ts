interface RenderedComponent {
  content?: string;
  components?: RenderedComponent[];
}

/**
 * Flattens a Components V2 reply payload into the text it would display.
 *
 * Tests assert on this rather than on `JSON.stringify(payload)`: the builders serialise
 * nested content as escaped JSON strings, so a naive `toContain('"count":3')` never
 * matches even when the reply is correct.
 */
export function renderedText(payload: unknown): string {
  const json = JSON.parse(JSON.stringify(payload)) as { components?: RenderedComponent[] };

  const flatten = (c: RenderedComponent): RenderedComponent[] =>
    c.components ? c.components.flatMap(flatten) : [c];

  return (json.components ?? [])
    .flatMap(flatten)
    .map((c) => c.content ?? '')
    .filter((s) => s.length > 0)
    .join('\n');
}
