import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import BaseWindow from './base-window';
import { WINDOWS_NAME } from '../../common/constants';

/**
 * 窗口服务
 *  - 注册窗口: 管理窗口配置
 */
export default class WindowsService {
  private cacheWindows: Map<
    string,
    {
      window: BaseWindow | null;
      options: BrowserWindowConstructorOptions;
    }
  > = new Map();

  constructor() {
    this.init();
  }

  private init() {
    console.log('[WindowsService] init');
    this.registerAppEvents();
  }

  // 注册 App 上跟窗口相关的全局事件
  registerAppEvents() {
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) this.openWindow(WINDOWS_NAME.MAIN_WINDOW);
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  registerWindow(name: string, options: BrowserWindowConstructorOptions) {
    this.cacheWindows.set(name, { window: null, options });

    // 注册窗口相关事件的
  }

  unregisterWindow(name: string) {
    if (!this.cacheWindows.has(name)) {
      throw new Error(`窗口 ${name} 未注册`);
    }

    const { window } = this.cacheWindows.get(name)!;

    if (window) {
      window.destroy();
    }

    this.cacheWindows.delete(name);
  }

  createWindow(name: string) {
    if (!this.cacheWindows.has(name)) {
      throw new Error(`窗口 ${name} 未注册`);
    }

    const { options } = this.cacheWindows.get(name)!;
    const window = new BaseWindow(name, options);
    this.cacheWindows.set(name, { window, options });

    return window;
  }

  getWindow(name: string) {
    return this.cacheWindows.get(name);
  }

  openWindow(name: string) {
    if (!this.cacheWindows.has(name)) {
      throw new Error(`窗口 ${name} 未注册`);
    }

    let { window } = this.cacheWindows.get(name)!;

    if (!window) {
      window = this.createWindow(name);
    }

    if (window && !window.isDestroyed()) {
      window.show();
      return;
    }

    if (window.isDestroyed()) {
      window = this.createWindow(name);
      window.show();
      return;
    }
  }

  closeWindow(name: string) {
    if (!this.cacheWindows.has(name)) {
      throw new Error(`窗口 ${name} 未注册`);
    }

    const { window } = this.cacheWindows.get(name)!;
    if (window) {
      window.close();
    }
  }
}
