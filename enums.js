const Enums = {
  Affiliation: {Player: "Player", Enemy: "Enemy", Neutral: "Neutral"},
  GameState: {Select: "Select", Move: "Move", Action: "Action", Menu: "Menu", Waiting: "Waiting", Trading: "Trading"},
  Tile: {
    Wall: {Name: "Wall", Traversible: False, Cover: 0, Def: 0, Color: "Black"}, // not sure about colors yet
    Grass: {Name: "Grass", Traversible: True, Cover: 0, Def: 0, Color: "White"},
    Forest: {Name: "Forest", Traversible: True, Cover: 30, Def: 0, Color: "Green"},
    Fort: {Name: "Fort", Traversible: True, Cover: 30, Def: 1, Color: "Gray"}
  },
  WeaponType: {Sword: "Sword", Lance: "Lance", Axe: "Axe", Anima: "Anima", Dark: "Dark", Light: "Light", Bow: "Bow", Rod: "Rod"},
	Class: {
		Mercenary: {Name: "Mercenary", Sword: True},
		Bandit: {Name: "Bandit", Axe: True},
		Cavalier: {Name: "Cavalier", Lance: True, Sword: True},
		Mage: {Name: "Mage", Anima: True},
		Archer: {Name: "Archer", Bow: True},
		Knight: {Name: "Knight", Lance: True},
		Cleric: {Name: "Cleric", Rod: True},

		Lord: {Name: "Lord", Sword: True},
		Aide: {Name: "Aide", Sword: True, Lance: True}
	},
	Behavior: {Chase: "Chase", Idle: "Idle", Waiting: "Waiting"}
}

export {Enums}
