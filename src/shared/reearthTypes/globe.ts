import { Reearth } from ".";

export type GlobalThis = {
  reearth: Reearth;
  console: {
    readonly log: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
  };
};
