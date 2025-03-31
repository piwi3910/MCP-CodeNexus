#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Print debugging information
console.log('=== DEBUG INFORMATION ===');
console.log(`Node.js version: ${process.version}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script path: ${__filename}`);
console.log(`Script directory: ${__dirname}`);
console.log(`Process arguments: ${process.argv.join(' ')}`);
console.log(`Environment variables: NODE_ENV=${process.env.NODE_ENV}`);

// Load .env file
const envPath = path.join(__dirname, '.env');
console.log(`Looking for .env file at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log(`.env file exists at ${envPath}`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('=== .env file content ===');
  console.log(envContent);
  console.log('=== End of .env file content ===');
  
  const envConfig = dotenv.parse(envContent);
  console.log('=== Parsed .env variables ===');
  console.log(envConfig);
  console.log('=== End of parsed .env variables ===');
} else {
  console.log(`.env file does not exist at ${envPath}`);
}

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
console.log(`Data directory path: ${dataDir}`);
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory: ${dataDir}`);
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Successfully created data directory: ${dataDir}`);
  } catch (error) {
    console.error(`Error creating data directory: ${error}`);
    console.error(`Error stack: ${error.stack}`);
  }
} else {
  console.log(`Data directory already exists: ${dataDir}`);
}

// Set database path
const dbPath = path.join(dataDir, 'codenexus.sqlite');
console.log(`Database path: ${dbPath}`);

// Check if database file exists
if (fs.existsSync(dbPath)) {
  console.log(`Database file exists: ${dbPath}`);
} else {
  console.log(`Database file does not exist yet: ${dbPath}`);
}

// Check directory permissions
try {
  const stats = fs.statSync(__dirname);
  console.log(`Directory permissions: ${stats.mode.toString(8)}`);
} catch (error) {
  console.error(`Error checking directory permissions: ${error}`);
}

// Start the actual server
const serverPath = path.join(__dirname, 'dist', 'index.js');
console.log(`Starting MCP-CodeNexus server from: ${serverPath}`);

// Set environment variables for the server
const serverEnv = {
  ...process.env,
  DB_TYPE: 'sqlite',
  DB_DATABASE: dbPath,
  DEBUG: 'true'
};

console.log('=== Server environment variables ===');
console.log(`DB_TYPE: ${serverEnv.DB_TYPE}`);
console.log(`DB_DATABASE: ${serverEnv.DB_DATABASE}`);
console.log('=== End of server environment variables ===');

console.log(`Spawning server process: node ${serverPath}`);
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: serverEnv
});

server.on('error', (error) => {
  console.error(`Failed to start server: ${error}`);
  console.error(`Error stack: ${error.stack}`);
  process.exit(1);
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

console.log('Wrapper script initialization complete');