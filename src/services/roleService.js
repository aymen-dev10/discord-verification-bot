// src/services/roleService.js — Assigns a Discord role to a guild member.
//
// WHY every dependency is a parameter: This function doesn't import the
// Discord client or read config — it receives them from the caller. That
// means a future Express route can call the same function by passing in the
// same client instance, without any refactoring. The service layer has zero
// knowledge of *who* is calling it.

/**
 * Assigns a Discord role to a member.
 *
 * @param {Client} client    - The discord.js Client instance
 * @param {string} guildId   - The guild where the member lives
 * @param {string} discordId - The member's Discord user ID
 * @param {string} roleId    - The role to assign
 * @throws {Error} If guild fetch, member fetch, or role assignment fails
 *                 (e.g. bot's role is below the target role in the hierarchy)
 */
async function assignRole(client, guildId, discordId, roleId) {
  try {
    const guild  = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(discordId);
    await member.roles.add(roleId);
  } catch (err) {
    // Re-throw with a clear message. Common causes:
    // - Bot's role is positioned below the target role in the guild hierarchy
    // - The role ID doesn't exist (typo in the verification code document)
    // - The member left the server between clicking "Verify" and this running
    throw new Error(`Failed to assign role: ${err.message}`);
  }
}

module.exports = { assignRole };
