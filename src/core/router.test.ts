import { test, expect } from 'bun:test';
import { handleInteraction } from './router';

function fakeClient(opts: { commands?: Map<string, any>; components?: Map<string, any> }) {
  return {
    commands: opts.commands ?? new Map(),
    components: opts.components ?? new Map(),
    db: {},
    translator: () => (k: string) => k,
  } as any;
}

test('routes a chat-input command through run', async () => {
  let ran = false;
  const cmd = { data: { name: 'ping' }, run: async () => { ran = true; } };
  const interaction: any = {
    isChatInputCommand: () => true, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    inGuild: () => false, commandName: 'ping', locale: 'en-US',
    user: { id: 'u1' }, replied: false, deferred: false,
  };
  await handleInteraction(fakeClient({ commands: new Map([['ping', cmd]]) }), interaction);
  expect(ran).toBe(true);
});

test('silently ignores a chat-input command with no matching handler', async () => {
  const interaction: any = {
    isChatInputCommand: () => true, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    inGuild: () => false, commandName: 'missing', locale: 'en-US',
    user: { id: 'u1' }, replied: false, deferred: false,
  };
  await expect(handleInteraction(fakeClient({}), interaction)).resolves.toBeUndefined();
});

test('routes autocomplete to the command autocomplete handler', async () => {
  let calledWith: unknown;
  const cmd = {
    data: { name: 'ping' },
    run: async () => {},
    autocomplete: async (ctx: unknown) => { calledWith = ctx; },
  };
  const interaction: any = {
    isChatInputCommand: () => false, isContextMenuCommand: () => false,
    isAutocomplete: () => true, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    commandName: 'ping', locale: 'en-US', user: { id: 'u1' },
  };
  await handleInteraction(fakeClient({ commands: new Map([['ping', cmd]]) }), interaction);
  expect(calledWith).toMatchObject({ interaction });
});

test('routes a button through the exact feature:action component first', async () => {
  const calls: string[] = [];
  const specific = { match: 'help:nav', run: async () => { calls.push('specific'); } };
  const fallback = { match: 'help', run: async () => { calls.push('fallback'); } };
  const interaction: any = {
    isChatInputCommand: () => false, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => true,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    customId: 'help:nav:page2', locale: 'en-US', user: { id: 'u1' },
    replied: false, deferred: false,
  };
  await handleInteraction(
    fakeClient({
      components: new Map([
        ['help:nav', specific],
        ['help', fallback],
      ]),
    }),
    interaction,
  );
  expect(calls).toEqual(['specific']);
});

test('falls back to the feature-only component and forwards args', async () => {
  let receivedArgs: string[] | undefined;
  const fallback = {
    match: 'help',
    run: async (ctx: { args: string[] }) => { receivedArgs = ctx.args; },
  };
  const interaction: any = {
    isChatInputCommand: () => false, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => true,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    customId: 'help:nav:page2', locale: 'en-US', user: { id: 'u1' },
    replied: false, deferred: false,
  };
  await handleInteraction(fakeClient({ components: new Map([['help', fallback]]) }), interaction);
  expect(receivedArgs).toEqual(['page2']);
});

test('silently ignores a component interaction with no matching handler', async () => {
  const interaction: any = {
    isChatInputCommand: () => false, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => true,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    customId: 'unknown:action', locale: 'en-US', user: { id: 'u1' },
    replied: false, deferred: false,
  };
  await expect(handleInteraction(fakeClient({}), interaction)).resolves.toBeUndefined();
});

test('replies with an ephemeral error notice when the handler throws and no reply was sent yet', async () => {
  const cmd = { data: { name: 'boom' }, run: async () => { throw new Error('kaboom'); } };
  let replied: unknown;
  const interaction: any = {
    isChatInputCommand: () => true, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    inGuild: () => false, commandName: 'boom', locale: 'en-US',
    user: { id: 'u1' }, replied: false, deferred: false,
    reply: async (m: unknown) => { replied = m; },
    followUp: async () => { throw new Error('should not be called'); },
  };
  await handleInteraction(fakeClient({ commands: new Map([['boom', cmd]]) }), interaction);
  expect(replied).toBeDefined();
});

test('uses followUp for the error notice when already replied/deferred', async () => {
  const cmd = { data: { name: 'boom' }, run: async () => { throw new Error('kaboom'); } };
  let followedUp: unknown;
  const interaction: any = {
    isChatInputCommand: () => true, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    inGuild: () => false, commandName: 'boom', locale: 'en-US',
    user: { id: 'u1' }, replied: true, deferred: false,
    reply: async () => { throw new Error('should not be called'); },
    followUp: async (m: unknown) => { followedUp = m; },
  };
  await handleInteraction(fakeClient({ commands: new Map([['boom', cmd]]) }), interaction);
  expect(followedUp).toBeDefined();
});

test('never throws, even when the error-reply itself rejects', async () => {
  const cmd = { data: { name: 'boom' }, run: async () => { throw new Error('kaboom'); } };
  const interaction: any = {
    isChatInputCommand: () => true, isContextMenuCommand: () => false,
    isAutocomplete: () => false, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    inGuild: () => false, commandName: 'boom', locale: 'en-US',
    user: { id: 'u1' }, replied: false, deferred: false,
    reply: async () => { throw new Error('discord is down'); },
  };
  await expect(
    handleInteraction(fakeClient({ commands: new Map([['boom', cmd]]) }), interaction),
  ).resolves.toBeUndefined();
});

test('does not attempt to reply on a failing autocomplete interaction', async () => {
  const cmd = {
    data: { name: 'ping' },
    run: async () => {},
    autocomplete: async () => { throw new Error('kaboom'); },
  };
  const interaction: any = {
    isChatInputCommand: () => false, isContextMenuCommand: () => false,
    isAutocomplete: () => true, isButton: () => false,
    isAnySelectMenu: () => false, isModalSubmit: () => false,
    commandName: 'ping', locale: 'en-US', user: { id: 'u1' },
  };
  await expect(
    handleInteraction(fakeClient({ commands: new Map([['ping', cmd]]) }), interaction),
  ).resolves.toBeUndefined();
});
