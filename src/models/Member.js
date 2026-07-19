// src/models/Member.js — Tracks which Discord users have verified and with
// which code. One document per user (discordId is unique).
//
// WHY verified defaults to false: A Member doc could theoretically be
// pre-created for other reasons later (e.g. tracking join date). The
// verified flag is the canonical source of truth, not the doc's existence.

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    discordId: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedWithCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
