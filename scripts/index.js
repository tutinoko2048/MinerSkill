// @ts-check
import { world, ObjectiveSortOrder } from '@minecraft/server';
import { SkillManager } from './skill/SkillManager';

world.afterEvents.blockBreak.subscribe(ev => {
  try {
    onBreak(ev);
  } catch (e) { console.error(e, e.stack) }
});

/**
 * 
 * @param {import('@minecraft/server').BlockBreakAfterEvent} ev 
 */
function onBreak(ev) {
  const skill = getPlayerSkill(ev.player, ObjectiveSortOrder.Descending);
  if (skill) skill.run(ev);
}

/**
 * 
 * @param {import('@minecraft/server').Player} player 
 * @param {import('@minecraft/server').ObjectiveSortOrder} sortOrder 
 */
function getPlayerSkill(player, sortOrder = ObjectiveSortOrder.Ascending) {
  const tags = player.getTags();
  const skills = SkillManager.getAllSkills().slice();
  if (sortOrder === ObjectiveSortOrder.Descending) skills.reverse();
  return skills.find(skill => tags.includes(skill.tag));
}