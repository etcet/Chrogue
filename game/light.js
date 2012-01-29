function Light(x, y) {
  this.x = x;
  this.y = y;

  this.radius = 50 + Math.random()*100;
  this.intensity = 10 + Math.random()*50;
  this.lum = 0.8;
  this.flicker = 20;
  
  this.color = {r: Math.random(), g: Math.random(), b: Math.random()};
/*
  var rand = Math.floor(Math.random() * 3);
  var color = Math.max(.5, Math.random());
  if (rand == 0)
    this.color = {r: Math.random(), g: Math.random(), b: Math.random()};
  else if (rand == 1)
    this.color = {r: 0.0, g: color, b: 0.0};
  else if (rand == 2)
    this.color = {r: 0.0, g: 0.0, b: color};*/
}


