/* Sanfte Töne und Konfetti */
(function (LA) {
  'use strict';
  var ctx = null;
  var enabled = true;

  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    var t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  var sounds = {
    correct: function () { tone(659, 0, 0.18); tone(880, 0.1, 0.3); },
    // bewusst weich und nicht "strafend"
    retry: function () { tone(392, 0, 0.22, 'triangle', 0.12); },
    level: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.35); }); },
    goal: function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.14, 0.4, 'triangle', 0.2); }); },
    click: function () { tone(1200, 0, 0.05, 'sine', 0.05); }
  };

  function play(name) { if (enabled && sounds[name]) { try { sounds[name](); } catch (e) { /* ignorieren */ } } }

  function confetti(amount) {
    var canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    document.body.appendChild(canvas);
    var W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
    var g = canvas.getContext('2d');
    var colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43'];
    var parts = [];
    for (var i = 0; i < (amount || 140); i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.4, y: H * 0.35,
        vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
        r: Math.random() * 6 + 4, c: colors[i % colors.length],
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3
      });
    }
    var frames = 0;
    (function step() {
      g.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
        g.fillStyle = p.c; g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        g.restore();
      });
      if (++frames < 160) requestAnimationFrame(step); else canvas.remove();
    })();
  }

  LA.fx = {
    play: play, confetti: confetti,
    setSound: function (on) { enabled = on; }
  };
})(window.LA);
