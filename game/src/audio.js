/* Gobble Dash — procedural sound bank. One job: every sound is synthesized
   live with WebAudio, so the game ships no audio files at all. */
'use strict';

function GobbleSoundBank() {
  this.context = null;
  this.muted = false;
  this.master = null;
}

GobbleSoundBank.prototype.ensureContext = function () {
  if (this.context) {
    if (this.context.state === 'suspended') this.context.resume();
    return true;
  }
  var Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return false;
  this.context = new Ctor();
  this.master = this.context.createGain();
  this.master.gain.value = 0.35;
  this.master.connect(this.context.destination);
  return true;
};

GobbleSoundBank.prototype.setMuted = function (muted) {
  this.muted = muted;
  if (this.master) this.master.gain.value = muted ? 0 : 0.35;
};

GobbleSoundBank.prototype.blip = function (freqStart, freqEnd, seconds, type, volume) {
  if (this.muted || !this.ensureContext()) return;
  var now = this.context.currentTime;
  var osc = this.context.createOscillator();
  var gain = this.context.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + seconds);
  gain.gain.setValueAtTime(volume || 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  osc.connect(gain);
  gain.connect(this.master);
  osc.start(now);
  osc.stop(now + seconds + 0.02);
};

GobbleSoundBank.prototype.noiseBurst = function (seconds, volume) {
  if (this.muted || !this.ensureContext()) return;
  var now = this.context.currentTime;
  var length = Math.floor(this.context.sampleRate * seconds);
  var buffer = this.context.createBuffer(1, length, this.context.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  var source = this.context.createBufferSource();
  var gain = this.context.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume || 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  source.connect(gain);
  gain.connect(this.master);
  source.start(now);
};

GobbleSoundBank.prototype.gobble = function () {
  var self = this;
  [0, 0.09, 0.18, 0.27].forEach(function (delay, i) {
    setTimeout(function () {
      self.blip(520 - i * 60, 240 - i * 30, 0.09, 'square', 0.22);
    }, delay * 1000);
  });
};

GobbleSoundBank.prototype.flap = function () { this.noiseBurst(0.12, 0.25); };
GobbleSoundBank.prototype.cornPickup = function () { this.blip(880, 1320, 0.12, 'sine', 0.4); };
GobbleSoundBank.prototype.hurtThud = function () {
  this.blip(160, 55, 0.25, 'sawtooth', 0.5);
  this.noiseBurst(0.15, 0.3);
};
GobbleSoundBank.prototype.alarmSpotted = function () {
  this.blip(660, 660, 0.1, 'square', 0.3);
  var self = this;
  setTimeout(function () { self.blip(880, 880, 0.14, 'square', 0.3); }, 110);
};
GobbleSoundBank.prototype.escapeFanfare = function () {
  var self = this;
  [523, 659, 784, 1047].forEach(function (freq, i) {
    setTimeout(function () { self.blip(freq, freq, 0.28, 'triangle', 0.4); }, i * 140);
  });
};
GobbleSoundBank.prototype.caughtTrombone = function () {
  var self = this;
  [392, 370, 349, 330].forEach(function (freq, i) {
    setTimeout(function () { self.blip(freq, freq * 0.94, 0.32, 'sawtooth', 0.25); }, i * 260);
  });
};
