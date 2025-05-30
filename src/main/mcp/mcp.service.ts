import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import { DatabaseService } from '../database/database.service';
import { TableManager } from '../database/table-manager';
import { RegisterMcpServerDto } from './dto/register-mcp-server.dto';
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
    this.connectToServer(this.mcpServerList);
  }

  async connectToServer(mcpServers: McpEntity[]) {
    let success = false;
    for (const mcpServer of mcpServers) {
      const client = new Client({
        name: mcpServer.serverName,
        version: '1.0.0'
      });
      try {
        const transport = new StdioClientTransport({
          command: mcpServer.command,
          args: [...mcpServer.args],
          env: {
            ...mcpServer.env,
            PATH: process.env.PATH || ''
          }
        });

        client.connect(transport);

        const toolsResult = await client.listTools();
        const tools = toolsResult.tools.map((toolInfo) => {
          return new DynamicStructuredTool({
            func: async (args) => {
              const result = await client.callTool({
                name: toolInfo.name,
                arguments: args as Record<string, unknown>
              });
              console.log('result >>>', result);

              if (Array.isArray(result.content)) {
                return result.content
                  .map((item) => {
                    return item.text;
                  })
                  .join('\n');
              }
              return result;
            },
            name: toolInfo.name,
            description: toolInfo.description || '',
            // @ts-ignore(TODO: 后续需要优化)
            schema: JSONSchemaToZod.convert(toolInfo.inputSchema)
          });
        });

        console.log(
          'Connected to server with tools:',
          tools.map(({ name }) => name)
        );

        this.mcpServers.set(mcpServer.id, {
          mcpServerName: mcpServer.serverName,
          client,
          tools,
          status: 'connected'
        });

        success = true;
      } catch (e) {
        console.log('Failed to connect to MCP server: ', e);
        this.mcpServers.set(mcpServer.id, {
          mcpServerName: mcpServer.serverName,
          client,
          tools: [],
          status: 'disconnected'
        });
      }
    }
    return success;
  }

  async getTools(mcpServerNames: string[]) {
    const tools = mcpServerNames.map((name) => {
      const { tools } = this.mcpServers.get(name) || {};
      return tools;
    });
    return tools;
  }

  async getToolsByIds(mcpServerIds: string[]) {
    const tools = mcpServerIds.flatMap((id) => {
      const { tools } = this.mcpServers.get(id) || {};
      return tools;
    });
    return tools;
  }

  async registerMcpServer(registerMcpServerDto: RegisterMcpServerDto) {
    const newMcpServerList: McpEntity[] = [];
    for (const [key, value] of Object.entries(registerMcpServerDto)) {
      const mcpServer = await this.table.insert({
        ...value,
        serverName: key
      });
      newMcpServerList.push(mcpServer);
      this.mcpServerList.push(mcpServer);
    }
    return newMcpServerList;
  }

  async getMcpServerList() {
    const mcpServerList = await this.table.findAll();
    return mcpServerList;
  }

  async getMcpServerListWithStatus() {
    return this.mcpServerList.map((mcpServer) => {
      const { status } = this.mcpServers.get(mcpServer.id) || {};
      return {
        mcpServerName: mcpServer.serverName,
        status: status || 'disconnected',
        mcpServerId: mcpServer.id
      };
    });
  }
}
