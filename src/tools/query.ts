import { Project } from '../models/project';
import { ApiEndpoint } from '../models/api-endpoint';
import { Function } from '../models/function';
import { StorageManager } from '../storage/storage-manager';

/**
 * Input schema for the query tool
 */
export interface QueryInput {
  /**
   * Type of entity to query
   */
  type: 'project' | 'api-endpoint' | 'function' | 'all';
  
  /**
   * Project ID (optional, for filtering API endpoints and functions)
   */
  projectId?: string;
  
  /**
   * Search query (optional)
   */
  query?: string;
  
  /**
   * Tags to filter by (optional)
   */
  tags?: string[];
  
  /**
   * Path pattern to filter by (optional, for API endpoints)
   */
  pathPattern?: string;
  
  /**
   * HTTP method to filter by (optional, for API endpoints)
   */
  method?: string;
  
  /**
   * Function name pattern to filter by (optional, for functions)
   */
  namePattern?: string;
  
  /**
   * Implementation path to filter by (optional)
   */
  implementationPath?: string;
}

/**
 * Output schema for the query tool
 */
export interface QueryOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Query results
   */
  results?: Array<Project | ApiEndpoint | Function>;
  
  /**
   * Error message (if any)
   */
  error?: string;
}

/**
 * Tool for querying stored data
 */
export class QueryTool {
  constructor(private storageManager: StorageManager) {}
  
