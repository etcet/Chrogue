function Engine(ctx, step) {
  this.ctx = ctx;

  this.step = step;
  this.map = new Map(ctx, step);
  this.renderer = null;

  var move_interval = 100; //time between moves, in ms
  this.controls = new Controls(move_interval);
  var player_l = this.map.getPlayerLocation();
  //console.log('player at:', player_l.x, player_l.y);
  this.player = new Player(player_l.x, player_l.y);

  this.objects = Objects;
  this.object_map = new ObjectMap();

  this.zombie_counter = 0;
}
Engine.prototype.init = function() {
  this.renderer = new Renderer(this.ctx, this.step, this.map.getWidth(), this.map.getHeight());
  this.initObjects(); //initialize zombie object and lights
  this.resize();
  //this.tick();
  /*var self = this;
  var animate = window.setInterval(function() {
    self.map.draw();
  }, 150);*/
};
Engine.prototype.reset = function() {
  this.map = new Map(this.ctx, this.step);
  var player_l = this.map.getPlayerLocation();
  this.player = new Player(player_l.x, player_l.y);
  this.object_map = new ObjectMap();
  this.zombie_counter = 0;
  this.init();
};

Engine.prototype.tick = function() {
  this.is_ticking = true;
  this.doZombies();
  this.renderer.render();
  this.lookAt(this.player.x, this.player.y);
  this.is_ticking = false;
}

//look at objects on player tile
Engine.prototype.lookAt = function(x, y) {
  var objs = this.map.getObjects(x, y); 
  var msg;
  var found_objects = 0;
  for (var i = 0; i < objs.length; i++) {
    var object = this.objects[objs[i]];
    if (object.can_pickup) {
      this.say("Here lies a " + object.name + ". Press p to pick it up.");
      found_objects += 1;
    } 
  }
};

Engine.prototype.pickup = function() {
  while (this.is_ticking) {
  }
  this.is_ticking = true;
  var objs = this.map.getObjects(this.player.x, this.player.y); 
  for (var i = 0; i < objs.length; i++) {
    var object = objs[i];
    if (this.objects[object].can_pickup) {
      if (object === "*") {
        var light = this.object_map.get(this.player.x, this.player.y);
        this.player.absorbLight(light);
        this.map.removeFromTile(object, this.player.x, this.player.y);
        this.object_map.delete(light, this.player.x, this.player.y);
        this.tick();
        break;
      }
      if (this.player.pickUp(object)) {
        this.say("You pickup the " + this.objects[object].name + ". Press d to drop it.");
        this.map.removeFromTile(object, this.player.x, this.player.y);
        this.tick();
        break;
      }
      else {
        this.say("You can't carry anymore.");
        break;
      }
    }
  }
  this.is_ticking = false;
};
Engine.prototype.drop = function() {
  while (this.is_ticking) {
  }
  this.is_ticking = true;
  var dropped_obj = this.player.drop(); 
  if (dropped_obj) {
    this.say("You drop the " + this.objects[dropped_obj].name + ".");
    game.map.addToTile(dropped_obj, this.player.x, this.player.y);
    this.tick();
  }
  this.is_ticking = false;
};

//display text in the header
Engine.prototype.say = function(string) {
  if (string) {
    $('<p>'+string+'</p>').prependTo('#console');
  }
};

Engine.prototype.move = function(x, y) {
  while (this.is_ticking) {
  }
  this.is_ticking = true;
  this.player.move(x, y);
  this.is_ticking = false;
};

Engine.prototype.initObjects = function() {
  console.log('init objects');
  var zombies = this.map.getLocation("z");
  for (var i=0; i<zombies.length; i++) {
    var zombie_loc = zombies[i];
    this.createZombie(zombie_loc.x, zombie_loc.y);
  }

  var lights = this.map.getLocation("*");
  for (var i=0; i<lights.length; i++) {
    var light_loc = lights[i];
    this.createLight(light_loc.x, light_loc.y);
  }
};

Engine.prototype.createZombie = function(x, y) {
  var zombie = new Zombie(x, y);
  this.zombie_counter += 1;
  this.object_map.add(zombie, x, y);
};

Engine.prototype.createLight = function(x, y) {
  console.log('new light');
  var light = new Light(x, y);
  //this.zombie_counter += 1;
  this.object_map.add(light, x, y);
};

Engine.prototype.doZombies = function() {
  var zombies = this.map.getLocation("z");
  for (var i = 0; i < zombies.length; i++) {
    var zombie_loc = zombies[i];
    var zombie = this.object_map.get(zombie_loc.x, zombie_loc.y);
    zombie.tick();
    if (this.player.dead) {
      game.reset();
      game.say("You die.");
      break;
    }
  } 
};

Engine.prototype.setCanvasSize = function() {
  this.ctx.canvas.width = window.innerWidth - window.innerWidth % this.step;
  this.ctx.canvas.height = window.innerHeight - window.innerHeight % this.step;
};
Engine.prototype.resize = function(e) {
  this.setCanvasSize();
  this.renderer.resize(this.ctx.canvas.width, this.ctx.canvas.height);
};
