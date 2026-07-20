// src/bot/client.js — Sets up the discord.js client with intents and event handlers.
//
// WHY this is modularized: Separating client instantiation and event wiring
// from the startup process (index.js) makes the client configuration easily
// auditable and testable. index.js only has to run client.login(token).

const { Client, GatewayIntentBits } = require('discord.js');
const { handleReady } = require('./events/ready');
const { handleInteractionCreate } = require('./events/interactionCreate');
const handleGuildMemberAdd = require('./events/guildMemberAdd');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// Register events
client.once('ready', () => handleReady(client));
client.on('interactionCreate', handleInteractionCreate);
client.on('guildMemberAdd', handleGuildMemberAdd);

module.exports = client;
