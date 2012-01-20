var Objects = {
      renderImage: function(img, self, x, y, offset) {
        x = x*self.step+self.bg_x*self.step;
        y = y*self.step+self.bg_y*self.step;
        self.ctx.drawImage(img, x + offset, y + offset, self.step - 2*offset, self.step - 2*offset);
      },
      /* 7yy
      "": {
        name: "",
        render: function(self, x, y) {
          x = x*self.step+self.bg_x*self.step;
          y = y*self.step+self.bg_y*self.step;
        },
      },
      */
      "unseen tile": {
        name: "",
        render: function(self, x, y) {
          x = x*self.step+self.bg_x*self.step;
          y = y*self.step+self.bg_y*self.step;
          self.ctx.fillStyle="rgb(0,0,0)";
          self.ctx.fillRect(x, y, self.step, self.step);
        },
      },
      "@": {
        name: "player",
        PC: true,
        blocks_movement: true,
        render: function(self, x, y) {
          var player = document.getElementById('player');
          Objects.renderImage(player, self, x, y, 2);
        },
      },
      "*": {
        name: "light",
        light: {
          radius: 20,
          intensity: 6,
          lum: 0.8,
          flicker: 20,
        },
        blocks_movement: true,
        render: function(self, x, y) {
          var fire = document.getElementById('fire');
          Objects.renderImage(fire, self, x, y, 2);
        },
      },
      b: {
        name: "musky tome",
        can_pickup: true,
        can_read: true,
        render: function(self, x, y) {
          var book = document.getElementById('book');
          Objects.renderImage(book, self, x, y, 2);
        },
      },
      "#": {
        name: "brick wall",
        opaque: true,
        blocks_movement: true,
        render: function(self, x, y) {
          self.ctx.fillStyle="rgb(255,255,255)";
          var wall = document.getElementById('wall');
          Objects.renderImage(wall, self, x, y, 0);
        },
      },
      B: {
        name: "book case",
        opaque: true,
        blocks_movement: true,
        render: function(self, x, y) {
          var bookcase = document.getElementById('bookcase');
          Objects.renderImage(bookcase, self, x, y, 0);
        },
      },
      " ": {
        name: "floor",
        render: function(self, x, y) {
          var x = x*self.step+self.bg_x*self.step;
          var y = y*self.step+self.bg_y*self.step;

          /*self.ctx.fillStyle="rgb(0,0,0)";
          self.ctx.beginPath();
          self.ctx.arc(x+self.step/2, y+self.step/2, self.step/10,0,2*Math.PI,false);
          self.ctx.closePath();
          self.ctx.fill();     */

          self.ctx.fillStyle="rgb(250,250,250)";
          self.ctx.beginPath();
          self.ctx.arc(x+self.step/2, y+self.step/2, self.step/15,0,2*Math.PI,false);
          self.ctx.closePath();
          self.ctx.fill();     
        },
      },
      "d": {
        name: "door",
      },
      "z": {
        name: "zombie",
        //opaque: true,
        blocks_movement: true,
        zombie: true,
        render:  function(self, x, y) {
          var zombie = document.getElementById('zombie');
          Objects.renderImage(zombie, self, x, y, 2);
        },
      },
      "t": {
        name: "torch",
        light: {
          radius: 7,
          lum: 164,
          flicker: 5,
        },
        can_pickup: true,
        render: function(self, x, y) {
          var torch = document.getElementById('torch');
          Objects.renderImage(torch, self, x, y, 2);
        },
      },
      "M": {
        name: "matchbook",
        can_pickup: true,
        render: function(self, x, y) {
          var matchbook = document.getElementById('matchbook');
          Objects.renderImage(matchbook, self, x, y, 1);
        },
      },
      "L": {
        name: "lighter",
        light: {
          radius: 3,
          lum: 164,
          flicker: 6,
        },
        can_pickup: true,
        render: function(self, x, y) {
          var lighter = document.getElementById('lighter');
          Objects.renderImage(lighter, self, x, y, 2);
        },
      },
      "n": {
        name: "lantern",
        light: {
          radius: 15,
          lum: 164,
          flicker: 10,
        },
        can_pickup: true,
        render: function(self, x, y) {
          var lantern = document.getElementById('lantern');
          Objects.renderImage(lantern, self, x, y, 2);
        },
      },
  };

