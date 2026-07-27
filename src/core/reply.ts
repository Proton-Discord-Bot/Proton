import {
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  ContainerBuilder,
} from 'discord.js';

type Block = TextDisplayBuilder | SeparatorBuilder;
const V2 = MessageFlags.IsComponentsV2;

export const reply = {
  text(content: string) {
    return { flags: [V2], components: [new TextDisplayBuilder().setContent(content)] };
  },
  ephemeralText(content: string) {
    return {
      flags: [V2, MessageFlags.Ephemeral],
      components: [new TextDisplayBuilder().setContent(content)],
    };
  },
  separator() {
    return new SeparatorBuilder();
  },
  container(opts: { accent?: number; ephemeral?: boolean; blocks: Block[] }) {
    const c = new ContainerBuilder();
    if (opts.accent !== undefined) c.setAccentColor(opts.accent);
    for (const b of opts.blocks) {
      if (b instanceof SeparatorBuilder) c.addSeparatorComponents(b);
      else c.addTextDisplayComponents(b);
    }
    const flags = opts.ephemeral ? [V2, MessageFlags.Ephemeral] : [V2];
    return { flags, components: [c] };
  },
  text_(content: string) {
    return new TextDisplayBuilder().setContent(content);
  },
};
