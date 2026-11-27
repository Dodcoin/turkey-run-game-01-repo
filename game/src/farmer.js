/* Gobble Dash — the farmer. One job: chase the turkey, lose it when it hides,
   search the haystacks, and corner it at the screen edge. */
'use strict';

function FarmerChaser() {
  this.reset();
}

FarmerChaser.prototype.reset = function () {
  this.x = 220 - GobbleConfig.farmerStartGap;
  this.y = GobbleConfig.groundY;
  this.state = 'chasing';
  this.searchTimer = 0;
  this.stridePhase = 0;
  this.spottedFlash = 0;
  this.speedBoost = 0;
  this.graceTimer = 2.5;
};

FarmerChaser.prototype.speed = function (world) {
  var base = GobbleConfig.farmerBaseSpeed + world.stageSpeedBonus() + this.speedBoost;
  if (this.state === 'searching') return GobbleConfig.farmerSearchSpeed;
  return base;
};

FarmerChaser.prototype.update = function (dt, turkey, world, sounds) {
  this.stridePhase += dt * 10;
  if (this.spottedFlash > 0) this.spottedFlash -= dt;
  if (this.speedBoost > 0) this.speedBoost -= dt * 8;

  /* Head start: at the start of a run the farmer hollers and points for a
     couple of seconds instead of sprinting, so the player can get moving. */
  if (this.graceTimer > 0) {
    this.graceTimer -= dt;
    return;
  }

  if (turkey.hiding && this.state === 'chasing') {
    this.state = 'searching';
    this.searchTimer = 2.2;
    if (sounds) sounds.alarmSpotted();
    this.spottedFlash = 0.9;
  }
  if (this.state === 'searching') {
    this.searchTimer -= dt;
    this.x += GobbleConfig.farmerSearchSpeed * dt;
    if (this.searchTimer <= 0 || !turkey.hiding) {
      this.state = 'chasing';
      if (!turkey.hiding) this.speedBoost = 26;
    }
    return;
  }
  var gap = turkey.x - this.x;
  var target = this.speed(world);
  if (gap > 130) target += 34;
  if (gap < 60) target -= 30;
  this.x += target * dt;
  if (this.x < 30) this.x = 30;
};

FarmerChaser.prototype.catches = function (turkey) {
  if (turkey.hiding || turkey.invulnerableTimer > 0) return false;
  return Math.abs(this.x - turkey.x) < GobbleConfig.farmerCatchDistance &&
    turkey.onGround;
};

FarmerChaser.prototype.draw = function (ctx, time) {
  var stride = Math.sin(this.stridePhase) * 6;
  var reach = this.state === 'chasing' ? Math.max(0, Math.sin(time * 3)) * 6 : 0;
  drawFarmer(ctx, this.x, this.y, 1, { stride: stride, reach: reach });
  if (this.graceTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEY! GET BACK HERE!', this.x + 60, this.y - 108);
    ctx.restore();
  }
  if (this.state === 'searching') {
    ctx.save();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('WHERE DID IT GO?!', this.x + 40, this.y - 108);
    ctx.fillStyle = '#d94f30';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('?', this.x + 40, this.y - 84);
    ctx.restore();
  }
  if (this.spottedFlash > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(217,79,48,' + (this.spottedFlash * 0.5).toFixed(2) + ')';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', this.x + 60, this.y - 130);
    ctx.restore();
  }
};
