// src/config/db.js — Mongoose connection lifecycle.
//
// WHY a separate module: The connection is established once at startup
// (called from index.js), but the *listeners* below stay active for the
// entire process lifetime. A long-running bot can lose its DB connection
// hours after boot (Atlas maintenance, network blip, etc.), so we need
// persistent event listeners — not just a one-shot connect() call.

const mongoose = require('mongoose');
const config   = require('./env');

/**
 * Opens the Mongoose connection to MongoDB Atlas.
 * Throws on failure so the caller (index.js) can decide whether to retry
 * or shut down.
 */
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[db] MongoDB connected — ${mongoose.connection.host}`);
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    throw err; // let the caller handle it (crash on startup is fine)
  }

  // --- Persistent lifecycle listeners ---

  // Fires if the connection drops after it was initially established.
  // This is NOT the same as the initial connect() failing — that's caught above.
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  // Fires on any connection-level error after the initial connect succeeds.
  // Without this listener, an unhandled 'error' event would crash the process.
  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });
}

module.exports = { connectDB };
