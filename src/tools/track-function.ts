import { Function, Parameter, createFunction } from '../models/function';
import { StorageManager } from '../storage/storage-manager';
import { extractFunctions } from '../utils/helpers';

/**
 * Input schema for the track-function tool
 */
export interface TrackFunctionInput {
  /**
   * Project ID
   */
  projectId: string;
  
  /**
   * Name of the function
   */
  name: string;
  
  /**
   * Description of the function
   */
  description: string;
  
  /**
   * Parameters of the function
   */
  parameters: Parameter[];
  
  /**
   * Return type of the function
   */
  returnType: string;
  
  /**
   * Return description
   */
  returnDescription: string;
  
  /**
   * Code snippet of the function implementation
   */
  implementation: string;
  
  /**
   * File path where the function is implemented
   */
  implementationPath: string;
  
  /**
   * Line number where the function starts in the file
   */
  startLine: number;
  
  /**
   * Line number where the function ends in the file
   */
  endLine: number;
  
  /**
   * Purpose or reason why the function was implemented
   */
  purpose: string;
  
  /**
   * Tags or categories (optional)
   */
  tags?: string[];
  
  /**
   * Related API endpoint IDs (optional)
   */
  relatedApiEndpoints?: string[];
  
  /**
   * Related function IDs (optional)
   */
  relatedFunctions?: string[];
  
  /**
   * Usage examples (optional)
   */
  usageExamples?: string[];
}

/**
 * Output schema for the track-function tool
 */
export interface TrackFunctionOutput {
  /**
   * Success status
   */
  success: boolean;
  
  /**
   * Function ID
   */
  functionId?: string;
  
  /**
   * Error message (if any)
   */
  error?: string;
}

/**
 * Tool for tracking functions
 */
export class TrackFunctionTool {
  constructor(private storageManager: StorageManager) {}
  
  /**
   * Track a function
   * @param input Tool input
   * @returns Tool output
   */
  async execute(input: TrackFunctionInput): Promise<TrackFunctionOutput> {
    try {
      // Validate input
      if (!input.projectId) {
        return { success: false, error: 'Project ID is required' };
      }
      
      if (!input.name) {
        return { success: false, error: 'Function name is required' };
      }
      
      if (!input.implementationPath) {
        return { success: false, error: 'Implementation path is required' };
      }
      
      // Check if project exists
      const project = await this.storageManager.getProject(input.projectId);
      if (!project) {
        return { success: false, error: `Project with ID ${input.projectId} not found` };
      }
      
      // Create function
      const func = createFunction(
        input.projectId,
        input.name,
        input.description,
        input.parameters,
        input.returnType,
        input.returnDescription,
        input.implementation,
        input.implementationPath,
        input.startLine,
        input.endLine,
        input.purpose,
        input.tags,
        input.usageExamples
      );
      
      // Add related API endpoints
      if (input.relatedApiEndpoints && input.relatedApiEndpoints.length > 0) {
        func.relatedApiEndpoints = input.relatedApiEndpoints;
      }
      
      // Add related functions
      if (input.relatedFunctions && input.relatedFunctions.length > 0) {
        func.relatedFunctions = input.relatedFunctions;
      }
      
      // Save function
      await this.storageManager.saveFunction(func);
      
      return {
        success: true,
        functionId: func.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Scan a file for functions
   * @param projectId Project ID
   * @param filePath File path
   * @returns Tool output with array of function IDs
   */
  async scanFile(projectId: string, filePath: string): Promise<{ success: boolean; functionIds?: string[]; error?: string }> {
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
      
      // Extract functions
      const functions = await extractFunctions(filePath, projectId);
      
      // Save functions
      const functionIds: string[] = [];
      for (const func of functions) {
        await this.storageManager.saveFunction(func);
        functionIds.push(func.id);
      }
      
      return {
        success: true,
        functionIds
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Add a usage example to a function
   * @param functionId Function ID
   * @param example Usage example
   * @returns Tool output
   */
  async addUsageExample(functionId: string, example: string): Promise<TrackFunctionOutput> {
    try {
      // Validate input
      if (!functionId) {
        return { success: false, error: 'Function ID is required' };
      }
      
      if (!example) {
        return { success: false, error: 'Example is required' };
      }
      
      // Get function
      const func = await this.storageManager.getFunction(functionId);
      if (!func) {
        return { success: false, error: `Function with ID ${functionId} not found` };
      }
      
      // Add usage example
      if (!func.usageExamples) {
        func.usageExamples = [];
      }
      
      func.usageExamples.push(example);
      func.updatedAt = new Date().toISOString();
      
      // Save function
      await this.storageManager.saveFunction(func);
      
      return {
        success: true,
        functionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Update the purpose of a function
   * @param functionId Function ID
   * @param purpose New purpose
   * @returns Tool output
   */
  async updatePurpose(functionId: string, purpose: string): Promise<TrackFunctionOutput> {
    try {
      // Validate input
      if (!functionId) {
        return { success: false, error: 'Function ID is required' };
      }
      
      if (!purpose) {
        return { success: false, error: 'Purpose is required' };
      }
      
      // Get function
      const func = await this.storageManager.getFunction(functionId);
      if (!func) {
        return { success: false, error: `Function with ID ${functionId} not found` };
      }
      
      // Update purpose
      func.purpose = purpose;
      func.updatedAt = new Date().toISOString();
      
      // Save function
      await this.storageManager.saveFunction(func);
      
      return {
        success: true,
        functionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}