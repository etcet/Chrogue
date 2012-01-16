function Map(ctx, step) {
  this.map = [
              '###################################################',
              '####################*###########*##################',
              '#########                                         #',
              '#########           #           #                 #',
              '##                                                #',
              '#*@                  z                    L#  z   #',
              '##                                               ##',
              '#########     #           #                      ##',
              '#########                                        ##',
              '##############*###########*###################   ##',
              '##############################################   ##',
              '#   ##########################################   ##',
              '# #       #   #  #      #       z   #            ##',
              '#t             #        #  #        #    #     # *#',
              '# #       #          #        #                  ##',
              '#   ###############################################',
              '# ###   #            #BBBBBBBBBBB#                #',
              '#     #           z  #           #                #',
              '#####   #            #           #       #        #',
              '#   #####            # #   #   # #   #       #    #',
              '#    z                                      n #z  #',
              '#                    #   #   #   #   #       #    #',
              '#               z    #           #       #        #',
              '#                    #    z      #           z    #',
              '#                    #BBBBBBBBBBB#                #',
              '###################################################',
              ]

  this.string_map = [];
  for (var i=0; i<this.map.length; i++) {
    this.string_map.push((this.map[i].split('')))
  }
 
  this.step = step; //size of block in pixels
  this.ctx = ctx; //canvas context

  //width and height in pixels
  this.width = this.ctx.canvas.width;
  this.height = this.ctx.canvas.height;
  this.grid_width = this.width / this.step;
  this.grid_height = this.height / this.step;

  //player start position
  var player_pos = this.getPlayerLocation();
  //background offset
  this.bg_x = -player_pos.x + this.grid_width / 2;
  this.bg_y = -player_pos.y + this.grid_height / 2;

  this.lights = new Lights(this.map[0].length, this.map.length);
}

Map.prototype.resize = function(w, h) {
  this.width = this.ctx.canvas.width;
  this.height = this.ctx.canvas.height;
  this.grid_width = this.width / this.step;
  this.grid_height = this.height / this.step;

  //player start position
  var player_pos = this.getPlayerLocation();
  //background offset
  this.bg_x = -player_pos.x + this.grid_width / 2;
  this.bg_y = -player_pos.y + this.grid_height / 2;

  this.draw();
};

Map.prototype.getLocation = function(c) {
  var locations = [];
  for (var i=0; i<this.string_map.length; i++) {
    var row = this.string_map[i];
    for (var j=0; j<this.string_map[i].length; j++) {
      if (row[j].indexOf(c) !== -1) {
        locations.push({x: j, y: i});
      }
    }
  }
  return locations;
};
Map.prototype.getPlayerLocation = function() {
  return this.getLocation("@")[0];
};

Map.prototype.addToTile = function(c, x, y) {
  var blocks_on_tile = this.getObjects(x, y);
  if (blocks_on_tile === " ") 
   this.string_map[y][x] = c; 
  else
   this.string_map[y][x] += c; 
};

Map.prototype.removeFromTile = function (c, x, y) {
  var tile_items = this.string_map[y][x];
  var item_index = tile_items.indexOf(c);
  tile_items = tile_items.substring(0, item_index) + tile_items.substring(item_index + 1);
  if (tile_items === "")
    tile_items = " ";
  this.string_map[y][x] = tile_items;
};

//calculate appropriate tile shading (0-255)
Map.prototype.getShade = function(c, x, y) {
  var light_color =  this.lights.getShade(x, y);
  var last_seen = this.lights.seen_map[y][x];
  var only_lit = false;
  var block = game.objects[c];
  if (this.lights.lit(x,y)) {
    if (c === "#" && last_seen === "#" && light_color < 32) {
      return 32;
    }
    return light_color;
  } else if (last_seen !== "") {
    if (block.zombie || block.name === "floor") {
      return 0;
    }
    else if (block.light) {
      return 64;
    }
    
    return 32;
  }
  return 0;
};

Map.prototype.objectToShow = function(x, y) {
  var objects_on_tile = this.string_map[y][x];
  if (objects_on_tile.length === 1)
    return objects_on_tile[0];
  else {
    for (var i = 0; i < objects_on_tile.length; i++) {
      if (objects_on_tile[i] === "@") {
        return "@";
      }
    }
    return objects_on_tile[objects_on_tile.length - 1];
  }
};

//draw all tiles
Map.prototype.drawMap = function() {
  var xnum = this.width / this.step;
  var ynum = this.height / this.step;

  for (var i=0; i<this.string_map.length; i++) {
    var row = this.string_map[i];
    for (var j=0; j<this.string_map[i].length; j++) {
      var tile_objects = row[j];
      var obj = this.objectToShow(j, i);
      var color = this.getShade(obj, j, i);
      if (color > 0) {
        this.ctx.fillStyle="rgb("+color+","+color+","+color+")";
        this.ctx.globalAlpha = color / 255;
        game.objects[obj].render(this, j, i);
      }
      else if (game.objects[obj].PC) {
        game.objects[obj].render(this, j, i);
      }
      else {
        game.objects["unseen tile"].render(this, j, i);
      }
    }
  }
};
//clear the canvas
Map.prototype.clearCanvas = function() {
  this.ctx.save();
  this.ctx.setTransform(1,0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.width, this.height);
};
Map.prototype.getObjects = function(x, y) {
  return this.string_map[y][x];
}

Map.prototype.printMap = function() {
  for (var i = 0; i < this.map.length; i++) {
    console.log(this.map[i]);
  }
};
Map.prototype.printItemMap = function() {
  for (var i = 0; i < this.string_map.length; i++) {
    console.log(this.string_map[i].join(''));
  }
};

//main draw cycle
Map.prototype.draw = function() {
  this.clearCanvas();
  this.lights.reset();
  this.lights.doFOV(game.player.x,
                    game.player.y,
                    this.grid_width / 2, //extend field of view to entire screen
                    game.player.light.radius,
                    game.player.light.lum,
                    game.player.light.flicker,
                    "player");
  //do lights 
  for (var b in game.objects) {
    var light = game.objects[b].light;
    if (light) {
      var lights = this.getLocation(b);
      for (var i=0; i<lights.length; i++) {
        this.lights.doFOV(lights[i].x,
                          lights[i].y,
                          light.radius,
                          light.radius,
                          light.lum,
                          light.flicker,
                          "light");
      }
    }
  }
  //do zombies
  /*var zombies = this.getLocation("z");
  for (var i=0; i<zombies.length; i++) {
    var zombie_loc = zombies[i];
    var zombie = game.object_map.get(zombie_loc.x, zombie_loc.y);
    this.lights.doFOV(zombie_loc.x,
                      zombie_loc.y,
                      4,
                      4,
                      255,
                      0,
                      "zombie");
  }*/
  this.drawMap();
  //this.lights.printEnemy();
  //this.printItemMap();
};

Map.prototype.tileFull = function(x, y) {
  var blocks_on_tile = this.getObjects(x, y);
  for (var i=0; i<blocks_on_tile.length; i++){
    if (game.objects[blocks_on_tile[i]].blocks_movement)
      return true;
  }
  return false;
};
Map.prototype.tileHasEnemy = function(x, y) {
  var blocks_on_tile = this.getObjects(x, y);
  for (var i=0; i<blocks_on_tile.length; i++){
    if (game.objects[blocks_on_tile[i]].zombie)
      return true;
  }
  return false;
};
