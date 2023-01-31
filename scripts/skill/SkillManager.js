import { BreakSkill } from './BreakSkill';
import config from '../config/config.js';

const SKILLS = config.skills.map(skill => new BreakSkill(skill.name, skill.id, skill.size, skill.tag));

export class SkillManager {
  static getSkill(skillId) {
    return SKILLS.find(skill => skill.id === skillId);
  }
  
  static getAllSkills() {
    return SKILLS;
  }
}