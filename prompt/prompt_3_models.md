# PROMPT #3 — Mongoose Models

Implement ONLY the three model files below. No services, no bot code yet.

Each file: `require('mongoose')`, define a `Schema`, compile it into a model,
`module.exports` the model directly (e.g. `module.exports = mongoose.model('VerificationCode', schema);`).

Use `{ timestamps: true }` as a schema option wherever a created/updated
timestamp is needed, instead of manually defining `createdAt` fields —
Mongoose manages it for you and it's the standard convention.

## 1. `src/models/VerificationCode.js`

| Field | Type | Rules |
|---|---|---|
| `code` | String | required, unique, `trim: true`, `uppercase: true` (so lookups are case-insensitive by construction — no need for manual `.toUpperCase()` calls everywhere) |
| `roleId` | String | required |
| `roleName` | String | required |
| `mode` | String | required, `enum: ['one-time', 'reusable']`, default `'one-time'` |
| `expiresAt` | Date | default `null` |
| `enabled` | Boolean | default `true` |
| `usageCount` | Number | default `0` |

Schema options: `{ timestamps: true }`

## 2. `src/models/Member.js`

| Field | Type | Rules |
|---|---|---|
| `discordId` | String | required, unique |
| `verified` | Boolean | default `false` |
| `verifiedAt` | Date | default `null` |
| `verifiedWithCode` | String | default `null` |

Schema options: `{ timestamps: true }`

## 3. `src/models/VerificationLog.js`

| Field | Type | Rules |
|---|---|---|
| `discordId` | String | required |
| `codeAttempted` | String | required |
| `success` | Boolean | required |
| `reason` | String | required, `enum: ['ok', 'invalid_code', 'expired', 'disabled', 'already_used', 'role_assign_failed']` |

Schema options: `{ timestamps: true }` — use the auto `createdAt` as the
attempt timestamp, don't add a separate `timestamp` field.

Also add a compound index on `{ discordId: 1, createdAt: -1 }` for this
schema (`schema.index({ discordId: 1, createdAt: -1 })`) — this is what
will make "show me this user's verification history" fast once the
dashboard exists, instead of a full collection scan.

---

**Stop here. Do not write the services, the Discord bot client, or `index.js`
yet. Confirm all three models are created, then wait for Prompt #4.**
