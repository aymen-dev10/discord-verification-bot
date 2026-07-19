// src/index.js — Main application entry point: boots DB, Express, and Discord client.
//
// WHY startup order matters:
// 1. Validate environment configuration immediately on file load.
// 2. Connect to the Database before starting the server. If the DB is offline,
//    the app cannot query codes, so we fail fast.
// 3. Start Express listening on the designated port so routing is available.
// 4. Log the Discord client in. This establishes the gateway websocket connection
//    only after Express and database systems are verified healthy.

// Validate env variables immediately at boot time.
require('./config/env');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const client = require('./bot/client');
const app = require('./api/app');
const mongoose = require('mongoose');

// --- Process Safety Nets ---

// Catches unhandled asynchronous rejections to prevent silent failures
// in async/await chains.
process.on('unhandledRejection', (err) => {
  console.error('[process] Unhandled promise rejection:', err);
});

// Handles graceful shutdown signals (e.g., from Render, Docker, or PM2)
// to close connections cleanly rather than dropping them abruptly.
process.on('SIGTERM', async () => {
  console.log('[process] SIGTERM received. Initiating graceful shutdown...');
  
  try {
    client.destroy();
    console.log('[process] Discord client connection destroyed.');
    
    await mongoose.connection.close();
    console.log('[process] MongoDB connection closed.');
    
    process.exit(0);
  } catch (err) {
    console.error('[process] Error during graceful shutdown:', err.message);
    process.exit(1);
  }
});

// --- Bootstrapping function ---

async function main() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Start health check HTTP server
    app.listen(config.port, () => {
      console.log(`[api] Express listening on port ${config.port}`);
    });

    // 3. Connect to Discord Gateway
    await client.login(config.discordToken);
  } catch (err) {
    console.error('[process] Critical startup error:', err);
    process.exit(1);
  }
}

main();
