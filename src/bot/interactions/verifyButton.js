// src/bot/interactions/verifyButton.js — Renders the verification code entry modal.
//
// WHY a modal: Modals are native Discord UI components that allow safe, structured
// text input directly in-app. Showing a modal on button click keeps the interaction
// streamlined and clean without clogging chat history.

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

/**
 * Handles the "Verify" button click by showing the verification modal.
 *
 * @param {ButtonInteraction} interaction - The button click interaction
 */
async function handleVerifyButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('verify_modal')
    .setTitle('Enter Verification Code');

  const codeInput = new TextInputBuilder()
    .setCustomId('code_input')
    .setLabel('Verification Code')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. TEAM-1234')
    .setRequired(true);

  // Modals require action rows for each input field
  const actionRow = new ActionRowBuilder().addComponents(codeInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}

module.exports = { handleVerifyButton };
