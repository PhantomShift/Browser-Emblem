// There's a lot of messy setup up here, I didn't realize modules could not be used without a server when I made my prototype in Lua
function convertStringToMapArray(stringMap) {
  console.log(stringMap)
  var map = new Array();
  let lines = stringMap.split("\n")
  lines.forEach(function(string, index){
    map.push(string.split(""))
  })
  console.log(map)
  return map
}

// Credits to Javidx9 for the C++ implementation and tutorial that this JS A* algorithm is based on
// Manually ported from Lua
class Node {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.Obstacle = false;
    this.Visited = false;
    this.Neighbors = [];
    this.GlobalGoal = Infinity;
    this.LocalGoal = Infinity;
  }
  GetNeighbors(NodeMap) {
    let posx = this.x;
    let posy = this.y;
    let neighbors = [];
    if (posx > 0) {
      neighbors.push(NodeMap[posx-1][posy])
    }
    if (posx < NodeMap.length - 1) {
      neighbors.push(NodeMap[posx+1][posy])
    }
    if (posy > 0) {
      neighbors.push(NodeMap[posx][posy-1])
    }
    if (posy < NodeMap[0].length - 1) {
      neighbors.push(NodeMap[posx][posy+1])
    }
    return neighbors
  }
}

function A_Star(Map, StartNode, EndNode) {
  // Reset the state of the Map
  for (let x = 0; x < Map.length; x++) {
    for (let y = 0; y < Map[x].length; y++) {
      Map[x][y].Visited = false;
      Map[x][y].GlobalGoal = Infinity;
      Map[x][y].LocalGoal = Infinity;
      Map[x][y].parent = null
    }
  }
  // Functions that will be used extensively
  function Distance(Node1, Node2) {
    return Math.sqrt((Node1.x-Node2.x) * (Node1.x-Node2.x) + (Node1.y-Node2.y) * (Node1.y-Node2.y))
  }
  function Heuristic(Node1, Node2) {
    return Distance(Node1, Node2)
  }
  // Initial conditions
  StartNode.LocalGoal = 0;
  StartNode.GlobalGoal = Heuristic(StartNode, EndNode);

  let currentNode = null;
  let uncheckedNodes = new Array();
  uncheckedNodes[0] = StartNode
  while (uncheckedNodes.length > 0 && currentNode != EndNode) {
    // Sort uncheckedNodes by distance
    uncheckedNodes.sort(function(node1, node2) {return Distance(node1, EndNode) - Distance(node2, EndNode)});
    // Remove any nodes that have been checked
    while (uncheckedNodes.length > 0 && uncheckedNodes[0].Visited) {
      uncheckedNodes.shift()
    }
    if (uncheckedNodes.length == 0) {break};
    currentNode = uncheckedNodes[0];
    currentNode.Visited = true;
    for (let i = 0; i < currentNode.Neighbors.length; i++) {
      let neighbor = currentNode.Neighbors[i];
      if (!neighbor.Visited && !neighbor.Obstacle) {uncheckedNodes.push(neighbor)}
      let potentialGoal = currentNode.LocalGoal + Distance(currentNode, neighbor);
      if (potentialGoal < neighbor.LocalGoal) {
        neighbor.parent = currentNode;
        neighbor.LocalGoal = potentialGoal;
        neighbor.GlobalGoal = neighbor.LocalGoal + Heuristic(neighbor, EndNode)
      }
    }
  }
  let path = [];
  let pathNode = EndNode;
  while (pathNode.parent) {
    path.unshift(pathNode)
    pathNode = pathNode.parent
  }

  return path
};

const Enums = {
  Affiliation: {Player: "Player", Enemy: "Enemy", Neutral: "Neutral"},
  GameState: {Select: "Select", Move: "Move", Action: "Action", Menu: "Menu", Waiting: "Waiting", Trading: "Trading"},
  MovementType: {Ground: "Ground", Flying: "Flying"},
  Tile: {
    Wall: {Name: "Wall", Traversible: false, Cover: 0, DEF: 0, Color: "Black", Image: "assets/wall.png"},
    Grass: {Name: "Grass", Traversible: true, Cover: 0, DEF: 0, Color: "White", Image: "assets/grass.png"},
    Forest: {Name: "Forest", Traversible: true, Cover: 30, DEF: 0, Color: "Green", Image: "assets/forest.png"},
    Fort: {Name: "Fort", Traversible: true, Cover: 30, DEF: 1, Color: "Gray", Image: "assets/fort.png"}
  },
  WeaponType: {Sword: "Sword", Lance: "Lance", Axe: "Axe", Anima: "Anima", Dark: "Dark", Light: "Light", Bow: "Bow", Rod: "Rod"},
  AttackType: {Physical: "Physical", Magical: "Magical"},
	Class: {
		Mercenary: {Name: "Mercenary", Sword: true},
		Brigand: {Name: "Brigand", Axe: true},
		Cavalier: {Name: "Cavalier", Lance: true, Sword: true},
        Soldier: {Name: "Soldier", Lance: true},
		Mage: {Name: "Mage", Anima: true},
        Shaman: {Name: "Shaman", Dark: true},
		Archer: {Name: "Archer", Bow: true},
		Knight: {Name: "Knight", Lance: true},
		Cleric: {Name: "Cleric", Rod: true},

		Lord: {Name: "Lord", Sword: true},
		Aide: {Name: "Aide", Sword: true, Lance: true}
	},
	Behavior: {Chase: "Chase", Idle: "Idle", Waiting: "Waiting"}
}

const WeaponTriangle = {
	[Enums.WeaponType.Sword]: {[Enums.WeaponType.Axe]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Lance]: {ATK: -1, ACC: -20}},
	[Enums.WeaponType.Axe]: {[Enums.WeaponType.Lance]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Sword]: {ATK: -1, ACC: -20}},
	[Enums.WeaponType.Lance]: {[Enums.WeaponType.Sword]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Axe]: {ATK: -1, ACC: -20}},
	[Enums.WeaponType.Anima]: {[Enums.WeaponType.Light]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Dark]: {ATK: - 1, ACC: -20}},
	[Enums.WeaponType.Dark]: {[Enums.WeaponType.Anima]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Light]: {ATK: - 1, ACC: -20}},
	[Enums.WeaponType.Light]: {[Enums.WeaponType.Dark]: {ATK: 1, ACC: 20}, [Enums.WeaponType.Anima]: {ATK: - 1, ACC: -20}},
	[Enums.WeaponType.Bow]: {}
}

