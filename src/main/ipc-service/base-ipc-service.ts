import { MessagePortMain, WebContents } from 'electron';
import { IpcMessage, PostMessageParams, PostMessageToAllParams } from './types';

export class BaseIpcService {
  protected processKey: string;
  protected ipcServicesMap: Map<
    string,
    { port: MessagePort | MessagePortMain; processKey: string; webContents: WebContents | null }
  >;

  protected callbackMap: Map<string, ((data: IpcMessage) => void)[]> = new Map();

  constructor(processKey: string) {
    this.processKey = processKey;
    this.ipcServicesMap = new Map();
  }

  public postMessage(params: PostMessageParams) {
    const { processKey, event, data } = params;
    const ipcService = this.ipcServicesMap.get(processKey);
    if (ipcService) {
      ipcService.port.postMessage({
        event,
        from: this.processKey,
        data,
        time: Date.now()
      });
    }
  }

  public postMessageToAll(params: PostMessageToAllParams) {
    const { event, data } = params;
    this.ipcServicesMap.forEach((ipcService) => {
      ipcService.port.postMessage({
        event,
        from: this.processKey,
        data,
        time: Date.now()
      });
    });
  }

  public getAllProcessKeys() {
    return Array.from(this.ipcServicesMap.keys());
  }

  public addEventListener(event: string, callback: (data: IpcMessage) => void) {
    const callbacks = this.callbackMap.get(event) || [];
    callbacks.push(callback);
    this.callbackMap.set(event, callbacks);
  }

  public removeEventListener(event: string, callback: (data: IpcMessage) => void) {
    const callbacks = this.callbackMap.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  public triggerEvent(event: string, data: IpcMessage) {
    const callbacks = this.callbackMap.get(event) || [];
    callbacks.forEach((callback) => {
      callback(data);
    });
  }

  public removeAllEventListeners(event: string) {
    this.callbackMap.delete(event);
  }
}
