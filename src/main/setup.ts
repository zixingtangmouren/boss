import WindowsService from './windows-service';
import { WINDOWS_NAME } from '../common/constants';
import { MainIpcService } from './ipc-service';
import { IPC_EVENT } from './ipc-service/constants';

export function setup() {
  // 注册主窗口服务
  const windowsService = new WindowsService();
  windowsService.registerWindow(WINDOWS_NAME.MAIN_WINDOW, {
    width: 800,
    height: 600
  });
  windowsService.registerWindow(WINDOWS_NAME.CHAT_WINDOW, {
    width: 800,
    height: 600
  });
  windowsService.openWindow(WINDOWS_NAME.MAIN_WINDOW);

  // 注册主进程 IPC 服务
  const mainIpcService = new MainIpcService('main');
  mainIpcService.addEventListener(IPC_EVENT.OPEN_WINDOW, (data) => {
    const { name } = data.data as { name: string };
    windowsService.openWindow(name);
  });

  return {
    windowsService,
    mainIpcService
  };
}