// Unit Class stuff
class Unit {
  constructor(params) {
    this.Name = params.Name || "Name";
    this.Class = params.Class; // Required on purpose
    this.MAXHP = params.MAXHP || 20;
    this.LVL = params.LVL || 1;
    this.EXP = params.EXP || 0;
    this.HP = params.MAXHP || 20;
    this.POW = params.POW || 4,
    this.DEF = params.DEF || 3;
    this.RES = params.RES || 3;
    this.SKL = params.SKL || 4;
    this.LUK = params.LUK || 4;
    this.SPD = params.SPD || 3;
    this.MOV = params.MOV || 5;
    this.Growth = params.Growth || {HP: 50, POW: 45, DEF: 35, SPD: 35, RES: 25, SKL: 30, LUK: 30};
    this.MovementType = params.MovementType || Enums.MovementType.Ground;
    this.Affiliation = params.Affiliation|| Enums.Affiliation.Neutral;
    this.x = params.x;
    this.y = params.y;
    this.Behavior = params.Behavior || Enums.Behavior.Waiting;
    this.Inventory = params.Inventory || [];
    this.Image = document.createElement("img");
    this.Image.src = params.Image || "assets/placeholder.png"
    this.Image.alt = this.Name
    this.Image.className = "unit image"
    // fully optional parameters
    for (const parameter in params) {
      if (!this.hasOwnProperty(parameter)) {
        this[parameter] = params[parameter]
      }
    }
  }
  Reposition(x, y, timeMultiple) {
      let RootMap = this.RootMap;
      let oldx = this.x;
      let oldy = this.y;
      this.x = x; this.y = y;
	  let img = this.Image
      RootMap.CharacterMap[oldx][oldy] = null;
      RootMap.CharacterMap[x][y] = this;
      function render() {
		  let newImg = document.createElement("img");
          newImg.className = "image"
		  newImg.src = RootMap.MetaMap[x][y].Image;
		  RootMap.RenderMap[x][y].appendChild(newImg);
		  RootMap.RenderMap[x][y].appendChild(img);
		  let oldImg = document.createElement("img");
          oldImg.className = "image"
		  oldImg.src = RootMap.MetaMap[oldx][oldy].Image
		  RootMap.RenderMap[oldx][oldy].appendChild(oldImg)
	  }
	  if (timeMultiple) {setTimeout(render, timeMultiple * 1000)} else {render()}
  }
  GetTraversibleTiles() {
    let RootMap = this.RootMap
    let traversibles = [];
    let posx = this.x; let posy = this.y;
    let maxDistance = this.MOV;
    for (let x = -maxDistance; x <= maxDistance; x++) {
      let maxY = maxDistance - Math.abs(x)
      for (let y = -maxY; y <= maxY; y++) {
        let TrueX = x + posx;
        let TrueY = y + posy;
        let occupyingUnit = RootMap.CharacterMap[TrueX] && RootMap.CharacterMap[TrueX][TrueY] || null;
        let validNode = RootMap.NodeMap[TrueX] && RootMap.NodeMap[TrueX][TrueY];
        if ((occupyingUnit && occupyingUnit.Affiliation == this.Affiliation || !occupyingUnit) && validNode && RootMap.MetaMap[TrueX][TrueY].Traversible) {
          traversibles.push(validNode)
        }
      }
    }
    // Determine whether or not these nodes can actually be accessed
    let trueTraversibles = [];
    let StartNode = RootMap.NodeMap[posx][posy];
    traversibles.forEach(function(endNode, index){
      let Path = A_Star(RootMap.NodeMap, StartNode, endNode);
      if (Path.length <= maxDistance && Path[Path.length -1] == endNode) {trueTraversibles.push(endNode)}
    })
    trueTraversibles.push(RootMap.NodeMap[this.x][this.y])
    return trueTraversibles
  }
  GetAllAttackableTiles() {
    let currentRange = this.GetTraversibleTiles();
    let tilesToCheck = [];
    let unit = this;
    currentRange.forEach(function(tile, index){
      let occupied = unit.RootMap.CharacterMap[tile.x][tile.y];
      // If the tile is already occupied by another unit, then don't bother checking the node's neighbors
      if (occupied != 0 && occupied != this) {return}
      // Check if ALL of the neighbors of this tile are already in the range of the unit
      let checkedNeighbors = 0;
      tile.Neighbors.forEach(function(neighbor, index){
        if (currentRange.includes(neighbor)) {checkedNeighbors ++}
      })
      if (checkedNeighbors < 4) {tilesToCheck.push(tile)}
    })
    tilesToCheck.forEach(function(tile, index){
      let attackableTiles = unit.GetAttackableTiles(tile)
      attackableTiles.forEach(function(attackable, bindex){
        if (!currentRange.includes(attackable)) {currentRange.push(attackable)}
      })
    })
    return currentRange
  }
  GetAttackableTiles(SpecificNode) {
    if (!this.Equipped) {return []}
    let RootMap = this.RootMap;
    let posx = this.x; let posy = this.y;
    let attackables = [];
    this.Equipped.Range.forEach(function(valid, index){
      if (!valid) {return}
      for (let x = -index; x <= index; x++) {
        let maxY = index - Math.abs(x);
        for (let y = -maxY; y <= maxY; y++) {
          let TrueX = x + (SpecificNode && SpecificNode.x || posx);
          let TrueY = y + (SpecificNode && SpecificNode.y || posy);
          if (Math.abs(y) + Math.abs(x) == index && RootMap.NodeMap[TrueX] && RootMap.NodeMap[TrueX][TrueY]) {attackables.push(RootMap.NodeMap[TrueX][TrueY])}
        }
      }
    })
    return attackables
  }
  ForecastAttack(Target, Retaliation = false) {
    let unit = this;
    if (!this.Equipped || this.Equipped.Heal) {return {Damage: 0, Hit: 0, RemainingHP: Target.HP}}
    if (Retaliation) {
      Target.Equipped.Range.forEach(function(able, range){
        if (able && !unit.Equipped.Range[range]) {return {Damage: 0, Hit: 0, RemainingHP: Target.HP}}
      })
    }
    let WeaponTriangleEffect = WeaponTriangle[unit.Equipped.WeaponType][Target.Equipped&&Target.Equipped.WeaponType] || {ATK: 0, ACC: 0};
    let TargetTileInfo = Target.RootMap.MetaMap[Target.x][Target.y];
    let Forecast = {
      Damage: Math.max(0, unit.POW + unit.Equipped.POW + WeaponTriangleEffect.ATK - Target.DEF - TargetTileInfo.DEF),
      Hit: unit.Equipped.ACC + this.SKL * 2 + WeaponTriangleEffect.ACC - Target.SPD * 2 - TargetTileInfo.Cover,
      DoubleAttack: unit.SPD >= Target.SPD + 4
    }
    Forecast.RemainingHP = Math.max(0, Target.HP - Forecast.Damage);
    return Forecast
  }
  CalculatePriority(Target) {
    let Forecast = this.ForecastAttack(Target);
    let RetaliationForecast = Target.ForecastAttack(this);
    let DamageBonus = Forecast.RemainingHP == 0 && 50 || Math.min(40, (Forecast.Hit * Forecast.Damage) / 100);
    let RemainingHPBonus = 20 - Forecast.RemainingHP;
    let RetalationBonus = RetaliationForecast.Damage == 0 && 10 || Math.max(-40, (RetaliationForecast.Hit * RetaliationForecast.Damage) / 100);
    let OwnRemainingHPBonus = Math.max(0, RetaliationForecast.RemainingHP - 20);
    let Priority = DamageBonus + RemainingHPBonus + RetalationBonus + OwnRemainingHPBonus;
    if (Priority <= 0) {Priority = DamageBonus} else {Priority *= 40}
    return Priority
  }
  Attack(Target) {
    if (this.HP <= 0 || !this.Equipped || this.Equipped.Heal || !this.GetAttackableTiles().includes(this.RootMap.NodeMap[Target.x][Target.y])) {return false}
    let TargetTileInfo = Target.RootMap.MetaMap[Target.x][Target.y];
    let WeaponTriangleEffect = WeaponTriangle[this.Equipped.WeaponType][Target.Equipped&&Target.Equipped.WeaponType] || {ATK: 0, ACC: 0};
    let ATK = this.POW + this.Equipped.POW + WeaponTriangleEffect.ATK;
    let DMG = ATK - Target.DEF - TargetTileInfo.DEF;
    // kinda lazy
    let wtype = this.Equipped.WeaponType;
    if (wtype == "Anima" || wtype == "Dark" || wtype == "Light") {DMG = ATK - Target.RES - TargetTileInfo.DEF}
    let HIT = this.Equipped.ACC + this.SKL * 2 + WeaponTriangleEffect.ACC;
    let AVD = Target.SPD * 2 + TargetTileInfo.Cover;
    let Accuracy = HIT - AVD;
    if ((Math.random() * 100 + Math.random() * 100) / 2 < Accuracy) {
      let CRT = this.SKL / 2 + this.Equipped.CRT + Math.max(0, Accuracy - 100) / 4;
      if (Math.random()*100 < CRT) {DMG *= 3}
      Target.HP -= Math.max(0, DMG);
      this.Equipped.Use(this);
      console.log(Target.Name +"'s new HP:", Target.HP)
      this.RootMap.logEvent(`${this.Name} dealt ${Math.max(0, DMG)} to ${Target.Name}.`)
      // There's some tile recoloration here that I'm still not 100% about, come back to this later please
    } else {this.RootMap.logEvent(`${this.Name} missed ${Target.Name}.`)}
    Target.UpdateStatus();
    if (Target.Affiliation == Enums.Affiliation.Enemy && Target.HP <= 0 && Target.DropsItem) {
      let item = Target.Inventory[1] && Target.Equipped;
      if (item) {this.Inventory.push(item)}
    }
    return true
  }
  InitiateCombat(Target) {
    if (Target.Affiliation == this.Affiliation || !this.Equipped) {return false}
    console.log("Combat initiated by", this.Name, "who is targetting", Target.Name)
    let OldUnitHP = this.HP;
    let OldTargetHP = Target.HP;
    let DoubleAttack; let DoubleAttackRecipient;
    if (this.SPD >= Target.SPD + 4) {DoubleAttack = this; DoubleAttackRecipient = Target;}
    else if (Target.SPD >= this.SPD + 4) {DoubleAttack = Target; DoubleAttackRecipient = this;}
    this.Attack(Target);
    Target.Attack(this);
    if (DoubleAttack) {DoubleAttack.Attack(DoubleAttackRecipient)}
    if (this.HP <= 0) {Target.AddExperience("Kill", this)}
  	else if (this.HP < OldUnitHP) {Target.AddExperience("Attack", this)}
  	if (Target.HP <= 0) {this.AddExperience("Kill", Target)}
  	else if (Target.HP < OldTargetHP) {this.AddExperience("Attack", Target)}

  	this.Moved = true;
  	return true
  }
  AddExperience(Action, Target) {
    if (this.Affiliation != Enums.Affiliation.Player) {return}
    let EXP = 0;
    if (Action == "Attack") {EXP = Math.max(1, 31 + Target.LVL - this.LVL)}
    else if (Action == "Kill") {EXP = Math.max(1, 31 + Target.LVL - this.LVL)}
    else if (Action == "Heal") {EXP = Math.max(1, 35 - this.LVL)}
    this.EXP += EXP;
    if (this.EXP >= 100) {
      this.EXP -= 100
      this.LevelUp()
    }
  }
  LevelUp() {
    this.LVL ++;
    if (this.RootMap) {this.RootMap.logEvent(`${this.Name} is now level ${this.LVL}.`)}
    for (const stat in this.Growth) {
      if (this.Growth.hasOwnProperty(stat) && Math.random()*100 <= this.Growth[stat]) {
        if (stat == "HP") {
            this.MAXHP ++
        } else {this[stat]++}
        if (this.RootMap) {this.RootMap.logEvent(`${stat} increased by 1!`)}
      }
    }
  }
  UpdateStatus() {
    let RootMap = this.RootMap;
    if (this.HP <= 0 ){
      RootMap.logEvent(`${this.Name} died.`)
      RootMap.CharacterMap[this.x][this.y] = null;
      RootMap.NodeMap[this.x][this.y].Obstacle = false;
      this.Image.remove();
    }
  }
}

