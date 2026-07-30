const stamp = (level: string) => `[${level}]`;
export const logger = {
  info: (...a: unknown[]) => console.log(stamp('INFO'), ...a),
  warn: (...a: unknown[]) => console.warn(stamp('WARN'), ...a),
  error: (...a: unknown[]) => console.error(stamp('ERROR'), ...a),
  debug: (...a: unknown[]) => console.debug(stamp('DEBUG'), ...a),
};
