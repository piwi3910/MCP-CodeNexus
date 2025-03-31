import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs-extra";

// Load environment variables
dotenv.config();

// Get database type from environment variables
const dbType = process.env.DB_TYPE || "sqlite";

// Common options for all database types
const commonOptions = {
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true", 
  entities: [path.join(__dirname, "..", "entities", "*.entity.{js,ts}")],
  migrations: [path.join(__dirname, "migrations", "*.{js,ts}")],
  subscribers: [path.join(__dirname, "subscribers", "*.{js,ts}")],
};

// Configure data source options based on database type
let dataSourceOptions: DataSourceOptions;

if (dbType === "postgres") {
  // PostgreSQL configuration
  dataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "codenexus",
    ...commonOptions,
  };
  console.log("Using PostgreSQL database");
} else {
  // SQLite configuration (default)
  // Ensure the data directory exists
  // Use an absolute path to avoid any path resolution issues
  const dataDir = "/Users/pascal/Documents/git/MCP-CodeNexus/data";
  console.log(`Ensuring data directory exists: ${dataDir}`);
  try {
    fs.ensureDirSync(dataDir);
  } catch (error) {
    console.error(`Error creating data directory: ${error}`);
  }
  
  const dbPath = path.join(dataDir, "codenexus.sqlite");
  dataSourceOptions = {
    type: "sqlite",
    database: dbPath,
    ...commonOptions,
  };
  console.log(`Using SQLite database at: ${dbPath}`);
}

// Create and export the DataSource
export const AppDataSource = new DataSource(dataSourceOptions);

// Initialize the data source
export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
};