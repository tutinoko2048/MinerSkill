// @ts-check
/**
 * @typedef Skill
 * @prop {string} name
 * @prop {string} id
 * @prop {{height: number, width: number, depth: number}} size
 * @prop {string} tag
 * 
 * @typedef AllowDenyList
 * @prop {boolean | string[]} allow
 * @prop {string[]} deny
 */
/**
 * @type {{
 *  ignoreCreative: boolean,
 *  skills: Skill[],
 *  block: AllowDenyList,
 *  item: AllowDenyList
 * }}
 */
export default {
  ignoreCreative: false,
  skills: [
    {
      name: "Skill 1",
      id: "skill1",
      size: { height: 1, width: 0, depth: 0 },
      tag: "tn:skill1"
    },
    {
      name: "Skill 2",
      id: "skill2",
      size: { height: 1, width: 1, depth: 0 },
      tag: "tn:skill2"
    },
    {
      name: "Skill 3",
      id: "skill3",
      size: { height: 2, width: 1, depth: 0 },
      tag: "tn:skill3"
    },
    {
      name: "Skill 4",
      id: "skill4",
      size: { height: 1, width: 1, depth: 1 },
      tag: "tn:skill4"
    },
    {
      name: "Skill 5",
      id: "skill5",
      size: { height: 2, width: 1, depth: 2 },
      tag: "tn:skill5"
    },
    {
      name: "Skill 6",
      id: "skill6",
      size: { height: 4, width: 2, depth: 0 },
      tag: "tn:skill6"
    }
  ],
  block: {
    allow: true,
    deny: [ 'minecraft:bedrock' ]
  },
  item: {
    allow: true,
    deny: []
  }
}