/* Gobble Dash — the game loop. One job: own the state machine (title, play,
   paused, caught, escaped), wire input, collisions and scoring together. */
'use strict';

(function () {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var W = GobbleConfig.canvasWidth;
  var H = GobbleConfig.canvasHeight;

  var sounds = new GobbleSoundBank();
  var world = new GobbleWorld();
  var turkey = new TurkeyPlayer();
  var farmer = new FarmerChaser();
  var hud = new GobbleHud();

  var game = {
    state: 'title',
    score: 0,
    cornCollected: 0,
    lives: GobbleConfig.maxLives,
    distance: 0,
    time: 0,
    endResult: null,
    muted: false,
    shotMode: null,
    shotFrozen: false
  };

  var input = { left: false, right: false, down: false, jumpPressed: false, sounds: sounds };

  var params = new URLSearchParams(window.location.search || '');
  game.shotMode = params.get('shot');
  var selfTest = params.get('selftest') === '1';

  function startRun() {
    world.reset();
    turkey.reset();
    farmer.reset();
    game.score = 0;
    game.cornCollected = 0;
    game.lives = GobbleConfig.maxLives;
    game.distance = 0;
    game.endResult = null;
    game.state = 'playing';
    game.shotFrozen = false;
    sounds.ensureContext();
    sounds.gobble();
  }

  function endRun(outcome) {
    game.state = outcome === 'escaped' ? 'escaped' : 'caught';
    game.endResult = {
      outcome: outcome,
      score: game.score,
      distance: game.distance,
      corn: game.cornCollected
    };
    if (outcome === 'escaped') sounds.escapeFanfare();
    else sounds.caughtTrombone();
  }

  function loseLife(cause) {
    if (turkey.invulnerableTimer > 0 || game.state !== 'playing') return;
    game.lives -= 1;
    turkey.invulnerableTimer = GobbleConfig.invulnerableSeconds;
    sounds.hurtThud();
    if (game.lives <= 0) {
      endRun('caught');
      return;
    }
    turkey.x = Math.min(turkey.x + 90, 880);
    farmer.x = turkey.x - GobbleConfig.farmerStartGap - 60;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function haystackUnderTurkey() {
    for (var i = 0; i < world.haystacks.length; i++) {
      var h = world.haystacks[i];
      if (Math.abs(h.x - turkey.x) < 52 && turkey.onGround) return h;
    }
    return null;
  }

  function updatePlaying(dt) {
    var runSpeed = GobbleConfig.turkeyRunSpeed + world.stageSpeedBonus();
    world.update(dt, runSpeed * 0.55);
    game.distance = world.distanceMeters;
    game.score += Math.floor(runSpeed * dt * GobbleConfig.metersPerPixel * GobbleConfig.meterScore);

    turkey.update(dt, input);
    input.jumpPressed = false;
    farmer.update(dt, turkey, world, sounds);

    var tb = turkey.bounds();
    var i, o, ob, c, cb;
    for (i = 0; i < world.obstacles.length; i++) {
      o = world.obstacles[i];
      if (o.hit) continue;
      ob = { x: o.x - o.w / 2, y: GobbleConfig.groundY - o.h, w: o.w, h: o.h };
      if (overlaps(tb, ob)) {
        o.hit = true;
        loseLife(o.kind);
        if (game.state !== 'playing') return;
      }
    }
    for (i = 0; i < world.corns.length; i++) {
      c = world.corns[i];
      if (c.taken) continue;
      cb = { x: c.x - 12, y: c.y - 18, w: 24, h: 36 };
      if (overlaps(tb, cb)) {
        c.taken = true;
        game.cornCollected += 1;
        game.score += GobbleConfig.cornScore;
        sounds.cornPickup();
      }
    }
    if (farmer.catches(turkey)) {
      loseLife('farmer');
      if (game.state !== 'playing') return;
    }
    if (game.distance >= GobbleConfig.escapeDistanceMeters) endRun('escaped');
  }

  function drawPlaying() {
    world.draw(ctx, game.time);
    turkey.draw(ctx, game.time);
    farmer.draw(ctx, game.time);
    hud.drawHud(ctx, {
      score: game.score,
      distance: game.distance,
      lives: game.lives,
      stageName: stageNameForDistance(game.distance)
    });
  }

  function drawTitleBackdrop() {
    world.reset();
    world.distanceMeters = 0;
    world.draw(ctx, game.time);
    drawTurkey(ctx, 300, GobbleConfig.groundY, 1.15, { bob: Math.sin(game.time * 2) * 2, legSwing: 0 });
    drawFarmer(ctx, 660, GobbleConfig.groundY, 1.15, { stride: Math.sin(game.time * 4) * 6 });
    drawCorn(ctx, 480, GobbleConfig.groundY - 90, 1, game.time * 3);
    drawOven(ctx, 830, GobbleConfig.groundY, 0.9);
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - (frame.last || now)) / 1000 || 0.016);
    frame.last = now;
    game.time += dt;
    ctx.clearRect(0, 0, W, H);

    if (game.state === 'title') {
      drawTitleBackdrop();
      hud.drawTitle(ctx, game.time);
    } else if (game.state === 'playing') {
      if (!game.shotFrozen) updatePlaying(dt);
      drawPlaying();
    } else if (game.state === 'paused') {
      drawPlaying();
      hud.drawPaused(ctx);
    } else {
      drawPlaying();
      hud.drawEnd(ctx, game.endResult);
    }
    requestAnimationFrame(frame);
  }

  function canvasPoint(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (W / rect.width),
      y: (event.clientY - rect.top) * (H / rect.height)
    };
  }

  canvas.addEventListener('click', function (event) {
    sounds.ensureContext();
    var p = canvasPoint(event);
    var hit = hud.buttonAt(p.x, p.y);
    if (hit === 'start' && game.state === 'title') startRun();
    else if (hit === 'restart' && (game.state === 'caught' || game.state === 'escaped')) startRun();
  });

  window.addEventListener('keydown', function (event) {
    var key = event.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') input.left = true;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') input.right = true;
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      input.down = true;
      if (game.state === 'playing' && !turkey.hiding) {
        var hay = haystackUnderTurkey();
        if (hay) turkey.startHiding(hay);
      }
    }
    if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
      event.preventDefault();
      if (game.state === 'playing') input.jumpPressed = true;
    }
    if (key === 'Enter') {
      if (game.state === 'title') startRun();
      else if (game.state === 'caught' || game.state === 'escaped') startRun();
    }
    if (key === 'p' || key === 'P') {
      if (game.state === 'playing') game.state = 'paused';
      else if (game.state === 'paused') game.state = 'playing';
    }
    if (key === 'm' || key === 'M') {
      game.muted = !game.muted;
      sounds.setMuted(game.muted);
    }
  });

  window.addEventListener('keyup', function (event) {
    var key = event.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') input.left = false;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') input.right = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') input.down = false;
  });

  /* Fixed states for real screenshots of this game's own code (?shot=...). */
  function applyShotMode() {
    if (game.shotMode === 'play') {
      startRun();
      game.shotFrozen = true;
      world.stagePlayShotScene();
      game.score = 1240;
      game.cornCollected = 6;
      game.distance = 312;
      turkey.x = 330;
      turkey.y = GobbleConfig.groundY - 110;
      turkey.onGround = false;
      turkey.vy = -60;
      farmer.x = 150;
      farmer.state = 'chasing';
      farmer.graceTimer = 0;
      farmer.spottedFlash = 0;
    } else if (game.shotMode === 'caught') {
      startRun();
      game.score = 2310;
      game.cornCollected = 11;
      game.distance = 641;
      game.lives = 0;
      turkey.x = 420;
      farmer.x = 392;
      farmer.graceTimer = 0;
      endRun('caught');
    } else if (game.shotMode === 'escaped') {
      startRun();
      game.score = 5875;
      game.cornCollected = 23;
      game.distance = 1000;
      world.distanceMeters = 1000;
      turkey.x = 700;
      farmer.x = 120;
      farmer.graceTimer = 0;
      endRun('escaped');
    }
  }

  window.__gobbleDash = {
    game: game,
    world: world,
    turkey: turkey,
    farmer: farmer,
    startRun: startRun,
    endRun: endRun,
    loseLife: loseLife
  };

  applyShotMode();
  if (selfTest) runSelfTest();
  requestAnimationFrame(frame);

  /* Headless self-test: drives the real loop with synthetic keys and reports
     into the document title, so a plain browser run can verify playability. */
  function runSelfTest() {
    var results = [];
    function check(name, ok) { results.push(name + ':' + (ok ? 'PASS' : 'FAIL')); }
    try {
      startRun();
      check('starts-playing', game.state === 'playing');
      var d0 = game.distance;
      updatePlaying(0.5);
      check('distance-grows', game.distance > d0);
      check('farmer-advances', farmer.x > 0);
      var y0 = turkey.y;
      turkey.jump(sounds);
      check('jump-leaves-ground', !turkey.onGround && turkey.vy < 0);
      var roseAboveGround = false;
      var landedBack = false;
      for (var step = 0; step < 30; step++) {
        turkey.update(0.05, { left: false, right: false, down: false, jumpPressed: false, sounds: sounds });
        if (turkey.y < y0 - 10) roseAboveGround = true;
        if (turkey.onGround && turkey.y === GobbleConfig.groundY) landedBack = true;
      }
      check('gravity-returns', roseAboveGround && landedBack);
      world.corns.push({ x: turkey.x, y: turkey.y - 20, taken: false, phase: 0 });
      var corn0 = game.cornCollected;
      updatePlaying(0.016);
      check('corn-collects', game.cornCollected > corn0);
      var lives0 = game.lives;
      turkey.invulnerableTimer = 0;
      farmer.x = turkey.x - 10;
      turkey.y = GobbleConfig.groundY;
      turkey.onGround = true;
      check('farmer-catches', farmer.catches(turkey) === true);
      loseLife('farmer');
      check('life-lost', game.lives === lives0 - 1);
      game.lives = 1;
      turkey.invulnerableTimer = 0;
      loseLife('farmer');
      check('caught-ends-run', game.state === 'caught' && game.endResult !== null);
      startRun();
      game.distance = 1000;
      world.distanceMeters = 1000;
      updatePlaying(0.016);
      check('escape-ends-run', game.state === 'escaped');
      world.reset();
      world.spawnHaystack(300);
      turkey.x = 300;
      check('hide-works', turkey.startHiding(world.haystacks[0]) === true);
      check('farmer-searches-when-hidden', (function () {
        farmer.state = 'chasing';
        farmer.graceTimer = 0;
        farmer.update(0.1, turkey, world, sounds);
        return farmer.state === 'searching';
      })());
    } catch (err) {
      results.push('exception:' + err.message);
    }
    document.title = 'SELFTEST ' + results.join(' | ');
  }
})();
