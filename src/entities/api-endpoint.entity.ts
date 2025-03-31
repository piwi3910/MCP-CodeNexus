import { Entity, PrimaryColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { ProjectEntity } from "./project.entity";
import { FunctionEntity } from "./function.entity";

/**
 * HTTP methods supported by API endpoints
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * API Endpoint entity representing an API endpoint tracked by CodeNexus
 */
@Entity("api_endpoints")
export class ApiEndpointEntity {
  /**
   * Unique identifier for the API endpoint
   */
  @PrimaryColumn()
  id: string;

  /**
   * ID of the project this endpoint belongs to
   */
  @Column({ name: "project_id" })
  projectId: string;

  /**
   * Project this endpoint belongs to
   */
  @ManyToOne(() => ProjectEntity, project => project.apiEndpoints)
  @JoinColumn({ name: "project_id" })
  project: ProjectEntity;

  /**
   * HTTP method of the endpoint
   */
  @Column()
  method: HttpMethod;

  /**
   * Path of the endpoint
   */
  @Column()
  path: string;

  /**
   * Description of the endpoint
   */
  @Column("text")
  description: string;

  /**
   * Request schema content type
   */
  @Column({ name: "request_content_type", nullable: true })
  requestContentType: string;

  /**
   * Request schema definition
   */
  @Column({ name: "request_definition", type: "text", nullable: true })
  requestDefinition: string;

  /**
   * Request schema example
   */
  @Column({ name: "request_example", type: "text", nullable: true, default: null })
  requestExample: string;

  /**
   * Response schema content type
   */
  @Column({ name: "response_content_type", nullable: true })
  responseContentType: string;

  /**
   * Response schema definition
   */
  @Column({ name: "response_definition", type: "text", nullable: true })
  responseDefinition: string;

  /**
   * Response schema example
   */
  @Column({ name: "response_example", type: "text", nullable: true, default: null })
  responseExample: string;

  /**
   * File path where the endpoint is implemented
   */
  @Column({ name: "implementation_path" })
  implementationPath: string;

  /**
   * Date when the endpoint was first tracked
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /**
   * Date when the endpoint was last updated
   */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  /**
   * Tags or categories for the endpoint
   */
  @Column("simple-array", { nullable: true })
  tags: string[];

  /**
   * Functions related to this endpoint
   */
  @ManyToMany(() => FunctionEntity, func => func.relatedApiEndpoints)
  @JoinTable({
    name: "api_endpoint_function",
    joinColumn: { name: "api_endpoint_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "function_id", referencedColumnName: "id" }
  })
  relatedFunctions: FunctionEntity[];
}