import { BrowserWindowConstructorOptions } from 'electron';
import BaseWindow from './base-window';
import { WindowsServiceOptions } from './types';

/**
 * 窗口服务
 *  - 注册窗口: 管理窗口配置
 */
export class WindowsService {
  private cacheWindows: Map<
    string,
    {
      window: BaseWindow | null;
      options: BrowserWindowConstructorOptions;
    }
  > = new Map();

  public defaultProcessKey: string;

  constructor({ defaultProcessKey }: WindowsServiceOptions) {
    this.defaultProcessKey = defaultProcessKey;
  }

  start() {
    this.openWindow(this.defaultProcessKey);
  }

  registerWindow(name: string, options: BrowserWindowConstructorOptions) {
    this.cacheWindows.set(name, { window: null, options });
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

  getAllWindows() {
    return Array.from(this.cacheWindows.keys());
  }
}
