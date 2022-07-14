import { IEventEmitter, EventEmitterOptions } from "./types";


// use symbol to make sure no duplicate key.
const events = Symbol('#events');
const captureRejections = Symbol('#captureRejections');
const maxListeners = Symbol('#maxListeners');

export class EventEmitter implements IEventEmitter {
  constructor(options?: EventEmitterOptions) {
    // this[events] = new Map();
    // this[captureRejections] = options?.captureRejections ?? false;
    // this[maxListeners] = 0;
    this.set(events, new Map());
    this.set(captureRejections,  options?.captureRejections ?? false);
    this.set(maxListeners, 0);
  }

  private set(key: symbol, value: any) {
    Object.defineProperty(this, key, {
      value
    });
  }

  private get(key: symbol) {
    return (this as any)[key];
  }

  addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this.on(eventName, listener);
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (listener === null || listener === undefined || typeof listener !== 'function') {
      throw new Error('error listener must be function');
    }
    const map: Map<string | Symbol, Function[]> = this.get(events);
    let list: Function[];
    if (map.has(eventName)) {
      list = map.get(eventName) || [];
    } else {
      list = [];
      map.set(eventName, list);
    }
    if (list.find(item => item === listener)) {
      throw new Error('duplicate listener added');
    }
    if ( this.get(maxListeners) !== 0 && list.length >=  this.get(maxListeners)) {
      throw new Error('max listeners exceed');
    }
    list.push(listener);
    return this;
  }

  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (listener === null || listener === undefined || typeof listener !== 'function') {
      throw new Error('error listener must be function');
    }
    const wrapper = (...args: any[]) => {
      listener(...args);
      (this as any).off(eventName, wrapper);
    };
    (wrapper as any).listener = listener;
    return this.on(eventName, wrapper);

  }

  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this.off(eventName, listener);
  }


  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const map: Map<string | Symbol, Function[]> = this.get(events);
    if (map.has(eventName)) {
      const list = map.get(eventName) || [];
      const index = list.findIndex(item => item === listener);
      list.splice(index, 1);
      if (list.length === 0) {
        map.delete(eventName);
      }
    }
    return this;
  }

  removeAllListeners(event?: string | symbol | undefined): this {
    if (event !== undefined) {
      this.get(events).delete(event);
    } else {
      this.set(events, new Map());
    }
    return this;
  }

  setMaxListeners(n: number): this {
    this.set(maxListeners, n);
    return this;
  }

  getMaxListeners(): number {
    return this.get(maxListeners);
  }

  listeners(eventName: string | symbol): Function[] {
    const list: Function[] = this.get(events).get(eventName) || [];
    const ret: Function[] = [];
    for (const func of list) {
      if ((func as any).listener) {
        ret.push((func as any).listener as Function);
      } else {
        ret.push(func);
      }
    }
    return ret;
  }

  rawListeners(eventName: string | symbol): Function[] {
    const list = this.get(events).get(eventName) || [];
    return [...list];
  }
  
  emit(eventName: string | symbol, ...args: any[]): boolean {
    if (!this.get(events).has(eventName)) {
      return false;
    }
    const isCaptureRejections = this.get(captureRejections);
    const list = this.get(events).get(eventName);
    for (const func of list) {
      if (isCaptureRejections) {
        try {
          func(...args);
        } catch (e) {
          console.error(e);
        }
      } else {
        func(...args);
      }
    }
    return true;
  }


  listenerCount(eventName: string | symbol): number {
    return this.get(events).get(eventName).length;
  }
  
  prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (listener === null || listener === undefined || typeof listener !== 'function') {
      throw new Error('error listener must be function');
    }
    const map: Map<string | Symbol, Function[]> = this.get(events);
    let list: Function[];
    if (map.has(eventName)) {
      list = map.get(eventName) || [];
    } else {
      list = [];
      map.set(eventName, list);
    }
    list.unshift(listener);
    return this;
  }


  prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (listener === null || listener === undefined || typeof listener !== 'function') {
      throw new Error('error listener must be function');
    }
    const wrapper = (...args: any[]) => {
      listener(...args);
      this.off(eventName, wrapper);
    };
    wrapper.listener = listener;
    return this.prependListener(eventName, wrapper);
  }

  eventNames(): (string | symbol)[] {
    const list: (string | symbol)[] = [];
    const iter: IterableIterator<any> = this.get(events).keys();
    for(const name of iter) {
      list.push(name);
    }
    return list;
  }
  
}
