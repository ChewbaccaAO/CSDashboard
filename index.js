// We import the modules.
const Discord = require("discord.js")
const mongoose = require("mongoose")
const config = require("./config")
const GuildSettings = require("./models/settings")
const Dashboard = require("./dashboard/dashboard")
const fs = require("fs")

// We initiate the client, initiate commands and connect to database.
const client = new Discord.Client()
mongoose.connect(config.mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
client.config = config
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}

// We listen for client's ready event.
client.on("ready", () => {
  console.log(`Bot is ready. (${client.guilds.cache.size} Guilds - ${client.channels.cache.size} Channels - ${client.users.cache.size} Users)`)
  Dashboard(client)
  setInterval(func => {
    client.guilds.cache.forEach(async guild => {
      var storedSettings = await GuildSettings.findOne({ gid: guild.id })
      if (!storedSettings) {
        // If there are no settings stored for this guild, we create them and try to retrive them again.
        const newSettings = new GuildSettings({
          gid: guild.id,
          gname: guild.name
        })
        await newSettings.save().catch(()=>{})
        storedSettings = await GuildSettings.findOne({ gid: guild.id })
      }
      if (storedSettings.gname !== guild.name) {
        guild.setName(storedSettings.gname).then(updated => console.log(`INFO: Guild <${guild.id}> has been renamed to ${guild.name}`)).catch(console.error)
      }
    })
    }, 300000)
})

// We listen for message events.
client.on("message", async (message) => {
  if (message.channel.type === "dm") return;
  // Important - Do not touch!
  var storedSettings = await GuildSettings.findOne({ gid: message.guild.id })
  if (!storedSettings) {
    // If there are no settings stored for this guild, we create them and try to retrive them again.
    const newSettings = new GuildSettings({
      gid: message.guild.id,
      gname: message.guild.name
    })
    await newSettings.save().catch(()=>{})
    storedSettings = await GuildSettings.findOne({ gid: message.guild.id })
  }

  // If the message does not start with the prefix stored in database, we ignore the message.
  if (message.content.indexOf(storedSettings.prefix) !== 0) return;

  // We remove the prefix from the message and process the arguments.
  const args = message.content.slice(storedSettings.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args, client, storedSettings)
  } catch (error) {
    console.log(`Error appeared while trying to execute a command!`)
    console.error(error)
  }
});

// Listening for error & warn events.
client.on("error", console.error)
client.on("warn", console.warn)

// We login into the bot.
client.login(config.token)