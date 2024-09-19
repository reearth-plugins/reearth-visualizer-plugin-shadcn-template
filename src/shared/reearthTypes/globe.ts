/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reearth } from "./reearth";

export type GlobalThis = {
  reearth: Reearth;
  console: {
    readonly log: (...args: any[]) => void;
    readonly error: (...args: any[]) => void;
  };
};
