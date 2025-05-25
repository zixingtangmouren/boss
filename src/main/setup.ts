import { WindowsModule } from './windows';
import { MainIpcService } from './ipc';
import { DatabaseModule } from './database';
export async function setup() {
  // 注册主进程 IPC 服务
  const mainIpcService = new MainIpcService('main');

  // 注册主窗口服务
  const windowsModule = new WindowsModule(mainIpcService);
  windowsModule.init();

  // 注册本地数据库服务
  const databaseModule = new DatabaseModule(mainIpcService);
  await databaseModule.init();

  return {
    windowsModule,
    databaseModule,
    mainIpcService
  };
}
