function Player(x, y) {
  this.x = x;
  this.y = y;
  
  this.hp = 100;
  this.max_dmg = 20;
  this.item_in_hand = "";

  this.def_light = { radius: 2, lum: 64, flicker: 0 };
  this.light = this.def_light;

  this.dead = false;
}

Player.prototype.pickUp = function(item) {
  if (this.item_in_hand === "") {
    this.item_in_hand = item;
  }
  else {
    return false;
  }

  if (game.objects[item].light) {
    this.light = game.objects[item].light;
  }
  return true;
};

Player.prototype.drop = function() {
  var object = false;
  if (this.item_in_hand) {
    object = this.item_in_hand;
  
    if (game.objects[object].light) {
      this.light = this.def_light;
    }
    this.item_in_hand = "";
  }
  return object;
};

//move player "up", "down", "left" or "right, unless they hit a wall
Player.prototype.move = function(direction) {
  var x = this.x;
  var y = this.y;
  if (direction === "up") {
    y -= 1;
  }
  else if (direction === "down") {
    y += 1;
  }
  else if (direction === "left") {
    x -= 1;
  }
  else if (direction === "right") {
    x += 1;
  }
  else {
    return 0;
  }

  if (game.map.tileHasEnemy(x, y)) {
    var blocks = game.map.getObjects(x, y);
    var last_on_tile = blocks.charAt(blocks.length - 1);
    var dmg = Math.ceil(Math.random() * this.max_dmg);
    var actual_dmg = this.attack(x, y, dmg);
    if (actual_dmg != dmg) {
      game.say("You push a " + game.objects[last_on_tile].name + " into something hard, dealing " + actual_dmg + " damage.");
    }
    else {
      game.say("You push a " + game.objects[last_on_tile].name + " away from you, dealing " + actual_dmg + " damage.");
    }
  } else if (game.map.tileFull(x, y)) {
    var blocks = game.map.getObjects(x, y);
    var last_on_tile = blocks.charAt(blocks.length - 1);
    game.say("You run into a " + game.objects[last_on_tile].name + ".");
  }
  else {
    game.map.bg_x += this.x-x;
    game.map.bg_y += this.y-y;
    game.map.removeFromTile("@", this.x, this.y);
    game.map.addToTile("@", x, y);
    this.x = x;
    this.y = y;
  }
  
  game.tick();
};

Player.prototype.attack = function(x, y, dmg) {
  var zombie = game.object_map.get(x, y);
  return zombie.defend(dmg); 
};
Player.prototype.defend = function(dmg) {
  this.hp -= dmg;
  if (this.hp <= 0) {
    this.die();
    return false;
  }
  return true;
};
Player.prototype.die = function() {
  this.dead = true;
};
