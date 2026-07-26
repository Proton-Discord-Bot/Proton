import { test, expect, spyOn } from 'bun:test';
import { logger } from './logger';

test('logger.info prefixes level and forwards args', () => {
  const spy = spyOn(console, 'log').mockImplementation(() => {});
  logger.info('hello', 1);
  expect(spy).toHaveBeenCalledWith('[INFO]', 'hello', 1);
  spy.mockRestore();
});
