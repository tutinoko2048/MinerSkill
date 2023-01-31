export default {
  "minecraft:dirt": {
    scores: [
      { objective: "mine", value: 2 }
    ]
  },
  
  "minecraft:stone": {
    gives: [
      { item: "minecraft:emerald" }
    ],
    scores: [
      { objective: "mine", value: 2 }
    ],
    commands: [
      
    ],
    actionbar: "§a%{player}§f が %{block} を壊した！ §7[%{x}, %{y}, %{z}]",
    chance: 99,
    randomize: [
      {
        range: 0,
        message: "§l§e大当たり！",
        gives: [
          { item: "minecraft:gold_ingot", amount: 1 }
        ],
        scores: [
          { objective: "mine", value: 1000 }
        ]
      },
      {
        range: [ 1, 10 ],
        gives: [
          { item: "minecraft:iron_ingot", amount: 1 }
        ]
      }
    ]
  },
  defaultLoot: {
    scores: [
      { objective: "mine", value: 1 }
    ]
  }
}

/* example
  "minecraft:stone": {
    gives: [
      {
        item: "minecraft:emerald",
        amount: 1, 
        data: 0, 
        nameTag: 'test',
        lore: [ "this", "is", "lore" ]
      }
    ],
    scores: [
      { objective: "mine", value: 1 }
    ],
    commands: [
      "title @s actionbar §a%{player}§f が %{block} を壊した！ §7[%{x}, %{y}, %{z}]"
    ],
    drop: false,
    chance: 99,
    randomize: [
      {
        range: [ 0 ],
        message: "§l石の中から何か出てきたようだ...",
        gives: [
          { item: "minecraft:gold_ingot", amount: 1 }
        ]
      },
      {
        range: [ 1, 10 ],
        gives: [
          { item: "minecraft:iron_ingot", amount: 1 }
        ]
      }
    ]
  }
*/

/* list of types
type Loot = {
  gives?: ItemData[],
  scores?: ScoreData[],
  commands?: string[],
  message?: string,
  actionbar?: string,
  drop?: boolean,
  chance?: number,
  randomize?: Loot[],
  range?: number[] | number
}

type ItemData = {
  item: string,
  amount?: number,
  data?: number,
  nameTag?: string,
  lore?: string[]
}

type ScoreData = {
  objective: string,
  value: number
}
*/