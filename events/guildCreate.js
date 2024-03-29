const {
    ActivityType: { Watching },
    Events,
} = require('discord.js')
const Guild = require('../models/guilds')
const cMessage = require('../models/cMessage')
const warns = require('../models/warns')

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        let client = guild.client
        await Guild.create({
            guildId: guild.id,
        })
        await cMessage.create({
            guildId: guild.id,
        })

        const serverAmount = client.guilds.cache

        client.user.setPresence({
            activities: [
                {
                    name: `${serverAmount.size} Server(s)`,
                    type: Watching,
                },
            ],
            status: 'online',
        })
    },
}
