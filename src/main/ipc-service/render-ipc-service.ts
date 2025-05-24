import { ipcRenderer } from 'electron';
import { IPC_EVENT } from './constants';
import { BaseIpcService } from './base-ipc-service';

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

    this.addRenderIpcServiceRegisterSuccessListener();

    console.log(`[${this.processKey} RenderIpcService] init`);
  }

  // 注册渲染进程 IPC 服务到主进程
  private async registerRenderIpcServiceToMain() {
    const result = await ipcRenderer.invoke(IPC_EVENT.RENDER_REGISTER, {
      processKey: this.processKey
    });

    console.log('result >>>', result);
  }

  // 添加渲染进程注册成功事件监听
  private addRenderIpcServiceRegisterSuccessListener() {
    // 监听自己是否注册成功
    ipcRenderer.once(IPC_EVENT.RENDER_REGISTER_SUCCESS, (event, data) => {
      this.registerIpcService(data.processKey, event.ports[0]);
    });

    // 监听其他渲染进程的加入
    ipcRenderer.on(IPC_EVENT.RENDER_JOIN, (event, data) => {
      this.registerIpcService(data.processKey, event.ports[0]);
    });
  }

  private registerIpcService(processKey: string, port: MessagePort) {
    // 注册渲染进程 IPC 服务
    this.ipcServicesMap.set(processKey, {
      port,
      processKey,
      webContents: null
    });

    port.start();
    port.onmessage = (event) => {
      console.log('event >>>', event);
    };
  }
}
