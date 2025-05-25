import { app, BrowserWindow } from 'electron';
import { MainIpcService } from '../ipc';
import { WINDOWS_SERVICE_EVENT } from './events';
import { WindowsService } from './windows.service';

export class WindowsController {
  private mainIpcService: MainIpcService;
  private windowsService: WindowsService;

  constructor(mainIpcService: MainIpcService, windowsService: WindowsService) {
    this.mainIpcService = mainIpcService;
    this.windowsService = windowsService;
  }

  registerEvents() {
    const { mainIpcService, windowsService } = this;

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0)
        windowsService.openWindow(windowsService.defaultProcessKey);
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    mainIpcService.addEventListener(WINDOWS_SERVICE_EVENT.OPEN_WINDOW, (event) => {
      const data = event.data as { name: string };
      windowsService.openWindow(data.name);
    });

    mainIpcService.addEventListener(WINDOWS_SERVICE_EVENT.CLOSE_WINDOW, (event) => {
      const data = event.data as { name: string };
      windowsService.closeWindow(data.name);
    });

    mainIpcService.addEventListener(WINDOWS_SERVICE_EVENT.GET_ALL_WINDOWS, (event) => {
      const res = windowsService.getAllWindows();
      mainIpcService.postMessage(event.from, WINDOWS_SERVICE_EVENT.GET_ALL_WINDOWS, res);
    });
  }
}
