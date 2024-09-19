/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layer } from "@reearth/core";

export declare type Extension = {
  readonly block?: PluginStoryBlock | (PluginInfoboxBlock & { layer?: Layer });
  readonly widget?: Widget;
  readonly list: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: any) => void;
  readonly on: ExtensionEvents["on"];
  readonly off: ExtensionEvents["off"];
};

export declare type WidgetLayout = {
  location: WidgetLocation;
  align?: WidgetAlignment;
};

export declare type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export declare type WidgetAlignment = "start" | "centered" | "end";

export declare type PluginInfoboxBlock = {
  id: string;
  name?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: "infoboxBlock";
  propertyId?: string;
  property?: any;
};

export type PluginStoryBlock = {
  id: string;
  name?: string | null;
  pluginId: string;
  extensionId: string;
  extensionType?: "storyBlock";
  propertyId?: string;
  property?: any;
};

export declare type Widget = {
  readonly id: string;
  readonly pluginId?: string;
  readonly extensionId?: string;
  readonly property?: any;
  readonly propertyId?: string;
  readonly extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  readonly layout?: WidgetLayout;
};

export declare type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block" | "infoboxBlock" | "storyBlock";
  readonly runTimes: number | undefined;
};

export declare type ExtensionEventType = {
  message: [message: any];
  extensionMessage: [props: ExtensionMessage];
};

export declare type ExtensionEvents = {
  readonly on: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void,
    options?: { once?: boolean }
  ) => void;
  readonly off: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void
  ) => void;
};

export declare type ExtensionMessage = {
  data: any;
  sender: string;
};
