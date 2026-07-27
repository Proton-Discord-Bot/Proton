import { defineCommand } from '../../command';
export default defineCommand({
  data: { name: 'ping', toJSON: () => ({}) as any },
  run: async () => {},
});
