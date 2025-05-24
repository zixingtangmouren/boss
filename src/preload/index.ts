import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { RenderIpcService } from '../main/ipc-service/render-ipc-service';

// Custom APIs for renderer
const api = {
  postMessage: (processKey: string, data: unknown) => {
    renderIpcService.postMessage(processKey, data);
  },
  postMessageToAll: (data: unknown) => {
    renderIpcService.postMessageToAll(data);
  },
  getAllProcessKeys: () => {
    return renderIpcService.getAllProcessKeys();
  }
};

const renderIpcService = new RenderIpcService(`render-${Date.now()}`);

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
    // contextBridge.exposeInMainWorld('renderIpcService', renderIpcService);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  // window.renderIpcService = renderIpcService;
}
