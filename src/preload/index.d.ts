import { ElectronAPI } from '@electron-toolkit/preload';
import { RenderIpcService } from '../main/ipc/render-ipc-service';
import { Api } from '.';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
    renderIpcService: RenderIpcService;
  }
}
