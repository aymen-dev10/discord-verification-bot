// src/scripts/seed.js — Utility script to seed default verification codes.
//
// WHY upsert is used: Using findOneAndUpdate with upsert: true makes this script
// idempotent. It can be run multiple times safely without causing duplicate key
// errors or creating duplicate documents for the same code.

const { connectDB } = require('../config/db');
const VerificationCode = require('../models/VerificationCode');

const seedData = [
  {
    code: "DEV-4821",
    roleId: "1528136659785482280",
    roleName: "Developer",
    mode: "reusable",
    expiresAt: null,
    enabled: true,
    usageCount: 0
  },
  {
    code: "DESIGN-3390",
    roleId: "1528136730774081576",
    roleName: "Designer",
    mode: "reusable",
    expiresAt: null,
    enabled: true,
    usageCount: 0
  },
  {
    code: "EDITOR-8888",
    roleId: "1528136783525707986",
    roleName: "Editor",
    mode: "reusable",
    expiresAt: null,
    enabled: true,
    usageCount: 0
  },
  {
    code: "RESEARCH-1923",
    roleId: "1528136940702924850",
    roleName: "Researcher",
    mode: "reusable",
    expiresAt: null,
    enabled: true,
    usageCount: 0
  },
  {
    code: "TEAM-1234",
    roleId: "1528137019895840898",
    roleName: "Team",
    mode: "reusable",
    expiresAt: null,
    enabled: true,
    usageCount: 0
  }
];

async function seed() {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log('[seed] Seeding verification codes...');

    // 2. Perform idempotent upserts
    for (const doc of seedData) {
      const result = await VerificationCode.findOneAndUpdate(
        { code: doc.code.toUpperCase().trim() },
        doc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[seed] Seeded code: ${result.code} (${result.roleName})`);
    }

    console.log('[seed] Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
