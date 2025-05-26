import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

export default class BaseWindow extends BrowserWindow {
  private name: string;

  constructor(name: string, { webPreferences, ...options }: BrowserWindowConstructorOptions) {
    super({
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      frame: false,
      ...options,
      webPreferences: {
        // contextIsolation: false, // 禁用上下文隔离
        // nodeIntegration: true, // 通常需要同时启用 nodeIntegration
        sandbox: false,
        preload: join(__dirname, '../preload/index.js'),
        additionalArguments: [`--processKey=${name}`],
        ...webPreferences
      }
    });

    this.name = name;

    this.init();
  }

  private init() {
    console.log(`初始化窗口 >>> ${this.name}`);

    // 拦截窗口中所有通过 window.open 或类似方式尝试新开窗口的行为，并用系统默认浏览器打开链接，而不是在 Electron 应用内新开窗口。
    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    this.on('ready-to-show', () => {
      console.log(`窗口 ${this.name} 已准备好显示`);
    });

    // 开发环境使用远程 URL，生产环境使用本地 HTML 文件
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.loadURL(process.env['ELECTRON_RENDERER_URL'] + `/${this.name}.html`);
    } else {
      this.loadFile(join(__dirname, `../renderer/${this.name}.html`));
    }
  }
}
