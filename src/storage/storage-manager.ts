import { Project } from '../models/project';
import { ApiEndpoint } from '../models/api-endpoint';
import { Function } from '../models/function';

/**
 * Storage manager interface for CodeNexus
 * Defines methods for storing and retrieving data
 */
export interface StorageManager {
  /**
   * Initialize the storage
   */
  initialize(): Promise<void>;
  
  /**
   * Get all projects
   */
  getAllProjects(): Promise<Project[]>;
  
  /**
   * Get a project by ID
   * @param id Project ID
   */
  getProject(id: string): Promise<Project | null>;
  
  /**
   * Save a project
   * @param project Project to save
   */
  saveProject(project: Project): Promise<void>;
  
  /**
   * Delete a project
   * @param id Project ID
   */
  deleteProject(id: string): Promise<void>;
  
  /**
   * Get all API endpoints for a project
   * @param projectId Project ID
   */
  getApiEndpoints(projectId: string): Promise<ApiEndpoint[]>;
  
  /**
   * Get an API endpoint by ID
   * @param id API endpoint ID
   */
  getApiEndpoint(id: string): Promise<ApiEndpoint | null>;
  
  /**
   * Save an API endpoint
   * @param endpoint API endpoint to save
   */
  saveApiEndpoint(endpoint: ApiEndpoint): Promise<void>;
  
  /**
   * Delete an API endpoint
   * @param id API endpoint ID
   */
  deleteApiEndpoint(id: string): Promise<void>;
  
  /**
   * Get all functions for a project
   * @param projectId Project ID
   */
  getFunctions(projectId: string): Promise<Function[]>;
  
  /**
   * Get a function by ID
   * @param id Function ID
   */
  getFunction(id: string): Promise<Function | null>;
  
  /**
   * Save a function
   * @param func Function to save
   */
  saveFunction(func: Function): Promise<void>;
  
  /**
   * Delete a function
   * @param id Function ID
   */
  deleteFunction(id: string): Promise<void>;
  
  /**
   * Search for projects, API endpoints, or functions
   * @param query Search query
   * @param type Type of entity to search for (optional)
   */
  search(query: string, type?: 'project' | 'api-endpoint' | 'function'): Promise<Array<Project | ApiEndpoint | Function>>;
}