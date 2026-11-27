/* Gobble Dash — tuning constants. One job: every number the game balances on. */
'use strict';

var GobbleConfig = {
  canvasWidth: 960,
  canvasHeight: 540,
  groundY: 452,
  gravity: 2100,
  turkeyRunSpeed: 300,
  turkeyJumpSpeed: 780,
  turkeyDuckHeight: 34,
  turkeyStandHeight: 56,
  turkeyWidth: 58,
  farmerBaseSpeed: 238,
  farmerSearchSpeed: 150,
  farmerCatchDistance: 46,
  farmerStartGap: 210,
  escapeDistanceMeters: 1000,
  metersPerPixel: 0.055,
  maxLives: 3,
  invulnerableSeconds: 1.6,
  hideSeconds: 3.0,
  cornScore: 25,
  meterScore: 2,
  stageBoundaries: [0, 330, 660],
  stageNames: ['THE FARMYARD', 'THE BARN', 'THE KITCHEN'],
  stageSpeedBonus: [0, 26, 52],
  obstacleGapMin: 260,
  obstacleGapMax: 520,
  cornArcEveryMeters: 90,
  palette: {
    skyTop: '#f7b733',
    skyBottom: '#fbe3b0',
    duskTop: '#7d4a2d',
    duskBottom: '#e8955a',
    nightTop: '#3d2b4f',
    nightBottom: '#8a5570',
    groundFarm: '#a9713d',
    groundBarn: '#8a5a30',
    groundKitchen: '#6e4a3a',
    grass: '#7fae4c',
    wood: '#8a5a2e',
    cream: '#fff3d6',
    ink: '#3a2417'
  }
};

function stageIndexForDistance(meters) {
  if (meters >= GobbleConfig.stageBoundaries[2]) return 2;
  if (meters >= GobbleConfig.stageBoundaries[1]) return 1;
  return 0;
}

function stageNameForDistance(meters) {
  return GobbleConfig.stageNames[stageIndexForDistance(meters)];
}
