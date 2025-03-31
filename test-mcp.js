#!/usr/bin/env node

/**
 * Test script for the MCP-CodeNexus server
 * This script demonstrates how to use the MCP server in your own projects
 */

const { spawn } = require('child_process');
const path = require('path');

// Ensure the database is initialized before running tests
console.log('Ensuring database is initialized...');
const dbInit = spawn('npm', ['run', 'migrate'], {
  stdio: 'inherit'
});

dbInit.on('close', (code) => {
  if (code !== 0) {
    console.error(`Database initialization failed with code ${code}`);
    process.exit(1);
  }
  
  console.log('Database initialized successfully, starting MCP server...');
  
  // Start the MCP server
  const server = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
    stdio: ['pipe', 'pipe', process.stderr]
  });

  // Handle server output
  let buffer = '';
  server.stdout.on('data', (data) => {
    buffer += data.toString();
    
    // Process complete JSON messages
    let endIndex;
    while ((endIndex = buffer.indexOf('\n')) !== -1) {
      const message = buffer.substring(0, endIndex);
      buffer = buffer.substring(endIndex + 1);
      
      try {
        const response = JSON.parse(message);
        handleResponse(response);
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    }
  });

  // Handle server exit
  server.on('close', (code) => {
    console.log(`MCP server exited with code ${code}`);
  });

  // Send a message to the server
  function sendMessage(message) {
    console.log('\nSending message:', JSON.stringify(message, null, 2));
    server.stdin.write(JSON.stringify(message) + '\n');
  }

  // Handle server response
  function handleResponse(response) {
    console.log('\nReceived response:', JSON.stringify(response, null, 2));
    
    // Process response based on type
    switch (response.type) {
      case 'ready':
        // Server is ready, start the test
        startTest();
        break;
      case 'execute_tool_result':
        // Tool execution result
        handleToolResult(response);
        break;
      case 'access_resource_result':
        // Resource access result
        handleResourceResult(response);
        break;
      case 'error':
        // Error
        console.error('Error:', response.error);
        break;
    }
  }

  // Start the test
  function startTest() {
    console.log('\n=== Starting MCP-CodeNexus Test ===\n');
    
    // Step 1: Create a project
    createProject();
  }

  // Create a project
  function createProject() {
    console.log('\n=== Step 1: Create a Project ===\n');
    
    sendMessage({
      type: 'execute_tool',
      id: 'create_project',
      tool_name: 'create_project',
      arguments: {
        name: 'Test Project',
        path: process.cwd(),
        description: 'A test project for MCP-CodeNexus'
      }
    });
  }

  // Handle tool result
  let projectId = null;

  function handleToolResult(response) {
    if (!response.success) {
      console.error('Tool execution failed:', response.result.error);
      return;
    }
    
    switch (response.id) {
      case 'create_project':
        // Project created, store project ID
        projectId = response.result.projectId;
        console.log(`Project created with ID: ${projectId}`);
        
        // Step 2: Scan the project
        scanProject();
        break;
      case 'scan_project':
        // Project scanned
        console.log(`Project scanned: ${response.result.scannedFiles} files, ${response.result.apiEndpoints} API endpoints, ${response.result.functions} functions`);
        
        // Step 3: Query the project
        queryProject();
        break;
      case 'query':
        // Query result
        console.log(`Query result: ${response.result.results ? response.result.results.length : 0} items`);
        
        // Step 4: Access project resource
        accessProjectResource();
        break;
    }
  }

  // Scan the project
  function scanProject() {
    console.log('\n=== Step 2: Scan the Project ===\n');
    
    if (!projectId) {
      console.error('Project ID not available');
      return;
    }
    
    sendMessage({
      type: 'execute_tool',
      id: 'scan_project',
      tool_name: 'scan_project',
      arguments: {
        projectId: projectId,
        filePatterns: ['*.ts', '*.js']
      }
    });
  }

  // Query the project
  function queryProject() {
    console.log('\n=== Step 3: Query the Project ===\n');
    
    if (!projectId) {
      console.error('Project ID not available');
      return;
    }
    
    sendMessage({
      type: 'execute_tool',
      id: 'query',
      tool_name: 'query',
      arguments: {
        type: 'all',
        projectId: projectId
      }
    });
  }

  // Access project resource
  function accessProjectResource() {
    console.log('\n=== Step 4: Access Project Resource ===\n');
    
    if (!projectId) {
      console.error('Project ID not available');
      return;
    }
    
    sendMessage({
      type: 'access_resource',
      id: 'project_resource',
      uri: `codenexus://projects/${projectId}`
    });
  }

  // Handle resource result
  function handleResourceResult(response) {
    if (!response.success) {
      console.error('Resource access failed:', response.result.error);
      return;
    }
    
    switch (response.id) {
      case 'project_resource':
        // Project resource
        console.log(`Project resource: ${response.result.data.name}`);
        
        // Test complete, shutdown the server
        shutdownServer();
        break;
    }
  }

  // Shutdown the server
  function shutdownServer() {
    console.log('\n=== Test Complete, Shutting Down Server ===\n');
    
    sendMessage({
      type: 'shutdown',
      id: 'shutdown'
    });
  }

  // Handle process exit
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down...');
    shutdownServer();
  });
});