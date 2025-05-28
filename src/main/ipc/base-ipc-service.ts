import { MessagePortMain, WebContents } from 'electron';
import { IpcMessage } from './types';

export class BaseIpcService {
  protected processKey: string;
  private debug = false;
  protected ipcServicesMap: Map<
    string,
    { port: MessagePort | MessagePortMain; processKey: string; webContents: WebContents | null }
  >;

  protected callbackMap: Map<string, ((data: IpcMessage) => void)[]> = new Map();

  constructor(processKey: string, debug = false) {
    this.processKey = processKey;
    this.ipcServicesMap = new Map();
    this.debug = debug;
  }

  public postMessage(processKey: string, eventName: string, data?: unknown) {
    const ipcService = this.ipcServicesMap.get(processKey);
    if (ipcService) {
      ipcService.port.postMessage({
        eventName,
        from: this.processKey,
        data: data || '',
        time: Date.now()
      });

      if (this.debug) {
        console.log('postMessage >>>', {
          eventName,
          from: this.processKey,
          data: data || '',
          time: Date.now()
        });
      }
    }
  }

  public postMessageToAll(eventName: string, data?: unknown) {
    this.ipcServicesMap.forEach((ipcService) => {
      ipcService.port.postMessage({
        eventName,
        from: this.processKey,
        data: data || '',
        time: Date.now()
      });
    });

    if (this.debug) {
      console.log('postMessageToAll >>>', {
        eventName,
        from: this.processKey,
        data: data || '',
        time: Date.now()
      });
    }
  }

  public getAllProcessKeys() {
    return Array.from(this.ipcServicesMap.keys());
  }

  public addEventListener(
    event: string,
    callback: (data: IpcMessage) => void,
    options: AddEventListenerOptions = {}
  ) {
    const { once } = options;
    if (once) {
      // @ts-ignore (define in dts)
      callback._once = true;
    }
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

    if (callbacks.some((callback) => (callback as any)._once)) {
      this.removeEventListener(event, callbacks[0] as (data: IpcMessage) => void);
    }
  }

  public removeAllEventListeners(event: string) {
    this.callbackMap.delete(event);
  }
}
