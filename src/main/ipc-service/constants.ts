export enum IPC_EVENT {
  /** 通道消息事件 */
  CHANNEL_MESSAGE = 'message',
  /** 渲染进程注册事件 */
  RENDER_REGISTER = 'render-register',
  /** 渲染进程注册成功事件 */
  RENDER_REGISTER_SUCCESS = 'render-register-success',
  /** 渲染进程注销事件 */
  RENDER_UNREGISTER = 'render-unregister',
  /** 新渲染进程加入事件 */
  RENDER_JOIN = 'render-join'
}
