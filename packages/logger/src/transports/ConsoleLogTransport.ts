import {Data, Transport} from '../types';

/**
 * @internal
 * Console transport.
 * @constructor
 */
export default function CONSOLE_LOG(): Transport {
  return function CONSOLE_LOG(data: Data) {
    if (data.level === 'warn') console.warn(data.output);
    else if (data.level === 'error') console.error(data.output);
    else console.log(data.output);
  };
}
