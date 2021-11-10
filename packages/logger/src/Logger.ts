import * as path from 'path';
import {format} from 'fecha';
import {LogData, Metadata, Options, Stack} from './types';
import DATED_LOG from './transports/DatedLogTransport';
import NAMED_LOG from './transports/NamedLogTransport';
import CONSOLE_LOG from './transports/ConsoleLogTransport';
import SIMULATE_LAG from './transports/SimulateLogTransport';
import ts from '@studimax/ts';

/**
 * @internal
 * Logger class
 */
export default class Logger {
  readonly #options: Options;
  #prevLogTransports: Promise<void>[] = [];

  constructor(options: Partial<Options> = {}) {
    this.#options = {
      format: '{timestamp}\t<{level}>\t{file}:{line}\t({method})\t{message} {metadata}',
      dateFormat: 'YYYY-MM-DD HH:mm:ss.SS',
      logFolder: 'logs',
      transports: [],
      transportTimeout: 1000,
      ...options,
    };
  }

  /**
   * Some default transports.
   */
  public static TRANSPORTS = {
    DATED_LOG,
    NAMED_LOG,
    CONSOLE_LOG,
    SIMULATE_LAG,
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

  public log(level: string, message: string, metadata?: Metadata): LogData {
    return this.#logMain(level, message, metadata);
  }

  public debug(message: string, metadata?: Metadata): LogData {
    return this.#logMain('debug', message, metadata);
  }

  public info(message: string, metadata?: Metadata): LogData {
    return this.#logMain('info', message, metadata);
  }

  public warn(message: string, metadata?: Metadata): LogData {
    return this.#logMain('warn', message, metadata);
  }

  public error(message: string, metadata?: Metadata): LogData {
    return this.#logMain('error', message, metadata);
  }

  #logMain(level: string, message: string, metadata?: Metadata): LogData {
    const stack = Logger.getStackLog(1);
    const date = new Date();
    const output = ts(this.#options.format, {
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
    this.#prevLogTransports = this.#options.transports.map((transport, index) => {
      const ready = Promise.allSettled(this.#prevLogTransports).then(() => {});
      const transportReady = this.#prevLogTransports[index];
      const t = transport(data, {...this.#options, ready, transportReady});
      return new Promise((resolve, reject) => {
        if (!(t instanceof Promise)) return resolve();
        const timeout = setTimeout(() => {
          reject(new Error(`Transport ${transport.name} is taking too long to process the log.`));
        }, this.#options.transportTimeout);
        t.then(resolve)
          .catch(reject)
          .finally(() => clearTimeout(timeout));
      });
    });
    return {...data, done: Promise.allSettled(this.#prevLogTransports).then(() => {})};
  }
}
