import { defineCommand } from '../../../command';

export default defineCommand({
  data: { name: 'pong', toJSON: () => ({}) as any },
  run: async () => {},
});
