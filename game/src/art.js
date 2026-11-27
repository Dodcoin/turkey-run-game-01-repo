/* Gobble Dash — procedural art. One job: draw every character and prop with
   canvas shapes only, so the game needs no image files. */
'use strict';

function drawEllipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* The hero: a plump brown turkey with a fanned tail, mid-waddle. Faces right. */
function drawTurkey(ctx, x, y, scale, opts) {
  opts = opts || {};
  var bob = opts.bob || 0;
  var ducking = !!opts.ducking;
  var hidden = !!opts.hidden;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  if (hidden) ctx.globalAlpha = 0.55;
  var bodyH = ducking ? 26 : 40;
  var bodyY = ducking ? -16 : -26;

  ctx.fillStyle = '#8a4b2a';
  for (var i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-14, bodyY - 6);
    ctx.rotate(i * 0.42);
    ctx.fillStyle = i === 0 ? '#b5651d' : (i % 2 === 0 ? '#a0522d' : '#c47a33');
    drawEllipse(ctx, 0, -20, 7, 22);
    ctx.restore();
  }
  ctx.fillStyle = '#7a3f1d';
  drawEllipse(ctx, -6, bodyY - 8, 10, 15);

  ctx.fillStyle = '#a0522d';
  drawEllipse(ctx, 0, bodyY, 26, bodyH / 2 + 6);
  ctx.fillStyle = '#c98a4b';
  drawEllipse(ctx, 4, bodyY + 4, 18, bodyH / 2 - 2);

  ctx.fillStyle = '#8a4b2a';
  drawEllipse(ctx, 24, bodyY - 26, 13, 13);
  ctx.fillStyle = '#d94f30';
  drawEllipse(ctx, 26, bodyY - 12, 4, 9);
  ctx.fillStyle = '#f6b73c';
  ctx.beginPath();
  ctx.moveTo(34, bodyY - 28);
  ctx.lineTo(46, bodyY - 24);
  ctx.lineTo(34, bodyY - 21);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b1a12';
  drawCircle(ctx, 28, bodyY - 30, 2.4);
  ctx.fillStyle = '#d94f30';
  ctx.beginPath();
  ctx.moveTo(20, bodyY - 34);
  ctx.lineTo(24, bodyY - 42);
  ctx.lineTo(27, bodyY - 33);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  var legSwing = opts.legSwing || 0;
  ctx.beginPath();
  ctx.moveTo(-6, bodyY + bodyH / 2 + 2);
  ctx.lineTo(-10 + legSwing, 0);
  ctx.moveTo(8, bodyY + bodyH / 2 + 2);
  ctx.lineTo(12 - legSwing, 0);
  ctx.stroke();
  ctx.fillStyle = '#e8a33d';
  drawEllipse(ctx, -10 + legSwing, -1, 7, 2.5);
  drawEllipse(ctx, 12 - legSwing, -1, 7, 2.5);

  ctx.strokeStyle = '#8a4b2a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-16, bodyY - 2);
  ctx.quadraticCurveTo(-30, bodyY - 16 + (opts.wingFlap || 0), -14, bodyY - 18);
  ctx.stroke();
  ctx.restore();
}

/* The pursuer: a big farmer in overalls and straw hat, always hurrying left-to-right. */
function drawFarmer(ctx, x, y, scale, opts) {
  opts = opts || {};
  var stride = opts.stride || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#3a5a8c';
  ctx.fillRect(-14, -52, 28, 52);
  ctx.fillStyle = '#7a9cc6';
  ctx.fillRect(-14, -52, 28, 12);
  ctx.fillStyle = '#e8b88a';
  drawCircle(ctx, 2, -62, 13);
  ctx.fillStyle = '#f2d13c';
  ctx.beginPath();
  ctx.moveTo(-16, -70);
  ctx.lineTo(20, -70);
  ctx.lineTo(14, -76);
  ctx.lineTo(-10, -76);
  ctx.closePath();
  ctx.fill();
  drawEllipse(ctx, 2, -71, 17, 4);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(-6, -52, 4, 10);
  ctx.fillRect(6, -52, 4, 10);
  ctx.fillStyle = '#2b1a12';
  drawCircle(ctx, 6, -64, 2);
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-2, -54);
  ctx.quadraticCurveTo(8, -48, 12, -56);
  ctx.stroke();
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.lineTo(-16 + stride, 0);
  ctx.moveTo(8, -6);
  ctx.lineTo(14 - stride, 0);
  ctx.stroke();
  ctx.fillStyle = '#5a3a22';
  drawEllipse(ctx, -16 + stride, -1, 8, 3);
  drawEllipse(ctx, 14 - stride, -1, 8, 3);
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(10, -44);
  ctx.lineTo(26, -30 + (opts.reach || 0));
  ctx.stroke();
  ctx.restore();
}

/* A cast-iron oven: the turkey's worst nightmare, squat and glowing. */
function drawOven(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#3a3a40';
  ctx.fillRect(-34, -58, 68, 58);
  ctx.fillStyle = '#55555e';
  ctx.fillRect(-30, -54, 60, 10);
  ctx.fillStyle = '#1d1d22';
  ctx.fillRect(-24, -40, 48, 28);
  var glow = ctx.createRadialGradient(0, -26, 4, 0, -26, 26);
  glow.addColorStop(0, '#ffd76a');
  glow.addColorStop(0.6, '#ff7b2f');
  glow.addColorStop(1, '#7a1e05');
  ctx.fillStyle = glow;
  ctx.fillRect(-20, -36, 40, 20);
  ctx.strokeStyle = '#2b2b30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, -26);
  ctx.lineTo(20, -26);
  ctx.stroke();
  ctx.fillStyle = '#c9c9cf';
  drawCircle(ctx, 24, -48, 4);
  ctx.fillStyle = '#ff5a2a';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', 0, 52);
  ctx.restore();
}

