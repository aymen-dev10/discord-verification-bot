// src/bot/events/ready.js — Handles the 'ready' event and posts the Verify button.
//
// WHY the message check is idempotent: Every deploy/reboot restarts the bot.
// If we blindly posted the button message every time, the verification channel
// would quickly get flooded with duplicate messages. Checking the last 20
// messages for our button keeps the channel clean automatically.

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config/env');

/**
 * Executes when the bot successfully connects to Discord.
 * Fetches the verification channel and ensures the Verify button exists.
 *
 * @param {Client} client - The logged-in discord.js client
 */
async function handleReady(client) {
  console.log(`[bot] Logged in as ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(config.verifyChannelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`[bot] Verify channel (${config.verifyChannelId}) is not a valid text channel.`);
      return;
    }

    // Fetch the last 20 messages to look for an existing verify button
    const messages = await channel.messages.fetch({ limit: 20 });
    
    const buttonExists = messages.some((msg) => {
      const isFromBot = msg.author.id === client.user.id;
      if (!isFromBot) return false;

      // Check all action rows for a button with customId 'verify_button'
      return msg.components.some((row) => 
        row.components.some((comp) => comp.customId === 'verify_button')
      );
    });

    if (buttonExists) {
      console.log('[bot] Verification button already exists in channel. Skipping creation.');
      return;
    }

    console.log('[bot] Verification button not found. Creating new message...');

    // Build the verify embed message
    const embed = new EmbedBuilder()
      .setTitle('Server Verification')
      .setDescription('Welcome! Click the **Verify** button below and enter your verification code to gain full access to the server.')
      .setColor('#c9a84c'); // Gold color to match dark-gold theme/sentinel style

    // Build the action row containing the button
    const button = new ButtonBuilder()
      .setCustomId('verify_button')
      .setLabel('Verify')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
      embeds: [embed],
      components: [row],
    });

    console.log('[bot] Verification message posted successfully.');
  } catch (err) {
    console.error('[bot] Error while setting up verify button in ready event:', err.message);
  }
}

module.exports = { handleReady };
