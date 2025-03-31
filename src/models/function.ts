/**
 * Parameter representation for a function
 */
export interface Parameter {
  /**
   * Name of the parameter
   */
  name: string;
  
  /**
   * Type of the parameter
   */
  type: string;
  
  /**
   * Description of the parameter
   */
  description: string;
  
  /**
   * Whether the parameter is optional
   */
  isOptional: boolean;
  
  /**
   * Default value of the parameter (if any)
   */
  defaultValue?: string;
}

/**
 * Function model representing a function tracked by CodeNexus
 */
export interface Function {
  /**
   * Unique identifier for the function
   */
  id: string;
  
  /**
   * ID of the project this function belongs to
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
   * Date when the function was first tracked
   */
  createdAt: string;
  
  /**
   * Date when the function was last updated
   */
  updatedAt: string;
  
  /**
   * Tags or categories for the function
   */
  tags: string[];
  
  /**
   * List of API endpoint IDs related to this function
   */
  relatedApiEndpoints: string[];
  
  /**
   * List of other function IDs related to this function
   */
  relatedFunctions: string[];
  
  /**
   * Usage examples of the function
   */
  usageExamples: string[];
}

/**
 * Create a new function
 * @param projectId Project ID
 * @param name Function name
 * @param description Function description
 * @param parameters Function parameters
 * @param returnType Function return type
 * @param returnDescription Function return description
 * @param implementation Function implementation code
 * @param implementationPath File path where the function is implemented
 * @param startLine Line number where the function starts
 * @param endLine Line number where the function ends
 * @param purpose Purpose or reason for implementation
 * @param tags Tags or categories (optional)
 * @param usageExamples Usage examples (optional)
 * @returns A new Function object
 */
export function createFunction(
  projectId: string,
  name: string,
  description: string,
  parameters: Parameter[],
  returnType: string,
  returnDescription: string,
  implementation: string,
  implementationPath: string,
  startLine: number,
  endLine: number,
  purpose: string,
  tags: string[] = [],
  usageExamples: string[] = []
): Function {
  const now = new Date().toISOString();
  
  return {
    id: generateFunctionId(projectId, name, implementationPath),
    projectId,
    name,
    description,
    parameters,
    returnType,
    returnDescription,
    implementation,
    implementationPath,
    startLine,
    endLine,
    purpose,
    createdAt: now,
    updatedAt: now,
    tags,
    relatedApiEndpoints: [],
    relatedFunctions: [],
    usageExamples
  };
}

/**
 * Generate a unique function ID based on project ID, function name, and implementation path
 * @param projectId Project ID
 * @param name Function name
 * @param implementationPath Implementation path
 * @returns A unique function ID
 */
function generateFunctionId(projectId: string, name: string, implementationPath: string): string {
  return `function_${Buffer.from(`${projectId}:${name}:${implementationPath}`).toString('base64').replace(/[+/=]/g, '')}`;
}