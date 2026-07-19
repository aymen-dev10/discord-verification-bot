# PROMPT #2 — config/env.js and config/db.js

Implement ONLY these two files. Do not touch the Discord client, models, or
anything else yet.

## 1. `src/config/env.js`

Purpose: load `.env` via dotenv, validate that every required variable is
present, and export a single clean config object. Nothing else in the codebase
should call `process.env` directly — everything imports from here.

Requirements:
- Call `require('dotenv').config()` at the top
- Define the required keys: `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `MONGODB_URI`
- Loop over them and if any are missing/empty, `throw new Error(...)` listing
  exactly which key(s) are missing — don't let the app start silently with
  `undefined` values that only fail later inside a Discord API call
- `PORT` defaults to `3000` if not set, `NODE_ENV` defaults to `'development'`
- Export a plain object, e.g.:
  ```js
  module.exports = {
    discordToken: ...,
    clientId: ...,
    guildId: ...,
    mongoUri: ...,
    port: ...,
    nodeEnv: ...,
  };
  ```

## 2. `src/config/db.js`

Purpose: a single `connectDB()` async function that connects Mongoose to
Atlas, called once from `index.js`.

Requirements:
- `require('mongoose')` and `require('./env')`
- Export `async function connectDB()` that calls `mongoose.connect(config.mongoUri)`
- On success, log a short confirmation (e.g. `"MongoDB connected"`) — no need
  for a whole logger yet, plain `console.log` is fine at this stage
- On failure, log the error clearly and `throw` it (don't swallow it) — the
  caller in `index.js` will decide what to do (we'll wire that in Prompt #3)
- Attach `mongoose.connection.on('disconnected', ...)` and `.on('error', ...)`
  listeners that log what happened — this matters for a long-running bot
  process where the DB connection can drop hours after startup

---

**Stop here. Do not write `src/index.js`, the Discord client, or any models
yet. Confirm both files are created, then wait for Prompt #3.**
