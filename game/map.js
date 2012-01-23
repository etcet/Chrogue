function Map(ctx, step) {
  /*this.map = [
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
              ]*/

  var objects = [ {character: '@', count: 1},
                  {character: '*', count: 10},
                  {character: 'z', count: 1}
                ];
  this.map = new GeneratedMap(32, 32, objects);
  
  this.string_map = [];
  for (var i=0; i<this.map.length; i++) {
    this.string_map.push((this.map[i].split('')))
  }
}

Map.prototype.getWidth = function() {
  return this.map[0].length;
};
Map.prototype.getHeight = function() {
  return this.map.length;
}


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


Map.prototype.getObjects = function(x, y) {
  return this.string_map[y][x];
}

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

