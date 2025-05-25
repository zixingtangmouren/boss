import { BrowserWindowConstructorOptions } from 'electron';
import BaseWindow from './base-window';

export interface CacheWindows {
  window: BaseWindow | null;
  options: BrowserWindowConstructorOptions;
}

export interface WindowsServiceOptions {
  defaultProcessKey: string;
}
