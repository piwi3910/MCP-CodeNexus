import { Entity, PrimaryColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { ProjectEntity } from "./project.entity";
import { ApiEndpointEntity } from "./api-endpoint.entity";

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
 * Function entity representing a function tracked by CodeNexus
 */
@Entity("functions")
export class FunctionEntity {
  /**
   * Unique identifier for the function
   */
  @PrimaryColumn()
  id: string;

  /**
   * ID of the project this function belongs to
   */
  @Column({ name: "project_id" })
  projectId: string;

  /**
   * Project this function belongs to
   */
  @ManyToOne(() => ProjectEntity, project => project.functions)
  @JoinColumn({ name: "project_id" })
  project: ProjectEntity;

  /**
   * Name of the function
   */
  @Column()
  name: string;

  /**
   * Description of the function
   */
  @Column("text")
  description: string;

  /**
   * Parameters of the function (stored as JSON)
   */
  @Column("jsonb")
  parameters: Parameter[];

  /**
   * Return type of the function
   */
  @Column({ name: "return_type" })
  returnType: string;

  /**
   * Return description
   */
  @Column({ name: "return_description", type: "text" })
  returnDescription: string;

  /**
   * Code snippet of the function implementation
   */
  @Column("text")
  implementation: string;

  /**
   * File path where the function is implemented
   */
  @Column({ name: "implementation_path" })
  implementationPath: string;

  /**
   * Line number where the function starts in the file
   */
  @Column({ name: "start_line" })
  startLine: number;

  /**
   * Line number where the function ends in the file
   */
  @Column({ name: "end_line" })
  endLine: number;

  /**
   * Purpose or reason why the function was implemented
   */
  @Column("text")
  purpose: string;

  /**
   * Date when the function was first tracked
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /**
   * Date when the function was last updated
   */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  /**
   * Tags or categories for the function
   */
  @Column("simple-array", { nullable: true })
  tags: string[];

  /**
   * API endpoints related to this function
   */
  @ManyToMany(() => ApiEndpointEntity, apiEndpoint => apiEndpoint.relatedFunctions)
  relatedApiEndpoints: ApiEndpointEntity[];

  /**
   * Other functions related to this function
   */
  @ManyToMany(() => FunctionEntity)
  @JoinTable({
    name: "function_relation",
    joinColumn: { name: "function_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "related_function_id", referencedColumnName: "id" }
  })
  relatedFunctions: FunctionEntity[];

  /**
   * Usage examples of the function
   */
  @Column("simple-array", { nullable: true })
  usageExamples: string[];
}