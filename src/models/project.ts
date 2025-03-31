/**
 * Project model representing a project tracked by CodeNexus
 */
export interface Project {
  /**
   * Unique identifier for the project
   */
  id: string;
  
  /**
   * Name of the project
   */
  name: string;
  
  /**
   * Path to the project root directory
   */
  path: string;
  
  /**
   * Description of the project
   */
  description: string;
  
  /**
   * Date when the project was first tracked
   */
  createdAt: string;
  
  /**
   * Date when the project was last updated
   */
  updatedAt: string;
  
  /**
   * List of API endpoint IDs associated with this project
   */
  apiEndpoints: string[];
  
  /**
   * List of function IDs associated with this project
   */
  functions: string[];
}

/**
 * Create a new project
 * @param name Project name
 * @param path Project path
 * @param description Project description
 * @returns A new Project object
 */
export function createProject(name: string, path: string, description: string): Project {
  const now = new Date().toISOString();
  
  return {
    id: generateProjectId(name, path),
    name,
    path,
    description,
    createdAt: now,
    updatedAt: now,
    apiEndpoints: [],
    functions: []
  };
}

/**
 * Generate a unique project ID based on name and path
 * @param name Project name
 * @param path Project path
 * @returns A unique project ID
 */
function generateProjectId(name: string, path: string): string {
  return `project_${Buffer.from(`${name}:${path}`).toString('base64').replace(/[+/=]/g, '')}`;
}