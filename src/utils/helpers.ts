import * as fs from 'fs-extra';
import * as path from 'path';
import { ApiEndpoint, HttpMethod, Schema, createApiEndpoint } from '../models/api-endpoint';
import { Function, Parameter, createFunction } from '../models/function';

/**
 * Extract API endpoints from a file
 * This is a simple implementation that looks for common patterns in code
 * More sophisticated implementations could use AST parsing for specific languages
 * 
 * @param filePath Path to the file
 * @param projectId Project ID
 * @returns Array of extracted API endpoints
 */
export async function extractApiEndpoints(filePath: string, projectId: string): Promise<ApiEndpoint[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const endpoints: ApiEndpoint[] = [];
  
  // Express.js pattern: app.METHOD(PATH, HANDLER)
  const expressPattern = /app\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = expressPattern.exec(content)) !== null) {
    const method = match[1].toUpperCase() as HttpMethod;
    const path = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Try to extract description from comments above the endpoint
    const lines = content.split('\n');
    let description = '';
    let i = lineNumber - 2;
    
    while (i >= 0 && i >= lineNumber - 10) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        description = line.replace(/^\/\/\s*|\*\s*/, '') + '\n' + description;
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `${method} endpoint for ${path}`;
    }
    
    endpoints.push(createApiEndpoint(
      projectId,
      method,
      path,
      description,
      filePath
    ));
  }
  
  // Fastify pattern: fastify.METHOD(PATH, OPTIONS, HANDLER)
  const fastifyPattern = /fastify\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
  
  while ((match = fastifyPattern.exec(content)) !== null) {
    const method = match[1].toUpperCase() as HttpMethod;
    const path = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Try to extract description from comments above the endpoint
    const lines = content.split('\n');
    let description = '';
    let i = lineNumber - 2;
    
    while (i >= 0 && i >= lineNumber - 10) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        description = line.replace(/^\/\/\s*|\*\s*/, '') + '\n' + description;
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `${method} endpoint for ${path}`;
    }
    
    endpoints.push(createApiEndpoint(
      projectId,
      method,
      path,
      description,
      filePath
    ));
  }
  
  // NestJS pattern: @Get(PATH), @Post(PATH), etc.
  const nestjsPattern = /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]([^'"]*)['"]\s*\)/g;
  
  while ((match = nestjsPattern.exec(content)) !== null) {
    const method = match[1].toUpperCase() as HttpMethod;
    const path = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Try to extract description from comments above the endpoint
    const lines = content.split('\n');
    let description = '';
    let i = lineNumber - 2;
    
    while (i >= 0 && i >= lineNumber - 10) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        description = line.replace(/^\/\/\s*|\*\s*/, '') + '\n' + description;
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `${method} endpoint for ${path}`;
    }
    
    // Find the method name
    const methodNamePattern = new RegExp(`\\s*async\\s+([a-zA-Z0-9_]+)\\s*\\(`, 'g');
    methodNamePattern.lastIndex = match.index + match[0].length;
    const methodMatch = methodNamePattern.exec(content);
    
    if (methodMatch) {
      endpoints.push(createApiEndpoint(
        projectId,
        method,
        path,
        description,
        filePath
      ));
    }
  }
  
  return endpoints;
}

/**
 * Extract functions from a file
 * This is a simple implementation that looks for common patterns in code
 * More sophisticated implementations could use AST parsing for specific languages
 * 
 * @param filePath Path to the file
 * @param projectId Project ID
 * @returns Array of extracted functions
 */
