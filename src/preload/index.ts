import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { RenderIpcService } from '../main/ipc-service/render-ipc-service';
import { IPC_EVENT } from '../main/ipc-service/constants';
import { PostMessageParams, PostMessageToAllParams } from '../main/ipc-service/types';

// Custom APIs for renderer
const api = {
  postMessage: (params: PostMessageParams) => {
    renderIpcService.postMessage(params);
  },
  postMessageToAll: (params: PostMessageToAllParams) => {
    renderIpcService.postMessageToAll(params);
  },
  getAllProcessKeys: () => {
    return renderIpcService.getAllProcessKeys();
  },
  openWindow: (name: string) => {
    renderIpcService.postMessage({
      processKey: 'main',
      event: IPC_EVENT.OPEN_WINDOW,
      data: { name }
    });
  }
};

export type Api = typeof api;

console.log(process.env);

const renderIpcService = new RenderIpcService(`render-${Date.now()}`);

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
