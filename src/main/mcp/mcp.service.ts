import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { RegisterMcpServerDto } from './dto/register-mcp-server.dto';
import { DatabaseService } from '../database/database.service';
import { TableManager } from '../database/table-manager';
import { McpEntity } from './entites/mcp.entity';

export class McpService {
  private mcpServers: Map<
    string,
    {
      mcpServerName: string;
      client: Client;
      tools: DynamicStructuredTool[];
      status: 'connected' | 'disconnected';
    }
  > = new Map();
  private databaseService: DatabaseService;
  private table: TableManager<McpEntity>;
  private mcpServerList: McpEntity[] = [];

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;

    this.init();
  }

  async init() {
    await this.databaseService.createTable('mcp');
    this.table = await this.databaseService.getTable<McpEntity>('mcp');

    this.mcpServerList = await this.getMcpServerList();
    for (const mcpServer of this.mcpServerList) {
      this.connectToServer(mcpServer);
    }
  }

  async connectToServer(mcpServer: McpEntity) {
    const client = new Client({
      name: mcpServer.mcpServerName,
      version: '1.0.0'
    });
    try {
      const transport = new StdioClientTransport({
        command: mcpServer.command,
        args: [mcpServer.serverScriptPath]
      });

      client.connect(transport);

      const toolsResult = await client.listTools();
      const tools = toolsResult.tools.map((toolInfo) => {
        return tool(
          async (toolArgs: any) => {
            console.log(`${toolInfo.name} toolArgs >>>`, toolArgs);
            const result = await client.callTool({
              name: toolInfo.name,
              arguments: toolArgs
            });

            console.log(`${toolInfo.name} result >>>`, result);

            return result;
          },
          {
            name: toolInfo.name,
            description: toolInfo.description,
            schema: toolInfo.inputSchema
          }
        );
      });

      console.log(
        'Connected to server with tools:',
        tools.map(({ name }) => name)
      );

      this.mcpServers.set(mcpServer.id, {
        mcpServerName: mcpServer.mcpServerName,
        client,
        tools,
        status: 'connected'
      });
    } catch (e) {
      console.log('Failed to connect to MCP server: ', e);
      this.mcpServers.set(mcpServer.id, {
        mcpServerName: mcpServer.mcpServerName,
        client,
        tools: [],
        status: 'disconnected'
      });
    }
  }

  async getTools(mcpServerNames: string[]) {
    const tools = mcpServerNames.map((name) => {
      const { tools } = this.mcpServers.get(name) || {};
      return tools;
    });
    return tools;
  }

  async getToolsByIds(mcpServerIds: string[]) {
    const tools = mcpServerIds.map((id) => {
      const { tools } = this.mcpServers.get(id) || {};
      return tools;
    });
    return tools;
  }

  async registerMcpServer(registerMcpServerDto: RegisterMcpServerDto) {
    const mcpServer = await this.table.insert(registerMcpServerDto);
    return mcpServer;
  }

  async getMcpServerList() {
    const mcpServerList = await this.table.findAll();
    return mcpServerList;
  }

  async getMcpServerListWithStatus() {
    return this.mcpServerList.map((mcpServer) => {
      const { status } = this.mcpServers.get(mcpServer.id) || {};
      return {
        mcpServerName: mcpServer.mcpServerName,
        status: status || 'disconnected',
        mcpServerId: mcpServer.id
      };
    });
  }
}
