export interface IpcMessage<T = unknown> {
  event: string;
  from: string;
  data: T;
  time: number;
}

export interface PostMessageParams {
  processKey: string;
  event: string;
  data: unknown;
}

export interface PostMessageToAllParams {
  event: string;
  data: unknown;
}
