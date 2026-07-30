import { test, expect } from 'bun:test';
import { join } from 'node:path';
import { loadEvents } from './load-events';

function makeFakeClient() {
  const calls: { method: 'on' | 'once'; name: string; listener: (...args: any[]) => unknown }[] =
    [];
  return {
    calls,
    on(name: string, listener: (...args: any[]) => unknown) {
      calls.push({ method: 'on', name, listener });
      return this;
    },
    once(name: string, listener: (...args: any[]) => unknown) {
      calls.push({ method: 'once', name, listener });
      return this;
    },
  };
}

test('registers a once:true event via client.once with the right event name', async () => {
  const client = makeFakeClient();
  const dir = join(import.meta.dir, '__fixtures__/events');

  await loadEvents(client as any, dir);

  expect(client.calls).toHaveLength(1);
  expect(client.calls[0]?.method).toBe('once');
  expect(client.calls[0]?.name).toBe('ready');
});

test('resolves without throwing when the directory does not exist', async () => {
  const client = makeFakeClient();
  const dir = join(import.meta.dir, '__fixtures__/does-not-exist');

  await expect(loadEvents(client as any, dir)).resolves.toBeUndefined();
  expect(client.calls).toHaveLength(0);
});