// Item class stuff - Includes equipment as well
class Item {
  constructor(params) {
    this.Name = params.Name || "Item";
    this.Uses = params.Uses || 5;
    this.Usable = params.Usable || false;
  }
  Destroy(Owner) {
    if (this == Owner.Equipped) {Owner.Equipped = null}
    else {
      let index = Owner.Inventory.indexOf(this);
      if (index) {Owner.Inventory.splice(index)}
    }
  }
  Use(User) {
    this.Uses -= 1
    if (this.Uses == 0) {this.Destroy(User)}
    return true;
  }
}

class HealingItem extends Item {
  constructor(params) {
    super(params)
    this.POW = params.POW
  }
  Use(User) {
    if (User.HP == User.MAXHP) {return false}
    console.log(this)
    User.HP = Math.min(User.MAXHP, User.HP + this.POW);
    console.log(User.HP, User.MAXHP, this.POW)
    this.Uses -= 1;
    if (this.Uses == 0) {this.Destroy(User)}
    return true;
  }
}

class Equipment extends Item {
  constructor(params) {
    super(params)
    this.POW = params.POW || 5;
    this.Range = params.Range || [false, true, false, false] // Unlike Lua, Javascript starts arrays at 0, so setting 0 to false
    this.ACC = params.ACC || 85;
    this.Uses = params.Uses || 40;
	this.Equippable = true;
  }
}

class Weapon extends Equipment {
    constructor(params) {
        super(params)
        this.WeaponType = params.WeaponType;
        this.AttackType = params.AttackType || Enums.AttackType.Physical;
    }
}

class Tome extends Equipment {
    constructor(params) {
        super(params)
        this.WeaponType = params.WeaponType || Enums.WeaponType.Anima;
        this.AttackType = params.AttackType || Enums.AttackType.Magical
        this.Range = params.Range || [false, true, true, false]
    }
}

class Rod extends Equipment {
  constructor(params) {
    super(params)
  }
  Heal(User, Target) {
    if (Target.HP == Target.MAXHP) {return false}
    let oldHP = Target.HP
    Target.HP = Math.min(Target.MAXHP, Target.HP + User.POW + this.POW);
    User.AddExperience("Heal");
    User.Moved = true;
    User.RootMap.logEvent(`${User.Name} healed ${Target.Name} for ${Target.HP - oldHP} HP.`)
    return true;
  }
}

