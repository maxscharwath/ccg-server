import Logger from '../src/core/misc/Logger';

describe('Logger', () => {
  const Log = new Logger();
  test('log', () => {
    const log = Log.log('log', 'log1', {hello: 'world'});
    expect(log.level).toBe('log');
    expect(log.message).toBe('log1');
    expect(log.metadata).toEqual({hello: 'world'});
  });
  test('log error', () => {
    const log = Log.error('log1', {hello: 'world'});
    expect(log.level).toBe('error');
    expect(log.message).toBe('log1');
    expect(log.metadata).toEqual({hello: 'world'});
  });
  test('log warn', () => {
    const log = Log.warn('log2', {hello: 'world'});
    expect(log.level).toBe('warn');
    expect(log.message).toBe('log2');
    expect(log.metadata).toEqual({hello: 'world'});
  });
  test('log info', () => {
    const log = Log.info('log3', {hello: 'world'});
    expect(log.level).toBe('info');
    expect(log.message).toBe('log3');
    expect(log.metadata).toEqual({hello: 'world'});
  });
  test('log debug', () => {
    const log = Log.debug('log4', {hello: 'world'});
    expect(log.level).toBe('debug');
    expect(log.message).toBe('log4');
    expect(log.metadata).toEqual({hello: 'world'});
  });
});
