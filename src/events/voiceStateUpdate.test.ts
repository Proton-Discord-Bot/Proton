import { test, expect } from 'bun:test';
import { isTempRoom, tempRoomName } from './voiceStateUpdate';

test('tempRoomName derives the room name from the username', () => {
  expect(tempRoomName('Alice')).toBe("Alice's room");
});

test('isTempRoom recognises names produced by tempRoomName', () => {
  expect(isTempRoom(tempRoomName('Alice'))).toBe(true);
});

test('isTempRoom rejects unrelated channel names', () => {
  expect(isTempRoom('General')).toBe(false);
  expect(isTempRoom('Join to Create')).toBe(false);
});