// Item library would be here
let ItemLibrary = {
	IronSword: new Weapon({Name: "Iron Sword", ACC: 90, Uses: 46, WeaponType: Enums.WeaponType.Sword}),
	SteelSword: new Weapon({Name: "Steel Sword", POW: 8, ACC: 75, Uses: 30, WeaponType: Enums.WeaponType.Sword}),
	KillingEdge: new Weapon({Name: "Killing Edge", POW: 9, ACC: 75, Uses: 20, WeaponType: Enums.WeaponType.Sword, CRT: 30}),

	IronLance: new Weapon({Name: "Iron Lance", POW: 7, ACC: 80, Uses: 45, WeaponType: Enums.WeaponType.Lance}),
	Javelin: new Weapon({Name: "Javelin", POW: 6, ACC: 65, Uses: 20, WeaponType: Enums.WeaponType.Lance, Range: [false, true, true, false]}),
	SteelLance: new Weapon({Name: "Steel Lance", POW: 13, ACC: 70, Uses: 30, WeaponType: Enums.WeaponType.Lance}),

	IronAxe: new Weapon({Name: "Iron Axe", POW: 8, ACC: 75, Uses: 45, WeaponType: Enums.WeaponType.Axe}),
	HandAxe: new Weapon({Name: "Hand Axe", POW: 7, ACC: 60, Uses: 20, WeaponType: Enums.WeaponType.Axe, Range: [false, true, true, false]}),
	SteelAxe: new Weapon({Name: "Steel Axe", POW: 11, ACC: 65, Uses: 30, WeaponType: Enums.WeaponType.Axe}),

    IronBow: new Weapon({Name: "Iron Bow", POW: 6, ACC: 85, Uses: 45, WeaponType: Enums.WeaponType.Bow, Range: [false, false, true, true]}),
    SteelBow: new Weapon({Name: "Steel Bow", POW: 9, ACC: 70, Uses: 30, WeaponType: Enums.WeaponType.Bow, Range: [false, false, true, true]}),
    Longbow: new Weapon({Name: "Longbow", POW: 5, ACC: 65, Uses: 20, WeaponType: Enums.WeaponType.Bow, Range: [false, false, false, true, true]}),

    Fire: new Tome({Name: "Fire", POW: 5, ACC: 90, Uses: 40}),
    Thunder: new Tome({Name: "Thunder", POW: 8, ACC: 80, Uses: 35, CRT: 5}),
    Lightning: new Tome({Name: "Lightning", POW: 4, ACC: 95, Uses: 35, CRT: 5, WeaponType: Enums.WeaponType.Light}),
    Divine: new Tome({Name: "Divine", POW: 8, ACC: 85, Uses: 25, CRT: 10, WeaponType: Enums.WeaponType.Light}),
    Flux: new Tome({Name: "Flux", POW: 7, ACC: 80, Uses: 45, WeaponType: Enums.WeaponType.Dark}),
    Worm: new Tome({Name: "Worm", POW: 12, ACC: 65, Uses: 25, CRT: 5, WeaponType: Enums.WeaponType.Dark, AttackType: Enums.AttackType.Physical}),

    Heal: new Rod({Name: "Heal", Uses: 30, POW: 10}),
    Mend: new Rod({Name: "Mend", Uses: 20, POW: 20}),

    Vulnerary: new HealingItem({Name: "Vulnerary", POW: 10}),
    Elixir: new HealingItem({Name: "Elixir", POW: 20})
}
//https://www.digitalocean.com/community/tutorials/copying-objects-in-javascript
function CloneDictionary(dictionary) {
	let res = JSON.parse(JSON.stringify(dictionary))
	res.__proto__ = dictionary.__proto__;
    res.cloned = true
    for (let key in dictionary) {
        if (key == "Image") {
            res[key] = document.createElement("img");
            res[key].src = dictionary[key].src;
            res[key].alt = dictionary[key].alt;
            res[key].className = dictionary[key].className;
        }
        if (typeof(dictionary[key]) == "object" && dictionary[key].cloned) {
            res[key] = CloneDictionary(dictionary[key])
        }
    }
	return res
}
let rq = new Unit({Equipped: CloneDictionary(ItemLibrary.Fire)});
console.log(CloneDictionary(rq))

// Quick access to generic enemies
class Enemy extends Unit {
    constructor(params) {
        super(params);
        this.Affiliation = Enums.Affiliation.Enemy;
    }
}
let EnemyLibrary = {
    Cavalier: new Enemy({Name: "Cavalier", Image: "assets/red/cavalier.png", MAXHP: 20, POW: 5, SKL: 2, SPD: 5, LUK: 0, DEF: 6, RES: 0, MOV: 7, Equipped: CloneDictionary(ItemLibrary.IronLance), Growth: {HP: 75, POW: 35, SKL: 40, SPD: 28, LUK: 30, DEF: 15, RES: 15}, Class: Enums.Class.Cavalier}),
    Archer: new Enemy({Name: "Archer", Image: "assets/red/archer.png", MAXHP: 18, POW: 4, SKL: 3, SPD: 3, LUK: 0, DEF: 3, RES: 0, MOV: 5, Equipped: CloneDictionary(ItemLibrary.IronBow), Growth: {HP: 70, POW: 35, SKL: 40, SPD: 32, LUK: 35, DEF: 15, RES: 20}}),
    Brigand: new Enemy({Name: "Brigand", Image: "assets/red/brigand.png", MAXHP: 20, POW: 5, SKL: 1, SPD: 5, LUK: 0, DEF: 3, RES: 0, MOV: 5, Equipped: CloneDictionary(ItemLibrary.IronAxe), Growth: {HP: 82, POW: 50, SKL: 30, SPD: 20, LUK: 15, DEF: 10, RES: 13}}),
    Knight: new Enemy({Name: "Knight", Image: "assets/red/knight.png", MAXHP: 17, POW: 5, SKL: 2, SPD: 0, LUK: 0, DEF: 9, RES: 0, MOV: 5, Equipped: CloneDictionary(ItemLibrary.IronLance), Growth: {HP: 80, POW: 40, SKL: 30, SPD: 15, LUK: 25, DEF: 32, RES: 20}}),
    Mercenary: new Enemy({Name: "Mercenary", Image: "assets/red/mercenary.png", MAXHP: 18, POW: 4, SKL: 8, SPD: 8, LUK: 0, DEF: 4, RES: 0, MOV: 5, Equipped: CloneDictionary(ItemLibrary.IronSword), Growth: {HP: 80, POW: 40, SKL: 40, SPD: 32, LUK: 30, DEF: 18, RES: 20}}),
    Shaman: new Enemy({Name: "Shaman", Image: "assets/red/shaman.png", MAXHP: 16, POW: 3, SKL: 1, SPD: 2, LUK: 0, DEF: 2, RES: 4, MOV: 5, Equipped: CloneDictionary(ItemLibrary.Flux), Growth: {HP: 50, POW: 50, SKL: 32, SPD: 30, LUK: 20, DEF: 12, RES: 30}}),
    Soldier: new Enemy({Name: "Soldier", Image: "assets/red/soldier.png", MAXHP: 19, POW: 4, SKL: 2, SPD: 2, LUK: 1, DEF: 1, RES: 1, MOV: 5, Equipped: CloneDictionary(ItemLibrary.IronLance), Growth: {HP: 80, POW: 50, SKL: 40, SPD: 20, LUK: 25, DEF: 12, RES: 15}}),
}

