function Controls(move_interval) { 
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;

  this.timer = null;

  this.initKeys();
  $(window).resize( function(e) {
    game.resize(e);
  });
}

Controls.prototype.initKeys = function() {
  var self = this;
  $(document).keydown(function(e) {
    var key = e.keyCode;
    //console.log('down', key);

    //move w/ nethack + arrows + numpad
    if (key == 75 || key == 38 || key == 104) { //k 
      self.up = true;
    } else if (key == 72 || key == 37 || key == 100) { //h
      self.left = true;
    } else if (key == 74 || key == 40 || key == 98) { //j
      self.down = true;
    } else if (key == 76 || key == 39 || key == 102) { //l
      self.right = true;
    } else if (key == 89 || key == 103) { //y
      self.up = true;
      self.left = true;
    } else if (key == 85 || key == 105 ) { //u
      self.up = true;
      self.right = true;
    } else if (key == 66 || key == 97) { //b
      self.down = true;
      self.left = true;
    } else if (key == 78 || key == 99) { //n
      self.down = true;
      self.right = true;
    } else if (key == 32 || key == 110) { //space or keypad .
      game.tick();
    } else if (key == 80) { //p
      game.pickup();
    } else if (key == 68) { //d
      game.drop();
    }

    if (self.timer === null) {
      self.move(self);
      self.timer = window.setTimeout(function() {
        self.timer = null;
      }, 50);
    }
    else {
    }
  
  });
  
  $(document).keyup(function(e) {
    var key = e.keyCode;
    //console.log('up', key);

    if (key == 75 || key == 38 || key == 104) { //k 
      self.up = false;
    } else if (key == 72 || key == 37 || key == 100) { //h
      self.left = false;
    } else if (key == 74 || key == 40 || key == 98) { //j
      self.down = false;
    } else if (key == 76 || key == 39 || key == 102) { //l
      self.right = false;
    } else if (key == 89 || key == 103) { //l
      self.up = false;
      self.left = false;
    } else if (key == 85 || key == 105 ) { //l
      self.up = false;
      self.right = false;
    } else if (key == 66 || key == 97) { //l
      self.down = false;
      self.left = false;
    } else if (key == 78 || key == 99) { //l
      self.down = false;
      self.right = false;
    }
  });
};

Controls.prototype.move = function(self) {
  var x = 0;
  var y = 0;
  if (self.up)
    y -= 1;
  else if (self.down)
    y += 1;
  
  if (self.left)
    x -= 1;
  else if (self.right)
    x += 1;

  if (x != 0 || y != 0)
    game.move(x, y);
};
