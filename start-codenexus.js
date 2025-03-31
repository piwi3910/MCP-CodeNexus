#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ensure the data directory exists in the current working directory
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Start the actual server
const serverPath = path.join(__dirname, 'dist', 'index.js');
console.log(`Starting MCP-CodeNexus server from: ${serverPath}`);

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DB_TYPE: 'sqlite',
    DB_DATABASE: path.join(dataDir, 'codenexus.sqlite')
  }
});

server.on('close', (code) => {
  console.log(`MCP-CodeNexus server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  server.kill('SIGTERM');
});