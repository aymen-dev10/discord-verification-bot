# PROMPT #4 — Service Layer

Implement ONLY the three service files below. Do not touch the Discord bot
client, event handlers, or `index.js` yet — these functions won't be callable
by anything until Prompt #5, and that's fine.

Design rule for this whole layer: **no function here should read `process.env`,
import Express, or assume it's being called from a Discord interaction.**
Every dependency it needs (the Discord client, a guild ID, a user ID) is
passed in as a parameter. This is what lets the exact same functions get
called from a future Express route without modification — the function
doesn't know or care who's calling it.

## 1. `src/services/logService.js`

```
async function logAttempt({ discordId, codeAttempted, success, reason }) { ... }
```

- `require('../models/VerificationLog')`
- Creates and saves a `VerificationLog` document with those four fields
- Returns the saved document
- No try/catch needed here — let errors bubble up to the caller

## 2. `src/services/roleService.js`

```
async function assignRole(client, guildId, discordId, roleId) { ... }
```

- Takes the discord.js `client` instance, the guild ID, the target user's
  Discord ID, and the role ID to assign — all as parameters, not imported
  from anywhere
- Fetch the guild: `await client.guilds.fetch(guildId)`
- Fetch the member: `await guild.members.fetch(discordId)`
- Assign the role: `await member.roles.add(roleId)`
- Wrap all of this in a try/catch. On failure, throw a plain `Error` with a
  clear message (e.g. `"Failed to assign role: " + err.message"`) — don't
  swallow it. The caller (`verificationService`) decides what that means.

## 3. `src/services/verificationService.js`

```
async function verifyCode(client, guildId, discordId, rawCode) { ... }
```

This is the core business rule. Requires `VerificationCode`, `Member`,
`roleService`, and `logService`.

Steps, in order:

1. Normalize input: `const code = rawCode.trim().toUpperCase();`
   (The model uppercases on *save*, not automatically on *query* — so the
   lookup value must be normalized here too, or a correctly-entered
   lowercase code will fail to match.)
2. `const codeDoc = await VerificationCode.findOne({ code });`
3. If no `codeDoc` → log with `reason: 'invalid_code'`, return
   `{ success: false, reason: 'invalid_code' }`
4. If `!codeDoc.enabled` → log `reason: 'disabled'`, return accordingly
5. If `codeDoc.expiresAt` is set and is in the past → log `reason: 'expired'`
6. If `codeDoc.mode === 'one-time'` and `codeDoc.usageCount >= 1` → log
   `reason: 'already_used'`
7. Otherwise, attempt role assignment:
   - `try { await assignRole(client, guildId, discordId, codeDoc.roleId); }`
   - On failure: log `reason: 'role_assign_failed'`, return that — **do not**
     increment usage count or mark the member verified if the role assignment
     failed, since nothing actually succeeded
8. On successful assignment:
   - `codeDoc.usageCount += 1;`
   - if `mode === 'one-time'`, also set `codeDoc.enabled = false;`
   - `await codeDoc.save();`
   - Upsert the `Member` doc: `discordId`, `verified: true`, `verifiedAt: new Date()`,
     `verifiedWithCode: code` — use `Member.findOneAndUpdate({ discordId }, {...}, { upsert: true })`
   - Log with `reason: 'ok'`
   - Return `{ success: true, roleName: codeDoc.roleName }`

Every branch above must call `logAttempt` before returning — a verification
attempt that isn't logged is a bug, not an edge case. Don't rely on the
caller to remember to log it.

---

**Stop here. Do not write the Discord client, interaction handlers, or
`index.js` yet. Confirm all three service files are created, then wait for
Prompt #5.**
