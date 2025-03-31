#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Create data directory if it doesn't exist
DATA_DIR="$SCRIPT_DIR/data"
if [ ! -d "$DATA_DIR" ]; then
  echo "Creating data directory: $DATA_DIR"
  mkdir -p "$DATA_DIR"
fi

# Set environment variables
export DB_TYPE=sqlite
export DB_DATABASE="$DATA_DIR/codenexus.sqlite"

# Start the server
echo "Starting MCP-CodeNexus server from: $SCRIPT_DIR/dist/index.js"
node "$SCRIPT_DIR/dist/index.js"