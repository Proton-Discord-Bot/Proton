import { Events } from 'discord.js';
import { defineEvent } from '../core/event';
import { buildLogContainer, relativeTimestamp, sendGuildLog } from './messageLog';

export default defineEvent({
  name: Events.MessageDelete,
  async execute(client, message) {
    // Uncached deletions arrive partial. The client registers no `Partials`, so these are
    // not emitted in practice; the guard keeps the handler honest if that ever changes.
    if (message.partial) return;
    if (!message.guild || message.author.bot) return;

    const container = buildLogContainer({
      title: 'Message Deleted',
      avatarUrl: message.author.displayAvatarURL(),
      fields: [
        { name: 'Message ID', value: message.id },
        { name: 'Author', value: `<@${message.author.id}>` },
        { name: 'Message Content', value: message.content },
        { name: 'Channel', value: `<#${message.channel.id}>` },
        // FIX: legacy stamped `Date.now()` here, so the field labelled "Message Timestamp"
        // always rendered as "in 0 seconds". Use the message's own creation time.
        { name: 'Message Timestamp', value: relativeTimestamp(message.createdTimestamp) },
      ],
    });

    await sendGuildLog(client.db, message.guild, container);
  },
});
