# PROMPT #5 — Discord Client, Events, and Verify Interactions

Implement the files below. Do not write `src/index.js` or `src/api/app.js`
yet — the bot won't actually be running after this step, and that's expected.
We're building the pieces; wiring them together is Prompt #6.

## 0. Small addition to `src/config/env.js`

Add `VERIFY_CHANNEL_ID` to the list of required keys (the Discord channel ID
for `#verify-here`), and add `verifyChannelId` to the exported config object,
same pattern as the existing keys. Also add `VERIFY_CHANNEL_ID=` to
`.env.example`.

(I'll get this value the same way I got `GUILD_ID` — right-click the
`#verify-here` channel with Developer Mode on, Copy Channel ID — and add it
to my real `.env`.)

## 1. `src/bot/client.js`

- `require('discord.js')` — use `Client`, `GatewayIntentBits`
- Create the client with intents: `Guilds`, `GuildMembers`
- Require the two event handlers below and wire them up in this file:
  ```
  client.once('ready', () => handleReady(client));
  client.on('interactionCreate', handleInteractionCreate);
  ```
- `module.exports = client;`

This file is the single place that owns "what does the bot listen for" —
`index.js` will only ever call `client.login(token)`, nothing more.

## 2. `src/bot/events/ready.js`

Export `async function handleReady(client)`:
- Log `` `Logged in as ${client.user.tag}` ``
- Then ensure the Verify button message exists in `#verify-here`:
  - Fetch the channel: `client.channels.fetch(config.verifyChannelId)`
  - Fetch its recent messages (`channel.messages.fetch({ limit: 20 })`)
  - Check whether any of them was sent by this bot AND contains a button
    component with `customId === 'verify_button'`
  - **If one already exists, do nothing.** If not, send a new message: an
    embed briefly explaining "Click below and enter your invitation code to
    get access," with a button (`customId: 'verify_button'`, label `"Verify"`,
    style `Success`)

This idempotency check matters: without it, every bot restart (which will
happen on every Render redeploy) would post a duplicate Verify button.

## 3. `src/bot/events/interactionCreate.js`

Export `async function handleInteractionCreate(interaction)` — a router,
no logic of its own:
- If `interaction.isButton()` and `interaction.customId === 'verify_button'`
  → call the button handler (below)
- If `interaction.isModalSubmit()` and `interaction.customId === 'verify_modal'`
  → call the modal handler (below)
- Otherwise, do nothing

## 4. `src/bot/interactions/verifyButton.js`

Export `async function handleVerifyButton(interaction)`:
- Build a `ModalBuilder` (`customId: 'verify_modal'`, title e.g.
  `"Enter Verification Code"`)
- One `TextInputBuilder` (`customId: 'code_input'`, style `Short`, required,
  placeholder like `"e.g. TEAM-1234"`), wrapped in an `ActionRowBuilder`
- `await interaction.showModal(modal)`

## 5. `src/bot/interactions/verifyModal.js`

Export `async function handleVerifyModal(interaction)`:
- Wrap everything in try/catch — this interaction MUST always get a reply
- Read the code: `interaction.fields.getTextInputValue('code_input')`
- Call `verifyCode(interaction.client, interaction.guildId, interaction.user.id, rawCode)`
  from `verificationService`
- On `result.success === true`: ephemeral reply confirming the role name
  they were granted
- On failure: ephemeral reply with a user-friendly message mapped from
  `result.reason` (write a small local map/switch — `invalid_code` →
  "That code doesn't exist," `expired` → "That code has expired," etc.
  Don't expose internal reason strings directly to the user)
- In the catch block: log the error server-side, reply ephemeral with a
  generic "Something went wrong, please contact an admin" — never let the
  interaction time out unanswered

---

**Stop here. Do not write `index.js` or the Express app yet. Confirm all
files are created, then wait for Prompt #6 — wiring it all together so the
bot actually starts.**
