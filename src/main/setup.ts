import WindowsService from './windows-service';
import { WINDOWS_NAME } from '../common/constants';
import { MainIpcService } from './ipc-service';

export function setup() {
  const windowsService = new WindowsService();
  // 注册主窗口
  windowsService.registerWindow(WINDOWS_NAME.MAIN_WINDOW, {
    width: 800,
    height: 600
  });
  // 注册聊天窗口
  windowsService.registerWindow(WINDOWS_NAME.CHAT_WINDOW, {
    width: 800,
    height: 600
  });

  windowsService.openWindow(WINDOWS_NAME.MAIN_WINDOW);

  const mainIpcService = new MainIpcService('main');

  return {
    windowsService,
    mainIpcService
  };
}
