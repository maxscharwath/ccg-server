import * as event from 'events';

type EventMap = Record<string | symbol, (...args: any[]) => void>;
type EventMapImproved<T extends EventMap> = T & {
  '*': (name: string, params: unknown[]) => void;
};
type EventKey<T extends EventMap> = string & keyof EventMapImproved<T>;

/**
 * Class EventEmitter is a full typed Node EventEmitter
 */
export class EventEmitter<T extends EventMap> extends event.EventEmitter {
  override removeListener<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ): this {
    return super.removeListener(event, listener);
  }
  override removeAllListeners<K extends EventKey<T>>(event?: K): this {
    return super.removeAllListeners(event);
  }
  override listeners<K extends EventKey<T>>(event: K): Function[] {
    return super.listeners(event);
  }
  override rawListeners<K extends EventKey<T>>(event: K): Function[] {
    return super.rawListeners(event);
  }
  override listenerCount<K extends EventKey<T>>(event: K): number {
    return super.listenerCount(event);
  }
  override prependListener<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ): this {
    return super.prependListener(event, listener);
  }
  override prependOnceListener<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ): this {
    return super.prependOnceListener(event, listener);
  }
  override addListener<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ) {
    return super.addListener(event, listener);
  }
  override on<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ): this {
    return super.on(event, listener);
  }
  override off<K extends EventKey<T>>(
    event: K,
    listener: EventMapImproved<T>[K]
  ): this {
    return super.off(event, listener);
  }
  override emit<K extends EventKey<T>>(
    event: K,
    ...params: Parameters<T[K]>
  ): boolean {
    if (event === '*') {
      throw new Error("Event '*' can be emitted");
    }
    super.emit('*', event, params);
    return super.emit(event, ...params);
  }
  override once<K extends EventKey<T>>(event: K, listener: T[K]) {
    return super.once(event, listener);
  }
}
