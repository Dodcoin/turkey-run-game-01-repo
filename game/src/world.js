/* Gobble Dash — the scrolling world. One job: spawn and recycle obstacles,
   corn and haystacks as the turkey runs, and track distance and stage. */
'use strict';

function GobbleWorld() {
  this.distanceMeters = 0;
  this.scrollPixels = 0;
  this.obstacles = [];
  this.corns = [];
  this.haystacks = [];
  this.nextObstacleAt = 700;
  this.nextCornAt = 520;
  this.nextHayAt = 980;
  this.spawnSeed = 12345;
}

GobbleWorld.prototype.reset = function () {
  this.distanceMeters = 0;
  this.scrollPixels = 0;
  this.obstacles = [];
  this.corns = [];
  this.haystacks = [];
  this.nextObstacleAt = 700;
  this.nextCornAt = 520;
  this.nextHayAt = 980;
  this.spawnSeed = 12345;
};

/* Tiny deterministic picker so a fresh run always opens the same way. */
GobbleWorld.prototype.pickNext = function (n) {
  this.spawnSeed = (this.spawnSeed * 1103515245 + 12345) % 2147483648;
  return this.spawnSeed % n;
};

GobbleWorld.prototype.stageSpeedBonus = function () {
  return GobbleConfig.stageSpeedBonus[stageIndexForDistance(this.distanceMeters)];
};

GobbleWorld.prototype.spawnObstacle = function (screenX) {
  var roll = this.pickNext(10);
  var kind = roll < 4 ? 'oven' : (roll < 8 ? 'knife' : 'oven');
  if (this.distanceMeters > 500 && roll === 9) kind = 'knife';
  this.obstacles.push({ kind: kind, x: screenX, w: kind === 'oven' ? 68 : 60, h: kind === 'oven' ? 58 : 56, hit: false });
};

GobbleWorld.prototype.spawnCornArc = function (screenX) {
  var baseY = GobbleConfig.groundY - 70;
  for (var i = 0; i < 4; i++) {
    this.corns.push({ x: screenX + i * 44, y: baseY - Math.sin((i / 3) * Math.PI) * 46, taken: false, phase: i * 0.9 });
  }
};

GobbleWorld.prototype.spawnHaystack = function (screenX) {
  this.haystacks.push({ x: screenX, w: 84, h: 56 });
};

GobbleWorld.prototype.update = function (dt, runSpeed) {
  var dx = runSpeed * dt;
  this.scrollPixels += dx;
  this.distanceMeters += dx * GobbleConfig.metersPerPixel;

  var i, item;
  for (i = 0; i < this.obstacles.length; i++) { this.obstacles[i].x -= dx; }
  for (i = 0; i < this.corns.length; i++) { this.corns[i].x -= dx; }
  for (i = 0; i < this.haystacks.length; i++) { this.haystacks[i].x -= dx; }
  this.obstacles = this.obstacles.filter(function (o) { return o.x > -120; });
  this.corns = this.corns.filter(function (c) { return c.x > -60; });
  this.haystacks = this.haystacks.filter(function (h) { return h.x > -140; });

  var gap = GobbleConfig.obstacleGapMin +
    this.pickNext(GobbleConfig.obstacleGapMax - GobbleConfig.obstacleGapMin);
  if (this.scrollPixels + 960 >= this.nextObstacleAt) {
    this.spawnObstacle(1000);
    this.nextObstacleAt = this.scrollPixels + 960 + gap;
  }
  if (this.scrollPixels + 960 >= this.nextCornAt) {
    this.spawnCornArc(1000);
    this.nextCornAt = this.scrollPixels + 960 + GobbleConfig.cornArcEveryMeters / GobbleConfig.metersPerPixel * 0.6;
  }
  if (this.scrollPixels + 960 >= this.nextHayAt) {
    this.spawnHaystack(1060);
    this.nextHayAt = this.scrollPixels + 960 + 1500 + this.pickNext(900);
  }
};

GobbleWorld.prototype.draw = function (ctx, time) {
  var stage = stageIndexForDistance(this.distanceMeters);
  drawFarmBackdrop(ctx, GobbleConfig.canvasWidth, GobbleConfig.canvasHeight,
    GobbleConfig.groundY, this.scrollPixels, stage);
  var i;
  for (i = 0; i < this.haystacks.length; i++) {
    drawHaystack(ctx, this.haystacks[i].x, GobbleConfig.groundY, 1);
  }
  for (i = 0; i < this.corns.length; i++) {
    var c = this.corns[i];
    if (!c.taken) drawCorn(ctx, c.x, c.y, 1, time * 3 + c.phase);
  }
  for (i = 0; i < this.obstacles.length; i++) {
    var o = this.obstacles[i];
    if (o.kind === 'oven') drawOven(ctx, o.x, GobbleConfig.groundY, 1);
    else drawCarvingKnife(ctx, o.x, GobbleConfig.groundY, 1, time * 4);
  }
};

/* Fixed, photogenic mid-run scene for the play screenshot (?shot=play). */
GobbleWorld.prototype.stagePlayShotScene = function () {
  this.reset();
  this.distanceMeters = 312;
  this.scrollPixels = 312 / GobbleConfig.metersPerPixel;
  this.obstacles = [
    { kind: 'oven', x: 640, w: 68, h: 58, hit: false },
    { kind: 'knife', x: 830, w: 60, h: 56, hit: false }
  ];
  this.corns = [
    { x: 520, y: GobbleConfig.groundY - 116, taken: false, phase: 0 },
    { x: 564, y: GobbleConfig.groundY - 138, taken: false, phase: 0.9 },
    { x: 608, y: GobbleConfig.groundY - 116, taken: false, phase: 1.8 }
  ];
  this.haystacks = [{ x: 880, w: 84, h: 56 }];
};
