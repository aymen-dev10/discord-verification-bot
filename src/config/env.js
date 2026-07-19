// src/config/env.js — Loads .env, validates required vars, exports a clean config object.
//
// WHY this exists: Every other module imports config from here instead of
// touching process.env directly. That gives us one place to validate at
// startup and one place to add defaults, so a missing key fails loudly
// on boot — not 20 minutes later inside a Discord API call.

require('dotenv').config();

const REQUIRED_KEYS = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'MONGODB_URI',
  'VERIFY_CHANNEL_ID',
];

// Collect all missing keys so the developer sees every problem at once,
// rather than fixing them one-by-one in a restart loop.
const missing = REQUIRED_KEYS.filter(
  (key) => !process.env[key] || process.env[key].trim() === ''
);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}\n` +
    'Copy .env.example to .env and fill in the values.'
  );
}

module.exports = {
  discordToken:    process.env.DISCORD_TOKEN,
  clientId:        process.env.CLIENT_ID,
  guildId:         process.env.GUILD_ID,
  mongoUri:        process.env.MONGODB_URI,
  verifyChannelId: process.env.VERIFY_CHANNEL_ID,
  port:            parseInt(process.env.PORT, 10) || 3000,
  nodeEnv:         process.env.NODE_ENV || 'development',
};
