# MCP-CodeNexus

MCP-CodeNexus is a Model Context Protocol (MCP) server that acts as a knowledge base for tracking code components across projects. It provides extended memory for AI coders by keeping track of API endpoints, functions, their schemas, purposes, and usage.

## Features

- Track API endpoints and their schemas
- Track functions, their purpose, and where they're used
- Support for both backend and frontend applications
- Store data in a PostgreSQL database for persistence and scalability
- TypeORM integration for object-relational mapping
- Query stored information to assist with development tasks

## Installation

```bash
# Clone the repository
git clone https://github.com/piwi3910/MCP-CodeNexus.git
cd MCP-CodeNexus

# Install dependencies
npm install

# Build the project
npm run build

# Set up PostgreSQL
# Make sure PostgreSQL is installed and running
# Create a database named 'codenexus'
createdb codenexus

# Run database migrations to set up the schema
# This will create all necessary tables in the database
# Warning: This will drop existing tables if they exist
npm run migrate
```

## Configuration

Create a `.env` file in the root directory with the following content:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=codenexus
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

Adjust the values according to your PostgreSQL setup.

## Usage

```bash
# Start the MCP server in development mode
npm run dev
```

## Project Structure

```
MCP-CodeNexus/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # MCP server implementation
│   ├── models/                  # Data models
│   │   ├── api-endpoint.ts      # API endpoint model
│   │   ├── function.ts          # Function model
│   │   └── project.ts           # Project model
│   ├── storage/                 # Storage handlers
│   │   ├── storage-manager.ts   # Manages storage operations
│   │   ├── file-storage.ts      # File-based storage implementation
│   │   └── typeorm-storage.ts   # PostgreSQL storage implementation
│   ├── db/                      # Database related files
│   │   └── data-source.ts       # TypeORM data source configuration
│   ├── entities/                # TypeORM entities
│   ├── tools/                   # MCP tools
│   │   ├── track-api.ts         # Tool for tracking API endpoints
│   │   ├── track-function.ts    # Tool for tracking functions
│   │   └── query.ts             # Tool for querying stored data
│   └── utils/                   # Utility functions
│       └── helpers.ts           # Helper functions
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables
├── package.json                 # Project dependencies
└── README.md                    # Project documentation
```

## License

ISC