// @ts-check
import { Direction, MinecraftBlockTypes, ItemStack, ItemTypes, BlockVolumeUtils, EntityInventoryComponent } from '@minecraft/server';
import config from '../config/config.js';
import loot_table from '../config/loot_table.js';
import * as util from '../util';
import toJson from '../lib/toJson';
import { PlaceHolder } from '../lib/PlaceHolder';

const AIR = MinecraftBlockTypes.air;

const placeHolder = new PlaceHolder();
placeHolder.register('x', ({ x }) => x)
  .register('y', ({ y }) => y)
  .register('z', ({ z }) => z)
  .register('block', ({ block }) => block)
  .register('player', ({ player }) => player);


export class BreakSkill {
  /**
   * 
   * @param {import('../config/config.js').Skill['name']} name 
   * @param {import('../config/config.js').Skill['id']} id 
   * @param {import('../config/config.js').Skill['size']} param2 
   * @param {import('../config/config.js').Skill['tag']} tag 
   */
  constructor(name, id, { height, width, depth }, tag) {
    this.name = name;
    this.id = id;
    this.height = height;
    this.width = width;
    this.depth = depth;
    this.tag = tag;
  }

  /**
   * 
   * @param {import('@minecraft/server').BlockBreakAfterEvent} ev 
   * @returns 
   */
  run(ev) {
    const { player, block: brokenBlock, brokenBlockPermutation: permutation, dimension } = ev;
    const blockId = permutation.type.id;
    if (!this.isAvailable(player)) return;
    const res = this.lootTable(brokenBlock, player, blockId)
    if (!res?.drop) util.killItem(brokenBlock.location, dimension);

    for (const loc of this.getArea(brokenBlock.location, player)) {
      if (util.equalPos(loc, brokenBlock.location)) continue;
      const block = brokenBlock.dimension.getBlock(loc);
      if (!this.isBreakable(block)) continue;

      const res = this.lootTable(block, player);

      if (res?.drop) {
        player.dimension.runCommandAsync(`setblock ${loc.x} ${loc.y} ${loc.z} air 0 destroy`);
      } else {
        block.setType(AIR);
      }
    }
  }

  /**
   * 
   * @param {import('@minecraft/server').Vector3} origin 
   * @param {import('@minecraft/server').Player} player 
   * @returns 
   */
  getArea(origin, player) {
    const facing = util.getDirection(player.getRotation().y);
    const from = { ...origin };
    const to = { ...origin };
    const playerY = Math.floor(player.location.y);

    // fix xz location by facing
    if (facing === Direction.North) {
      from.x -= this.width;
      to.x += this.width;
      to.z -= this.depth;
    }
    if (facing === Direction.South) {
      from.x += this.width;
      to.x -= this.width;
      to.z += this.depth;
    }
    if (facing === Direction.East) {
      from.z -= this.width;
      to.z += this.width;
      to.x += this.depth;
    }
    if (facing === Direction.West) {
      from.z += this.width;
      to.z -= this.width;
      to.x -= this.depth;
    }
    // fix y location: higher
    if (playerY <= origin.y && origin.y <= playerY + this.height) {
      from.y = playerY;
    }

    to.y = from.y + this.height;

    return BlockVolumeUtils.getBlockLocationIterator({ from, to });
  }

  /**
   * 
   * @param {import('@minecraft/server').Player} player 
   * @returns 
   */
  isAvailable(player) {
    const item = /**@type {EntityInventoryComponent}*/(player.getComponent('minecraft:inventory'))?.container.getItem(player.selectedSlot);

    return (
      item &&
      !player.isSneaking &&
      !config.item.deny.includes(item?.typeId) &&
      (config.item.allow instanceof Array ? config.item.allow.includes(item?.typeId) : config.item.allow) &&
      (!config.ignoreCreative || !util.isCreative(player))
    )
  }

  /**
   * 
   * @param {import('@minecraft/server').Block | undefined} block 
   * @returns {block is import('@minecraft/server').Block}
   */
  isBreakable(block) {
    return Boolean(
      block &&
      block.typeId !== 'minecraft:air' &&
      !config.block.deny.includes(block.typeId) &&
      (config.block.allow instanceof Array ? config.block.allow.includes(block.typeId) : config.block.allow)
    )
  }

  /**
   * 
   * @param {import('@minecraft/server').Block} block 
   * @param {import('@minecraft/server').Player} player 
   * @param {string} blockId 
   * @returns 
   */
  lootTable(block, player, blockId = block.typeId) {
    const loot = loot_table[blockId] ?? loot_table.defaultLoot;
    if (!loot) return;
    return this.runLoot(loot, block, player, blockId);
  }

  /**
   * 
   * @param {import('../config/loot_table.js').Loot} loot 
   * @param {import('@minecraft/server').Block} block 
   * @param {import('@minecraft/server').Player} player 
   * @param {string} blockId 
   * @returns 
   */
  runLoot(loot, block, player, blockId = block.typeId) {
    const { container } = /**@type {EntityInventoryComponent} */(player.getComponent('minecraft:inventory'));
    const res = {}

    if (loot.gives) loot.gives.forEach(data => {
      const item = new ItemStack(ItemTypes.get(data.item), data.amount ?? 1);
      if (data.nameTag) item.nameTag = data.nameTag;
      if (data.lore && data.lore.length > 0) item.setLore(data.lore.slice());
      container.addItem(item);
    });

    if (loot.scores) loot.scores.forEach(data => {
      util.addScore(player, data.objective, data.value);
    });

    if (loot.commands) loot.commands.forEach(command => {
      const { x, y, z } = block;
      const parsed = placeHolder.parse(command, { x, y, z, block: blockId, player: player.name });
      player.runCommandAsync(parsed);
    });

    if (loot.message) player.sendMessage(loot.message);

    if (loot.actionbar) {
      const { x, y, z } = block;
      const parsed = placeHolder.parse(loot.actionbar, { x, y, z, block: blockId, player: player.name });
      player.onScreenDisplay.setActionBar(parsed);
    }

    res.drop = loot.drop ?? false;

    const randomized = util.random(0, loot.chance ?? 0);
    if (loot.randomize) loot.randomize.forEach(_loot => {
      const min = _loot.range instanceof Array ? _loot.range[0] : _loot.range;
      const max = _loot.range instanceof Array ? (_loot.range[1] ?? _loot.range[0]) : _loot.range;

      if (Math.min(min, max) <= randomized && randomized <= Math.max(min, max)) {
        this.runLoot(_loot, block, player, blockId);
      }
    });

    return res;
  }
}