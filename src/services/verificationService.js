// src/services/verificationService.js — Core business logic for code verification.
//
// WHY this is the "fat" service: Every validation check, the role assignment
// call, the usage-count increment, the member upsert, and the audit log write
// all live here in a single linear flow. This makes the verification rules
// trivially auditable — you read top-to-bottom and see every possible outcome.
//
// DESIGN CHOICE — return objects, not throw: Each branch returns
// { success, reason } (and roleName on success). This avoids a custom error
// class hierarchy for what are really expected business outcomes, not
// exceptional failures. The caller (Discord handler or Express controller)
// can switch on `reason` without try/catch gymnastics.

const VerificationCode = require('../models/VerificationCode');
const Member           = require('../models/Member');
const { assignRole }   = require('./roleService');
const { logAttempt }   = require('./logService');

/**
 * Validates a verification code and, if valid, assigns the linked role.
 *
 * @param {Client} client    - The discord.js Client instance
 * @param {string} guildId   - The guild ID
 * @param {string} discordId - The user attempting to verify
 * @param {string} rawCode   - The code the user entered (any casing)
 * @returns {Promise<{ success: boolean, reason: string, roleName?: string }>}
 */
async function verifyCode(client, guildId, discordId, rawCode) {
  // --- 1. Normalize input ---
  // The model uppercases on *save*, not on *query*, so we must normalize the
  // lookup value ourselves. Without this, a user entering "abc123" would fail
  // to match a stored "ABC123".
  const code = rawCode.trim().toUpperCase();

  // --- 2. Look up the code ---
  const codeDoc = await VerificationCode.findOne({ code });

  // --- 3. Code not found ---
  if (!codeDoc) {
    await logAttempt({ discordId, codeAttempted: code, success: false, reason: 'invalid_code' });
    return { success: false, reason: 'invalid_code' };
  }

  // --- 4. Code is disabled ---
  if (!codeDoc.enabled) {
    await logAttempt({ discordId, codeAttempted: code, success: false, reason: 'disabled' });
    return { success: false, reason: 'disabled' };
  }

  // --- 5. Code has expired ---
  if (codeDoc.expiresAt && codeDoc.expiresAt < new Date()) {
    await logAttempt({ discordId, codeAttempted: code, success: false, reason: 'expired' });
    return { success: false, reason: 'expired' };
  }

  // --- 6. One-time code already used ---
  if (codeDoc.mode === 'one-time' && codeDoc.usageCount >= 1) {
    await logAttempt({ discordId, codeAttempted: code, success: false, reason: 'already_used' });
    return { success: false, reason: 'already_used' };
  }

  // --- 7. Attempt role assignment ---
  // If this fails (hierarchy issue, member left, etc.), we log the failure but
  // do NOT increment usageCount or mark the member verified — nothing actually
  // succeeded from the user's perspective.
  try {
    await assignRole(client, guildId, discordId, codeDoc.roleId);
  } catch (err) {
    console.error(`[verification] Role assignment failed for ${discordId}:`, err.message);
    await logAttempt({ discordId, codeAttempted: code, success: false, reason: 'role_assign_failed' });
    return { success: false, reason: 'role_assign_failed' };
  }

  // --- 8. Success — update state ---
  // Order: increment code usage → upsert member → log. If the log write fails,
  // the role is already assigned (can't undo that), but at least the code's
  // usageCount is correct.

  codeDoc.usageCount += 1;
  if (codeDoc.mode === 'one-time') {
    codeDoc.enabled = false;
  }
  await codeDoc.save();

  // Upsert: create the Member doc if it doesn't exist, update it if it does.
  // This handles both first-time verifiers and re-verification with a
  // different reusable code (edge case, but handled cleanly).
  await Member.findOneAndUpdate(
    { discordId },
    {
      verified: true,
      verifiedAt: new Date(),
      verifiedWithCode: code,
    },
    { upsert: true }
  );

  await logAttempt({ discordId, codeAttempted: code, success: true, reason: 'ok' });

  return { success: true, roleName: codeDoc.roleName };
}

module.exports = { verifyCode };
