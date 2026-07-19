// src/api/app.js — Configures the Express application.
//
// WHY app.listen is NOT called here: This module configuration only registers
// middleware and routes, exporting the constructed server instance. Separating
// instantiation from binding to a port allows supertest / integrations tests
// to run the app in memory without binding to network interfaces.

const express = require('express');
const app = express();

app.use(express.json());

// Mount routes
app.use('/health', require('./routes/health.routes'));

// Ping endpoint to prevent Render spin-down under the free tier
app.get('/ping', (req, res) => res.send('I am awake!'));

module.exports = app;
