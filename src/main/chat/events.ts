export enum CHAT_EVENT {
  /** 开始发送消息 */
  START_SEND_MESSAGE = 'chat/start_send_message',
  /** 发送消息中 */
  SENDING_MESSAGE = 'chat/sending_message',
  /** 停止发送消息 */
  STOP_SEND_MESSAGE = 'chat/stop_send_message'
}
