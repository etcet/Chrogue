function Renderer(ctx, step, grid_width, grid_height) {
  this.ctx = ctx;
  this.step = step;

  //width and height in pixels
  this.grid_width = grid_width;
  this.grid_height = grid_height;

  //player start position
  var player_pos = game.map.getPlayerLocation();
  //background offset
  this.bg_x = -player_pos.x + this.grid_width / 2;
  this.bg_y = -player_pos.y + this.grid_height / 2;

  //should be odd
  this.light_res = 3;
  this.lights = new Lights(this.grid_width, this.grid_height, this.light_res);
}

Renderer.prototype.resize = function(w, h) {
  this.width = w;
  this.height = h;
  this.grid_width = this.width / game.step;
  this.grid_height = this.height / game.step;

  //player start position
  var player_pos = game.map.getPlayerLocation();
  //background offset
  this.bg_x = -player_pos.x + this.grid_width / 2;
  this.bg_y = -player_pos.y + this.grid_height / 2;

  this.render();
};


//main draw cycle
Renderer.prototype.render = function() {
  this.clearCanvas();
  this.lights.reset();
  this.lights.doFOV(game.player.x,
                    game.player.y,
                    this.grid_width, //extend field of view to entire screen
                    game.player.light.radius,
                    game.player.light.intensity,
                    game.player.light.lum,
                    game.player.light.flicker,
                    game.player.light.color,
                    "player");
  //do lights 
  var lights = game.map.getLocation("*");
  for (var i=0; i<lights.length; i++) {
    var light_loc = lights[i];
    var light = game.object_map.get(light_loc.x, light_loc.y);
    this.lights.doFOV(light_loc.x,
                      light_loc.y,
                      light.radius,
                      light.radius,
                      light.intensity,
                      light.lum,
                      light.flicker,
                      light.color,
                      "light");
  }
  /*for (var b in game.objects) {
    var light = game.objects[b].light;
    if (light) {
      var lights = game.map.getLocation(b);
      var color = {r: Math.random(), g: Math.random(), b: Math.random()};
      for (var i=0; i<lights.length; i++) {
        this.lights.doFOV(lights[i].x,
                          lights[i].y,
                          light.radius,
                          light.radius,
                          light.intensity,
                          light.lum,
                          light.flicker,
                          color,
                          "light");
      }
    }
  }*/

  this.renderMap();
  //this.lights.printEnemy();
  //this.printItemMap();
};

Renderer.prototype.move = function(dx, dy) {
  this.bg_x += dx;
  this.bg_y += dy;
};

//draw all tiles
Renderer.prototype.renderMap = function() {
  var xnum = this.width / this.step;
  var ynum = this.height / this.step;

  for (var i=0; i<game.map.string_map.length; i++) {
    var row = game.map.string_map[i];
    for (var j=0; j<game.map.string_map[i].length; j++) {
      var tile_objects = row[j];
      var obj = this.objectToShow(j, i);
      var shades = this.getShades(obj, j, i);

      var avg_shade = 0;
      for (var k=0; k<shades.length; k++) {
        avg_shade += (shades[k][0] + shades[k][1] + shades[k][2]);
      }
      avg_shade = avg_shade / shades.length;
      //console.log(avg_shade);

      if (avg_shade > 0.00) {
        this.ctx.globalAlpha = 1.0;
        this.renderTile(shades, j, i);
        if (obj === "z") {
          this.ctx.globalAlpha = avg_shade*3;
        }
        else {
          this.ctx.globalAlpha = avg_shade;
        }
        
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

Renderer.prototype.renderTile = function(shades, x, y) {
  var step = this.step / this.light_res;
  var color = 0;

  for (var j=0; j<this.light_res; j++) {
    for (var i=0; i<this.light_res; i++) {
      var color_r = parseInt(255 * shades[j*this.light_res + i][0]);
      var color_g = parseInt(255 * shades[j*this.light_res + i][1]);
      var color_b = parseInt(255 * shades[j*this.light_res + i][2]);
      this.ctx.fillStyle="rgb("+color_r+","+color_g+","+color_b+")";
  
      var tx;
      var ty;
      if (step === this.step) {
        tx = this.step * (x + this.bg_x);
        ty = this.step * (y + this.bg_y);
      }
      else {
        tx = this.step * (x + this.bg_x) + step * i;
        ty = this.step * (y + this.bg_y) + step * j;
      }
  
      this.ctx.fillRect(tx, ty, step, step);
    }
  }
};

//calculate appropriate tile shading
Renderer.prototype.getShades = function(c, x, y) {
  var last_seen = this.lights.seen_map[y][x];
  var all_lit = false;
  var only_lit = false;
  var max_shade = [0.8, 0.8, 0.8];
  var min_shade = [0.125, 0.125, 0.125];
  var no_shade = [0.0, 0.0, 0.0];
  var obj = game.objects[c];

  var shades = [];
  for (var i=0; i<this.light_res; i++) {
    for (var j=0; j<this.light_res; j++) {
      shades.push(no_shade);
    }
  }

  if (all_lit) {
    shade = max_shade;
    for (var j=0; j<this.light_res; j++) {
      for (var i=0; i<this.light_res; i++) {
        shades[j*this.light_res + i] = max_shade;
      }
    }
  }
  else {
    x = x * this.light_res;
    y = y * this.light_res;
    for (var j=0; j<this.light_res; j++) {
      for (var i=0; i<this.light_res; i++) {
        var color = no_shade;
        if (this.lights.subLit(x+i, y+j)) {
          color = this.lights.getColor(x+i, y+j);
          shade = this.lights.getShade(x+i, y+j);
          if (only_lit)
            color = max_shade;
          else if (c === "#" && last_seen === "#") {// && shade < 0.125) 
            if (shade < 0.125) {
              color = min_shade;
            }
            else {
              //shade = shade * 2;
            }
          }
          //else
          //  shade = shade;
        }
        else if (last_seen !== "") {
          if (obj.zombie || obj.name === "floor") {
            color = no_shade;
          }
          else {
            color = min_shade;
          }
        }
        shades[j*this.light_res + i] = color;
      }
    }
  }

  return shades
};

//clear the canvas
Renderer.prototype.clearCanvas = function() {
  this.ctx.save();
  this.ctx.setTransform(1,0, 0, 1, 0, 0);
  this.ctx.clearRect(0, 0, this.width, this.height);
};

//which object is on top?
Renderer.prototype.objectToShow = function(x, y) {
  var objects_on_tile = game.map.string_map[y][x];
  if (objects_on_tile.length === 1)
    return objects_on_tile[0];
  else {
    for (var i = 0; i < objects_on_tile.length; i++) {
      //player should be on top
      if (objects_on_tile[i] === "@") {
        return "@";
      }
    }
    //or else last placed item is on top
    return objects_on_tile[objects_on_tile.length - 1];
  }
};


