// aggregator.js - run this in cron or background (same logic as server)
const { exec } = require('child_process');
const server = require('./server'); // if modularize; or simply run aggregateOnce() exported
// For simplicity, you can run: node server.js (it already schedules)
console.log("Use server.js which contains scheduled aggregation. If you want a separate worker, we can modularize.");
