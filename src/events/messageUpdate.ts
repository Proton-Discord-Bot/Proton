import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { buildLogContainer, relativeTimestamp, sendGuildLog } from '../core/message-log';

export default defineEvent({
  name: Events.MessageUpdate,
  async execute(client, oldMessage, newMessage) {
    // See messageDelete: partials are not emitted without `Partials`, but guard anyway.
    if (oldMessage.partial || newMessage.partial) return;
    if (!oldMessage.guild || oldMessage.author.bot) return;

    // Embeds resolving, pins, and other metadata edits re-fire this event with identical
    // content. Legacy logged those as no-op "Message Updated" entries; skip them.
    if (oldMessage.content === newMessage.content) return;

    const container = buildLogContainer({
      title: 'Message Updated',
      avatarUrl: oldMessage.author.displayAvatarURL(),
      fields: [
        { name: 'Message ID', value: oldMessage.id },
        { name: 'Author', value: `<@${oldMessage.author.id}>` },
        { name: 'Old Message', value: oldMessage.content },
        { name: 'New Message', value: newMessage.content },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>` },
        // FIX: legacy stamped `Date.now()`; use the message's own creation time.
        { name: 'Message Timestamp', value: relativeTimestamp(oldMessage.createdTimestamp) },
      ],
    });

    await sendGuildLog(client.db, oldMessage.guild, container);
  },
});