export async function extractFunctions(filePath: string, projectId: string): Promise<Function[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const functions: Function[] = [];
  const lines = content.split('\n');
  
  // JavaScript/TypeScript function pattern
  // This is a simplified pattern and won't catch all function declarations
  const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*:\s*([^{]*))?/g;
  let match;
  
  while ((match = functionPattern.exec(content)) !== null) {
    const name = match[1];
    const paramsString = match[2];
    const returnTypeString = match[3] ? match[3].trim() : 'void';
    
    const startLine = content.substring(0, match.index).split('\n').length;
    
    // Find the end of the function
    let braceCount = 0;
    let endLine = startLine;
    let foundOpeningBrace = false;
    
    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (!foundOpeningBrace && line.includes('{')) {
        foundOpeningBrace = true;
        braceCount++;
      } else if (foundOpeningBrace) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }
    }
    
    // Extract function implementation
    const implementation = lines.slice(startLine - 1, endLine).join('\n');
    
    // Parse parameters
    const parameters: Parameter[] = paramsString.split(',')
      .filter(param => param.trim())
      .map(param => {
        const paramParts = param.trim().split(':');
        const paramName = paramParts[0].trim();
        const isOptional = paramName.endsWith('?');
        const cleanName = isOptional ? paramName.slice(0, -1) : paramName;
        const paramType = paramParts.length > 1 ? paramParts[1].trim() : 'any';
        
        return {
          name: cleanName,
          type: paramType,
          description: `Parameter ${cleanName}`,
          isOptional
        };
      });
    
    // Try to extract description and purpose from comments above the function
    let description = '';
    let purpose = '';
    let i = startLine - 2;
    
    while (i >= 0 && i >= startLine - 20) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        const commentText = line.replace(/^\/\/\s*|\*\s*/, '');
        
        if (commentText.toLowerCase().includes('@description')) {
          description = commentText.replace(/@description/i, '').trim();
        } else if (commentText.toLowerCase().includes('@purpose')) {
          purpose = commentText.replace(/@purpose/i, '').trim();
        } else if (!description) {
          description = commentText + '\n' + description;
        }
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `Function ${name}`;
    }
    
    purpose = purpose.trim();
    if (!purpose) {
      purpose = `Implements functionality for ${name}`;
    }
    
    functions.push(createFunction(
      projectId,
      name,
      description,
      parameters,
      returnTypeString,
      `Returns ${returnTypeString}`,
      implementation,
      filePath,
      startLine,
      endLine,
      purpose
    ));
  }
  
  // Arrow function pattern (for class methods and standalone arrow functions)
  const arrowFunctionPattern = /(?:export\s+)?(?:public|private|protected)?\s*([a-zA-Z0-9_]+)\s*(?:=\s*)?(?:\(([^)]*)\)|([a-zA-Z0-9_]+))(?:\s*:\s*([^=]*))?(?:\s*=>\s*)/g;
  
  while ((match = arrowFunctionPattern.exec(content)) !== null) {
    const name = match[1];
    const paramsString = match[2] || match[3] || '';
    const returnTypeString = match[4] ? match[4].trim() : 'void';
    
    const startLine = content.substring(0, match.index).split('\n').length;
    
    // Find the end of the arrow function
    let braceCount = 0;
    let endLine = startLine;
    let foundOpeningBrace = false;
    
    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (!foundOpeningBrace && line.includes('{')) {
        foundOpeningBrace = true;
        braceCount++;
      } else if (foundOpeningBrace) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      } else if (line.includes('=>') && !foundOpeningBrace) {
        // Single-line arrow function without braces
        endLine = i + 1;
        break;
      }
    }
    
    // Extract function implementation
    const implementation = lines.slice(startLine - 1, endLine).join('\n');
    
    // Parse parameters
    const parameters: Parameter[] = paramsString.split(',')
      .filter(param => param.trim())
      .map(param => {
        const paramParts = param.trim().split(':');
        const paramName = paramParts[0].trim();
        const isOptional = paramName.endsWith('?');
        const cleanName = isOptional ? paramName.slice(0, -1) : paramName;
        const paramType = paramParts.length > 1 ? paramParts[1].trim() : 'any';
        
        return {
          name: cleanName,
          type: paramType,
          description: `Parameter ${cleanName}`,
          isOptional
        };
      });
    
    // Try to extract description and purpose from comments above the function
    let description = '';
    let purpose = '';
    let i = startLine - 2;
    
    while (i >= 0 && i >= startLine - 20) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        const commentText = line.replace(/^\/\/\s*|\*\s*/, '');
        
        if (commentText.toLowerCase().includes('@description')) {
          description = commentText.replace(/@description/i, '').trim();
        } else if (commentText.toLowerCase().includes('@purpose')) {
          purpose = commentText.replace(/@purpose/i, '').trim();
        } else if (!description) {
          description = commentText + '\n' + description;
        }
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `Function ${name}`;
    }
    
    purpose = purpose.trim();
    if (!purpose) {
      purpose = `Implements functionality for ${name}`;
    }
    
    functions.push(createFunction(
      projectId,
      name,
      description,
      parameters,
      returnTypeString,
      `Returns ${returnTypeString}`,
      implementation,
      filePath,
      startLine,
      endLine,
      purpose
    ));
  }
  
  // Class method pattern
  const classMethodPattern = /(?:public|private|protected)?\s*(?:async\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*:\s*([^{]*))?/g;
  
  while ((match = classMethodPattern.exec(content)) !== null) {
    const name = match[1];
    // Skip constructor
    if (name === 'constructor') {
      continue;
    }
    
    const paramsString = match[2];
    const returnTypeString = match[3] ? match[3].trim() : 'void';
    
    const startLine = content.substring(0, match.index).split('\n').length;
    
    // Find the end of the method
    let braceCount = 0;
    let endLine = startLine;
    let foundOpeningBrace = false;
    
    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (!foundOpeningBrace && line.includes('{')) {
        foundOpeningBrace = true;
        braceCount++;
      } else if (foundOpeningBrace) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }
    }
    
    // Extract method implementation
    const implementation = lines.slice(startLine - 1, endLine).join('\n');
    
    // Parse parameters
    const parameters: Parameter[] = paramsString.split(',')
      .filter(param => param.trim())
      .map(param => {
        const paramParts = param.trim().split(':');
        const paramName = paramParts[0].trim();
        const isOptional = paramName.endsWith('?');
        const cleanName = isOptional ? paramName.slice(0, -1) : paramName;
        const paramType = paramParts.length > 1 ? paramParts[1].trim() : 'any';
        
        return {
          name: cleanName,
          type: paramType,
          description: `Parameter ${cleanName}`,
          isOptional
        };
      });
    
    // Try to extract description and purpose from comments above the method
    let description = '';
    let purpose = '';
    let i = startLine - 2;
    
    while (i >= 0 && i >= startLine - 20) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('*')) {
        const commentText = line.replace(/^\/\/\s*|\*\s*/, '');
        
        if (commentText.toLowerCase().includes('@description')) {
          description = commentText.replace(/@description/i, '').trim();
        } else if (commentText.toLowerCase().includes('@purpose')) {
          purpose = commentText.replace(/@purpose/i, '').trim();
        } else if (!description) {
          description = commentText + '\n' + description;
        }
      } else if (!line.startsWith('/*')) {
        break;
      }
      i--;
    }
    
    description = description.trim();
    if (!description) {
      description = `Method ${name}`;
    }
    
    purpose = purpose.trim();
    if (!purpose) {
      purpose = `Implements functionality for ${name}`;
    }
    
    functions.push(createFunction(
      projectId,
      name,
      description,
      parameters,
      returnTypeString,
      `Returns ${returnTypeString}`,
      implementation,
      filePath,
      startLine,
      endLine,
      purpose
    ));
  }
  
  return functions;
}

