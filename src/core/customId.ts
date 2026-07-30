const SEP = ':';
export function encodeId(feature: string, action: string, ...args: string[]): string {
  const id = [feature, action, ...args].join(SEP);
  if (id.length > 100) throw new Error(`customId exceeds 100 chars: ${id}`);
  return id;
}
export function decodeId(customId: string): { feature: string; action: string; args: string[] } {
  const [feature = '', action = '', ...args] = customId.split(SEP);
  return { feature, action, args };
}
