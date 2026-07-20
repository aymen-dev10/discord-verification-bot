// src/bot/interactions/verifyModal.js — Processes modal submissions.
//
// WHY try/catch and ephemeral replies: Discord interactions expire and error out
// if not replied to within 3 seconds. Using try/catch guarantees the user always
// receives a response and the interaction is acknowledged. Ephemeral replies
// ensure other members cannot see private verification details or error messages.

const { verifyCode } = require('../../services/verificationService');
const { sendDM } = require('../../services/notificationService');

// User-friendly error message dictionary mapping machine reason codes
// to human-readable text.
const ERROR_MESSAGES = {
  invalid_code:       'That verification code is invalid. Please double-check the spelling.',
  disabled:           'This verification code is currently disabled.',
  expired:            'This verification code has expired.',
  already_used:       'This one-time verification code has already been used.',
  role_assign_failed: 'Your code is valid, but the bot failed to assign your role. This is usually a server configuration issue. Please contact a server administrator.',
};

/**
 * Handles verification modal submission by retrieving the input,
 * executing the verification service, and replying to the user.
 *
 * @param {ModalSubmitInteraction} interaction - The modal submission interaction
 */
async function handleVerifyModal(interaction) {
  try {
    // Discord requires acknowledgment/reply within 3 seconds.
    // Defer the reply to buy time for DB operations and API calls.
    await interaction.deferReply({ ephemeral: true });

    const rawCode = interaction.fields.getTextInputValue('code_input');

    const result = await verifyCode(
      interaction.client,
      interaction.guildId,
      interaction.user.id,
      rawCode
    );

    if (result.success) {
      await interaction.editReply({
        content: `✅ **Success!** You have been verified and granted the **${result.roleName}** role. Welcome to the server!`,
      });

      // Send confirmation DM asynchronously after the ephemeral reply
      sendDM(
        interaction.client,
        interaction.user.id,
        `🎉 You're verified! You've been given the **${result.roleName}** role. Welcome aboard!`
      );
    } else {
      const message = ERROR_MESSAGES[result.reason] || 'Verification failed for an unknown reason.';
      await interaction.editReply({
        content: `❌ **Verification Failed:** ${message}`,
      });
    }
  } catch (err) {
    console.error(`[bot] Error handling verify modal for user ${interaction.user.id}:`, err);
    
    // Attempt an edit or follow-up reply depending on interaction state
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ **Error:** An unexpected error occurred while processing your verification. Please contact a server administrator.',
        });
      } else {
        await interaction.reply({
          content: '❌ **Error:** An unexpected error occurred while processing your verification. Please contact a server administrator.',
          ephemeral: true,
        });
      }
    } catch (replyErr) {
      console.error('[bot] Failed to send emergency error response:', replyErr.message);
    }
  }
}

module.exports = { handleVerifyModal };
