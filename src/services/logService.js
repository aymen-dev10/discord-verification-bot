// src/services/logService.js — Creates immutable verification log entries.
//
// WHY no try/catch: This function is intentionally simple — it writes a doc
// and returns it. If Mongo is down, the error bubbles up to the caller
// (verificationService → interaction handler), which is the right place to
// decide how to respond to the user. Swallowing errors here would silently
// lose audit data, which is worse than a visible failure.

const VerificationLog = require('../models/VerificationLog');

/**
 * Writes a verification attempt to the audit log.
 *
 * @param {Object}  params
 * @param {string}  params.discordId     - The user who attempted verification
 * @param {string}  params.codeAttempted  - The code they entered
 * @param {boolean} params.success        - Whether verification succeeded
 * @param {string}  params.reason         - Machine-readable outcome (e.g. 'ok', 'expired')
 * @returns {Promise<Document>} The saved VerificationLog document
 */
async function logAttempt({ discordId, codeAttempted, success, reason }) {
  const entry = new VerificationLog({
    discordId,
    codeAttempted,
    success,
    reason,
  });

  return entry.save();
}

module.exports = { logAttempt };
