import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ApiEndpointEntity } from "./api-endpoint.entity";
import { FunctionEntity } from "./function.entity";

/**
 * Project entity representing a project tracked by CodeNexus
 */
@Entity("projects")
export class ProjectEntity {
  /**
   * Unique identifier for the project
   */
  @PrimaryColumn()
  id: string;

  /**
   * Name of the project
   */
  @Column()
  name: string;

  /**
   * Path to the project root directory
   */
  @Column()
  path: string;

  /**
   * Description of the project
   */
  @Column("text")
  description: string;

  /**
   * Date when the project was first tracked
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /**
   * Date when the project was last updated
   */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  /**
   * API endpoints associated with this project
   */
  @OneToMany(() => ApiEndpointEntity, apiEndpoint => apiEndpoint.project)
  apiEndpoints: ApiEndpointEntity[];

  /**
   * Functions associated with this project
   */
  @OneToMany(() => FunctionEntity, func => func.project)
  functions: FunctionEntity[];
}