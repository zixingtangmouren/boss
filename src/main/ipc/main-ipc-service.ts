import { ipcMain, MessageChannelMain, MessagePortMain, WebContents } from 'electron';
import { IPC_MAIN_EVENT } from './constants';
import { BaseIpcService } from './base-ipc-service';
import { IpcMessage } from './types';
// import RenderIpcService from './render-ipc-service';

/**
 * 主进程 IPC 服务
 *  - 监听渲染进程注册事件
 *  - 监听渲染进程发送的事件
 *  - 中转事件到其他渲染进程
 */
export class MainIpcService extends BaseIpcService {
  constructor(processKey: string) {
    super(processKey);
    this.init();
  }

  private init() {
    this.addRenderIpcServiceRegisterListener();
    console.log('[MainIpcService] init');
  }

  private addRenderIpcServiceRegisterListener() {
    ipcMain.handle(IPC_MAIN_EVENT.RENDER_REGISTER, (event, data) => {
      if (this.ipcServicesMap.has(data.processKey)) {
        return {
          success: false,
          message: '渲染进程已注册'
        };
      }

      const { port1, port2 } = new MessageChannelMain();

      this.registerRenderIpcService(data.processKey, port1, port2, event.sender);

      this.sendRenderJoinMessage(data.processKey, event.sender);

      return {
        success: true,
        message: ''
      };
    });
  }

  // 注册渲染进程 IPC 服务，监听消息事件
  private registerRenderIpcService(
    processKey: string,
    port1: MessagePortMain,
    port2: MessagePortMain,
    webContents: WebContents
  ) {
    this.ipcServicesMap.set(processKey, {
      port: port1,
      processKey,
      webContents
    });

    port1.start();
    // 接受新渲染进程的消息
    port1.on(IPC_MAIN_EVENT.CHANNEL_MESSAGE, (event) => {
      const data = event.data as IpcMessage;
      this.triggerEvent(data.eventName, data);
    });

    // 监听新渲染进程的注销
    webContents.once('destroyed', () => {
      this.sendRenderDestroyMessage(processKey);
    });

    this.sendRegisterSuccess(webContents, port2);
  }

  // 通知新渲染进程注册成功，将 port 传递给新渲染进程
  private sendRegisterSuccess(sender: WebContents, port: MessagePortMain) {
    sender.postMessage(
      IPC_MAIN_EVENT.RENDER_REGISTER_SUCCESS,
      {
        processKey: this.processKey
      },
      [port]
    );
  }

  // 通知其他渲染进程有新渲染进程加入
  private sendRenderJoinMessage(processKey: string, newWebContents: WebContents) {
    this.ipcServicesMap.forEach((ipcService) => {
      if (ipcService.processKey === processKey) {
        return;
      }

      // 创建新的 channel 连
      const { port1, port2 } = new MessageChannelMain();

      newWebContents.postMessage(
        IPC_MAIN_EVENT.RENDER_JOIN,
        {
          processKey: ipcService.processKey
        },
        [port1]
      );

      ipcService.webContents?.postMessage(
        IPC_MAIN_EVENT.RENDER_JOIN,
        {
          processKey
        },
        [port2]
      );
    });
  }

  // 通知其他渲染进程，有渲染进程被销毁
  private sendRenderDestroyMessage(processKey: string) {
    this.ipcServicesMap.forEach((ipcService) => {
      if (ipcService.processKey === processKey) {
        return;
      }

      ipcService.webContents?.postMessage(IPC_MAIN_EVENT.RENDER_DESTROY, {
        processKey
      });
    });

    this.ipcServicesMap.delete(processKey);
  }
}
