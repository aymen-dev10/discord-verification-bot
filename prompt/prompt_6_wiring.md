# PROMPT #6 — Wiring It All Together (index.js + Express app)

This is the final piece for Phase 1. After this, the bot should actually
start, connect to MongoDB, log into Discord, and post the Verify button.

## 1. `src/api/routes/health.routes.js`

- An Express `Router()`
- One route: `GET /` → responds with JSON `{ status: 'ok', uptime: process.uptime() }`
- `module.exports = router;`

## 2. `src/api/app.js`

- Create an Express app: `const app = express();`
- `app.use(express.json());`
- Mount the health router: `app.use('/health', require('./routes/health.routes'));`
- `module.exports = app;` — **do not call `app.listen()` here.** This file
  only builds and exports the app; `index.js` decides when and how it starts
  listening. Keeping "build the app" separate from "start the server" is
  what makes this app testable later without opening a real port.

## 3. `src/index.js`

Wire things up in this order, and explain why the order matters if asked:

```js
require('./config/env'); // validates env vars immediately — fail fast
const config = require('./config/env');
const connectDB = require('./config/db');
const client = require('./bot/client');
const app = require('./api/app');

async function main() {
  try {
    await connectDB();               // 1. DB first — nothing else works without it
    app.listen(config.port, () => {
      console.log(`Express listening on port ${config.port}`);
    });
    await client.login(config.discordToken);  // 2. then log the bot in
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

main();
```

Also add two process-level safety nets above `main()` — these catch bugs
that would otherwise crash the process silently or leave it in a broken
half-alive state:

```js
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  client.destroy();
  await require('mongoose').connection.close();
  process.exit(0);
});
```

The `SIGTERM` handler matters specifically for Render: every redeploy sends
`SIGTERM` to the old instance before killing it. Without handling it, the
Discord connection and DB connection get dropped abruptly instead of closed
cleanly — usually harmless, but it's the kind of thing that causes confusing
one-off errors in logs that are hard to trace back to "oh, that was just a
deploy."

---

**After this, run `npm run dev` locally.** Expected result: console logs
showing MongoDB connected, Express listening, and `Logged in as
YourBotName#1234`, and a Verify button should appear in `#verify-here`.

**You won't be able to fully test verification yet** — there's no code in
the database. Once this runs cleanly, tell me and I'll walk you through
manually inserting a test code into Atlas and doing a real end-to-end test.
