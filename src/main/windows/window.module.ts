import { PROCESSES_NAME } from '../../common/constants';
import { WindowsController } from './windows.controller';
import { WindowsService } from './windows.service';
import { MainIpcService } from '../ipc';

export class WindowsModule {
  private windowsController: WindowsController;
  private windowsService: WindowsService;

  constructor(mainIpcService: MainIpcService) {
    this.windowsService = new WindowsService({ defaultProcessKey: PROCESSES_NAME.MAIN_WINDOW });
    this.windowsController = new WindowsController(mainIpcService, this.windowsService);
  }

  init() {
    this.windowsService.registerWindow(PROCESSES_NAME.MAIN_WINDOW, {
      width: 800,
      height: 600
    });

    this.windowsService.registerWindow(PROCESSES_NAME.CHAT_WINDOW, {
      width: 800,
      height: 600
    });

    this.windowsController.registerEvents();

    this.windowsService.start();

    console.log('[WindowsModule] init');
  }
}
