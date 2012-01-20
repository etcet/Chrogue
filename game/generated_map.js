function GeneratedMap(w, h, objects) {
  this.cavify_times = 3;
  this.percent_walls = 0.40;

  this.width = w;
  this.height = h;
  
  this.map = this.randomMap();
  this.flood_map = [];
  
  //this.printMap();
  for (var i=0; i<this.cavify_times; i++) {
    this.cavify();
    //this.printMap();
  }
  this.removeDisconnectedAreas();

  this.string_map = this.stringifyMap();
  for (var i=0; i<objects.length; i++) {
    this.addObjects(objects[i].character, objects[i].count);
  }
  //this.printFloodMap();
  
  return this.string_map;
}

GeneratedMap.prototype.stringifyMap = function() {
  var map = [];

  for (var y = 0; y < this.height; y++) {
    var row = [];
    for (var x = 0; x < this.width; x++) {
      if (this.map[y][x] === 1)
        row.push("#");
      else if (this.map[y][x] === 0)
        row.push(" ");
    }
    map.push(row.join(''));
  }
  
  return map;
};

GeneratedMap.prototype.addObjects = function(obj, n) {
  var num = 0;
  while (num < n) {
    var x = Math.floor(Math.random() * this.width);
    var y = Math.floor(Math.random() * this.height);

    if (this.string_map[y][x] === " ") {
      this.string_map[y] = this.string_map[y].substring(0, x) + obj + this.string_map[y].substring(x+1);
      num += 1;
    }
  }
};

GeneratedMap.prototype.randomMap = function() {
  var map = [];

  for (var y = 0; y < this.height; y++) {
    var row = [];
    while (row.length < this.width) {
      if (row.length === 0 || row.length === this.width-1 || y === 0 || y === this.height-1)
        row.push(1);
      else {
        if (Math.random() < this.percent_walls)
          row.push(1);
        else
          row.push(0);
      }
    }
    map.push(row);
  } 

  return map;
};

GeneratedMap.prototype.removeDisconnectedAreas = function() {
  this.flood_map = [];
  while (this.flood_map.length < this.height) {
    var row = []; 
    while (row.length < this.width) {
      row.push(0);
    }
    this.flood_map.push(row);
  }

  var biggest = {id:0, count:0};
  var id = 0;

  for (var y = 1; y < this.height-1; y++) {
    for (var x = 1; x < this.width-1; x++) {
      if (this.map[y][x] === 0 && !this.flood_map[y][x]) {
        id += 1;
        var count = this.floodFill(x, y, id); 
        if (count > biggest.count) {
          biggest.id = id;
          biggest.count = count;
        }
      }
    }
  }
 
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      if (this.flood_map[y][x] !== biggest.id) {
        this.map[y][x] = 1;
      }
    }
  }
};

GeneratedMap.prototype.floodFill = function(x, y, id) {
  this.flood_map[y][x] = id;
  var c = 1;

  if (this.map[y][x+1] === 0 && !this.flood_map[y][x+1])
    c += this.floodFill(x+1, y, id);
  if (this.map[y][x-1] === 0 && !this.flood_map[y][x+1])
    c += this.floodFill(x-1, y, id);
  if (this.map[y+1][x+1] === 0 && !this.flood_map[y+1][x+1])
    c += this.floodFill(x+1, y+1, id);
  if (this.map[y+1][x-1] === 0 && !this.flood_map[y][x-1])
    c += this.floodFill(x-1, y+1, id);
  if (this.map[y+1][x] === 0 && !this.flood_map[y+1][x])
    c += this.floodFill(x, y+1, id);
  if (this.map[y-1][x+1] === 0 && !this.flood_map[y-1][x+1])
    c += this.floodFill(x+1, y-1, id);
  if (this.map[y-1][x-1] === 0 && !this.flood_map[y-1][x-1])
    c += this.floodFill(x-1, y-1, id);
  if (this.map[y-1][x] === 0 && !this.flood_map[y-1][x])
    c += this.floodFill(x, y-1, id);
  
  return c;
};

GeneratedMap.prototype.printMap = function() {
  for (var i = 0; i < this.map.length; i++) {
    console.log(this.map[i]);
  }
};

GeneratedMap.prototype.printFloodMap = function() {
  for (var i = 0; i < this.flood_map.length; i++) {
    console.log(this.flood_map[i]);
  }
};

GeneratedMap.prototype.cavify = function() {
  this.temp_map = this.map;

  for (var y = 1; y < this.height - 1; y++) {
    for (var x = 1; x < this.width - 1; x++) {
      var wall_count = 0;

      if (this.map[y][x+1])
        wall_count += 1;
      if (this.map[y][x-1])
        wall_count += 1;
      if (this.map[y-1][x])
        wall_count += 1;
      if (this.map[y-1][x+1])
        wall_count += 1;
      if (this.map[y-1][x-1])
        wall_count += 1;
      if (this.map[y+1][x])
        wall_count += 1;
      if (this.map[y+1][x+1])
        wall_count += 1;
      if (this.map[y+1][x-1])
        wall_count += 1;

      var this_tile = this.map[y][x];
      var replacement = this_tile;
      if (!this_tile && wall_count >= 5) {
        replacement = 1;
      }
      else if (wall_count < 3){
        replacement = 0;
      }
      this.temp_map[y][x] = replacement;
    }
  }
  
  this.map = this.temp_map;
};