let GAMESTATE;
let Selected;
const MAPSCALE = 50;
let MapKey = {
  X: Enums.Tile.Wall,
  O: Enums.Tile.Grass,
  F: Enums.Tile.Forest,
  H: Enums.Tile.Fort
};
function convertStringToRootMap(StringMap, CharacterMap, PlayerCharacters, Enemies, Neutral, Dialogue, onMapFinished) {
  let Root = {};
  let log = document.getElementById("log")
  Root.logEvent = function(text) {
      log.textContent += "\n" + text
      log.scrollTop = log.scrollHeight
  }
  function CloneArray(array) {
    return Array.from(array);
  }

  let CurrentUnit;
  let CurrentMenu;
  let CompleteUnitList = [];
  [PlayerCharacters, Enemies, Neutral].forEach(function(list, i) {
    for (let key in list) {
      let unit = list[key];
      unit.RootMap = Root;
      unit.Moved = false;
      unit.HP = unit.MAXHP;
      CompleteUnitList.push(unit)
    }
  });

  let BaseMap = convertStringToMapArray(StringMap);
  console.log(BaseMap)
  console.log(BaseMap[0][0])
  console.log(BaseMap[0])
  Root.MaximumX = BaseMap.length-1;
  Root.MaximumY = BaseMap[0].length-1;

  // Stuff for undo functionality
  let ColoredTiles = {};
  let HighlightedTiles = {}
  function UndoCache() {
    for (let tile in ColoredTiles) {
      let oldTileColor = ColoredTiles[tile];
      let pos = tile.split("|")
      let actualTile = Root.RenderMap[pos[0]][pos[1]]
      actualTile.style.backgroundColor = oldTileColor;
    }
    ColoredTiles = {};
    for (let tile in HighlightedTiles) {
        HighlightedTiles[tile].remove();
    }
    HighlightedTiles = {};
  }
  function RecolorTiles(positions, color) {
    for (let i = 0; i < positions.length; i++) {
      let position = positions[i];
      let tile = Root.RenderMap[position.x][position.y];
      ColoredTiles[`${position.x}|${position.y}`] = tile.style.backgroundColor;
      tile.style.backgroundColor = color
    }
  }
  function HighlightTiles(positions, color) {
      for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let tile = Root.RenderMap[position.x][position.y];
        let highlight = document.createElement("div");
        highlight.className = "highlight";
        highlight.style.backgroundColor = color;
        HighlightedTiles[`${position.x}|${position.y}`] = highlight;
        tile.appendChild(highlight)
      }
      RecolorTiles(positions, color);
  }
  let MostRecentMove = {};
  function UndoMostRecentMove() {
    let unit = MostRecentMove.Unit;
    if (!unit) {return}
    let OldPosition = MostRecentMove.OldPosition;
    let RecentPosition = {x: unit.x, y: unit.y};
    unit.Reposition(OldPosition.x, OldPosition.y)
    MostRecentMove.Unit = null;
    MostRecentMove.OldPosition = null;
  }

  function ProgressTurn() {
    if (!CurrentUnit) {
      MostRecentMove.Unit = null;
      UndoMostRecentMove.OldPosition = null;
    }
    let enemiesCleared1 = true;
    for (let x in Enemies) {
        let enemy = Enemies[x];
        if (enemy.HP > 0) {enemiesCleared1 = false; break}
    }
    if (enemiesCleared1) {
        console.log("Map finished")
        Root.clear()
        onMapFinished()
        return
    }
    for (let char in PlayerCharacters) {
      let unit = PlayerCharacters[char];
      if (unit.HP > 0 && !unit.Moved) {return}
    }
    GAMESTATE = Enums.GameState.Waiting;
    //Announce "Enemy Turn"
    // Execute all the things that would occur on the enemy turn
    Root.SetObstacleMode(Enums.Affiliation.Enemy)
	let timeMultiple = 0
    for (let char in Enemies) {
      let unit = Enemies[char]
      if (unit.HP <= 0) {continue}
      if (unit.Behavior == Enums.Behavior.Waiting) {
        let playerUnitFound; let tilesToCheck = unit.GetAllAttackableTiles();
        for (let character in PlayerCharacters) {
          let playerUnit = PlayerCharacters[character];
          if (!playerUnitFound && playerUnit.HP > 0) {playerUnitFound = tilesToCheck.includes(Root.NodeMap[playerUnit.x][playerUnit.y])}
        }
        if (playerUnitFound) {unit.Behavior = Enums.Behavior.Chase}
      }
      let endPos;
      if (unit.Behavior == Enums.Behavior.Chase) {
        let priorityTarget; let shortestPath; let backupPath; let startNode = Root.NodeMap[unit.x][unit.y];
        // Check all player units in range and evaluate which one is the best to attack
        for (let character in PlayerCharacters) {
          let playerUnit = PlayerCharacters[character];
          let node = Root.NodeMap[playerUnit.x][playerUnit.y];
          if (playerUnit.HP > 0 && unit.GetAllAttackableTiles().includes(node)) {
            let priority = unit.CalculatePriority(playerUnit);
            if (!priorityTarget || priority > priorityTarget.Priority) {priorityTarget = {Target: playerUnit, Priority: priority}}
          }
        }
        if (priorityTarget) {shortestPath = A_Star(Root.NodeMap, startNode, Root.NodeMap[priorityTarget.Target.x][priorityTarget.Target.y])}
        else {
          for (let character in PlayerCharacters) {
            let playerUnit = PlayerCharacters[character];
            // See if there are nodes where the enemy unit can attack from
            let attackables = unit.GetAttackableTiles(Root.NodeMap[playerUnit.x][playerUnit.y]);
            for (let i = 0; i < attackables.length; i++) {
              let node = attackables[i];
              if (!node.Obstacle && ! Root.CharacterMap[node.x][node.y]) {
                  let path = A_Star(Root.NodeMap, startNode, node);
                  if (!shortestPath || shortestPath.length > path.length && path.length > 0) {shortestPath = path}
              } else if (Root.CharacterMap[node.x][node.y] == unit) {shortestPath = {node}}
              //Backup path in case unit is in chase mode but there are no valid tiles to go to
              let directPath = A_Star(Root.NodeMap, startNode, node);
              if (directPath.length > 0 && (!backupPath || backupPath.length > directPath.length)) {backupPath = directPath}
            }
          }
        }
        // Simply do not move if there was no valid path at all
        if (!shortestPath && !backupPath) {continue} else if (!shortestPath) {shortestPath = backupPath}
        // All the stuff for actually moving the enemy unit
        let currentPosition = {x: unit.x, y: unit.y};
        endPos = shortestPath.length > unit.MOV && shortestPath[unit.MOV-1] || shortestPath[shortestPath.length-1];
        while (endPos && Root.CharacterMap[endPos.x][endPos.y] && Root.CharacterMap[endPos.x][endPos.y] != unit) {
            endPos = shortestPath[shortestPath.indexOf(endPos)-1]
        }
        if (!endPos) {endPos = startNode}
        let currentTile = Root.RenderMap[currentPosition.x][currentPosition.y];
        let endTile = Root.RenderMap[endPos.x][endPos.y];
        if (currentTile != endTile) {
			timeMultiple ++;
            unit.Reposition(endPos.x, endPos.y, timeMultiple)
            console.log(unit)
        }
      }
      else {endPos = Root.NodeMap[unit.x][unit.y]}
      let target; let priority;
      for (let character in PlayerCharacters) {
        let playerUnit = PlayerCharacters[character];
        let node = Root.NodeMap[playerUnit.x][playerUnit.y];
        if (playerUnit.HP > 0 && unit.GetAttackableTiles().includes(node)) {
          let temppriority = unit.CalculatePriority(playerUnit);
          if (!target|| temppriority > priority) {target = playerUnit; priority = temppriority}
        }
      }
      if (target) {timeMultiple++; setTimeout(function() {unit.InitiateCombat(target)}, timeMultiple * 1000)}
    }
	timeMultiple ++;
    // Enemy turn is now over
    setTimeout(function() {
        let enemiesCleared = true;
        for (let x in Enemies) {
            let enemy = Enemies[x];
            if (enemy.HP > 0) {enemiesCleared = false; break}
        }
        if (enemiesCleared) {
            console.log("Map finished!")
            Root.clear()
            onMapFinished()
        } else {
    		GAMESTATE = Enums.GameState.Select;
    		Root.SetObstacleMode(Enums.Affiliation.Player);
    		for (let char in PlayerCharacters) {PlayerCharacters[char].Moved = false}
        }
    }, timeMultiple * 1000)
    // Anounce Player Phase
  }

  let Menus = {};
  let menuHolder = document.getElementById("menu")
  function CreateMenu(options, key, oncancelpressed) {
      let menu = document.createElement("div");
      menu.className = "container";
      if (key) {Menus[key] = menu}
      if (menuHolder.children.length > 0) {
          for (let i = menuHolder.children.length-1; i >= 0; i--) {menuHolder.children[i].remove()}
      }
      document.getElementById("menu").appendChild(menu);
      function CreateButton(name, onpressed, parent) {
          let button = document.createElement("button");
          button.className = "button";
          button.textContent = name;
          button.addEventListener("click", onpressed);
          if (parent) {parent.appendChild(button)} else {menu.appendChild(button)}
          return button
      }
      if (options) {
          if (options.Action) {
              if (CurrentUnit.Equipped && CurrentUnit.Equipped.WeaponType) {
                  CreateButton("Attack", function() {
                      GAMESTATE = Enums.GameState.Action;
                      //RecolorTiles(CurrentUnit.GetAttackableTiles(), "red");
                      HighlightTiles(CurrentUnit.GetAttackableTiles(), "red")
                      CreateMenu(null, "AttackMenu", function() {
                          Menus.AttackMenu.remove();
                          menuHolder.appendChild(Menus.Main);
                          UndoCache();
                      })
                      CurrentUnit.Inventory.forEach((item, i) => {
						 if (!CurrentUnit.Inventory[i] || !CurrentUnit.Inventory[i].Equippable || !CurrentUnit.Class[CurrentUnit.Inventory[i].WeaponType]) {return}
                         let btn;
                         btn = CreateButton(`${item.Name} | Uses: ${item.Uses}`, function() {
                             let CurrentEquipped = CurrentUnit.Equipped;
                             let actualItem = CurrentUnit.Inventory[i];
                             CurrentUnit.Inventory[i] = CurrentEquipped;
                             CurrentUnit.Equipped = actualItem;
                             btn.textContent = `${CurrentEquipped.Name} | Uses: ${CurrentEquipped.Uses}`
                             UndoCache();
                             //RecolorTiles(CurrentUnit.GetAttackableTiles(), "red")
                             HighlightTiles(CurrentUnit.GetAttackableTiles(), "red")
                         }, Menus.AttackMenu)
                      });
                  })
              }
              if (CurrentUnit.Equipped && CurrentUnit.Equipped.Heal) {
                  CreateButton("Heal", function() {
                      GAMESTATE = Enums.GameState.Action;
                      //RecolorTiles(Root.NodeMap[CurrentUnit.x][CurrentUnit.y].Neighbors, "green");
                      HighlightTiles(CurrentUnit.GetAttackableTiles(), "green")
                      CreateMenu(null, "Heal", function(){Menus.Heal.remove(); menuHolder.appendChild(Menus.Main); UndoCache()});
                  })
              }
          }
          if (options.Item) {
              CreateButton("Items", function() {
                  GAMESTATE = Enums.GameState.Trading;
                  CreateMenu(null, "Items", function() {Menus.Items.remove(); menuHolder.appendChild(Menus.Main);})
                  CurrentUnit.Inventory.forEach((item, i) => {
                      if (!CurrentUnit.Inventory[i]) {return}
					  CreateButton(`${item.Name} | Uses: ${item.Uses}`, function() {
                          if (item.Equippable) {
                              if (!CurrentUnit.Class[item.WeaponType]) {return}
                              let CurrentEquipped = CurrentUnit.Equipped;
                              CurrentUnit.Equipped = item;
                              CurrentUnit.Inventory[i] = CurrentEquipped;
                              Menus.Items.remove(); menuHolder.appendChild(Menus.Main);
                              GAMESTATE = Enums.GameState.Select;
                          } else if (item.Use(CurrentUnit)) {
                              Menus.Items.remove();
                              CurrentUnit = null;
                              GAMESTATE = Enums.GameState.Select;
                              ProgressTurn()
                          }
                      }, Menus.Items)
                  });
              })
          }
          // Trading would go in here, don't wanna bother adding it yet
          if (options.End) {
              CreateButton("End", function() {
                  menu.remove();
                  GAMESTATE = Enums.GameState.Select;
                  if (CurrentUnit) {CurrentUnit.Moved = true; CurrentUnit = null}
                  else {for (let char in PlayerCharacters) {PlayerCharacters[char].Moved = true}}
                  ProgressTurn()
              })
          }
      }
      if (!(options && options.Escape)) {
          CreateButton("Cancel", oncancelpressed || function() {
              UndoCache();
              UndoMostRecentMove();
              menu.remove();
              CurrentUnit = null;
              GAMESTATE = Enums.GameState.Select;
          })
      }
      return menu
  }

  // Meta Map - Contains information about the individual tile
  Root.MetaMap = CloneArray(BaseMap);
  for (let x = 0; x <= Root.MaximumX; x++) {
    for (let y = 0; y <= Root.MaximumY; y++) {
      Root.MetaMap[x][y] = MapKey[Root.MetaMap[x][y]]
    }
  }

  // Character Map - Contains information about where characters are positioned
  let decodedCharMap = convertStringToMapArray(CharacterMap)
  Root.CharacterMap = CloneArray(decodedCharMap)
  for (let x = 0; x <= Root.MaximumX; x++) {
    for (let y = 0; y <= Root.MaximumY; y++) {
      let character = decodedCharMap[x][y];
      let unit = PlayerCharacters[character] || Enemies[character] || Neutral[character];
      if (unit) {
        Root.CharacterMap[x][y] = unit;
        unit.x = x;
        unit.y = y;
      }
      else {Root.CharacterMap[x][y] = null;}
    }
  }

  // Node Map - Specifically for determining traversible tiles for movement; also easy way to access neighboring tiles
  Root.NodeMap = CloneArray(convertStringToMapArray(StringMap))
  // reset the state of the node map
  function SetDefaultTraversibility() {
    for (let x = 0; x < Root.NodeMap.length; x++) {
      for (let y = 0; y < Root.NodeMap[1].length; y++) {
        Root.NodeMap[x][y] = new Node(x, y)
        Root.NodeMap[x][y].Obstacle = !Root.MetaMap[x][y].Traversible
      }
    }
    for (let x = 0; x < Root.NodeMap.length; x++) {
      for (let y = 0; y < Root.NodeMap[1].length; y++) {
        Root.NodeMap[x][y].Neighbors = Root.NodeMap[x][y].GetNeighbors(Root.NodeMap);
      }
    }
  }
  Root.SetObstacleMode = function(Affiliation) {
    SetDefaultTraversibility();
    for (let i = 0; i < CompleteUnitList.length; i++) {
      let unit = CompleteUnitList[i];
      if (unit.HP <= 0) {continue}
      Root.NodeMap[unit.x][unit.y].Obstacle = (unit.Affiliation != Affiliation)
    }
  }
  Root.SetObstacleMode(Enums.Affiliation.Player)

  // Render Map - Handles all of the user interface
  function onTileClicked(x, y) {
    if (GAMESTATE == Enums.GameState.Waiting) {return}
    if (GAMESTATE == Enums.GameState.Select) {UndoCache()}
    let tile = Root.RenderMap[x][y];
    let unit = Root.CharacterMap[x][y];
    let tileInfo = Root.MetaMap[x][y];
    let node = Root.NodeMap[x][y];
    if (!unit || unit == CurrentUnit) {
      if (Selected && GAMESTATE == Enums.GameState.Move && ColoredTiles[`${x}|${y}`]) {
        let oldTile = Root.RenderMap[Selected.x][Selected.y];
        oldTile.textContent = ""
        UndoCache();
        MostRecentMove.Unit = Selected;
        MostRecentMove.OldPosition = {x: Selected.x, y: Selected.y};
        Selected.Reposition(x, y)
        Selected = null;
        GAMESTATE = Enums.GameState.Menu;
        CreateMenu({Action: true, End: true, Item: true}, "Main")
      } else if (GAMESTATE == Enums.GameState.Select) {
        CreateMenu({End: true}, "Main")
      }
    } else if (unit) {
      if (GAMESTATE == Enums.GameState.Select && unit.Affiliation == Enums.Affiliation.Player && !unit.Moved) {
          console.log(unit.Moved)
        Selected = unit;
        CurrentUnit = unit;
        GAMESTATE = Enums.GameState.Move;
        HighlightTiles(unit.GetTraversibleTiles(), "blue")
      } else if (GAMESTATE == Enums.GameState.Select && unit.Affiliation == Enums.Affiliation.Enemy) {
        SetDefaultTraversibility(Enums.Affiliation.Enemy)
        if (unit.Behavior == Enums.Behavior.Idle) {unit.GetAttackableTiles(), "red"}
        else {HighlightTiles(unit.GetAllAttackableTiles(), "red")} //RecolorTiles(unit.GetAllAttackableTiles(), "red")
        SetDefaultTraversibility(Enums.Affiliation.Player)
      } else if (GAMESTATE == Enums.GameState.Select && (unit.Moved || unit.Affiliation != Enums.Affiliation.Player)) {
        CreateMenu({End: true}, "Main")
      } else if (GAMESTATE == Enums.GameState.Action && tile.style.backgroundColor == "red" && unit.Affiliation != CurrentUnit.Affiliation && CurrentUnit.Equipped) {
        Menus.AttackMenu.remove();
        UndoCache();
        CurrentUnit.InitiateCombat(unit)
        CurrentUnit = null;
        // if enemies are cleared then yay we won
        GAMESTATE = Enums.GameState.Select;
      } else if (GAMESTATE == Enums.GameState.Action && tile.style.backgroundColor == "green" && unit.Affiliation == CurrentUnit.Affiliation) {
        if (CurrentUnit.Equipped.Heal(CurrentUnit, unit)) {
          unit.UpdateStatus(Root);
          Menus.Heal.remove();
          UndoCache();
          CurrentUnit = null;
          GAMESTATE = Enums.GameState.Select;
        }
      }
    }
    ProgressTurn()
  }
  let currentHover = [];
  let hoverContainer = document.getElementById("hover")
  function onTileHovered(x, y) {
    // All the stuff for hovering
    let tile = Root.RenderMap[x][y];
    let unit = Root.CharacterMap[x][y];
    let tileInfo = Root.MetaMap[x][y];
    let node = Root.NodeMap[x][y];
    if (GAMESTATE == Enums.GameState.Select || GAMESTATE == Enums.GameState.Move) {
        if (GAMESTATE == Enums.GameState.Select) {UndoCache()}
        let text = "";
        if (unit) {
            text = `${unit.Name}
            LVL: ${unit.LVL} | EXP: ${unit.EXP}
            HP: ${unit.HP}/${unit.MAXHP}
            WPN: ${unit.Equipped && unit.Equipped.Name || "None"} ATK: ${unit.POW + (unit.Equipped && unit.Equipped.POW || 0)}
            DEF: ${unit.DEF} RES: ${unit.RES}
            SPD: ${unit.SPD} SKL: ${unit.SKL}
            HIT: ${unit.SKL / 2 + (unit.Equipped && unit.Equipped.ACC || 0)} AVD: ${unit.SPD * 2 + tileInfo.Cover}
            CRT: ${unit.SKL / 2 + (unit.Equipped && unit.Equipped.CRT || 0)} MOV: ${unit.MOV}`
        }
        let tileInfoText = `${tileInfo.Name}
        Cover: ${tileInfo.Cover}
        DEF: ${tileInfo.DEF}`;
        if (text == "") {text = tileInfoText}
        else {text += "\n\n" + tileInfoText}

        hoverContainer.textContent = text
    }
  }
  Root.RenderMap = [];
  let Table = document.createElement("table");
  Table.style.tableLayout = "fixed";
  Table.style.width = MAPSCALE * Root.MaximumX;
  Table.style.height = MAPSCALE * Root.MaximumY;
  Table.style.borderCollapse = "collapse";
  document.getElementById("Screen").appendChild(Table)
  for (let x = 0; x <= Root.MaximumX; x++) {
    let renderRow = document.createElement("tr");
    renderRow.style.height = MAPSCALE + "px"; renderRow.style.width = MAPSCALE * Root.MaximumY + "px";
    Root.RenderMap[x] = [];
    for (let y = 0; y <= Root.MaximumY; y++) {
      let renderTile = document.createElement("div");
      renderTile.style.display = "table-cell"
      Root.RenderMap[x][y] = renderTile;
      renderTile.style.height = MAPSCALE + "px";
      renderTile.style.width = MAPSCALE + "px";
      renderTile.style.minWidth = MAPSCALE + "px";
      renderTile.style.maxWidth = MAPSCALE + "px";
      renderTile.style.backgroundColor = Root.MetaMap[x][y].Color
      renderTile.style.position = "relative";
      if (Root.MetaMap[x][y].Image) {
          let img = document.createElement("img");
          img.className = "image"
          img.src = Root.MetaMap[x][y].Image;
          renderTile.appendChild(img);
      }
      if (Root.CharacterMap[x][y]) {
          //renderTile.textContent = Root.CharacterMap[x][y].Name;
          renderTile.appendChild(Root.CharacterMap[x][y].Image)
          console.log(Root.CharacterMap[x][y].Image)
      }
      renderRow.appendChild(renderTile)
      renderTile.addEventListener("click", function() {onTileClicked(x,y)})
      renderTile.addEventListener("mouseenter", function() {onTileHovered(x,y)})

    }
    Table.appendChild(renderRow);
  }

  Root.clear = function() {
    Table.remove()
  }

  if (Dialogue) {
      GAMESTATE = Enums.GameState.Waiting;
      let dialogue = Dialogue.split("\n");
      let dbox = document.getElementById("dialogueBox");
      dbox.style.visibility = "visible";
      let i = 0;
      function progressDialogue() {
          i++;
          if (dialogue[i]) {
              dbox.textContent = dialogue[i]
          } else {
              dbox.style.visibility = "hidden";
              GAMESTATE = Enums.GameState.Select;
          }
      }
      dbox.textContent = dialogue[i];
      dbox.addEventListener("click", progressDialogue)
  } else {
       GAMESTATE = Enums.GameState.Select;
  }
  //return Root
}

