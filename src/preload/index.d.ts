import { ElectronAPI } from '@electron-toolkit/preload';
import { RenderIpcService } from '../main/ipc-service/render-ipc-service';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    renderIpcService: RenderIpcService;
  }
}
