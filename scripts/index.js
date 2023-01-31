import { world, ObjectiveSortOrder } from '@minecraft/server';
import { events } from './lib/events/index.js';
import * as util from './util';
import { SkillManager } from './skill/SkillManager';
import config from './config/config.js';

world.events.blockBreak.subscribe(ev => {
  try {
    onBreak(ev);
  } catch(e) { console.error(e, e.stack) }
  
  if (ev.cancel) {
    const { block } = ev;
    util.killItem(block.location, block.dimension);
    block.setPermutation(ev.brokenBlockPermutation);
  }
});

function onBreak(ev) {
  const { player, block, brokenBlockPermutation: permutation } = ev;
  const blockId = permutation.type.id;
  
  const skill = getPlayerSkill(player, ObjectiveSortOrder.descending);
  if (skill) skill.run(ev);
}

function getPlayerSkill(player, sortOrder = ObjectiveSortOrder.ascending) {
  const tags = player.getTags();
  const skills = SkillManager.getAllSkills().slice();
  if (sortOrder === ObjectiveSortOrder.descending) skills.reverse();
  return skills.find(skill => tags.includes(skill.tag));
}