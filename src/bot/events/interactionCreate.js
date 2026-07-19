// src/bot/events/interactionCreate.js — Routes incoming Discord interactions.
//
// WHY this is a simple router: Interaction routing should contain no business
// logic, serving only as a traffic director. This ensures handlers (like button
// and modal submissions) remain isolated and easy to test/modify independently.

const { handleVerifyButton } = require('../interactions/verifyButton');
const { handleVerifyModal } = require('../interactions/verifyModal');

/**
 * Handles incoming interactions from Discord and routes them appropriately.
 *
 * @param {Interaction} interaction - The received interaction
 */
async function handleInteractionCreate(interaction) {
  if (interaction.isButton() && interaction.customId === 'verify_button') {
    return handleVerifyButton(interaction);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
    return handleVerifyModal(interaction);
  }
}

module.exports = { handleInteractionCreate };
