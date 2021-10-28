import * as event from 'events';

/**
 * EventMap represents a map of event associated with their handlers.
 */
export type EventMap = Record<string | symbol, (...args: any[]) => void>;

type EventMapImproved<T extends EventMap> = T & {
  '*': (name: string, params: unknown[]) => void;
};
type EventKey<T extends EventMap> = string & keyof EventMapImproved<T>;

/**
 * Class EventEmitter is a full type-safe event emitter.
 * @extends EventEmitter
 * @author Maxime Scharwath
 */
export class EventEmitter<T extends EventMap> extends event.EventEmitter {
  /**
   * Emit an event.
   * @param event The name of the event.
   * @param params The parameters of the event.
   */
  override emit<K extends EventKey<T>>(event: K, ...params: Parameters<T[K]>): boolean {
    if (event === '*') {
      throw new Error("Event '*' can be emitted");
    }
    super.emit('*', event, params);
    return super.emit(event, ...params);
  }

  /**
   * Remove listeners of a specific event.
   * @param event The name of the event.
   * @param listener The listener to remove.
   */
  override removeListener<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]): this {
    return super.removeListener(event, listener);
  }

  /**
   * Remove all listeners of a specific event.
   * @param event The name of the event.
   */
  override removeAllListeners<K extends EventKey<T>>(event?: K): this {
    return super.removeAllListeners(event);
  }

  /**
   * Returns a copy of the array of listeners for a specific event.
   * @param event The name of the event.
   */
  override listeners<K extends EventKey<T>>(event: K): Function[] {
    return super.listeners(event);
  }

  /**
   * Returns a copy of the array of listeners for a specific event, including any wrappers (such as those created by .once()).
   * @param event The name of the event.
   */
  override rawListeners<K extends EventKey<T>>(event: K): Function[] {
    return super.rawListeners(event);
  }

  /**
   * Returns the number of listeners for a specific event.
   * @param event The name of the event.
   */
  override listenerCount<K extends EventKey<T>>(event: K): number {
    return super.listenerCount(event);
  }

  /**
   * Adds a listener to the end of the listeners array for the specified event.
   * @param event The name of the event.
   * @param listener The listener to add.
   */
  override prependListener<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]): this {
    return super.prependListener(event, listener);
  }

  /**
   * Adds a one-time listener to the end of the listeners array for the specified event.
   * @param event The name of the event.
   * @param listener The listener to add.
   */
  override prependOnceListener<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]): this {
    return super.prependOnceListener(event, listener);
  }

  /**
   * Adds a listener to the beginning of the listeners array for the specified event.
   * @param event The name of the event.
   * @param listener The listener to add.
   */
  override addListener<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]) {
    return super.addListener(event, listener);
  }

  /**
   * Adds a listener for the event.
   * @param event The name of the event.
   * @param listener The listener to add.
   */
  override on<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]): this {
    return super.on(event, listener);
  }

  /**
   * Adds a one-time listener for the event.
   * @param event The name of the event.
   * @param listener The listener to add.
   */
  override once<K extends EventKey<T>>(event: K, listener: T[K]) {
    return super.once(event, listener);
  }

  /**
   * Remove listeners of a specific event.
   * @see removeListener
   * @param event The name of the event.
   * @param listener The listener to remove.
   */
  override off<K extends EventKey<T>>(event: K, listener: EventMapImproved<T>[K]): this {
    return super.off(event, listener);
  }
}
