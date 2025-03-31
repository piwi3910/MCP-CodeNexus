import { HttpMethod, createApiEndpoint } from '../models/api-endpoint';
import { StorageManager } from '../storage/storage-manager';
import { extractApiEndpoints } from '../utils/helpers';

/**
 * Input schema for the track-api tool
 */
export interface TrackApiInput {
  /**
   * Project ID
   */
  projectId: string;
  
  /**
   * HTTP method of the endpoint
   */
  method: HttpMethod;
  
  /**
   * Path of the endpoint
   */
  path: string;
  
  /**
   * Description of the endpoint
   */
  description: string;
  
  /**
   * File path where the endpoint is implemented
   */
  implementationPath: string;
  
  /**
   * Request schema (optional)
   */
  requestSchema?: {
    contentType: string;
    definition: string;
    example?: string;
  };
  
  /**
   * Response schema (optional)
   */
  responseSchema?: {
    contentType: string;
    definition: string;
    example?: string;
  };
  
  /**
   * Tags or categories (optional)
   */
  tags?: string[];
  
  /**
   * Related function IDs (optional)
   */
  relatedFunctions?: string[];
}

/**
 * Output schema for the track-api tool
 */
export interface TrackApiOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * API endpoint ID
   */
  endpointId?: string;
  
  /**
   * Error message (if any)
   */
  error?: string;
}

/**
 * Tool for tracking API endpoints
 */
export class TrackApiTool {
  constructor(private storageManager: StorageManager) {}
  
  /**
   * Track an API endpoint
   * @param input Tool input
   * @returns Tool output
   */
  async execute(input: TrackApiInput): Promise<TrackApiOutput> {
    try {
      // Validate input
      if (!input.projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      if (!input.method) {
        return { success: false, error: 'HTTP method is required' };
      }
      
      if (!input.path) {
        return { success: false, error: 'Path is required' };
      }
      
      if (!input.implementationPath) {
        return { success: false, error: 'Implementation path is required' };
      }
      
      // Check if project exists
      const project = await this.storageManager.getProject(input.projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${input.projectId} not found` };
      }
      
      // Create API endpoint
      const endpoint = createApiEndpoint(
        input.projectId,
        input.method,
        input.path,
        input.description,
        input.implementationPath,
        input.requestSchema,
        input.responseSchema,
        input.tags
      );
      
      // Add related functions
      if (input.relatedFunctions && input.relatedFunctions.length > 0) {
        endpoint.relatedFunctions = input.relatedFunctions;
      }
      
      // Save API endpoint
      await this.storageManager.saveApiEndpoint(endpoint);
      
      return {
        success: true,
        endpointId: endpoint.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Scan a file for API endpoints
   * @param projectId Project ID
   * @param filePath File path
   * @returns Tool output with array of endpoint IDs
   */
  async scanFile(projectId: string, filePath: string): Promise<{ success: boolean; endpointIds?: string[]; error?: string }> {
    try {
      // Validate input
      if (!projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      if (!filePath) {
        return { success: false, error: 'File path is required' };
      }
      
      // Check if project exists
      const project = await this.storageManager.getProject(projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${projectId} not found` };
      }
      
      // Extract API endpoints
      const endpoints = await extractApiEndpoints(filePath, projectId);
      
      // Save endpoints
      const endpointIds: string[] = [];
      for (const endpoint of endpoints) {
        await this.storageManager.saveApiEndpoint(endpoint);
        endpointIds.push(endpoint.id);
      }
      
      return {
        success: true,
        endpointIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}