/* A carving knife, stuck blade-up in the ground, glinting. */
function drawCarvingKnife(ctx, x, y, scale, glintPhase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(-26, -8, 52, 8);
  ctx.fillStyle = '#d7dee8';
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.lineTo(30, -52);
  ctx.lineTo(38, -44);
  ctx.lineTo(18, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, -10);
  ctx.lineTo(28, -46);
  ctx.stroke();
  var glint = 0.55 + 0.45 * Math.sin(glintPhase || 0);
  ctx.fillStyle = 'rgba(255,255,255,' + glint.toFixed(2) + ')';
  ctx.beginPath();
  ctx.moveTo(6, -34);
  ctx.lineTo(14, -40);
  ctx.lineTo(18, -32);
  ctx.lineTo(10, -27);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2417';
  ctx.fillRect(28, -52, 8, 14);
  ctx.restore();
}

/* A golden corn cob, the turkey's favourite snack and score pickup. */
function drawCorn(ctx, x, y, scale, bobPhase) {
  var bob = Math.sin(bobPhase || 0) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f6b73c';
  drawEllipse(ctx, 0, 0, 11, 17);
  ctx.strokeStyle = '#d98e1d';
  ctx.lineWidth = 1.5;
  for (var r = -2; r <= 2; r++) {
    ctx.beginPath();
    ctx.moveTo(-9, r * 6);
    ctx.quadraticCurveTo(0, r * 6 + 3, 9, r * 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#7fae4c';
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-18, 22, -6, 24);
  ctx.lineTo(-2, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.quadraticCurveTo(18, 22, 6, 24);
  ctx.lineTo(2, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* A haystack: the turkey's hiding spot. The farmer walks straight past it. */
function drawHaystack(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(-42, 0);
  ctx.quadraticCurveTo(-40, -52, 0, -56);
  ctx.quadraticCurveTo(40, -52, 42, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b9822a';
  ctx.lineWidth = 2;
  for (var i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 11, -8);
    ctx.quadraticCurveTo(i * 11 + 4, -30, i * 8, -48);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a5a2e';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE', 0, -58);
  ctx.restore();
}

/* Parallax autumn skyline: fence, barn roof, trees and a rising sun. */
function drawFarmBackdrop(ctx, width, height, groundY, scroll, stage) {
  var pal = GobbleConfig.palette;
  var grad = ctx.createLinearGradient(0, 0, 0, groundY);
  if (stage === 0) {
    grad.addColorStop(0, pal.skyTop);
    grad.addColorStop(1, pal.skyBottom);
  } else if (stage === 1) {
    grad.addColorStop(0, pal.duskTop);
    grad.addColorStop(1, pal.duskBottom);
  } else {
    grad.addColorStop(0, pal.nightTop);
    grad.addColorStop(1, pal.nightBottom);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY + 2);

  ctx.fillStyle = stage === 2 ? '#fbe3b0' : '#fff3d6';
  var sunX = width - 130 - (scroll * 0.02 % 40);
  var sunY = stage === 2 ? 84 : 74;
  drawCircle(ctx, sunX, sunY, stage === 2 ? 26 : 34);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  drawEllipse(ctx, 180 - (scroll * 0.05 % 1200), 90, 70, 16);
  drawEllipse(ctx, 620 - (scroll * 0.05 % 1200), 130, 90, 18);

  ctx.fillStyle = stage === 2 ? '#5a2e3d' : '#7a4a26';
  for (var i = 0; i < 6; i++) {
    var tx = ((i * 190 - scroll * 0.12) % (width + 200) + width + 200) % (width + 200) - 100;
    ctx.beginPath();
    ctx.moveTo(tx, groundY);
    ctx.lineTo(tx + 34, groundY - 96);
    ctx.lineTo(tx + 68, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = stage === 2 ? '#6e3d4a' : '#8a5a2e';
    ctx.fillRect(tx + 28, groundY - 14, 12, 14);
    ctx.fillStyle = stage === 2 ? '#5a2e3d' : '#7a4a26';
  }

  if (stage >= 1) {
    ctx.fillStyle = '#6e2f1d';
    ctx.fillRect(width - 260 - (scroll * 0.2 % 1400), groundY - 150, 190, 150);
    ctx.fillStyle = '#4a1e12';
    ctx.beginPath();
    ctx.moveTo(width - 275 - (scroll * 0.2 % 1400), groundY - 150);
    ctx.lineTo(width - 165 - (scroll * 0.2 % 1400), groundY - 215);
    ctx.lineTo(width - 55 - (scroll * 0.2 % 1400), groundY - 150);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = stage === 0 ? pal.groundFarm : (stage === 1 ? pal.groundBarn : pal.groundKitchen);
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = pal.grass;
  ctx.fillRect(0, groundY, width, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (var fx = 0; fx < width; fx += 46) {
    var postX = fx - (scroll % 46);
    ctx.beginPath();
    ctx.moveTo(postX, groundY + 22);
    ctx.lineTo(postX, groundY + 52);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, groundY + 30);
  ctx.lineTo(width, groundY + 30);
  ctx.stroke();
}
