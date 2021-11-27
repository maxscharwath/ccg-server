import Logger from './Logger';

export default Logger;

export const Log = Logger({
  transports: [Logger.TRANSPORTS.CONSOLE_LOG(), Logger.TRANSPORTS.DATED_LOG(), Logger.TRANSPORTS.SIMULATE_LAG(10000)],
});
