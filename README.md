# Aymen Sentinel — Discord Verification Bot

A self-service verification and role-assignment system for Discord servers.
New members enter an invitation code and receive the correct role
automatically — no manual role management, full audit trail of every
attempt.

Built as a layered backend service designed to grow into a full web
platform (admin dashboard + public verification website) without requiring
a rewrite of the core logic.

## Features

- One-click verification via a persistent button and modal — no slash
  commands required from members
- Configurable codes: reusable or one-time use, optional expiration date,
  can be disabled at any time
- Every verification attempt is logged — successes and failures alike —
  including which code was tried and why it failed
- Idempotent startup: the bot detects if the Verify message already exists
  and won't repost duplicates on every restart/redeploy
- Fail-fast configuration: the app refuses to start with a clear error if
  required environment variables are missing, rather than failing
  mysteriously later

## Tech Stack

| Layer    | Technology                             |
| -------- | -------------------------------------- |
| Runtime  | Node.js 18+                            |
| Bot      | discord.js v14                         |
| API      | Express (scaffolded for future phases) |
| Database | MongoDB Atlas + Mongoose               |
| Hosting  | Render                                 |

## Architecture

A single Node.js process runs both the Discord bot (gateway connection) and
an Express app together, deployed as one Render Web Service.

Business logic lives entirely in a **service layer** with no knowledge of
Discord.js or Express — the bot's interaction handlers call these functions
directly today; future Express routes for the dashboard and public website
will call the _same_ functions rather than duplicating logic.

```
src/
├── config/         # env validation, MongoDB connection
├── bot/
│   ├── client.js         # discord.js client + event wiring
│   ├── events/            # ready, interactionCreate
│   └── interactions/      # verify button, verify modal
├── api/            # Express app (scaffold for future dashboard/website)
├── models/         # VerificationCode, Member, VerificationLog
├── services/       # verificationService, roleService, logService
└── index.js        # boots everything together
```

## How Verification Works

1. New members join with only the `@everyone` role, seeing just
   `#welcome`, `#rules`, and `#verify-here`
2. `#verify-here` has a persistent **Verify** button
3. Clicking it opens a modal asking for an invitation code
4. The backend checks the code exists, is enabled, isn't expired, and
   (for one-time codes) hasn't already been used
5. **Valid** → the linked Discord role is assigned, the code's usage is
   updated, and the attempt is logged as successful
6. **Invalid** → an ephemeral error is shown, and the failed attempt is
   still logged — this matters most for sensitive codes, since it gives
   visibility into who tried and failed, not just who succeeded

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB Atlas cluster
- A Discord application + bot token, invited to your server with
  `Manage Roles` permission, and the bot's role positioned **above** every
  role it needs to assign

### Setup

```bash
npm install
cp .env.example .env
# fill in the values below
npm run dev
```

### Environment Variables

| Variable            | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `DISCORD_TOKEN`     | Bot token from the Discord Developer Portal                                                         |
| `CLIENT_ID`         | Application ID from the Developer Portal                                                            |
| `GUILD_ID`          | The Discord server (guild) ID this bot serves                                                       |
| `VERIFY_CHANNEL_ID` | Channel ID for `#verify-here`                                                                       |
| `MONGODB_URI`       | MongoDB Atlas connection string                                                                     |
| `PORT`              | Port for the Express app (defaults to `3000` locally; Render sets this automatically in production) |
| `NODE_ENV`          | `development` or `production`                                                                       |

## Managing Verification Codes

In this phase, codes are created and managed directly in MongoDB Atlas —
there is no admin command or dashboard yet. A code document looks like:

```json
{
  "code": "TEAM-1234",
  "roleId": "1528137019895840898",
  "roleName": "Team",
  "mode": "reusable",
  "expiresAt": null,
  "enabled": true,
  "usageCount": 0
}
```

- `mode`: `"one-time"` or `"reusable"`
- `expiresAt`: a date, or `null` for no expiration
- `enabled`: set to `false` to disable a code without deleting it

## Deployment

Deployed on Render as a single Node.js Web Service:

- **Build command**: `npm install`
- **Start command**: `npm start`
- Environment variables are configured in the Render dashboard, not
  committed to the repository
- Auto-deploys on every push to `main`

## Roadmap

- **Phase 2** — React dashboard for generating/managing codes, viewing
  members, verification history, and stats, calling the existing service
  layer through new Express routes
- **Phase 3** — Public verification website with "Login with Discord"
  (OAuth2), for verifying outside of Discord itself

## Security Notes

- `.env` is gitignored and must never be committed — it contains the bot
  token and database credentials
- MongoDB Atlas network access is currently open (`0.0.0.0/0`) since
  Render doesn't provide a fixed IP; security relies on the database
  credential's strength, not IP restriction
- High-privilege codes (e.g. admin-role codes) should generally be set to
  `one-time` use and monitored via `verificationlogs`