  /**
   * Execute a query
   * @param input Query input
   * @returns Query output
   */
  async execute(input: QueryInput): Promise<QueryOutput> {
    try {
      // Validate input
      if (!input.type) {
        return { success: false, error: 'Query type is required' };
      }
      
      let results: Array<Project | ApiEndpoint | Function> = [];
      
      // Query projects
      if (input.type === 'project' || input.type === 'all') {
        const projects = await this.storageManager.getAllProjects();
        results.push(...this.filterProjects(projects, input));
      }
      
      // Query API endpoints
      if (input.type === 'api-endpoint' || input.type === 'all') {
        let endpoints: ApiEndpoint[] = [];
        
        if (input.projectId) {
          // Get endpoints for a specific project
          endpoints = await this.storageManager.getApiEndpoints(input.projectId);
        } else {
          // Get all endpoints from all projects
          const projects = await this.storageManager.getAllProjects();
          for (const project of projects) {
            const projectEndpoints = await this.storageManager.getApiEndpoints(project.id);
            endpoints.push(...projectEndpoints);
          }
        }
        
        results.push(...this.filterApiEndpoints(endpoints, input));
      }
      
      // Query functions
      if (input.type === 'function' || input.type === 'all') {
        let functions: Function[] = [];
        
        if (input.projectId) {
          // Get functions for a specific project
          functions = await this.storageManager.getFunctions(input.projectId);
        } else {
          // Get all functions from all projects
          const projects = await this.storageManager.getAllProjects();
          for (const project of projects) {
            const projectFunctions = await this.storageManager.getFunctions(project.id);
            functions.push(...projectFunctions);
          }
        }
        
        results.push(...this.filterFunctions(functions, input));
      }
      
      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get a project by ID
   * @param projectId Project ID
   * @returns Query output
   */
  async getProject(projectId: string): Promise<QueryOutput> {
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
      
      return {
        success: true,
        results: [project]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get an API endpoint by ID
   * @param endpointId API endpoint ID
   * @returns Query output
   */
  async getApiEndpoint(endpointId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!endpointId) {
        return { success: false, error: 'API endpoint ID is required' };
      }
      
      // Get API endpoint
      const endpoint = await this.storageManager.getApiEndpoint(endpointId);
      if (!endpoint) {
        return { success: false, error: `API endpoint with ID ${endpointId} not found` };
      }
      
      return {
        success: true,
        results: [endpoint]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get a function by ID
   * @param functionId Function ID
   * @returns Query output
   */
  async getFunction(functionId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!functionId) {
        return { success: false, error: 'Function ID is required' };
      }
      
      // Get function
      const func = await this.storageManager.getFunction(functionId);
      if (!func) {
        return { success: false, error: `Function with ID ${functionId} not found` };
      }
      
      return {
        success: true,
        results: [func]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get all API endpoints for a project
   * @param projectId Project ID
   * @returns Query output
   */
  async getApiEndpointsForProject(projectId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      // Check if project exists
      const project = await this.storageManager.getProject(projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${projectId} not found` };
      }
      
      // Get API endpoints
      const endpoints = await this.storageManager.getApiEndpoints(projectId);
      
      return {
        success: true,
        results: endpoints
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get all functions for a project
   * @param projectId Project ID
   * @returns Query output
   */
  async getFunctionsForProject(projectId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      // Check if project exists
      const project = await this.storageManager.getProject(projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${projectId} not found` };
      }
      
      // Get functions
      const functions = await this.storageManager.getFunctions(projectId);
      
      return {
        success: true,
        results: functions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get related API endpoints for a function
   * @param functionId Function ID
   * @returns Query output
   */
  async getRelatedApiEndpoints(functionId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!functionId) {
        return { success: false, error: 'Function ID is required' };
      }
      
      // Get function
      const func = await this.storageManager.getFunction(functionId);
      if (!func) {
        return { success: false, error: `Function with ID ${functionId} not found` };
      }
      
      // Get related API endpoints
      const endpoints: ApiEndpoint[] = [];
      for (const endpointId of func.relatedApiEndpoints) {
        const endpoint = await this.storageManager.getApiEndpoint(endpointId);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      }
      
      return {
        success: true,
        results: endpoints
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get related functions for an API endpoint
   * @param endpointId API endpoint ID
   * @returns Query output
   */
  async getRelatedFunctions(endpointId: string): Promise<QueryOutput> {
    try {
      // Validate input
      if (!endpointId) {
        return { success: false, error: 'API endpoint ID is required' };
      }
      
      // Get API endpoint
      const endpoint = await this.storageManager.getApiEndpoint(endpointId);
      if (!endpoint) {
        return { success: false, error: `API endpoint with ID ${endpointId} not found` };
      }
      
      // Get related functions
      const functions: Function[] = [];
      for (const functionId of endpoint.relatedFunctions) {
        const func = await this.storageManager.getFunction(functionId);
        if (func) {
          functions.push(func);
        }
      }
      
      return {
        success: true,
        results: functions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Filter projects based on query input
   * @param projects Projects to filter
   * @param input Query input
   * @returns Filtered projects
   */
  private filterProjects(projects: Project[], input: QueryInput): Project[] {
    return projects.filter(project => {
      // Filter by query
      if (input.query) {
        const query = input.query.toLowerCase();
        if (
          !project.name.toLowerCase().includes(query) &&
          !project.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Filter by implementation path
      if (input.implementationPath) {
        if (!project.path.includes(input.implementationPath)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Filter API endpoints based on query input
   * @param endpoints API endpoints to filter
   * @param input Query input
   * @returns Filtered API endpoints
   */
  private filterApiEndpoints(endpoints: ApiEndpoint[], input: QueryInput): ApiEndpoint[] {
    return endpoints.filter(endpoint => {
      // Filter by project ID
      if (input.projectId && endpoint.projectId !== input.projectId) {
        return false;
      }
      
      // Filter by query
      if (input.query) {
        const query = input.query.toLowerCase();
        if (
          !endpoint.path.toLowerCase().includes(query) &&
          !endpoint.description.toLowerCase().includes(query) &&
          !endpoint.method.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Filter by tags
      if (input.tags && input.tags.length > 0) {
        if (!input.tags.some(tag => endpoint.tags.includes(tag))) {
          return false;
        }
      }
      
      // Filter by path pattern
      if (input.pathPattern) {
        const regex = new RegExp(input.pathPattern);
        if (!regex.test(endpoint.path)) {
          return false;
        }
      }
      
      // Filter by method
      if (input.method) {
        if (endpoint.method !== input.method.toUpperCase()) {
          return false;
        }
      }
      
      // Filter by implementation path
      if (input.implementationPath) {
        if (!endpoint.implementationPath.includes(input.implementationPath)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Filter functions based on query input
   * @param functions Functions to filter
   * @param input Query input
   * @returns Filtered functions
   */
  private filterFunctions(functions: Function[], input: QueryInput): Function[] {
    return functions.filter(func => {
      // Filter by project ID
      if (input.projectId && func.projectId !== input.projectId) {
        return false;
      }
      
      // Filter by query
      if (input.query) {
        const query = input.query.toLowerCase();
        if (
          !func.name.toLowerCase().includes(query) &&
          !func.description.toLowerCase().includes(query) &&
          !func.purpose.toLowerCase().includes(query) &&
          !func.implementation.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Filter by tags
      if (input.tags && input.tags.length > 0) {
        if (!input.tags.some(tag => func.tags.includes(tag))) {
          return false;
        }
      }
      
      // Filter by name pattern
      if (input.namePattern) {
        const regex = new RegExp(input.namePattern);
        if (!regex.test(func.name)) {
          return false;
        }
      }
      
      // Filter by implementation path
      if (input.implementationPath) {
        if (!func.implementationPath.includes(input.implementationPath)) {
          return false;
        }
      }
      
      return true;
    });
  }
}