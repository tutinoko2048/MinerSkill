// @ts-check
import { world, system, Direction, GameMode } from '@minecraft/server';

/**
 * 
 * @param {import('@minecraft/server').Vector3} location 
 * @param {import('@minecraft/server').Dimension} dimension 
 */
export function killItem(location, dimension) {
  system.run(() => {
    const items = dimension.getEntities({
      location,
      maxDistance: 1.5,
      type: 'minecraft:item'
    });
    for (const i of items) i.kill();
  });
}

/**
 * @author ChatGPT
 * @param {number} rotation
 */
export function getDirection(rotation) {
  if (rotation > 45 && rotation <= 135) return Direction.West; // -x
  if (rotation > 135 || rotation <= -135) return Direction.North; // -z
  if (rotation > -135 && rotation <= -45) return Direction.East; // +x
  return Direction.South; // +z
}
/**@type {(min:number,max:number) => number} */
export const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * 
 * @param {import('@minecraft/server').Player} player
 * @returns {GameMode[keyof GameMode] | undefined}
 */
export function getGamemode(player) {
  for (const gamemodeName in GameMode) {
    if ([...world.getPlayers({ name: player.name, gameMode: GameMode[gamemodeName] })].length > 0) {
      return GameMode[gamemodeName];
    }
  }
}

/**
 * @param {import('@minecraft/server').Player} player
 */
export function isSurvival(player) {
  return getGamemode(player) === GameMode.survival;
}

/**
 * @param {import('@minecraft/server').Player} player
 */
export function isCreative(player) {
  return getGamemode(player) === GameMode.creative;
}

/**
 * @param {import('@minecraft/server').Player} player
 */
export function isAdventure(player) {
  return getGamemode(player) === GameMode.adventure;
}

/**
 * @param {import('@minecraft/server').Player} player
 */
export function isSpectator(player) {
  return getGamemode(player) === GameMode.spectator;
}

/**
 * @param {import('@minecraft/server').Vector3} loc1 
 * @param {import('@minecraft/server').Vector3} loc2 
 */
export function equalPos(loc1, loc2) {
  return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z;
}

/**
 * @param {import('@minecraft/server').Player | string} player 
 * @param {import('@minecraft/server').ScoreboardObjective | string} objective 
 */
export function getScore(player, objective) {
  return getObjective(objective).getScore(player) ?? null;
}

/**
 * @param {import('@minecraft/server').Player | string} player 
 * @param {import('@minecraft/server').ScoreboardObjective | string} objective 
 * @param {number} score 
 */
export function setScore(player, objective, score) {
  return getObjective(objective).setScore(player, score);
}

/**
 * @param {import('@minecraft/server').Player | string} player 
 * @param {import('@minecraft/server').ScoreboardObjective | string} objective 
 * @param {number} score 
 */
export function addScore(player, objective, score) {
  return setScore(player, objective, (getScore(player, objective) ?? 0) + score);
}
/**
 * @param {import('@minecraft/server').ScoreboardObjective | string} objective 
 */
function getObjective(objective) {
  return typeof objective === 'string' ? world.scoreboard.getObjective(objective) : objective;
}