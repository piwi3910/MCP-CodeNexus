import "reflect-metadata";
import { StorageManager } from './storage/storage-manager';
import { TypeORMStorage } from './storage/typeorm-storage';
import { TrackApiTool } from './tools/track-api';
import { TrackFunctionTool } from './tools/track-function';
import { QueryTool } from './tools/query';
import { Project, createProject } from './models/project';
import { findFiles } from './utils/helpers';

/**
 * MCP server implementation for CodeNexus
 */
export class CodeNexusServer {
  private storageManager: StorageManager;
  private trackApiTool: TrackApiTool;
  private trackFunctionTool: TrackFunctionTool;
  private queryTool: QueryTool;
  
  /**
   * Create a new CodeNexusServer instance
   * @param projectPath Path to the project root directory
   */
  constructor(private projectPath: string = process.cwd()) {
    this.storageManager = new TypeORMStorage();
    this.trackApiTool = new TrackApiTool(this.storageManager);
    this.trackFunctionTool = new TrackFunctionTool(this.storageManager);
    this.queryTool = new QueryTool(this.storageManager);
  }
  
  /**
   * Initialize the server
   */
  async initialize(): Promise<void> {
    // Initialize storage
    await this.storageManager.initialize();
    
    // Log initialization
    console.log('CodeNexus server initialized');
  }
  
  /**
   * Get the server name
   */
  getName(): string {
    return 'codenexus';
  }
  
  /**
   * Get the server description
   */
  getDescription(): string {
    return 'CodeNexus is a knowledge base for tracking code components across projects';
  }
  
