/* Gobble Dash — the turkey. One job: the player's movement, jumping, ducking
   and hiding, plus the box the game collides against. */
'use strict';

function TurkeyPlayer() {
  this.reset();
}

TurkeyPlayer.prototype.reset = function () {
  this.x = 220;
  this.y = GobbleConfig.groundY;
  this.vy = 0;
  this.onGround = true;
  this.ducking = false;
  this.hiding = false;
  this.hideTimer = 0;
  this.invulnerableTimer = 0;
  this.legPhase = 0;
  this.wingFlap = 0;
  this.facing = 1;
};

TurkeyPlayer.prototype.height = function () {
  return this.ducking ? GobbleConfig.turkeyDuckHeight : GobbleConfig.turkeyStandHeight;
};

TurkeyPlayer.prototype.bounds = function () {
  return {
    x: this.x - GobbleConfig.turkeyWidth / 2,
    y: this.y - this.height(),
    w: GobbleConfig.turkeyWidth,
    h: this.height()
  };
};

TurkeyPlayer.prototype.jump = function (sounds) {
  if (!this.onGround || this.hiding) return false;
  this.vy = -GobbleConfig.turkeyJumpSpeed;
  this.onGround = false;
  this.ducking = false;
  this.wingFlap = 14;
  if (sounds) sounds.flap();
  return true;
};

TurkeyPlayer.prototype.startHiding = function (haystack) {
  if (!this.onGround || !haystack) return false;
  this.hiding = true;
  this.hideTimer = GobbleConfig.hideSeconds;
  this.ducking = true;
  this.x = haystack.x;
  return true;
};

TurkeyPlayer.prototype.update = function (dt, input) {
  var speed = GobbleConfig.turkeyRunSpeed;
  if (this.hiding) {
    this.hideTimer -= dt;
    if (this.hideTimer <= 0) {
      this.hiding = false;
      this.ducking = false;
    }
    this.legPhase += dt * 2;
  } else {
    if (input.left) { this.x -= speed * dt; this.facing = -1; }
    if (input.right) { this.x += speed * dt; this.facing = 1; }
    if (this.x < 60) this.x = 60;
    if (this.x > 880) this.x = 880;
    this.ducking = !!input.down && this.onGround;
    if (input.jumpPressed) this.jump(input.sounds);
    this.legPhase += dt * 11;
  }
  if (!this.onGround) {
    this.vy += GobbleConfig.gravity * dt;
    this.y += this.vy * dt;
    if (this.y >= GobbleConfig.groundY) {
      this.y = GobbleConfig.groundY;
      this.vy = 0;
      this.onGround = true;
    }
  }
  if (this.wingFlap > 0) this.wingFlap -= dt * 40;
  if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
};

TurkeyPlayer.prototype.draw = function (ctx, time) {
  if (this.invulnerableTimer > 0 && Math.floor(time * 12) % 2 === 0) return;
  var bob = this.onGround ? Math.sin(this.legPhase) * 2 : 0;
  var legSwing = this.onGround ? Math.sin(this.legPhase) * 7 : 4;
  drawTurkey(ctx, this.x, this.y, 1, {
    bob: bob,
    ducking: this.ducking,
    hidden: this.hiding,
    legSwing: legSwing,
    wingFlap: Math.max(0, this.wingFlap)
  });
  if (this.hiding) {
    ctx.save();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHHH… HIDING!', this.x, this.y - 84);
    ctx.restore();
  }
};
