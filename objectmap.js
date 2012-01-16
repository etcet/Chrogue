function ObjectMap() {
  this.object_map = [];
}
ObjectMap.prototype.add = function(object, x, y) {
  var object_item = { location: {x: x, y: y}, obj: object };
  this.object_map.push(object_item); 
};
ObjectMap.prototype.get = function(x, y) {
  for (var i=0; i<this.object_map.length; i++) {
    if (this.object_map[i].location.x === x && this.object_map[i].location.y === y)
      return this.object_map[i].obj;
  }
};
ObjectMap.prototype.move = function(obj, x, y) {
  for (var i=0; i<this.object_map.length; i++) {
    if (this.object_map[i].obj === obj) {
      this.object_map[i].location.x = x;
      this.object_map[i].location.y = y;
    }
  }
};
ObjectMap.prototype.delete = function(obj, x, y) {
  for (var i=0; i<this.object_map.length; i++) {
    if (this.object_map[i].obj == obj) {
      this.object_map.splice(i,1);
      delete obj; 
      return;
    }
  }
};
