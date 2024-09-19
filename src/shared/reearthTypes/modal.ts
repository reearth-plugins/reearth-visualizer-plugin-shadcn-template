export declare type Modal = {
  readonly show: (
    html: string,
    options?: {
      width?: number | string;
      height?: number | string;
      background?: string;
      clickBgToClose?: boolean;
    }
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly postMessage: (message: any) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    background?: string;
    clickBgToClose?: boolean;
  }) => void;
  readonly close: () => void;
  readonly on: ModalEvents["on"];
  readonly off: ModalEvents["off"];
};

export declare type ModalEventType = {
  close: [];
};

export declare type ModalEvents = {
  readonly on: <T extends keyof ModalEventType>(
    type: T,
    callback: (...args: ModalEventType[T]) => void,
    options?: { once?: boolean }
  ) => void;
  readonly off: <T extends keyof ModalEventType>(
    type: T,
    callback: (...args: ModalEventType[T]) => void
  ) => void;
};
