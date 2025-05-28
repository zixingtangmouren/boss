import { MCP_EVENT } from './events';
import { McpService } from './mcp.service';
import { MainIpcService } from '../ipc';
import { RegisterMcpServerDto } from './dto/register-mcp-server.dto';

export class McpController {
  private mcpService: McpService;
  private mainIpcService: MainIpcService;

  constructor(mcpService: McpService, mainIpcService: MainIpcService) {
    this.mcpService = mcpService;
    this.mainIpcService = mainIpcService;
  }

  registerEvents() {
    const { mainIpcService } = this;

    mainIpcService.addEventListener(MCP_EVENT.REGISTER_MCP_SERVER, async (event) => {
      const data = event.data as RegisterMcpServerDto;
      let success = false;
      try {
        const mcpServer = await this.mcpService.registerMcpServer(data);
        if (mcpServer) {
          await this.mcpService.connectToServer(mcpServer);
          success = true;
        }
      } catch (error) {
        console.error(error);
      } finally {
        mainIpcService.postMessage(event.from, MCP_EVENT.REGISTER_MCP_SERVER, {
          success
        });
      }
    });

    mainIpcService.addEventListener(MCP_EVENT.GET_MCP_SERVER_LIST, async (event) => {
      const mcpServerList = await this.mcpService.getMcpServerListWithStatus();
      mainIpcService.postMessage(event.from, MCP_EVENT.GET_MCP_SERVER_LIST, mcpServerList);
    });
  }
}
