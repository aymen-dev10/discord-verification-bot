// src/services/notificationService.js — Sends notifications to Discord members.
//
// WHY we don't throw on failure: A user blocking DMs or having privacy settings
// enabled is a common Discord client-side behavior, not an application crash event.
// Swallowing the error and returning false keeps the flow resilient and prevents
// a user's local preference from breaking server-side execution.

/**
 * Sends a direct message (DM) to a Discord user.
 *
 * @param {Client} client    - The discord.js Client instance
 * @param {string} discordId - The user's Discord ID
 * @param {string|Object} message - The message content (string or embed/options)
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
async function sendDM(client, discordId, message) {
  try {
    const user = await client.users.fetch(discordId);
    await user.send(message);
    return true;
  } catch (err) {
    console.log(`[notificationService] Could not send DM to user ${discordId}: ${err.message} (user likely has DMs disabled)`);
    return false;
  }
}

module.exports = { sendDM };
