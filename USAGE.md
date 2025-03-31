# Using MCP-CodeNexus with AI Coders

This guide explains how to integrate MCP-CodeNexus with AI coding assistants to provide extended memory and context for your development projects.

## Overview

MCP-CodeNexus is a Model Context Protocol (MCP) server that acts as a knowledge base for tracking code components across projects. It provides AI coding assistants with:

1. Tracking of API endpoints and their schemas
2. Tracking of functions, their purpose, and where they're used
3. Storage of this information in either SQLite (default) or PostgreSQL database for persistence
4. Query capabilities to retrieve stored information

## Integration with AI Coding Assistants

### Prerequisites

- Node.js (v16 or later)
- SQLite (included, no installation required)
- PostgreSQL (v12 or later, optional for production use)
- An AI coding assistant that supports the Model Context Protocol (MCP)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/piwi3910/MCP-CodeNexus.git
   cd MCP-CodeNexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Build the project:
   ```bash
   npm run build
   ```
   
4. Set up the database:

   **SQLite (Default):**
   - No additional setup required
   - Run database migrations to set up the schema:
   ```bash
   npm run migrate
   ```
   
   **PostgreSQL (Optional):**
   - Make sure PostgreSQL is installed and running
   - Create a database for CodeNexus:
   ```bash
   createdb codenexus
   ```
   
5. Configure the database connection:
   - Create a `.env` file in the project root
   - Set the database connection parameters (see Configuration section in README.md)
   - Adjust the values according to your PostgreSQL setup
   - The database tables will be created automatically when the server starts

3. Build the project:
   ```bash
   npm run build
   ```

### Starting the MCP Server

You can start the MCP server using the following command:

```bash
npm run dev [project_path]
```

Where `project_path` is the path to your project's root directory. If not provided, the current working directory will be used.

### Connecting to an AI Coding Assistant

MCP-CodeNexus follows the Model Context Protocol, which means it can be connected to any AI coding assistant that supports MCP. The exact method of connection depends on the AI coding assistant you're using.

For example, with OpenAI's GPT models that support MCP, you would:

1. Start the MCP server
2. Tell the AI coding assistant to connect to the MCP server
3. The AI coding assistant can then use the tools and resources provided by MCP-CodeNexus

### Testing the MCP Server

You can test the MCP server using the included test script:

```bash
node test-mcp.js
```

This will connect to the MCP server, create a test project, and perform various operations to verify that the server is working correctly.

## Available Tools

MCP-CodeNexus provides a comprehensive set of tools for tracking and querying code components. Below is a detailed description of each tool:

### Project Management

- **create_project**: Create a new project to track
  - Parameters:
    - `name`: Project name
    - `path`: Project path (directory location)
    - `description`: Project description

- **get_project**: Get details about a project
  - Parameters:
    - `projectId`: Project ID

- **scan_project**: Scan a project for API endpoints and functions
  - Parameters:
    - `projectId`: Project ID
    - `filePatterns` (optional): Array of file patterns to scan (e.g., "*.ts", "*.js")

### API Endpoint Tracking

