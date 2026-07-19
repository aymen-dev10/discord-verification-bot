// src/models/VerificationCode.js — Stores verification codes created manually
// in MongoDB Atlas. The bot reads these at verification time; it never writes
// new codes in Phase 1.
//
// WHY uppercase + trim on the schema: Normalizing at the model level means
// every code stored in the DB is guaranteed uppercase/trimmed. We still
// normalize the *lookup* value in the service layer (see verificationService),
// because schema transforms only run on save, not on query filters.

const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    roleId: {
      type: String,
      required: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ['one-time', 'reusable'],
      default: 'one-time',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