let TestMap =
`XXXXXXXXXXX
XOOOOOOOOOX
XOOOOOOOOOX
XOOOOOOOOOX
XOOOOOOOOOX
XOOOOOOOOOX
XOOOOOOOOOX
XOOOOOOOOOX
XXXXXXXXXXX`
let TestCharacterMap =
`00000000000
00Y00000000
0Z000000000
00000000000
00000000000
00000000000
00000000A00
0000000C0B0
00000000000`

let testUnit = new Unit({Name: "Caine", Affiliation: Enums.Affiliation.Player, Equipped: CloneDictionary(ItemLibrary.IronSword), Image: "assets/blue/lord.png", Class: Enums.Class.Lord, Inventory: [CloneDictionary(ItemLibrary.Vulnerary), null, null, null]})
let testEnemy = CloneDictionary(EnemyLibrary.Brigand)
let testEnemy2 = CloneDictionary(EnemyLibrary.Brigand)
let testCleric = new Unit({Name: "Sara", Affiliation: Enums.Affiliation.Player, Equipped: CloneDictionary(ItemLibrary.Heal), Image: "assets/blue/cleric.png", Class: Enums.Class.Cleric})
let SerLanser = new Unit({Name: "Ser Lanser", Affiliation: Enums.Affiliation.Player, MOV: 6, Image: "assets/blue/cavalier.png", Equipped: CloneDictionary(ItemLibrary.IronSword), Inventory: [CloneDictionary(ItemLibrary.Javelin), null, null, null], Class: Enums.Class.Cavalier})

