// src/api/routes/health.routes.js — Express router for uptime monitoring.
//
// WHY GET /health: Cloud platforms like Render require a health check URL to determine
// if the service is running correctly. Re-routing GET / to respond with JSON containing
// uptime details satisfies this requirement cleanly.

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

module.exports = router;
