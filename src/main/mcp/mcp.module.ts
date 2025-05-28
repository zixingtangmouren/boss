import { McpService } from './mcp.service';
import { MainIpcService } from '../ipc';
import { DatabaseService } from '../database/database.service';
import { McpController } from './mcp.controller';

export class McpModule {
  public mcpService: McpService;
  private mainIpcService: MainIpcService;
  private mcpController: McpController;

  constructor(databaseService: DatabaseService, mainIpcService: MainIpcService) {
    this.mcpService = new McpService(databaseService);
    this.mainIpcService = mainIpcService;
    this.mcpController = new McpController(this.mcpService, this.mainIpcService);
  }

  async init() {
    this.mcpController.registerEvents();
  }
}