// Everything is aligned to the left to make editing information easier
function test() {
console.log(testUnit)
console.log(testEnemy)
convertStringToRootMap(TestMap, TestCharacterMap, {A: testUnit, B: testCleric, C: SerLanser}, {Z: testEnemy, Y: testEnemy2}, {}, null, function() {
document.getElementById("startButton").style.visibility = "hidden"
let map2 =
`FOFOXOOOOOOOOOOOOOOOOOOOOOXOOOOOOOOOOOOO
OFOFXOOOOOOOOOOOOOOOOOOOOOOXXXXXXXXXXXXX
FOFOXOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOXOOOOOOOOXXXXXXXXXXXOOOOOOOOOOOOOOOO
OOOOXOOOOOOOOXXXXXXXXXXXOOOOOOOOOOOOOOOO
OOOOXOOOOOOOOXXXXXXXXXXXOOOOOOOOOOOOOOOO
OOOOXOOOOOOOOXXXXXXXXXXXOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOXXXXXXXXXXXOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOXOXXXXX
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOXOOOOOO
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOHOOO`
let charMap2 =
`B0C0000000000009000000000000000000000000
0A00000000000000700000000000000000000000
0000000000000000080000000000000000000000
000000000000000000000000000000000Q000000
0D00000000000000000000000000000000T00000
000000000000000000000000000000000U0R0000
1234000000000000000000000000000000S00000
0000000000000000000000000000000000000000
00500000000000000PW000000000000000Y00000
06000000000000000XV000000000000000000000
000000000000000000000000000000000000Z000`
let enemies2 = {
    1: CloneDictionary(EnemyLibrary.Soldier), 2: CloneDictionary(EnemyLibrary.Knight), 3: CloneDictionary(EnemyLibrary.Knight), 4: CloneDictionary(EnemyLibrary.Soldier),
    5: CloneDictionary(EnemyLibrary.Mercenary), 6: CloneDictionary(EnemyLibrary.Cavalier), 7: CloneDictionary(EnemyLibrary.Soldier), 8: CloneDictionary(EnemyLibrary.Soldier), 9: CloneDictionary(EnemyLibrary.Soldier),
    P: CloneDictionary(EnemyLibrary.Knight), X: CloneDictionary(EnemyLibrary.Knight), W: CloneDictionary(EnemyLibrary.Archer), V: CloneDictionary(EnemyLibrary.Archer),
    Q: CloneDictionary(EnemyLibrary.Cavalier), U: CloneDictionary(EnemyLibrary.Cavalier), T: CloneDictionary(EnemyLibrary.Cavalier), S: CloneDictionary(EnemyLibrary.Brigand), R: CloneDictionary(EnemyLibrary.Brigand),
    Y: CloneDictionary(EnemyLibrary.Knight),
    Z: CloneDictionary(EnemyLibrary.Shaman)
}
enemies2[6].Equipped = CloneDictionary(ItemLibrary.Javelin);
enemies2[7].Equipped = CloneDictionary(ItemLibrary.Javelin); enemies2[8].Equipped = CloneDictionary(ItemLibrary.Javelin); enemies2[9].Equipped = CloneDictionary(ItemLibrary.Javelin);
enemies2.Y.Equipped = CloneDictionary(ItemLibrary.Javelin);
enemies2.S.Equipped = CloneDictionary(ItemLibrary.HandAxe); enemies2.R.Equipped = CloneDictionary(ItemLibrary.HandAxe);
enemies2.Y.Behavior = Enums.Behavior.Idle;
enemies2.Z.Behavior = Enums.Behavior.Idle;
let Kurip = new Unit({
    Name: "Kurip", Affiliation: Enums.Affiliation.Player, MAXHP: 16, POW: 3, SKL: 3, SPD: 4, LUK: 3, DEF: 2, RES: 3, MOV: 5,
    Growth: {HP: 55, POW: 45, SKL: 40, SPD: 45, LUK: 20, DEF: 5, RES: 30},
    Equipped: CloneDictionary(ItemLibrary.Fire), Inventory: [CloneDictionary(ItemLibrary.Vulnerary), CloneDictionary(ItemLibrary.Thunder), null, null],
    Class: Enums.Class.Mage, Image: "assets/blue/mage.png"
});
do {Kurip.LevelUp()} while (Kurip.LVL < 4);
for (let key in enemies2) {
    let rand = Math.random(5,7);
    let enemy = enemies2[key]; do {enemy.LevelUp()} while (enemy.LVL < rand);
}
do {enemies2.Z.LevelUp()} while (enemies2.Z.LVL < 9);
let testDialog =
`Caine: Hold on, is that... Kurip!?
Kurip: My liege! I'm happy for this reunion, but I'm in a bit of a bind!
Caine: As I can see. Get over here and cover our rear!
Kurip: As you command!`
convertStringToRootMap(map2, charMap2, {A: testUnit, B: testCleric, C: SerLanser, D: Kurip}, enemies2, {}, testDialog, function() {
    console.log("The end yay")
})
});
}
