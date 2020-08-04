const Discord = require('discord.js')

module.exports = {
    name: 'help',
    description: 'Help',
    async execute(message, args, client, storedSettings) {
        message.channel.send({
            embed: {
                color: 0x00ffff,
                fields: [
                    {
                        name: `${storedSettings.prefix}prefix`,
                        value: `Shows the current prefix. Admins can also change it.`
                    }
                ]
            }
        })
    }
}