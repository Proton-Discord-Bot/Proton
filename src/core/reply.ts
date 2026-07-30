import {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
  type MessageActionRowComponentBuilder,
} from 'discord.js';

export type ButtonRow = ActionRowBuilder<MessageActionRowComponentBuilder>;
export type Block = TextDisplayBuilder | SeparatorBuilder | ButtonRow;
const V2 = MessageFlags.IsComponentsV2;

// `as const` matters: a plain array literal widens to `MessageFlags[]`, which discord.js
// rejects because reply flags accept only a four-flag subset.
const V2_FLAGS = [V2] as const;
const V2_EPHEMERAL_FLAGS = [V2, MessageFlags.Ephemeral] as const;

export const reply = {
  text(content: string) {
    return { flags: V2_FLAGS, components: [new TextDisplayBuilder().setContent(content)] };
  },
  ephemeralText(content: string) {
    return {
      flags: V2_EPHEMERAL_FLAGS,
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
      else if (b instanceof ActionRowBuilder) c.addActionRowComponents(b);
      else c.addTextDisplayComponents(b);
    }
    const flags = opts.ephemeral ? V2_EPHEMERAL_FLAGS : V2_FLAGS;
    return { flags, components: [c] };
  },
  text_(content: string) {
    return new TextDisplayBuilder().setContent(content);
  },
};
