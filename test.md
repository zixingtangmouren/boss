controller 层

```ts
import { BrowserWindow } from 'electron';
import { BaseIpcService } from '../ipc-service/base-ipc-service';
import { WINDOWS_SERVICE_EVENT } from './events';
import { WindowsService } from './window.service';

export class WindowsController {
  private ipcService: BaseIpcService;
  private windowsService: WindowsService;

  constructor(ipcService: BaseIpcService) {
    this.ipcService = ipcService;
  }

  // electron app 事件
  @AppEvent('activate')
  activate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      // this.openWindow(this.defaultProcessKey)/
    }
  }

  // 自定义事件
  @IpcEvent(WINDOWS_SERVICE_EVENT.OPEN_WINDOW)
  openWindow(name: string) {
    this.windowsService.openWindow();
  }

  @IpcEvent(WINDOWS_SERVICE_EVENT.CLOSE_WINDOW)
  closeWindow(name: string) {
    // TODO: 关闭窗口
  }

  @IpcResponseEvent(WINDOWS_SERVICE_EVENT.GET_ALL_WINDOWS)
  getAllWindows() {
    // TODO: 获取全部窗口
    return [];
  }
}
```

service 层

```ts
export class WindowService {
  openWindow() {
    //
  }

  closeWindow() {
    //
  }

  getAllWindows() {
    return [];
  }
}
```

module

```ts
export class WindowsModule {}
```

main

```ts
app.use([
  new WindowsModule({
    home: {},
    chat: {}
  })
]);
```

preload

```ts
// 注册 IPC 服务

// Api 调用全部视为请求
const api = {
  openWindow: (params) => {
    trigger(WINDOWS_SERVICE_EVENT.OPEN_WINDOW, {});
  },
  getAllWindows: () => {
    const res = await rigger(WINDOWS_SERVICE_EVENT.OPEN_WINDOW, {});

    console.log('>>>', res);
  }
};
```

需要解决的核心问题

- 如何实现 IoC 模式
- 如何设计装饰器 @AppEvent @IpcNomarlEvent @IpcReplyEvent
