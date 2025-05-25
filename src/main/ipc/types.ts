export interface IpcMessage<T = unknown> {
  eventName: string;
  from: string;
  data: T;
  time: number;
}

export interface AddEventListenerOptions {
  once?: boolean;
}