- **track_api**: Track an API endpoint
  - Parameters:
    - `projectId`: Project ID
    - `method`: HTTP method (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
    - `path`: Endpoint path
    - `description`: Endpoint description
    - `implementationPath`: File path where the endpoint is implemented
    - `requestSchema` (optional): Request schema details
      - `contentType`: Content type (e.g., 'application/json')
      - `definition`: Schema definition
      - `example` (optional): Example request
    - `responseSchema` (optional): Response schema details
      - `contentType`: Content type
      - `definition`: Schema definition
      - `example` (optional): Example response
    - `tags` (optional): Array of tags or categories
    - `relatedFunctions` (optional): Array of related function IDs

- **scan_file_for_apis**: Scan a file for API endpoints
  - Parameters:
    - `projectId`: Project ID
    - `filePath`: File path to scan

- **get_api_endpoint**: Get details about an API endpoint
  - Parameters:
    - `endpointId`: API endpoint ID

- **get_api_endpoints_for_project**: Get all API endpoints for a project
  - Parameters:
    - `projectId`: Project ID

- **get_related_functions**: Get related functions for an API endpoint
  - Parameters:
    - `endpointId`: API endpoint ID

### Function Tracking

- **track_function**: Track a function
  - Parameters:
    - `projectId`: Project ID
    - `name`: Function name
    - `description`: Function description
    - `parameters`: Array of function parameters
      - `name`: Parameter name
      - `type`: Parameter type
      - `description`: Parameter description
      - `isOptional`: Whether the parameter is optional
      - `defaultValue` (optional): Default value
    - `returnType`: Return type of the function
    - `returnDescription`: Description of the return value
    - `implementation`: Code snippet of the function implementation
    - `implementationPath`: File path where the function is implemented
    - `startLine`: Line number where the function starts
    - `endLine`: Line number where the function ends
    - `purpose`: Purpose or reason for implementation
    - `tags` (optional): Array of tags or categories
    - `relatedApiEndpoints` (optional): Array of related API endpoint IDs
    - `relatedFunctions` (optional): Array of related function IDs
    - `usageExamples` (optional): Array of usage examples

- **scan_file_for_functions**: Scan a file for functions
  - Parameters:
    - `projectId`: Project ID
    - `filePath`: File path to scan

- **get_function**: Get details about a function
  - Parameters:
    - `functionId`: Function ID

- **get_functions_for_project**: Get all functions for a project
  - Parameters:
    - `projectId`: Project ID

- **add_usage_example**: Add a usage example to a function
  - Parameters:
    - `functionId`: Function ID
    - `example`: Usage example

- **update_function_purpose**: Update the purpose of a function
  - Parameters:
    - `functionId`: Function ID
    - `purpose`: New purpose

- **get_related_api_endpoints**: Get related API endpoints for a function
  - Parameters:
    - `functionId`: Function ID

### Querying

- **query**: Query stored data based on various criteria
  - Parameters:
    - `type`: Type of entity to query ('project', 'api-endpoint', 'function', or 'all')
    - `projectId` (optional): Project ID to filter by
    - `query` (optional): Search query string
    - `tags` (optional): Array of tags to filter by
    - `pathPattern` (optional): Path pattern to filter by (for API endpoints)
    - `method` (optional): HTTP method to filter by (for API endpoints)
    - `namePattern` (optional): Function name pattern to filter by
    - `implementationPath` (optional): Implementation path to filter by

## Available Resources

MCP-CodeNexus also provides the following resources that can be accessed via URIs:

- **projects**: List of all projects
  - URI: `codenexus://projects`

- **project**: Details of a specific project
  - URI: `codenexus://projects/{projectId}`

- **api_endpoints**: List of API endpoints for a project
  - URI: `codenexus://projects/{projectId}/api-endpoints`

- **api_endpoint**: Details of a specific API endpoint
  - URI: `codenexus://api-endpoints/{endpointId}`

- **functions**: List of functions for a project
  - URI: `codenexus://projects/{projectId}/functions`

- **function**: Details of a specific function
  - URI: `codenexus://functions/{functionId}`
## Example Workflow

Here's an example of how an AI coding assistant might use MCP-CodeNexus:

1. **Project Creation**:
   The AI creates a new project in MCP-CodeNexus to start tracking code components.

2. **Code Analysis**:
   As the AI writes or modifies code, it scans files for API endpoints and functions, storing them in MCP-CodeNexus.

3. **Context Retrieval**:
   When the AI needs to understand existing code, it queries MCP-CodeNexus for information about API endpoints and functions.

4. **Documentation**:
   The AI can access the markdown documentation generated by MCP-CodeNexus to understand the purpose and usage of code components.

5. **Relationship Tracking**:
   The AI can track relationships between API endpoints and functions, helping it understand how different parts of the code interact.

## Example: Tracking a New API Endpoint

When the AI creates a new API endpoint, it can track it in MCP-CodeNexus:

```javascript
// AI creates a new API endpoint
app.get('/api/users', (req, res) => {
  // Implementation
});

// AI tracks the endpoint in MCP-CodeNexus
// Using the track_api tool
{
  "projectId": "project_123",
  "method": "GET",
  "path": "/api/users",
  "description": "Get all users",
  "implementationPath": "src/routes/users.js",
  "requestSchema": {
    "contentType": "application/json",
    "definition": "No request body required"
  },
  "responseSchema": {
    "contentType": "application/json",
    "definition": "Array of user objects",
    "example": "[{\"id\": 1, \"name\": \"John Doe\"}]"
  },
  "tags": ["users", "api"]
}
```

## Example: Querying for Functions

When the AI needs to understand existing functions, it can query MCP-CodeNexus:

```javascript
// AI queries for functions related to user authentication
// Using the query tool
{
  "type": "function",
  "query": "authentication",
  "tags": ["auth", "users"]
}

// MCP-CodeNexus returns matching functions
// The AI can then use this information to understand the authentication system
```

## Benefits for AI Coding Assistants

By using MCP-CodeNexus, AI coding assistants gain:

1. **Extended Memory**: The AI doesn't need to keep all code details in its context window
2. **Persistent Knowledge**: Information about code components persists between sessions
3. **Relationship Understanding**: The AI can understand how different parts of the code relate to each other
4. **Purpose Tracking**: The AI can track why certain functions were implemented
5. **Usage Examples**: The AI can store and retrieve examples of how functions are used

## Advanced Usage

### Custom Scanning

You can customize how MCP-CodeNexus scans your code by modifying the extraction patterns in `src/utils/helpers.ts`. This allows you to adapt the scanning to your specific coding style or framework.

### Integration with CI/CD

You can integrate MCP-CodeNexus with your CI/CD pipeline to automatically scan code changes and update the knowledge base.

### Switching from SQLite to PostgreSQL

For production environments with higher scalability requirements, you can switch from SQLite to PostgreSQL by updating the `.env` file as described in the README.md file.

### Multiple Projects

MCP-CodeNexus can track multiple projects simultaneously, allowing your AI coding assistant to work across different projects while maintaining context for each one.