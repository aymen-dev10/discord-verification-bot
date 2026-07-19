# PROMPT #1 — Project Init (paste after the master prompt is confirmed)

Do ONLY the following. Do not write any business logic, models, or handlers yet —
this step is scaffolding only.

## 1. `package.json`

Initialize a Node.js project (CommonJS, not ESM) with:

- `"main": "src/index.js"`
- Node engine: `"node": ">=18.0.0"`
- Scripts:
  - `"start": "node src/index.js"`
  - `"dev": "nodemon src/index.js"`
- Dependencies: `discord.js` (v14), `express`, `mongoose`, `dotenv`
- devDependencies: `nodemon`

## 2. Folder scaffold

Create the following folders and files (empty, or with a single-line comment
stating the file's purpose — no implementation yet):

```
src/
├── config/
│   ├── env.js
│   └── db.js
├── bot/
│   ├── client.js
│   ├── events/
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   └── interactions/
│       ├── verifyButton.js
│       └── verifyModal.js
├── api/
│   ├── app.js
│   └── routes/
│       └── health.routes.js
├── models/
│   ├── VerificationCode.js
│   ├── Member.js
│   └── VerificationLog.js
├── services/
│   ├── verificationService.js
│   ├── roleService.js
│   └── logService.js
├── utils/
│   └── errors.js
└── index.js
```

## 3. `.env.example`

```
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
MONGODB_URI=
PORT=3000
NODE_ENV=development
```

Also create a real `.env` (gitignored) with the same keys, left blank for me to fill in.

## 4. `.gitignore`

Standard Node.js gitignore — must include `node_modules/`, `.env`, and common
OS/editor junk files.

## 5. `README.md`

Just a short skeleton for now: project title, one-line description, and a
"Setup" section with placeholder steps (`npm install`, copy `.env.example` to
`.env`, `npm run dev`). Don't write full documentation yet.

---

**Stop here. Do not implement `config/env.js`, the Discord client, models, or any
logic. Confirm the scaffold is created, then wait for Prompt #2.**
