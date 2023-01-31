import { world, system, Direction, Location, GameMode } from '@minecraft/server';

export function killItem(loc, dimension) {
  system.run(() => {
    const items = dimension.getEntities({
      location: new Location(loc.x, loc.y, loc.z),
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
  if (rotation > 45 && rotation <= 135) return Direction.west; // -x
  if (rotation > 135 || rotation <= -135) return Direction.north; // -z
  if (rotation > -135 && rotation <= -45) return Direction.east; // +x
  return Direction.south; // +z
}

export const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export function addScore(objective, player, value) {
  try {
    /*
    const obj = world.scoreboard.getObjective(objective);
    const score = player.scoreboard.getScore(obj);
    return player.scoreboard.setScore(obj, score + value);
    */
    player.runCommandAsync(`scoreboard players add @s "${objective}" ${value}`);
  } catch {}
}

export function getGamemode(player) {
  for (const gamemodeName in GameMode) {
    if ([...world.getPlayers({ name: player.name, gameMode: GameMode[gamemodeName] })].length > 0) {
      return GameMode[gamemodeName];
    }
  }
}
  
export function isSurvival(player) {
  return getGamemode(player) === GameMode.survival;
}

export function isCreative(player) {
  return getGamemode(player) === GameMode.creative;
}

export function isAdventure(player) {
  return getGamemode(player) === GameMode.adventure;
}

export function isSpectator(player) {
  return getGamemode(player) === GameMode.spectator;
}