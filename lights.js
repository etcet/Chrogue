function Lights(w, h) {
  //width and height in grid coordinates
  this.gridw = w;
  this.gridh = h;
  //light array, stores tick when tile was seen,
  //and which light saw it (used for multiple light sources)
  this.light_map = [];  
  for (var i=0; i<this.gridh; i++) {
    this.light_map.push([]);
    for (var j=0; j<this.gridw; j++) {
      this.light_map[i].push({lit: [0, 0]});
    }
  }
  //luminance map has 4 cells for each light_map cell
  this.lum_map = [];
  for (var i=0; i<this.gridh; i++) {
    this.lum_map.push([]);
    for (var j=0; j<this.gridw; j++) {
      this.lum_map.push([0.0]);
    }
  }
  //light incrementor
  this.light_flag = 0;
  this.light_cycle = 0;

  this.enemy_lights = [];  
  for (var i=0; i<this.gridh; i++) {
    this.enemy_lights.push([]);
    for (var j=0; j<this.gridw; j++) {
      this.enemy_lights[i].push([]);
    }
  }

  //keep track of what the player saw when they could see tile
  this.seen_map = [];
  for (var i=0; i<this.gridh; i++) {
    this.seen_map.push([]);
    for (var j=0; j<this.gridw; j++) {
      this.seen_map[i].push("");
    }
  }
};

//is x,y tile blocking
Lights.prototype.blocked = function(x,y) {
  if (x < 0 || y < 0 || x >= this.gridw || y >= this.gridh) {
    return true;
  }
  else {
    for (var i=0; i<game.map.string_map[y][x].length; i++) {
      if (game.objects[game.map.string_map[y][x][i]].opaque)
        return true;
    }
  } 
  return false;
};
//does tile block?
Lights.prototype.isObjectOpaque = function(c) {
  return game.objects[c].opaque;
};
//is tile lit right now?
Lights.prototype.lit = function(x,y) {
  return (this.light_map[y][x].lit[0] === this.light_flag);
};
Lights.prototype.enemyCanSee = function(x, y, id) {
  if (jQuery.inArray(id, this.enemy_lights[y][x]) >= 0)
    return true;
  else
    return false;
};

Lights.prototype.getDistance = function(lx, ly, x, y) {
  return Math.sqrt( (x-lx)*(x-lx) + (y-ly)*(y-ly) );
};
Lights.prototype.getShade = function(x, y) {
  return this.lum_map[y][x];
};
Lights.prototype.shade = function(x, y, lx, ly) {
  var dist = this.getDistance(lx, ly, x, y);
  var radsq = this.lum_radius * this.lum_radius;
  var intcoeff1 = parseFloat(this.lum_start / (1.0 + dist*dist/this.lum_radius*2));
  var intcoeff2 = parseFloat(intcoeff1 - 1.0 / (1.0 + radsq));
  var intcoeff3 = parseFloat(intcoeff2 / (1.0 - 1.0/(1.0 + radsq)));
  if (this.lit(x, y)) {
    return Math.max(0.0, intcoeff3);
  } else {
    return 0.0;
  }
};

//set tile as lit with current light flag
Lights.prototype.setLit = function(x, y, lx, ly) {
  if (x >= 0 && x<this.gridw && y<this.gridh && y >= 0) {

    if (this.light_source === "zombie") {
      if (jQuery.inArray(this.light_id, this.enemy_lights[y][x]) === -1) {
        this.enemy_lights[y][x].push(this.light_id);
      }
      return;
    }

    //if this is the first time it's been lit
    if (this.light_map[y][x].lit[0] !== this.light_flag) {
      this.light_map[y][x].lit[1] = this.light_cycle;
      //player always goes first so this works
      if (this.light_source === "player") {
        this.light_map[y][x].lit[0] = this.light_flag;
        //this.lum_map[y][x] = Math.min(this.lum_start, this.shade(x, y, lx, ly));
        this.lum_map[y][x] = this.shade(x, y, lx, ly);
      }
    }
    //hit again but not by the same light
    else if (this.light_map[y][x].lit[1] !== this.light_cycle) {
      var lit = this.lit(x,y);
      this.light_map[y][x].lit[1] = this.light_cycle;
      if (lit) {
        //this.lum_map[y][x] = Math.min(this.lum_start, this.lum_map[y][x] + Math.min(this.lum_start, this.shade(x, y, lx, ly)));
        this.lum_map[y][x] = Math.min(this.lum_start, this.lum_map[y][x] + this.shade(x, y, lx, ly));
      }
    }

    if (this.lit(x,y)) {
      if (this.lum_map[y][x] > 0.0) {
        this.seen_map[y][x] = game.map.string_map[y][x];
      }
    }
  }
};

