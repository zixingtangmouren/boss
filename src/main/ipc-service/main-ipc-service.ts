import { ipcMain, MessageChannelMain, MessagePortMain, WebContents } from 'electron';
import { IPC_EVENT } from './constants';
import { BaseIpcService } from './base-ipc-service';
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
    ipcMain.handle(IPC_EVENT.RENDER_REGISTER, (event, data) => {
      if (this.ipcServicesMap.has(data.processKey)) {
        return {
          success: false,
          message: '渲染进程已注册'
        };
      }

      const { port1, port2 } = new MessageChannelMain();

      this.registerRenderIpcService(data.processKey, port1, event.sender);

      this.triggerRegisterSuccess(event.sender, port2);

      this.sendRenderJoinMessage(data.processKey, event.sender);

      return {
        success: true,
        message: ''
      };
    });
  }
  // 注册渲染进程 IPC 服务
  private registerRenderIpcService(
    processKey: string,
    port: MessagePortMain,
    webContents: WebContents
  ) {
    this.ipcServicesMap.set(processKey, {
      port,
      processKey,
      webContents
    });

    port.start();
    port.on(IPC_EVENT.CHANNEL_MESSAGE, (event) => {
      const { from, data, time } = event.data;

      console.log('from >>>', from);
      console.log('data >>>', data);
      console.log('time >>>', time);

      // TODO: 做实验
      // this.postMessageToAll(data);
    });
  }

  // 触发渲染进程注册成功事件，将 port 传递给渲染进程
  private triggerRegisterSuccess(sender: WebContents, port: MessagePortMain) {
    sender.postMessage(
      IPC_EVENT.RENDER_REGISTER_SUCCESS,
      {
        processKey: this.processKey
      },
      [port]
    );
  }

  // 发送渲染进程加入事件，通知其他渲染进程有新渲染进程加入
  private sendRenderJoinMessage(processKey: string, newWebContents: WebContents) {
    this.ipcServicesMap.forEach((ipcService) => {
      if (ipcService.processKey === processKey) {
        return;
      }

      // 创建新的 channel 连
      const { port1, port2 } = new MessageChannelMain();

      newWebContents.postMessage(
        IPC_EVENT.RENDER_JOIN,
        {
          processKey: ipcService.processKey
        },
        [port1]
      );

      ipcService.webContents?.postMessage(
        IPC_EVENT.RENDER_JOIN,
        {
          processKey
        },
        [port2]
      );
    });
  }
}
