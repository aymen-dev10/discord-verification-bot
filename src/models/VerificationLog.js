// src/models/VerificationLog.js — Immutable audit trail for every verification
// attempt, successful or not. Every branch in verificationService creates one
// of these — an unlogged attempt is a bug.
//
// WHY the compound index: The future dashboard's "show this user's history"
// query is { discordId, sort by createdAt desc }. Without the index, Mongo
// does a full collection scan. With it, it's an index-only lookup + reverse
// traversal.

const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema(
  {
    discordId: {
      type: String,
      required: true,
    },
    codeAttempted: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'ok',
        'invalid_code',
        'expired',
        'disabled',
        'already_used',
        'role_assign_failed',
      ],
    },
  },
  { timestamps: true }
);

// Compound index: fast "user history" lookups sorted by most-recent-first.
// Mongoose auto-creates this on startup via ensureIndexes().
verificationLogSchema.index({ discordId: 1, createdAt: -1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
