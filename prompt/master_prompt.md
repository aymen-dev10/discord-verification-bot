# MASTER PROMPT — Discord Verification Bot (paste this into Antigravity first)

You are a senior Node.js backend engineer helping me build a production-quality
Discord verification and role-assignment system. This message is CONTEXT ONLY.

**Do not generate any code yet.** Just confirm you understand the project below.
I will give you specific, scoped prompts for one file/module at a time after this.
Do not skip ahead or scaffold extra files I haven't asked for yet.

---

## Project purpose

This is a learning-focused but production-styled backend project. Priorities, in order:
1. Clean, layered architecture that a real backend engineer would write
2. Code that's easy to extend later without rewrites
3. Working functionality

When you write code, briefly note *why* it's structured that way, not just what it does.

## What this system does (Phase 1 — Discord bot only, no dashboard/website yet)

- Runs on ONE Discord server (no multi-guild support — do not add a guildId field anywhere)
- New members get only the @everyone role and can see #welcome, #rules, #verify-here
- #verify-here has a persistent "Verify" button
- Clicking it opens a Discord modal asking the user to enter a verification code
- The bot looks up the code in MongoDB, validates it, and if valid:
  - Assigns the linked Discord role to the user
  - Increments the code's usage count / marks it used if one-time
  - Writes a log entry
- If invalid (not found / disabled / expired / already used), reply with an ephemeral
  error and still write a log entry (failed attempts matter, especially for
  high-privilege codes)
- Verification codes are created MANUALLY in MongoDB Atlas for now — the bot does
  NOT have any code-creation/deletion commands in Phase 1. Do not build any of that.

## Process / deployment topology

ONE Node.js process containing BOTH:
- A discord.js v14 client (gateway connection)
- An Express app (minimal for now — just a `/health` route; it exists as scaffolding
  for a future React dashboard and public verification website, which are NOT part
  of Phase 1)

Both are started from a single `src/index.js`. Deployed as a single Render Web Service.

## The core architectural rule

Business logic lives in a **service layer**, as plain async functions with no
knowledge of Discord.js or Express. The Discord bot's interaction handlers call
these functions directly. Later, Express routes will call the SAME functions.
Never put business logic inside a Discord.js event handler or an Express controller —
those are just thin callers.

## Tech stack

- Node.js, CommonJS modules (`require`/`module.exports`) — not ESM
- discord.js v14
- express
- mongoose (MongoDB Atlas)
- dotenv for config
- Deployed on Render

## Folder structure (target — build toward this, one piece at a time)

```
discord-verification-bot/
├── src/
│   ├── config/
│   │   ├── env.js              # loads & validates process.env
│   │   └── db.js                # mongoose connection
│   ├── bot/
│   │   ├── client.js            # discord.js client setup + intents
│   │   ├── events/
│   │   │   ├── ready.js
│   │   │   └── interactionCreate.js
│   │   └── interactions/
│   │       ├── verifyButton.js  # shows the modal
│   │       └── verifyModal.js   # handles modal submit
│   ├── api/
│   │   ├── app.js               # express app, minimal routes
│   │   └── routes/
│   │       └── health.routes.js
│   ├── models/
│   │   ├── VerificationCode.js
│   │   ├── Member.js
│   │   └── VerificationLog.js
│   ├── services/
│   │   ├── verificationService.js  # verifyCode(), the core logic
│   │   ├── roleService.js          # assignRole() via Discord API
│   │   └── logService.js           # logAttempt()
│   ├── utils/
│   │   └── errors.js
│   └── index.js                 # boots bot + express together
├── .env.example
├── package.json
└── README.md
```

## Data models

**VerificationCode**
- `code` (String, unique, uppercase, trimmed)
- `roleId` (String — Discord role ID)
- `roleName` (String — human-readable label, e.g. "Developer")
- `mode` (String enum: `one-time` | `reusable`)
- `expiresAt` (Date, nullable)
- `enabled` (Boolean, default true)
- `usageCount` (Number, default 0)
- `createdAt` (Date, default now)

**Member**
- `discordId` (String, unique)
- `verified` (Boolean)
- `verifiedAt` (Date)
- `verifiedWithCode` (String, ref to the code used)

**VerificationLog**
- `discordId` (String)
- `codeAttempted` (String)
- `success` (Boolean)
- `reason` (String — e.g. `invalid_code`, `expired`, `disabled`, `already_used`, `ok`)
- `timestamp` (Date, default now)

## Environment variables

`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `MONGODB_URI`, `PORT`, `NODE_ENV`

## Error handling conventions

- Every Discord interaction handler wraps its logic in try/catch and always replies
  to the interaction (ephemeral) even on failure — never let an interaction hang
- Service-layer functions throw typed errors (or return `{ success, reason }` objects
  — we'll decide which pattern together in the relevant step) rather than letting
  raw Mongoose/Discord errors leak to the handler
- Role assignment failures (e.g. bot role below target role in hierarchy) must be
  caught and logged distinctly from "invalid code" failures

---

**Confirm you've understood this spec. Then wait — I'll give you Prompt #1
(project init: package.json, folder scaffold, .env.example) next.**
