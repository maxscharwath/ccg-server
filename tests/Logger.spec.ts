import {Log} from '../src/core/misc/Logger';

describe('Logger', () => {
  test('log error', () => {
    const log = Log.error('log', {hello: 'world'});
    expect(log.level).toBe('error');
    expect(log.message).toBe('log');
    expect(log.metadata).toEqual({hello: 'world'});
  });
});
