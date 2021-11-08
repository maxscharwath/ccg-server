import * as path from 'path';
import TemplateStrings from '@core/misc/TemplateStrings';
import {format} from 'fecha';
import * as fs from 'fs';

type Metadata = unknown;

type Stack = {
  path: string;
  stack: string;
  folder: string;
  file: string;
  method: string;
  pos: string;
  line: string;
};

type Data = {
  stack?: Stack;
  level: string;
  message: string;
  metadata: Metadata;
  output: string;
  rawOutput: Readonly<string>;
  date: Date;
};
type Transport = (data: Data, options: TransportOptions) => Promise<void>;

type TransportOptions = Options & {
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
  name?: string;
  format: string;
  dateFormat: string;
  logFolder: string;
  transports: Transport[];
};

export default class Logger {
  readonly #options: Options;
  #prevLogTransports: Promise<void>[] = [];

  constructor(options: Partial<Options> = {}) {
    this.#options = {
      format: '{timestamp} <{level}> {file}:{line} ({method}) {message} {metadata}',
      dateFormat: 'YYYY-MM-DD HH:mm:ss.SS',
      logFolder: 'logs',
      transports: [],
      ...options,
    };
  }

  public static TRANSPORTS = {
    DATED_LOG:
      (...subFolders: string[]) =>
      async (data: Data, options: TransportOptions) => {
        const filePrefix = options.name ? `${options.name}-` : '';
        const file = path.join(
          process.cwd(),
          options.logFolder,
          ...subFolders,
          `${filePrefix}${format(data.date, 'YYYY-MM-DD')}.log`
        );
        await fs.promises.mkdir(path.dirname(file), {recursive: true});
        await options.transportReady;
        await fs.promises.appendFile(file, `${data.output}\n`);
      },
    NAME_LOG:
      (...subFolders: string[]) =>
      async (data: Data, options: TransportOptions) => {
        const file = path.join(process.cwd(), options.logFolder, ...subFolders, `${options.name ?? 'default'}`);
        await fs.promises.mkdir(path.dirname(file), {recursive: true});
        await options.transportReady;
        await fs.promises.appendFile(file, `${data.output}\n`);
      },
    CONSOLE_LOG: () => async (data: Data) => {
      if (data.level === 'warn') console.warn(data.output);
      else if (data.level === 'error') console.error(data.output);
      else console.log(data.output);
    },
    SIMULATE_LAG: (time: number) => async (data: Data, options: TransportOptions) => {
      await options.ready;
      await new Promise(resolve => setTimeout(resolve, time));
    },
  };

  private static getStackLog(index = 0): Stack | undefined {
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
    const stackList = new Error().stack?.split('\n').slice(3);
    if (!stackList) return;
    const s = stackList[index],
      sp = stackReg.exec(s) ?? stackReg2.exec(s);
    if (!(sp && sp.length === 5)) return;
    return {
      method: sp[1] === '' ? '<anonymous>' : sp[1],
      path: sp[2],
      line: sp[3],
      pos: sp[4],
      folder: path.dirname(path.resolve(sp[2])),
      file: path.basename(sp[2]),
      stack: stackList.slice(index).join('\n'),
    } as Stack;
  }

  public log(level: string, message: string, metadata?: Metadata): Data {
    return this.#logMain(level, message, metadata);
  }

  public debug(message: string, metadata?: Metadata): Data {
    return this.#logMain('debug', message, metadata);
  }

  public info(message: string, metadata?: Metadata): Data {
    return this.#logMain('info', message, metadata);
  }

  public warn(message: string, metadata?: Metadata): Data {
    return this.#logMain('warn', message, metadata);
  }

  public error(message: string, metadata?: Metadata): Data {
    return this.#logMain('error', message, metadata);
  }

  #logMain(level: string, message: string, metadata?: Metadata): Data {
    const stack = Logger.getStackLog(1);
    const date = new Date();
    const output = TemplateStrings(this.#options.format, {
      ...stack,
      timestamp: format(date, this.#options.dateFormat),
      level,
      message,
      metadata: metadata ? JSON.stringify(metadata) : '',
    });
    const data = {
      date,
      level,
      message,
      metadata,
      rawOutput: output,
      stack,
      output,
    };
    //to keep the order of transports
    this.#prevLogTransports = this.#options.transports.map((transport, index) =>
      transport(data, {
        ...this.#options,
        ready: Promise.allSettled(this.#prevLogTransports).then(),
        transportReady: this.#prevLogTransports[index],
      })
    );
    return data;
  }
}

export const Log = new Logger({
  transports: [Logger.TRANSPORTS.CONSOLE_LOG(), Logger.TRANSPORTS.DATED_LOG()],
});
