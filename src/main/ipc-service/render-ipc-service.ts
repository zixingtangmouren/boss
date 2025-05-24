import { ipcRenderer } from 'electron';
import { IPC_MAIN_EVENT } from './constants';
import { BaseIpcService } from './base-ipc-service';
import { IpcMessage } from './types';

/**
 * 渲染进程 IPC 服务
 *  - 监听主进程发送的事件
 *  - 转发事件到渲染进程
 */
export class RenderIpcService extends BaseIpcService {
  constructor(processKey: string) {
    super(processKey);
    this.init();
  }

  private async init() {
    this.registerRenderIpcServiceToMain();

    this.addMainProcessEventListener();

    console.log(`[${this.processKey} RenderIpcService] init`);
  }

  // 注册渲染进程 IPC 服务到主进程
  private async registerRenderIpcServiceToMain() {
    const result = await ipcRenderer.invoke(IPC_MAIN_EVENT.RENDER_REGISTER, {
      processKey: this.processKey
    });

    console.log('result >>>', result);
  }

  // 添加渲染进程的相关事件监听
  private addMainProcessEventListener() {
    // 监听自己是否注册成功
    ipcRenderer.once(IPC_MAIN_EVENT.RENDER_REGISTER_SUCCESS, (event, data) => {
      this.registerIpcService(data.processKey, event.ports[0]);
    });

    // 监听其他渲染进程的加入
    ipcRenderer.on(IPC_MAIN_EVENT.RENDER_JOIN, (event, data) => {
      this.registerIpcService(data.processKey, event.ports[0]);
    });

    // 监听其他渲染进程的销毁
    ipcRenderer.on(IPC_MAIN_EVENT.RENDER_DESTROY, (_, data) => {
      this.ipcServicesMap.delete(data.processKey);
    });
  }

  private registerIpcService(processKey: string, port: MessagePort) {
    // 注册进程 IPC 服务
    this.ipcServicesMap.set(processKey, {
      port,
      processKey,
      webContents: null
    });

    port.start();
    // 监听其他进程的消息（会有主进程、渲染进程）
    port.onmessage = (event) => {
      const data = event.data as IpcMessage;
      this.triggerEvent(data.event, data);
    };
  }
}
