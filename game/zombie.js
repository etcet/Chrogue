var zombie_id_accumulator = 0;

function Zombie(x, y) {
  this.character = "z";
  this.x = x;
  this.y = y;
  this.id = zombie_id_accumulator;
  zombie_id_accumulator += 1;

  this.hp = 100;
  this.max_dmg = 10;

  this.skip_turn = false;

  this.def_light = { radius: 6, intensity: 8,  lum: 0.8, flicker: 0 };
  this.light = this.def_light;

  this.init();
}
Zombie.prototype.init = function() {
};

Zombie.prototype.defend = function(dmg) {
  var d = this.unitDistFromPlayer();

  //push back and make sure zombie doesn't take turn and step back
  if (this.walk({x: -d.x, y: -d.y})) {
    this.skip_turn = true;
    game.say("You push a " + game.objects[this.character].name + " away from you, dealing " + dmg + " damage.");
  }
  //otherwise, DOUBLE DAMAGE!
  else {
    dmg = dmg * 2;
    game.say("You push a " + game.objects[this.character].name + " into something hard, dealing " + dmg + " damage.");
  }
  
  this.hp -= dmg;
  if (this.hp <= 0) {
    this.die();
    return false;
  }

  return dmg;
};

Zombie.prototype.die = function() {
  game.object_map.delete(this, this.x, this.y);
  game.map.removeFromTile("z", this.x, this.y);
};

Zombie.prototype.move = function(x, y) {
  //hit wall
  if (game.map.tileFull(x, y)) {
    return false;
  }

  if (x != this.x || y != this.y) {
    game.map.removeFromTile("z", this.x, this.y);
    game.map.addToTile("z", x, y);
    game.object_map.move(this, x, y);
    this.x = x;
    this.y = y;
    return true;
  }
  else
    return false;
};
Zombie.prototype.tick = function() {
  if (this.skip_turn) {
    this.skip_turn = false;
    return;
  }

  game.renderer.lights.doFOV( this.x,
                              this.y,
                              this.light.radius,
                              this.light.radius,
                              this.light.intensity,
                              this.light.lum,
                              this.light.flicker,
                              "zombie",
                              this.id);
  //game.renderer.lights.printEnemy();
          
  var dloc = {};
  if (game.renderer.lights.enemyCanSee(game.player.x, game.player.y, this.id)) {
    dloc = this.moveToPlayer();
  }
  else {
    dloc = this.randomWalk();
  }
  return this.walk(dloc);
};
Zombie.prototype.walk = function(dloc) {
  var new_loc = {x: this.x + dloc.x, y: this.y + dloc.y};

  if (new_loc.x === game.player.x && new_loc.y === game.player.y) {
    if (!this.attackPlayer()) { //kill
      return false;
    }
  }

  return this.move(new_loc.x, new_loc.y);
};
Zombie.prototype.attackPlayer = function() {
  var dmg = Math.ceil(Math.random() * this.max_dmg);
  game.say("A zombie attacks you, dealing " + dmg + " damage.");
  return game.player.defend(dmg);
};
Zombie.prototype.unitDistFromPlayer = function() {
  var dx = game.player.x - this.x;
  if (dx > 0)
    dx = 1;
  else if (dx < 0)
    dx = -1;
  var dy = game.player.y - this.y;
  if (dy > 0)
    dy = 1;
  else if (dy < 0)
    dy = -1;

  return {x: dx, y: dy};
};
Zombie.prototype.moveToPlayer = function() {
  //TODO A* pathfinding
  var d = this.unitDistFromPlayer();
  var x = d.x;
  var y = d.y;

  if (Math.floor(Math.random() * 5) == 0) {
    var r = Math.floor(Math.random()*4);
    if (x != 1 && r == 0)
      x = -1;
    if (x != -1 && r == 1)
      x = 1;
    if (y != 1 && r == 2)
      y = -1;
    if (y != -1 && r == 3)
      y = 1;
  }
  
  return {x: x, y: y}
};

Zombie.prototype.randomWalk = function() {
  var dx = 0;
  var dy = 0;
  var rx = Math.floor(Math.random()*3);
  var ry = Math.floor(Math.random()*3);
   
  if (rx == 0)
    dx = -1;
  if (rx == 1)
    dx = 1;
  if (ry == 0)
    dy = -1;
  if (ry == 1)
    dy = 1;

  return {x: dx, y: dy};
};
