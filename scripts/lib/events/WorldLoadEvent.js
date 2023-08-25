// @ts-check
import { world, system } from '@minecraft/server';
import { BaseEventSignal } from './BaseEventSignal';

let loaded = false;

export class WorldLoadEvent {
  /**@type {boolean} */
  #state;
  
  /**@param {boolean} state */
  constructor(state) {
    this.#state = state;
  }
  
  get state() {
    return this.#state;
  }
}

/**
 * @extends {BaseEventSignal<WorldLoadEvent>}
 */
export class WorldLoadEventSignal extends BaseEventSignal {
  constructor() {
    super();
    
    const run = system.runInterval(() => {
      world.getDimension('overworld').runCommandAsync('testfor @a').then(() => {
        if (loaded) return;
        this.callbacks.forEach(fn => fn(new WorldLoadEvent(true)));
        loaded = true;
        system.clearRun(run);
      });
    });
  }
}