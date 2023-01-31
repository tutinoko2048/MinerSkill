import { world, Direction, MinecraftBlockTypes, ItemStack, ItemTypes, BlockLocation } from '@minecraft/server';
import config from '../config/config.js';
import loot_table from '../config/loot_table.js';
import * as util from '../util';
import toJson from '../lib/toJson';
import { PlaceHolder } from '../lib/PlaceHolder';

const AIR = MinecraftBlockTypes.air;

const placeHolder = new PlaceHolder();
placeHolder.register('x', ({x}) => x)
  .register('y', ({y}) => y)
  .register('z', ({z}) => z)
  .register('block', ({block}) => block)
  .register('player', ({player}) => player);
  

export class BreakSkill {
  constructor(name, id, { height, width, depth }, tag) {
    this.name = name;
    this.id = id;
    this.height = height;
    this.width = width;
    this.depth = depth;
    this.tag = tag;
  }
  
  run(ev) {
    const { player, block: brokenBlock, brokenBlockPermutation: permutation, dimension } = ev;
    const blockId = permutation.type.id;
    if (!this.isAvailable(player)) return;
    const res = this.lootTable(brokenBlock, player, blockId)
    if (!res.drop) util.killItem(brokenBlock.location, dimension);
    
    for (const loc of this.getArea(brokenBlock.location, player)) {
      if (loc.equals(brokenBlock.location)) continue;
      const block = brokenBlock.dimension.getBlock(loc);
      if (!this.isBreakable(block)) continue;
      
      const res = this.lootTable(block, player);
      
      if (res.drop) {
        player.dimension.runCommandAsync(`setblock ${loc.x} ${loc.y} ${loc.z} air 0 destroy`);
      } else {
        block.setType(AIR);
      }
    }
  }
  
  getArea(origin, player) {
    const facing = util.getDirection(player.rotation.y);
    const start = new BlockLocation(origin.x, origin.y, origin.z);
    const end = new BlockLocation(origin.x, origin.y, origin.z);
    const playerY = Math.floor(player.location.y);
    
    // fix xz location by facing
    if (facing === Direction.north) {
      start.x -= this.width;
      end.x += this.width;
      end.z -= this.depth;
    }
    if (facing === Direction.south) {
      start.x += this.width;
      end.x -= this.width;
      end.z += this.depth;
    }
    if (facing === Direction.east) {
      start.z -= this.width;
      end.z += this.width;
      end.x += this.depth;
    }
    if (facing === Direction.west) {
      start.z += this.width;
      end.z -= this.width;
      end.x -= this.depth;
    }
    // fix y location: higher
    if (playerY <= origin.y && origin.y <= playerY + this.height) {
      start.y = playerY;
    }

    end.y = start.y + this.height;
    
    return start.blocksBetween(end);
  }
  
  isAvailable(player) {
    const item = player.getComponent('minecraft:inventory').container.getItem(player.selectedSlot);
    
    return (
      !player.isSneaking &&
      !config.item.deny.includes(item?.typeId) &&
      (config.item.allow instanceof Array ? config.item.allow.includes(item?.typeId) : config.item.allow) &&
      (!config.ignoreCreative || !util.isCreative(player))
    )
  }

  isBreakable(block) {
    return (
      block.typeId !== 'minecraft:air' &&
      !config.block.deny.includes(block.typeId) &&
      (config.block.allow instanceof Array ? config.block.allow.includes(block.typeId) : config.block.allow)
    )
  }
  
  lootTable(block, player, blockId = block.typeId) {
    const loot = loot_table[blockId] ?? loot_table.defaultLoot;
    if (!loot) return;
    return this.runLoot(loot, block, player, blockId);
  }
  
  runLoot(loot, block, player, blockId = block.typeId) {
    const { container } = player.getComponent('minecraft:inventory');
    const res = {}
    
    if (loot.gives) loot.gives.forEach(data => {
      const item = new ItemStack(ItemTypes.get(data.item), data.amount ?? 1, data.data ?? 0);
      if (data.nameTag) item.nameTag = data.nameTag;
      if (data.lore?.length > 0) item.setLore(data.lore.slice());
      container.addItem(item);
    });
    
    if (loot.scores) loot.scores.forEach(data => {
      util.addScore(data.objective, player, data.value);
    });
    
    if (loot.commands) loot.commands.forEach(command => {
      const { x, y, z } = block;
      const parsed = placeHolder.parse(command, { x, y, z, block: blockId, player: player.name });
      player.runCommandAsync(parsed);
    });
    
    if (loot.message) player.tell(loot.message);
    
    if (loot.actionbar) {
      const { x, y, z } = block;
      const parsed = placeHolder.parse(loot.actionbar, { x, y, z, block: blockId, player: player.name });
      player.onScreenDisplay.setActionBar(parsed);
    }
    
    res.drop = loot.drop ?? false;
    
    const randomized = util.random(0, loot.chance ?? 0);
    if (loot.randomize) loot.randomize.forEach(_loot => {
      const min = _loot.range instanceof Array ? _loot.range[0] : _loot.range;
      const max = _loot.range instanceof Array ? (_loot.range[1] ?? _loot_range[0]) : _loot.range;
      
      if (Math.min(min, max) <= randomized && randomized <= Math.max(min, max)) {
        this.runLoot(_loot, block, player, blockId);
      }
    });
    
    return res;
  }
}