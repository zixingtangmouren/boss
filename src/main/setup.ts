import { AgentsModule } from './agents/agents.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { MainIpcService } from './ipc';
import { McpModule } from './mcp/mcp.module';
import { MemonyModule } from './memony/memony.module';
import { ModelsModule } from './models/models.module';
import { WindowsModule } from './windows/window.module';

export async function setup() {
  const start = Date.now();
  // 注册主进程 IPC 服务
  const mainIpcService = new MainIpcService('main');

  // 注册主窗口服务
  const windowsModule = new WindowsModule(mainIpcService);
  windowsModule.init();

  // 注册本地数据库服务
  const databaseModule = new DatabaseModule(mainIpcService);
  await databaseModule.init();

  // 注册模型服务
  const modelsModule = new ModelsModule(mainIpcService, databaseModule.databaseService);
  modelsModule.init();

  // 注册 agents 服务
  const agentsModule = new AgentsModule(mainIpcService, databaseModule.databaseService);
  agentsModule.init();

  // 注册记忆服务
  const memonyModule = new MemonyModule(mainIpcService, databaseModule.databaseService);
  memonyModule.init();

  // 注册 mcp 服务
  const mcpModule = new McpModule(databaseModule.databaseService, mainIpcService);
  mcpModule.init();

  // 注册 chat 服务
  const chatModule = new ChatModule(
    mainIpcService,
    agentsModule.agentsService,
    modelsModule.modelsService,
    memonyModule.memonyService,
    mcpModule.mcpService
  );
  chatModule.init();

  console.log(`setup time: ${Date.now() - start}ms`);

  return {
    windowsModule,
    databaseModule,
    mainIpcService
  };
}
