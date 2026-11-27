/* Gobble Dash — screens and HUD. One job: draw the title screen, the live
   HUD (score, distance, lives, stage) and the caught / escaped end screens,
   and own the clickable buttons on them. */
'use strict';

function GobbleHud() {
  this.buttons = [];
}

GobbleHud.prototype.clearButtons = function () { this.buttons = []; };

GobbleHud.prototype.addButton = function (id, x, y, w, h, label) {
  this.buttons.push({ id: id, x: x, y: y, w: w, h: h, label: label });
};

GobbleHud.prototype.buttonAt = function (px, py) {
  for (var i = 0; i < this.buttons.length; i++) {
    var b = this.buttons[i];
    if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b.id;
  }
  return null;
};

GobbleHud.prototype.roundRect = function (ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

GobbleHud.prototype.drawButton = function (ctx, b, accent) {
  ctx.save();
  ctx.fillStyle = accent ? '#d94f30' : '#3a5a8c';
  this.roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.restore();
};

GobbleHud.prototype.drawHud = function (ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.82)';
  this.roundRect(ctx, 14, 12, 932, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCORE  ' + state.score, 30, 41);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('DISTANCE  ' + Math.floor(state.distance) + ' m / 1000 m', 290, 41);
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('STAGE  ' + state.stageName, 585, 41);
  var lives = '';
  for (var i = 0; i < GobbleConfig.maxLives; i++) lives += (i < state.lives ? '♥ ' : '♡ ');
  ctx.fillStyle = '#ff8a7a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(lives, 930, 41);
  ctx.textAlign = 'left';
  ctx.restore();
  this.drawDistanceBar(ctx, state);
};

GobbleHud.prototype.drawDistanceBar = function (ctx, state) {
  var x = 14, y = 76, w = 932, h = 10;
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.55)';
  this.roundRect(ctx, x, y, w, h, 5);
  ctx.fill();
  var frac = Math.min(1, state.distance / GobbleConfig.escapeDistanceMeters);
  ctx.fillStyle = '#7fae4c';
  this.roundRect(ctx, x, y, Math.max(10, w * frac), h, 5);
  ctx.fill();
  ctx.fillStyle = '#3a2417';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('ESCAPE → THE FOREST', x + 2, y + 24);
  ctx.restore();
};

GobbleHud.prototype.drawTitle = function (ctx, time) {
  var W = GobbleConfig.canvasWidth, H = GobbleConfig.canvasHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', W / 2, 118);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'italic bold 26px Georgia, serif';
  ctx.fillText('The Great Thanksgiving Escape', W / 2, 156);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#ffe9bd';
  ctx.fillText('Thanksgiving is coming. You are the dinner.', W / 2, 200);
  ctx.fillText('Outrun Farmer Bram, leap the ovens, dodge the carving knives,', W / 2, 228);
  ctx.fillText('grab the corn — and reach the forest 1000 m away!', W / 2, 254);
  this.clearButtons();
  this.addButton('start', W / 2 - 150, 292, 300, 56, '▶  START THE ESCAPE');
  this.drawButton(ctx, this.buttons[0], true);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('← → / A D move · SPACE jump · S / ↓ hide in hay · P pause · M mute', W / 2, 382);
  ctx.fillText('Hide in a haystack and the farmer searches right past you.', W / 2, 406);
  ctx.font = 'italic 14px Georgia, serif';
  ctx.fillStyle = '#e8c98f';
  ctx.fillText('An original game — art, sounds and story drawn and played by its own code.', W / 2, 446);
  ctx.restore();
};

GobbleHud.prototype.drawEnd = function (ctx, result) {
  var W = GobbleConfig.canvasWidth, H = GobbleConfig.canvasHeight;
  var escaped = result.outcome === 'escaped';
  ctx.save();
  ctx.fillStyle = escaped ? 'rgba(31,74,40,0.55)' : 'rgba(74,20,12,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = escaped ? '#b8f5a0' : '#ffb3a0';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(escaped ? 'YOU ESCAPED!' : 'CAUGHT!', W / 2, 130);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'italic bold 24px Georgia, serif';
  ctx.fillText(escaped
    ? 'The forest is yours — no Thanksgiving dinner today!'
    : 'Farmer Bram got you… but the oven is still warm. Run again!', W / 2, 172);
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('FINAL SCORE  ' + result.score + '   ·   DISTANCE  ' +
    Math.floor(result.distance) + ' m   ·   CORN  ' + result.corn, W / 2, 232);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(escaped
    ? 'Best escape yet? Beat your score on the next run.'
    : 'Tip: jump the knives, duck under nothing — and hide in the hay!', W / 2, 268);
  this.clearButtons();
  this.addButton('restart', W / 2 - 150, 306, 300, 56, '↻  RUN AGAIN');
  this.drawButton(ctx, this.buttons[0], !escaped);
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Press ENTER or click RUN AGAIN to restart', W / 2, 396);
  ctx.restore();
};

GobbleHud.prototype.drawPaused = function (ctx) {
  var W = GobbleConfig.canvasWidth, H = GobbleConfig.canvasHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', W / 2, H / 2 - 8);
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Press P to keep running', W / 2, H / 2 + 28);
  ctx.restore();
};
