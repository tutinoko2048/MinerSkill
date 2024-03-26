// @ts-check
/**
 * @template Event
 * @typedef {(arg: Event) => void} EventCallback
 */
/**
 * @template Event
 */
export class BaseEventSignal {
  constructor() {
    this.callbacks = new Set();
  }

  /**@param {EventCallback<Event>} callback */
  subscribe(callback) {
    this.callbacks.add(callback);
    return callback;
  }

  /**@param {EventCallback<Event>} callback */
  unsubscribe(callback) {
    if (!callback) throw Error('callback must be specified.');
    if (!this.callbacks.has(callback)) throw Error('This funtion is not subscribed.');
    this.callbacks.delete(callback);
    return callback;
  }
}

