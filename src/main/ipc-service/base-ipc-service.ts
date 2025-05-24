import { MessagePortMain, WebContents } from 'electron';

export class BaseIpcService {
  protected processKey: string;
  protected ipcServicesMap: Map<
    string,
    { port: MessagePort | MessagePortMain; processKey: string; webContents: WebContents | null }
  >;

  constructor(processKey: string) {
    this.processKey = processKey;
    this.ipcServicesMap = new Map();
  }

  public postMessage(processKey: string, data: unknown) {
    const ipcService = this.ipcServicesMap.get(processKey);
    if (ipcService) {
      ipcService.port.postMessage({
        from: this.processKey,
        data,
        time: Date.now()
      });
    }
  }

  public postMessageToAll(data: unknown) {
    this.ipcServicesMap.forEach((ipcService) => {
      ipcService.port.postMessage({
        from: this.processKey,
        data,
        time: Date.now()
      });
    });
  }

  public getAllProcessKeys() {
    return Array.from(this.ipcServicesMap.keys());
  }
}
