import { StorageManager } from './storage-manager';
import { Project } from '../models/project';
import { ApiEndpoint } from '../models/api-endpoint';
import { Function } from '../models/function';
import { AppDataSource, initializeDataSource } from '../db/data-source';
import { ProjectEntity } from '../entities/project.entity';
import { ApiEndpointEntity } from '../entities/api-endpoint.entity';
import { FunctionEntity } from '../entities/function.entity';
import { Repository, Like, In } from 'typeorm';

/**
 * TypeORM-based storage implementation for CodeNexus
 * Stores data in a PostgreSQL database using TypeORM
 */
export class TypeORMStorage implements StorageManager {
  private projectRepository: Repository<ProjectEntity>;
  private apiEndpointRepository: Repository<ApiEndpointEntity>;
  private functionRepository: Repository<FunctionEntity>;
  
  /**
   * Create a new TypeORMStorage instance
   */
  constructor() {
    // Repositories will be initialized in the initialize method
  }
  
  /**
   * Initialize the storage by connecting to the database
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the data source
      const dataSource = await initializeDataSource();
      
      // Get repositories
      this.projectRepository = dataSource.getRepository(ProjectEntity);
      this.apiEndpointRepository = dataSource.getRepository(ApiEndpointEntity);
      this.functionRepository = dataSource.getRepository(FunctionEntity);
      
      console.log('TypeORM storage initialized');
    } catch (error) {
      console.error('Error initializing TypeORM storage:', error);
      throw error;
    }
  }
  
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    const projectEntities = await this.projectRepository.find();
    return projectEntities.map(this.mapProjectEntityToModel);
  }
  
  /**
   * Get a project by ID
   * @param id Project ID
   */
  async getProject(id: string): Promise<Project | null> {
    const projectEntity = await this.projectRepository.findOne({
      where: { id },
      relations: ['apiEndpoints', 'functions']
    });
    
    if (!projectEntity) {
      return null;
    }
    
    return this.mapProjectEntityToModel(projectEntity);
  }
  
  /**
   * Save a project
   * @param project Project to save
   */
  async saveProject(project: Project): Promise<void> {
    // Convert model to entity
    const projectEntity = this.mapProjectModelToEntity(project);
    
    // Save entity
    await this.projectRepository.save(projectEntity);
  }
  
