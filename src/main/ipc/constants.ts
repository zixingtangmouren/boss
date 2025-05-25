/**
 * 主进程事件
 * - 这些设计应该是一些内部事件，比如渲染进程注册、销毁等
 */
export enum IPC_MAIN_EVENT {
  /** 渲染进程注册事件 */
  RENDER_REGISTER = 'render-register',
  /** 渲染进程注册成功事件 */
  RENDER_REGISTER_SUCCESS = 'render-register-success',
  /** 渲染进程注销事件 */
  RENDER_UNREGISTER = 'render-unregister',
  /** 新渲染进程加入事件 */
  RENDER_JOIN = 'render-join',
  /** 渲染进程销毁事件 */
  RENDER_DESTROY = 'render-destroy',
  /** 通道消息事件 */
  CHANNEL_MESSAGE = 'message'
}
