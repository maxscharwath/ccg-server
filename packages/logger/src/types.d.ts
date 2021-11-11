export type Metadata = unknown;
export type Stack = {
  path: string;
  stack: string;
  folder: string;
  file: string;
  method: string;
  pos: string;
  line: string;
};
export type Data = {
  stack?: Stack;
  level: string;
  message: string;
  metadata: Metadata;
  output: string;
  rawOutput: Readonly<string>;
  date: Date;
};
export type LogData = Data & {
  done: Promise<void>;
};
export type Transport = (data: Data, options: TransportOptions) => Promise<void> | void;
export type TransportOptions = Options & {
  /**
   * Resolve when all previous logs transports have been resolved.
   */
  ready: Promise<void>;
  /**
   * Resolve when the same previous logs transport has been resolved.
   */
  transportReady: Promise<void>;
};

export type Options = {
  transportTimeout: number;
  name?: string;
  format: string;
  dateFormat: string;
  logFolder: string;
  logHistory: number;
  transports: Transport[];
};