/**
 * Find files recursively in a directory
 * @param dir Directory to search
 * @param pattern File pattern to match (e.g., '*.ts')
 * @returns Array of file paths
 */
export async function findFiles(dir: string, pattern: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.codenexus') {
        continue;
      }
      
      const subFiles = await findFiles(fullPath, pattern);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      if (matchPattern(entry.name, pattern)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Check if a filename matches a pattern
 * @param filename Filename to check
 * @param pattern Pattern to match (e.g., '*.ts')
 * @returns Whether the filename matches the pattern
 */
function matchPattern(filename: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }
  
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
  return regex.test(filename);
}

/**
 * Get relative path from project root
 * @param projectPath Project root path
 * @param filePath File path
 * @returns Relative path
 */
export function getRelativePath(projectPath: string, filePath: string): string {
  return path.relative(projectPath, filePath);
}

/**
 * Extract schema from TypeScript interface or type
 * @param content File content
 * @param typeName Type name to extract
 * @returns Schema or null if not found
 */
export function extractSchema(content: string, typeName: string): Schema | null {
  // This is a simplified implementation
  // A more sophisticated implementation would use TypeScript compiler API
  
  const interfacePattern = new RegExp(`interface\\s+${typeName}\\s*{([^}]*)}`, 's');
  const typePattern = new RegExp(`type\\s+${typeName}\\s*=\\s*({[^}]*})`, 's');
  
  let match = interfacePattern.exec(content);
  if (!match) {
    match = typePattern.exec(content);
  }
  
  if (match) {
    return {
      contentType: 'application/json',
      definition: match[1].trim()
    };
  }
  
  return null;
}