import { test, expect } from 'bun:test';
import { countOnlineHumans, countBots } from './ready';

test('countOnlineHumans counts online/idle/dnd non-bots', () => {
  const members = [
    { presence: { status: 'online' }, user: { bot: false } },
    { presence: { status: 'idle' }, user: { bot: false } },
    { presence: { status: 'dnd' }, user: { bot: false } },
  ];
  expect(countOnlineHumans(members)).toBe(3);
});

test('countOnlineHumans excludes offline members', () => {
  const members = [
    { presence: { status: 'offline' }, user: { bot: false } },
    { presence: { status: 'online' }, user: { bot: false } },
  ];
  expect(countOnlineHumans(members)).toBe(1);
});

test('countOnlineHumans excludes bots even if online', () => {
  const members = [
    { presence: { status: 'online' }, user: { bot: true } },
    { presence: { status: 'online' }, user: { bot: false } },
  ];
  expect(countOnlineHumans(members)).toBe(1);
});

test('countOnlineHumans handles missing/null presence', () => {
  const members = [
    { presence: null, user: { bot: false } },
    { user: { bot: false } },
    { presence: { status: 'online' }, user: { bot: false } },
  ];
  expect(countOnlineHumans(members)).toBe(1);
});

test('countOnlineHumans returns 0 for empty list', () => {
  expect(countOnlineHumans([])).toBe(0);
});

test('countBots counts members where user.bot is true', () => {
  const members = [{ user: { bot: true } }, { user: { bot: false } }, { user: { bot: true } }];
  expect(countBots(members)).toBe(2);
});

test('countBots returns 0 when no bots present', () => {
  const members = [{ user: { bot: false } }, { user: { bot: false } }];
  expect(countBots(members)).toBe(0);
});
