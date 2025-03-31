/**
 * HTTP methods supported by API endpoints
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * Schema representation for request/response
 */
export interface Schema {
  /**
   * Content type (e.g., 'application/json', 'multipart/form-data')
   */
  contentType: string;
  
  /**
   * Schema definition (can be JSON Schema, TypeScript interface, etc.)
   */
  definition: string;
  
  /**
   * Example of the schema (optional)
   */
  example?: string;
}

/**
 * API Endpoint model representing an API endpoint tracked by CodeNexus
 */
export interface ApiEndpoint {
  /**
   * Unique identifier for the API endpoint
   */
  id: string;
  
  /**
   * ID of the project this endpoint belongs to
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
   * Request schema
   */
  requestSchema?: Schema;
  
  /**
   * Response schema
   */
  responseSchema?: Schema;
  
  /**
   * File path where the endpoint is implemented
   */
  implementationPath: string;
  
  /**
   * Date when the endpoint was first tracked
   */
  createdAt: string;
  
  /**
   * Date when the endpoint was last updated
   */
  updatedAt: string;
  
  /**
   * Tags or categories for the endpoint
   */
  tags: string[];
  
  /**
   * List of function IDs related to this endpoint
   */
  relatedFunctions: string[];
}

/**
 * Create a new API endpoint
 * @param projectId Project ID
 * @param method HTTP method
 * @param path Endpoint path
 * @param description Endpoint description
 * @param implementationPath File path where the endpoint is implemented
 * @param requestSchema Request schema (optional)
 * @param responseSchema Response schema (optional)
 * @param tags Tags or categories (optional)
 * @returns A new ApiEndpoint object
 */
export function createApiEndpoint(
  projectId: string,
  method: HttpMethod,
  path: string,
  description: string,
  implementationPath: string,
  requestSchema?: Schema,
  responseSchema?: Schema,
  tags: string[] = []
): ApiEndpoint {
  const now = new Date().toISOString();
  
  return {
    id: generateEndpointId(projectId, method, path),
    projectId,
    method,
    path,
    description,
    requestSchema,
    responseSchema,
    implementationPath,
    createdAt: now,
    updatedAt: now,
    tags,
    relatedFunctions: []
  };
}

/**
 * Generate a unique endpoint ID based on project ID, method, and path
 * @param projectId Project ID
 * @param method HTTP method
 * @param path Endpoint path
 * @returns A unique endpoint ID
 */
function generateEndpointId(projectId: string, method: HttpMethod, path: string): string {
  return `endpoint_${Buffer.from(`${projectId}:${method}:${path}`).toString('base64').replace(/[+/=]/g, '')}`;
}