  /**
   * Delete a project
   * @param id Project ID
   */
  async deleteProject(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
  
  /**
   * Get all API endpoints for a project
   * @param projectId Project ID
   */
  async getApiEndpoints(projectId: string): Promise<ApiEndpoint[]> {
    const apiEndpointEntities = await this.apiEndpointRepository.find({
      where: { projectId },
      relations: ['relatedFunctions']
    });
    
    return apiEndpointEntities.map(this.mapApiEndpointEntityToModel);
  }
  
  /**
   * Get an API endpoint by ID
   * @param id API endpoint ID
   */
  async getApiEndpoint(id: string): Promise<ApiEndpoint | null> {
    const apiEndpointEntity = await this.apiEndpointRepository.findOne({
      where: { id },
      relations: ['relatedFunctions']
    });
    
    if (!apiEndpointEntity) {
      return null;
    }
    
    return this.mapApiEndpointEntityToModel(apiEndpointEntity);
  }
  
  /**
   * Save an API endpoint
   * @param endpoint API endpoint to save
   */
  async saveApiEndpoint(endpoint: ApiEndpoint): Promise<void> {
    // Convert model to entity
    const apiEndpointEntity = this.mapApiEndpointModelToEntity(endpoint);
    
    // Save entity
    await this.apiEndpointRepository.save(apiEndpointEntity);
    
    // Update project to include this endpoint
    const project = await this.getProject(endpoint.projectId);
    if (project) {
      if (!project.apiEndpoints.includes(endpoint.id)) {
        project.apiEndpoints.push(endpoint.id);
        project.updatedAt = new Date().toISOString();
        await this.saveProject(project);
      }
    }
  }
  
  /**
   * Delete an API endpoint
   * @param id API endpoint ID
   */
  async deleteApiEndpoint(id: string): Promise<void> {
    // Get the endpoint to find its project
    const endpoint = await this.getApiEndpoint(id);
    
    if (endpoint) {
      // Update the project to remove this endpoint
      const project = await this.getProject(endpoint.projectId);
      if (project) {
        project.apiEndpoints = project.apiEndpoints.filter(epId => epId !== id);
        project.updatedAt = new Date().toISOString();
        await this.saveProject(project);
      }
    }
    
    // Delete the endpoint
    await this.apiEndpointRepository.delete(id);
  }
  
  /**
   * Get all functions for a project
   * @param projectId Project ID
   */
  async getFunctions(projectId: string): Promise<Function[]> {
    const functionEntities = await this.functionRepository.find({
      where: { projectId },
      relations: ['relatedApiEndpoints', 'relatedFunctions']
    });
    
    return functionEntities.map(this.mapFunctionEntityToModel);
  }
  
  /**
   * Get a function by ID
   * @param id Function ID
   */
  async getFunction(id: string): Promise<Function | null> {
    const functionEntity = await this.functionRepository.findOne({
      where: { id },
      relations: ['relatedApiEndpoints', 'relatedFunctions']
    });
    
    if (!functionEntity) {
      return null;
    }
    
    return this.mapFunctionEntityToModel(functionEntity);
  }
  
  /**
   * Save a function
   * @param func Function to save
   */
  async saveFunction(func: Function): Promise<void> {
    // Convert model to entity
    const functionEntity = this.mapFunctionModelToEntity(func);
    
    // Save entity
    await this.functionRepository.save(functionEntity);
    
    // Update project to include this function
    const project = await this.getProject(func.projectId);
    if (project) {
      if (!project.functions.includes(func.id)) {
        project.functions.push(func.id);
        project.updatedAt = new Date().toISOString();
        await this.saveProject(project);
      }
    }
    
    // Update related API endpoints
    for (const endpointId of func.relatedApiEndpoints) {
      const endpoint = await this.getApiEndpoint(endpointId);
      if (endpoint && !endpoint.relatedFunctions.includes(func.id)) {
        endpoint.relatedFunctions.push(func.id);
        endpoint.updatedAt = new Date().toISOString();
        await this.saveApiEndpoint(endpoint);
      }
    }
  }
  
  /**
   * Delete a function
   * @param id Function ID
   */
  async deleteFunction(id: string): Promise<void> {
    // Get the function to find its project and related endpoints
    const func = await this.getFunction(id);
    
    if (func) {
      // Update the project to remove this function
      const project = await this.getProject(func.projectId);
      if (project) {
        project.functions = project.functions.filter(fId => fId !== id);
        project.updatedAt = new Date().toISOString();
        await this.saveProject(project);
      }
      
      // Update related API endpoints
      for (const endpointId of func.relatedApiEndpoints) {
        const endpoint = await this.getApiEndpoint(endpointId);
        if (endpoint) {
          endpoint.relatedFunctions = endpoint.relatedFunctions.filter(fId => fId !== id);
          endpoint.updatedAt = new Date().toISOString();
          await this.saveApiEndpoint(endpoint);
        }
      }
    }
    
    // Delete the function
    await this.functionRepository.delete(id);
  }
  
  /**
   * Search for projects, API endpoints, or functions
   * @param query Search query
   * @param type Type of entity to search for (optional)
   */
  async search(query: string, type?: 'project' | 'api-endpoint' | 'function'): Promise<Array<Project | ApiEndpoint | Function>> {
    const results: Array<Project | ApiEndpoint | Function> = [];
    const searchQuery = `%${query.toLowerCase()}%`;
    
    // Search projects
    if (!type || type === 'project') {
      const projects = await this.projectRepository.find({
        where: [
          { name: Like(searchQuery) },
          { description: Like(searchQuery) }
        ]
      });
      
      results.push(...projects.map(this.mapProjectEntityToModel));
    }
    
    // Search API endpoints
    if (!type || type === 'api-endpoint') {
      const apiEndpoints = await this.apiEndpointRepository.find({
        where: [
          { path: Like(searchQuery) },
          { description: Like(searchQuery) },
          { method: Like(searchQuery) }
        ],
        relations: ['relatedFunctions']
      });
      
      results.push(...apiEndpoints.map(this.mapApiEndpointEntityToModel));
    }
    
    // Search functions
    if (!type || type === 'function') {
      const functions = await this.functionRepository.find({
        where: [
          { name: Like(searchQuery) },
          { description: Like(searchQuery) },
          { purpose: Like(searchQuery) },
          { implementation: Like(searchQuery) }
        ],
        relations: ['relatedApiEndpoints', 'relatedFunctions']
      });
      
      results.push(...functions.map(this.mapFunctionEntityToModel));
    }
    
    return results;
  }
  
  /**
   * Map a ProjectEntity to a Project model
   * @param entity ProjectEntity
   * @returns Project model
   */
  private mapProjectEntityToModel(entity: ProjectEntity): Project {
    return {
      id: entity.id,
      name: entity.name,
      path: entity.path,
      description: entity.description,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      apiEndpoints: entity.apiEndpoints ? entity.apiEndpoints.map(e => e.id) : [],
      functions: entity.functions ? entity.functions.map(f => f.id) : []
    };
  }
  
  /**
   * Map a Project model to a ProjectEntity
   * @param model Project model
   * @returns ProjectEntity
   */
  private mapProjectModelToEntity(model: Project): ProjectEntity {
    const entity = new ProjectEntity();
    entity.id = model.id;
    entity.name = model.name;
    entity.path = model.path;
    entity.description = model.description;
    entity.createdAt = new Date(model.createdAt);
    entity.updatedAt = new Date(model.updatedAt);
    
    return entity;
  }
  
  /**
   * Map an ApiEndpointEntity to an ApiEndpoint model
   * @param entity ApiEndpointEntity
   * @returns ApiEndpoint model
   */
  private mapApiEndpointEntityToModel(entity: ApiEndpointEntity): ApiEndpoint {
    const requestSchema = entity.requestContentType ? {
      contentType: entity.requestContentType,
      definition: entity.requestDefinition,
      example: entity.requestExample
    } : undefined;
    
    const responseSchema = entity.responseContentType ? {
      contentType: entity.responseContentType,
      definition: entity.responseDefinition,
      example: entity.responseExample
    } : undefined;
    
    return {
      id: entity.id,
      projectId: entity.projectId,
      method: entity.method,
      path: entity.path,
      description: entity.description,
      requestSchema,
      responseSchema,
      implementationPath: entity.implementationPath,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      tags: entity.tags || [],
      relatedFunctions: entity.relatedFunctions ? entity.relatedFunctions.map(f => f.id) : []
    };
  }
  
  /**
   * Map an ApiEndpoint model to an ApiEndpointEntity
   * @param model ApiEndpoint model
   * @returns ApiEndpointEntity
   */
  private mapApiEndpointModelToEntity(model: ApiEndpoint): ApiEndpointEntity {
    const entity = new ApiEndpointEntity();
    entity.id = model.id;
    entity.projectId = model.projectId;
    entity.method = model.method;
    entity.path = model.path;
    entity.description = model.description;
    
    if (model.requestSchema) {
      entity.requestContentType = model.requestSchema.contentType;
      entity.requestDefinition = model.requestSchema.definition;
      entity.requestExample = model.requestSchema.example || null;
    }
    
    if (model.responseSchema) {
      entity.responseContentType = model.responseSchema.contentType;
      entity.responseDefinition = model.responseSchema.definition;
      entity.responseExample = model.responseSchema.example || null;
    }
    
    entity.implementationPath = model.implementationPath;
    entity.createdAt = new Date(model.createdAt);
    entity.updatedAt = new Date(model.updatedAt);
    entity.tags = model.tags;
    
    return entity;
  }
  
  /**
   * Map a FunctionEntity to a Function model
   * @param entity FunctionEntity
   * @returns Function model
   */
  private mapFunctionEntityToModel(entity: FunctionEntity): Function {
    return {
      id: entity.id,
      projectId: entity.projectId,
      name: entity.name,
      description: entity.description,
      parameters: entity.parameters,
      returnType: entity.returnType,
      returnDescription: entity.returnDescription,
      implementation: entity.implementation,
      implementationPath: entity.implementationPath,
      startLine: entity.startLine,
      endLine: entity.endLine,
      purpose: entity.purpose,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      tags: entity.tags || [],
      relatedApiEndpoints: entity.relatedApiEndpoints ? entity.relatedApiEndpoints.map(e => e.id) : [],
      relatedFunctions: entity.relatedFunctions ? entity.relatedFunctions.map(f => f.id) : [],
      usageExamples: entity.usageExamples || []
    };
  }
  
  /**
   * Map a Function model to a FunctionEntity
   * @param model Function model
   * @returns FunctionEntity
   */
  private mapFunctionModelToEntity(model: Function): FunctionEntity {
    const entity = new FunctionEntity();
    entity.id = model.id;
    entity.projectId = model.projectId;
    entity.name = model.name;
    entity.description = model.description;
    entity.parameters = model.parameters;
    entity.returnType = model.returnType;
    entity.returnDescription = model.returnDescription;
    entity.implementation = model.implementation;
    entity.implementationPath = model.implementationPath;
    entity.startLine = model.startLine;
    entity.endLine = model.endLine;
    entity.purpose = model.purpose;
    entity.createdAt = new Date(model.createdAt);
    entity.updatedAt = new Date(model.updatedAt);
    entity.tags = model.tags;
    entity.usageExamples = model.usageExamples;
    
    return entity;
  }
}