const Discord = require('discord.js')

module.exports = {
    name: 'prefix',
    description: 'Sets the prefix of the bot',
    async execute(message, args, client, storedSettings) {
      if (message.channel.type === "dm") return;
      message.channel.send({
        embed: {
          color: 0x00ffff,
          description: `**The current prefix is: ${storedSettings.prefix}**`
        }
      })
      if (message.member.permissions.has("ADMINISTRATOR")) {
        let uselessMessage = await message.reply(`do you want to change the prefix? (y/n)`)
        const filter = m => m.author.id === message.author.id && m.content.includes('y') || m.content.includes('n')
        const collector = message.channel.createMessageCollector(filter, {max: 1, time: 15000, errors: ['time']})
        collector.on('collect', async m => {
          if (m.content === 'y') {
            let uselessMessage2 = await m.reply('answer with the new prefix')
            message.channel.awaitMessages(m2 => m2.author.id === message.author.id, {max: 1, time: 30000, errors: ['time']}).then(collected => {
              storedSettings.prefix = collected.first().content
              storedSettings.save().catch(()=>{})
              collected.first().reply(`prefix -> ${storedSettings.prefix} <- successfully saved.`)
              collected.first().delete()
              uselessMessage.delete()
              uselessMessage2.delete()
              m.delete()
            }).catch(collected => {
              uselessMessage.delete()
              uselessMessage2.delete()
              m.delete()
            })
          } else {
            uselessMessage.delete()
            m.delete()
          }
        })
        collector.on('end', async m => {
          if (!m.size) {
            uselessMessage.delete()
          }
        })
      }
    }
}