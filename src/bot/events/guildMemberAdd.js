// src/bot/events/guildMemberAdd.js — Handles the 'guildMemberAdd' event when a user joins the server.
//
// WHY we don't await the DM: Sending the DM is a side effect and shouldn't block
// the event handler thread. Let it execute in the background so that any potential
// slow Discord API responses don't delay other event processing.

const { sendDM } = require('../../services/notificationService');
const config = require('../../config/env');

/**
 * Handles welcoming new guild members and prompting them to verify.
 *
 * @param {GuildMember} member - The guild member who joined
 */
async function handleGuildMemberAdd(member) {
  const message = `👋 Welcome to **${member.guild.name}**!\n\n` +
    `To get full access to the server, head to <#${config.verifyChannelId}>\n` +
    `and click **Verify**, then enter your invitation code.\n\n` +
    `Don't have a code? Reach out to a server admin.`;

  // Trigger DM delivery asynchronously
  sendDM(member.client, member.id, message);
}

module.exports = handleGuildMemberAdd;