/* recursive shadowing casting algorithm as described at:
   http://roguebasin.roguelikedevelopment.org/index.php/FOV_using_recursive_shadowcasting
*/
Lights.prototype.castLight = function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
  var the_end = end;
  if (start < end) 
    return;
  var radius_squared = parseFloat(radius * radius);
  for (var j=row; j<radius+1; j++) {
    var dx = 0.0;
    var dy = 0.0;
    dx = -j - 1;
    dy = -j;
    var blocked = false;
    while (dx <= 0) {
      dx += 1.0;
      //translate the dx, dy coordinates into map coordinates
      var X = 0.0;
      var Y = 0.0;
      X = cx + dx * xx + dy * xy;
      Y = cy + dx * yx + dy * yy;
      // l_slope and r_slope store the slopes of the left and right
      // extremities of the square we're considering
      var l_slope = 0.0;
      var r_slope = 0.0;
      l_slope = (dx-0.5) / (dy+0.5);
      r_slope = (dx+0.5) / (dy-0.5);
      if (start <  r_slope) {
        continue;
      } else if (end > l_slope) {
        break;
      }
      else {
        //our light beam is touching this square; light it:
        if ( (dx*dx + dy*dy) <= radius_squared) {
          this.setLit(X,Y,cx,cy);
        }
        if (blocked) {
          if (this.blocked(X,Y)) {
            new_start = r_slope;
            continue;
          }
          else {
            blocked = false;
            start = new_start;
          }
        }
        else {
          if (this.blocked(X,Y) && j<=radius) {
            // this is a blocking square, start a child scan:
            blocked = true;
            this.castLight(cx,cy,j+1,start,l_slope,radius,xx,xy,yx,yy,id+1);
            new_start = r_slope;
          }
        }
      }
    }
    // row is scanned; do next row unless last square was blocked
    if (blocked) {
      break;
    }
  }
};

Lights.prototype.reset = function() {
  for (var i=0; i<this.gridh; i++) {
    for (var j=0; j<this.gridw; j++) {
      this.lum_map[i][j] = 0.0;
      this.enemy_lights[i][j] = [];
    }
  }
  this.light_flag += 1;
};

//calculator lit squares from the given location and radius
Lights.prototype.doFOV = function(x,y,radius,lum_radius,lum_start,flicker,light_source, light_id) {
  this.lum_start = lum_start; 
  this.light_source = light_source;
  this.lum_radius = lum_radius;
  if (flicker > 0) {
    this.lum_radius = this.lum_radius + Math.random()/flicker;
  }

  if (light_source === "zombie") {
    this.light_id = light_id;
    this.light_cycle = light_id;
  }
  else {
    this.light_cycle += 1;
  }

  //multipliers for transforming coordinates to other octants:
  var mult = [
              [1,  0,  0, -1, -1,  0,  0,  1],
              [0,  1, -1,  0,  0, -1,  1,  0],
              [0,  1,  1,  0,  0, -1, -1,  0],
              [1,  0,  0,  1, -1,  0,  0, -1]
             ];
  for (var i=0;i<8;i++) {
    this.castLight(x, y, 1, 1.0, 0.0, radius, mult[0][i], mult[1][i], mult[2][i], mult[3][i], 0);
  }
  this.setLit(x,y, x, y);
};

Lights.prototype.printEnemy = function() {
  console.log('enemy sight array:', this.enemy_lights);
  for (var i=0; i<this.enemy_lights.length; i++) {
    console.log(this.enemy_lights[i].join(','));
  }
};
