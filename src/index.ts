import "reflect-metadata";
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { CodeNexusServer } from './server';

/**
 * MCP message types
 */
enum MessageType {
  INITIALIZE = 'initialize',
  EXECUTE_TOOL = 'execute_tool',
  ACCESS_RESOURCE = 'access_resource',
  SHUTDOWN = 'shutdown'
}

/**
 * MCP message interface
 */
interface MCPMessage {
  type: MessageType;
  id: string;
  tool_name?: string;
  arguments?: Record<string, unknown>;
  uri?: string;
  [key: string]: unknown; // For other properties
}

/**
 * Main class for the MCP server
 */
class MCPServerMain {
  private server: CodeNexusServer;
  private rl: readline.Interface;
  
  /**
   * Create a new MCPServerMain instance
   * @param projectPath Path to the project root directory
   */
  constructor(projectPath: string) {
    this.server = new CodeNexusServer(projectPath);
    
    // Create readline interface for stdio communication
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
  }
  
  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      // Initialize the server
      await this.server.initialize();
      
      // Listen for incoming messages
      this.rl.on('line', (line) => this.handleMessage(line));
      
      // Handle process exit
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
      // Log server start
      console.error('CodeNexus MCP server started');
      
      // Send ready message
      this.sendResponse({
        type: 'ready',
        id: 'server',
        name: this.server.getName(),
        description: this.server.getDescription(),
        tools: this.server.getTools(),
        resources: this.server.getResources()
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  }
  
  /**
   * Handle an incoming message
   * @param line Message line
   */
  private async handleMessage(line: string): Promise<void> {
    try {
      // Parse message
      const message = JSON.parse(line) as MCPMessage;
      
      // Process message based on type
      switch (message.type) {
        case MessageType.INITIALIZE:
          await this.handleInitialize(message);
          break;
        case MessageType.EXECUTE_TOOL:
          await this.handleExecuteTool(message);
          break;
        case MessageType.ACCESS_RESOURCE:
          await this.handleAccessResource(message);
          break;
        case MessageType.SHUTDOWN:
          await this.handleShutdown(message);
          break;
        default:
          this.sendError(message.id, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError('unknown', error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Handle initialize message
   * @param message Initialize message
   */
  private async handleInitialize(message: MCPMessage): Promise<void> {
    try {
      // Server is already initialized in start()
      this.sendResponse({
        type: 'initialize_result',
        id: message.id,
        success: true,
        name: this.server.getName(),
        description: this.server.getDescription(),
        tools: this.server.getTools(),
        resources: this.server.getResources()
      });
    } catch (error) {
      this.sendError(message.id, error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Handle execute_tool message
   * @param message Execute tool message
   */
  private async handleExecuteTool(message: MCPMessage): Promise<void> {
    try {
      const { tool_name, arguments: args } = message;
      
      if (!tool_name) {
        this.sendError(message.id, 'Tool name is required');
        return;
      }
      
      // Execute tool
      const result = await this.server.executeTool(tool_name, args || {});
      
      // Send response
      this.sendResponse({
        type: 'execute_tool_result',
        id: message.id,
        success: result.success !== false,
        result: result
      });
    } catch (error) {
      this.sendError(message.id, error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Handle access_resource message
   * @param message Access resource message
   */
  private async handleAccessResource(message: MCPMessage): Promise<void> {
    try {
      const { uri } = message;
      
      if (!uri) {
        this.sendError(message.id, 'Resource URI is required');
        return;
      }
      
      // Access resource
      const result = await this.server.accessResource(uri);
      
      // Send response
      this.sendResponse({
        type: 'access_resource_result',
        id: message.id,
        success: result.success !== false,
        result: result
      });
    } catch (error) {
      this.sendError(message.id, error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Handle shutdown message
   * @param message Shutdown message
   */
  private async handleShutdown(message: MCPMessage): Promise<void> {
    try {
      // Send response before shutting down
      this.sendResponse({
        type: 'shutdown_result',
        id: message.id,
        success: true
      });
      
      // Shutdown
      this.shutdown();
    } catch (error) {
      this.sendError(message.id, error instanceof Error ? error.message : String(error));
      this.shutdown();
    }
  }
  
  /**
   * Send a response
   * @param response Response object
   */
  private sendResponse(response: Record<string, unknown>): void {
    console.log(JSON.stringify(response));
  }
  
  /**
   * Send an error response
   * @param id Message ID
   * @param error Error message
   */
  private sendError(id: string, error: string): void {
    this.sendResponse({
      type: 'error',
      id,
      error
    });
  }
  
  /**
   * Shutdown the server
   */
  private shutdown(): void {
    this.rl.close();
    process.exit(0);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Load environment variables
    dotenv.config();
    
    // Get project path from command-line arguments
    const projectPath = process.argv[2] || process.cwd();
    
    // Create and start server
    const server = new MCPServerMain(projectPath);
    await server.start();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});