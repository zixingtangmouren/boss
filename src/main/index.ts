import { app, ipcMain } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { setup } from './setup';
import { WINDOWS_NAME } from '../common/constants';

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  const { windowsService } = setup();

  ipcMain.on('open-chat-window', () => {
    windowsService.openWindow(WINDOWS_NAME.CHAT_WINDOW);
  });
});
