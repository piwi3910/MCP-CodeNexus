import "reflect-metadata";
import { initializeDataSource } from "./data-source";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    console.log("Initializing database connection...");
    const dataSource = await initializeDataSource();
    
    console.log("Synchronizing database schema...");
    await dataSource.synchronize(true); // Drop existing tables and recreate them
    
    console.log("Database schema synchronized successfully!");
    
    // Log the entities that were synchronized
    console.log("Entities:");
    console.log("- ProjectEntity");
    console.log("- ApiEndpointEntity");
    console.log("- FunctionEntity");
    
    // Close the connection
    await dataSource.destroy();
    console.log("Database connection closed.");
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run migrations
runMigrations().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});