  /**
   * Get the available tools
   */
  getTools(): any[] {
    return [
      {
        name: 'create_project',
        description: 'Create a new project',
        input_schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name'
            },
            path: {
              type: 'string',
              description: 'Project path'
            },
            description: {
              type: 'string',
              description: 'Project description'
            }
          },
          required: ['name', 'path', 'description']
        }
      },
      {
        name: 'track_api',
        description: 'Track an API endpoint',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            method: {
              type: 'string',
              description: 'HTTP method',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
            },
            path: {
              type: 'string',
              description: 'Endpoint path'
            },
            description: {
              type: 'string',
              description: 'Endpoint description'
            },
            implementationPath: {
              type: 'string',
              description: 'File path where the endpoint is implemented'
            },
            requestSchema: {
              type: 'object',
              properties: {
                contentType: {
                  type: 'string',
                  description: 'Content type'
                },
                definition: {
                  type: 'string',
                  description: 'Schema definition'
                },
                example: {
                  type: 'string',
                  description: 'Example'
                }
              },
              required: ['contentType', 'definition']
            },
            responseSchema: {
              type: 'object',
              properties: {
                contentType: {
                  type: 'string',
                  description: 'Content type'
                },
                definition: {
                  type: 'string',
                  description: 'Schema definition'
                },
                example: {
                  type: 'string',
                  description: 'Example'
                }
              },
              required: ['contentType', 'definition']
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags or categories'
            },
            relatedFunctions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Related function IDs'
            }
          },
          required: ['projectId', 'method', 'path', 'description', 'implementationPath']
        }
      },
      {
        name: 'scan_file_for_apis',
        description: 'Scan a file for API endpoints',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            filePath: {
              type: 'string',
              description: 'File path'
            }
          },
          required: ['projectId', 'filePath']
        }
      },
      {
        name: 'track_function',
        description: 'Track a function',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            name: {
              type: 'string',
              description: 'Function name'
            },
            description: {
              type: 'string',
              description: 'Function description'
            },
            parameters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Parameter name'
                  },
                  type: {
                    type: 'string',
                    description: 'Parameter type'
                  },
                  description: {
                    type: 'string',
                    description: 'Parameter description'
                  },
                  isOptional: {
                    type: 'boolean',
                    description: 'Whether the parameter is optional'
                  },
                  defaultValue: {
                    type: 'string',
                    description: 'Default value'
                  }
                },
                required: ['name', 'type', 'description', 'isOptional']
              },
              description: 'Function parameters'
            },
            returnType: {
              type: 'string',
              description: 'Return type'
            },
            returnDescription: {
              type: 'string',
              description: 'Return description'
            },
            implementation: {
              type: 'string',
              description: 'Function implementation'
            },
            implementationPath: {
              type: 'string',
              description: 'File path where the function is implemented'
            },
            startLine: {
              type: 'number',
              description: 'Line number where the function starts'
            },
            endLine: {
              type: 'number',
              description: 'Line number where the function ends'
            },
            purpose: {
              type: 'string',
              description: 'Purpose or reason for implementation'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags or categories'
            },
            relatedApiEndpoints: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Related API endpoint IDs'
            },
            relatedFunctions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Related function IDs'
            },
            usageExamples: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Usage examples'
            }
          },
          required: ['projectId', 'name', 'description', 'parameters', 'returnType', 'returnDescription', 'implementation', 'implementationPath', 'startLine', 'endLine', 'purpose']
        }
      },
      {
        name: 'scan_file_for_functions',
        description: 'Scan a file for functions',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            filePath: {
              type: 'string',
              description: 'File path'
            }
          },
          required: ['projectId', 'filePath']
        }
      },
      {
        name: 'add_usage_example',
        description: 'Add a usage example to a function',
        input_schema: {
          type: 'object',
          properties: {
            functionId: {
              type: 'string',
              description: 'Function ID'
            },
            example: {
              type: 'string',
              description: 'Usage example'
            }
          },
          required: ['functionId', 'example']
        }
      },
      {
        name: 'update_function_purpose',
        description: 'Update the purpose of a function',
        input_schema: {
          type: 'object',
          properties: {
            functionId: {
              type: 'string',
              description: 'Function ID'
            },
            purpose: {
              type: 'string',
              description: 'New purpose'
            }
          },
          required: ['functionId', 'purpose']
        }
      },
      {
        name: 'query',
        description: 'Query stored data',
        input_schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of entity to query',
              enum: ['project', 'api-endpoint', 'function', 'all']
            },
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            query: {
              type: 'string',
              description: 'Search query'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags to filter by'
            },
            pathPattern: {
              type: 'string',
              description: 'Path pattern to filter by'
            },
            method: {
              type: 'string',
              description: 'HTTP method to filter by'
            },
            namePattern: {
              type: 'string',
              description: 'Function name pattern to filter by'
            },
            implementationPath: {
              type: 'string',
              description: 'Implementation path to filter by'
            }
          },
          required: ['type']
        }
      },
      {
        name: 'get_project',
        description: 'Get a project by ID',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            }
          },
          required: ['projectId']
        }
      },
      {
        name: 'get_api_endpoint',
        description: 'Get an API endpoint by ID',
        input_schema: {
          type: 'object',
          properties: {
            endpointId: {
              type: 'string',
              description: 'API endpoint ID'
            }
          },
          required: ['endpointId']
        }
      },
      {
        name: 'get_function',
        description: 'Get a function by ID',
        input_schema: {
          type: 'object',
          properties: {
            functionId: {
              type: 'string',
              description: 'Function ID'
            }
          },
          required: ['functionId']
        }
      },
      {
        name: 'get_api_endpoints_for_project',
        description: 'Get all API endpoints for a project',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            }
          },
          required: ['projectId']
        }
      },
      {
        name: 'get_functions_for_project',
        description: 'Get all functions for a project',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            }
          },
          required: ['projectId']
        }
      },
      {
        name: 'get_related_api_endpoints',
        description: 'Get related API endpoints for a function',
        input_schema: {
          type: 'object',
          properties: {
            functionId: {
              type: 'string',
              description: 'Function ID'
            }
          },
          required: ['functionId']
        }
      },
      {
        name: 'get_related_functions',
        description: 'Get related functions for an API endpoint',
        input_schema: {
          type: 'object',
          properties: {
            endpointId: {
              type: 'string',
              description: 'API endpoint ID'
            }
          },
          required: ['endpointId']
        }
      },
      {
        name: 'scan_project',
        description: 'Scan a project for API endpoints and functions',
        input_schema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID'
            },
            filePatterns: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'File patterns to scan (e.g., "*.ts", "*.js")'
            }
          },
          required: ['projectId']
        }
      }
    ];
  }
  
  /**
   * Get the available resources
   */
  getResources(): any[] {
    return [
      {
        name: 'projects',
        description: 'List of projects',
        uri_pattern: 'codenexus://projects'
      },
      {
        name: 'project',
        description: 'Project details',
        uri_pattern: 'codenexus://projects/{projectId}'
      },
      {
        name: 'api_endpoints',
        description: 'List of API endpoints for a project',
        uri_pattern: 'codenexus://projects/{projectId}/api-endpoints'
      },
      {
        name: 'api_endpoint',
        description: 'API endpoint details',
        uri_pattern: 'codenexus://api-endpoints/{endpointId}'
      },
      {
        name: 'functions',
        description: 'List of functions for a project',
        uri_pattern: 'codenexus://projects/{projectId}/functions'
      },
      {
        name: 'function',
        description: 'Function details',
        uri_pattern: 'codenexus://functions/{functionId}'
      }
    ];
  }
  
  /**
   * Execute a tool
   * @param toolName Tool name
   * @param args Tool arguments
   * @returns Tool result
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    try {
      switch (toolName) {
        case 'create_project':
          return await this.createProject(args);
        case 'track_api':
          return await this.trackApiTool.execute(args);
        case 'scan_file_for_apis':
          return await this.trackApiTool.scanFile(args.projectId, args.filePath);
        case 'track_function':
          return await this.trackFunctionTool.execute(args);
        case 'scan_file_for_functions':
          return await this.trackFunctionTool.scanFile(args.projectId, args.filePath);
        case 'add_usage_example':
          return await this.trackFunctionTool.addUsageExample(args.functionId, args.example);
        case 'update_function_purpose':
          return await this.trackFunctionTool.updatePurpose(args.functionId, args.purpose);
        case 'query':
          return await this.queryTool.execute(args);
        case 'get_project':
          return await this.queryTool.getProject(args.projectId);
        case 'get_api_endpoint':
          return await this.queryTool.getApiEndpoint(args.endpointId);
        case 'get_function':
          return await this.queryTool.getFunction(args.functionId);
        case 'get_api_endpoints_for_project':
          return await this.queryTool.getApiEndpointsForProject(args.projectId);
        case 'get_functions_for_project':
          return await this.queryTool.getFunctionsForProject(args.projectId);
        case 'get_related_api_endpoints':
          return await this.queryTool.getRelatedApiEndpoints(args.functionId);
        case 'get_related_functions':
          return await this.queryTool.getRelatedFunctions(args.endpointId);
        case 'scan_project':
          return await this.scanProject(args.projectId, args.filePatterns);
        default:
          return {
            success: false,
            error: `Unknown tool: ${toolName}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Access a resource
   * @param uri Resource URI
   * @returns Resource data
   */
  async accessResource(uri: string): Promise<any> {
    try {
      // Parse URI
      const uriParts = uri.replace('codenexus://', '').split('/');
      
      if (uriParts[0] === 'projects') {
        if (uriParts.length === 1) {
          // List all projects
          const projects = await this.storageManager.getAllProjects();
          return {
            success: true,
            data: projects
          };
        } else if (uriParts.length === 2) {
          // Get project details
          const projectId = uriParts[1];
          const project = await this.storageManager.getProject(projectId);
          
          if (!project) {
            return {
              success: false,
              error: `Project with ID ${projectId} not found`
            };
          }
          
          return {
            success: true,
            data: project
          };
        } else if (uriParts.length === 3 && uriParts[2] === 'api-endpoints') {
          // Get API endpoints for a project
          const projectId = uriParts[1];
          const endpoints = await this.storageManager.getApiEndpoints(projectId);
          
          return {
            success: true,
            data: endpoints
          };
        } else if (uriParts.length === 3 && uriParts[2] === 'functions') {
          // Get functions for a project
          const projectId = uriParts[1];
          const functions = await this.storageManager.getFunctions(projectId);
          
          return {
            success: true,
            data: functions
          };
        }
      } else if (uriParts[0] === 'api-endpoints' && uriParts.length === 2) {
        // Get API endpoint details
        const endpointId = uriParts[1];
        const endpoint = await this.storageManager.getApiEndpoint(endpointId);
        
        if (!endpoint) {
          return {
            success: false,
            error: `API endpoint with ID ${endpointId} not found`
          };
        }
        
        return {
          success: true,
          data: endpoint
        };
      } else if (uriParts[0] === 'functions' && uriParts.length === 2) {
        // Get function details
        const functionId = uriParts[1];
        const func = await this.storageManager.getFunction(functionId);
        
        if (!func) {
          return {
            success: false,
            error: `Function with ID ${functionId} not found`
          };
        }
        
        return {
          success: true,
          data: func
        };
      }
      
      return {
        success: false,
        error: `Invalid resource URI: ${uri}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Create a new project
   * @param args Project arguments
   * @returns Creation result
   */
  private async createProject(args: { name: string; path: string; description: string }): Promise<any> {
    try {
      // Validate input
      if (!args.name) {
        return { success: false, error: 'Project name is required' };
      }
      
      if (!args.path) {
        return { success: false, error: 'Project path is required' };
      }
      
      if (!args.description) {
        return { success: false, error: 'Project description is required' };
      }
      
      // Create project
      const project = createProject(args.name, args.path, args.description);
      
      // Save project
      await this.storageManager.saveProject(project);
      
      return {
        success: true,
        projectId: project.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Scan a project for API endpoints and functions
   * @param projectId Project ID
   * @param filePatterns File patterns to scan
   * @returns Scan result
   */
  private async scanProject(projectId: string, filePatterns: string[] = ['*.ts', '*.js']): Promise<any> {
    try {
      // Validate input
      if (!projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      // Get project
      const project = await this.storageManager.getProject(projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${projectId} not found` };
      }
      
      // Find files to scan
      const files: string[] = [];
      for (const pattern of filePatterns) {
        const patternFiles = await findFiles(project.path, pattern);
        files.push(...patternFiles);
      }
      
      // Scan files
      const results = {
        apiEndpoints: [] as string[],
        functions: [] as string[]
      };
      
      for (const file of files) {
        // Scan for API endpoints
        const apiResult = await this.trackApiTool.scanFile(projectId, file);
        if (apiResult.success && apiResult.endpointIds) {
          results.apiEndpoints.push(...apiResult.endpointIds);
        }
        
        // Scan for functions
        const funcResult = await this.trackFunctionTool.scanFile(projectId, file);
        if (funcResult.success && funcResult.functionIds) {
          results.functions.push(...funcResult.functionIds);
        }
      }
      
      return {
        success: true,
        scannedFiles: files.length,
        apiEndpoints: results.apiEndpoints.length,
        functions: results.functions.length,
        apiEndpointIds: results.apiEndpoints,
        functionIds: results.functions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}