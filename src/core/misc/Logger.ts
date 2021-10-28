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

export type Options = {
  format: string;
  dateFormat: string;
  transports: ((data: Data) => void)[];
};

export default class Logger {
  #options: Options;
  constructor(
    options: Options = {
      format:
        '{timestamp} <{level}> {file}:{line} ({method}) {message} {metadata}',
      dateFormat: 'YYYY-MM-DD HH:mm:ss.SS',
      transports: [],
    }
  ) {
    this.#options = options;

    this.#options.transports.push(data => {
      if (data.level === 'warn') console.warn(data.output);
      else if (data.level === 'error') console.error(data.output);
      else console.log(data.output);
    });

    this.#options.transports.push(async data => {
      const file = path.join(
        process.cwd(),
        'logs',
        `${format(data.date, 'YYYY-MM-DD')}.log`
      );
      await fs.promises.mkdir(path.dirname(file), {recursive: true});
      await fs.promises.appendFile(file, `${data.output}\n`);
    });
  }

  private static getStackLog(index = 0): Stack | undefined {
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    const stackReg2 = /at\s+(.*)(.*):(\d*):(\d*)/i;
    const stackList = new Error().stack?.split('\n').slice(3);
    if (!stackList) return;
    const s = stackList[index],
      sp = stackReg.exec(s) ?? stackReg2.exec(s);
    if (!(sp && sp.length === 5)) return;
    return {
      method: sp[1],
      path: sp[2],
      line: sp[3],
      pos: sp[4],
      folder: path.dirname(path.resolve(sp[2])),
      file: path.basename(sp[2]),
      stack: stackList.slice(index).join('\n'),
    } as Stack;
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
    this.#options.transports.forEach(transport => transport(data));
    return data;
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
}

export const Log = new Logger();
