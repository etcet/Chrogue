function Player(x, y) {
  this.x = x;
  this.y = y;
  
  this.hp = 100;
  this.max_dmg = 20;
  this.item_in_hand = "";

  this.def_light = { 
                      radius: 30,
                      intensity: 20,
                      lum: 0.8,
                      flicker: 0,
                      color: {r: 1.0, g: 0.0, b: 0.0},
                   };
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
Player.prototype.move = function(x, y) {
  var noclip = false;

  x = this.x + x;
  y = this.y + y;

  if (game.map.tileHasEnemy(x, y)) {
    var blocks = game.map.getObjects(x, y);
    var last_on_tile = blocks.charAt(blocks.length - 1);
    var dmg = Math.ceil(Math.random() * this.max_dmg);
    var actual_dmg = this.attack(x, y, dmg);
      } else if (!noclip && game.map.tileFull(x, y)) {
    var blocks = game.map.getObjects(x, y);
    var last_on_tile = blocks.charAt(blocks.length - 1);
    game.say("You run into a " + game.objects[last_on_tile].name + ".");
    return;
  }
  else {
    game.renderer.move(this.x - x, this.y - y);
    game.map.removeFromTile("@", this.x, this.y);
    game.map.addToTile("@", x, y);
    this.x = x;
    this.y = y;
  }
  
  game.tick();
};

Player.prototype.attack = function(x, y, dmg) {
  var zombie = game.object_map.get(x, y);
  //kill!
  if (zombie.defend(dmg) === false) {
    game.say("You kill a zombie.");
    game.zombie_counter -= 1;
    if (game.zombie_counter == 0)
      game.say("You've killed all the zombies. You win?"); 
  }
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
