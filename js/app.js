/* Lern-Abenteuer – Bildschirme und Spielablauf */
(function (LA) {
  'use strict';
  var h = LA.u.h, u = LA.u, S = LA.store, A = LA.adapt;
  var root;
  var app = LA.app = { profile: null, session: null };

  var BREAKS = ['Mach 10 Hampelmänner! 🤸', 'Streck dich ganz groß – und mach dich ganz klein! 🙆', 'Hüpfe 10-mal auf einem Bein! 🦩',
    'Trink einen Schluck Wasser! 💧', 'Schüttle Arme und Beine aus! 🕺', 'Schau 20 Sekunden aus dem Fenster in die Ferne! 🪟'];

  function screen(cls) {
    LA.speech.stop();
    root.innerHTML = '';
    var s = h('div', { class: 'screen ' + cls });
    root.appendChild(s);
    window.scrollTo(0, 0);
    return s;
  }

  function applyProfileStyle() {
    var st = app.profile ? app.profile.settings : {};
    document.body.classList.toggle('big-text', !!st.bigText);
    document.body.classList.toggle('wide-spacing', !!st.spacing);
    LA.fx.setSound(S.get().sound !== false);
  }

  function goal(p) { return p.settings.goal || 100; }
  function goalPoints(p) {
    return p.settings.goalMode === 'session' ? (app.session ? app.session.points : 0) : S.day(p).points;
  }

  function progressBar(p, big) {
    var g = goal(p), pts = goalPoints(p), pct = Math.min(100, Math.round(pts / g * 100));
    var reached = pts >= g;
    return h('div', { class: 'goalbar' + (big ? ' big' : '') + (reached ? ' reached' : '') },
      h('div', { class: 'goalbar-track' }, h('div', { class: 'goalbar-fill', style: { width: pct + '%' } }),
        h('span', { class: 'goalbar-flag' }, reached ? '🏆' : '🏁')),
      h('div', { class: 'goalbar-label' }, '⭐ ' + pts + ' / ' + g + ' Punkte' + (p.settings.goalMode === 'session' ? ' (diese Runde)' : ' heute')));
  }

  /* ---------- Ersteinrichtung ---------- */
  function setupScreen() {
    var s = screen('setup');
    s.appendChild(h('h1', null, '🌟 Willkommen beim Lern-Abenteuer!'));
    s.appendChild(h('p', { class: 'lead' }, 'Für Eltern: Legen Sie hier die Kinder an. Alles lässt sich später im Elternbereich (⚙️) ändern. ' +
      'Die Schwierigkeit passt sich danach automatisch an.'));
    var rows = [];
    function row(defName, defPreset, defAvatar) {
      var name = h('input', { type: 'text', placeholder: 'Name', value: defName });
      var av = defAvatar;
      var avBtns = h('div', { class: 'avatar-pick' }, LA.data.AVATARS.map(function (a) {
        var b = h('button', { class: 'av' + (a === av ? ' sel' : ''), type: 'button', onclick: function () {
          av = a; Array.prototype.forEach.call(avBtns.children, function (x) { x.classList.remove('sel'); }); b.classList.add('sel');
        } }, a);
        return b;
      }));
      var preset = h('select', null, Object.keys(S.PRESETS).map(function (k) {
        return h('option', { value: k, selected: k === defPreset }, S.PRESETS[k].label);
      }));
      var desc = h('div', { class: 'small' }, S.PRESETS[defPreset].desc);
      preset.addEventListener('change', function () { desc.textContent = S.PRESETS[preset.value].desc; });
      var box = h('div', { class: 'card setup-row' }, h('label', null, 'Name'), name, h('label', null, 'Figur'), avBtns,
        h('label', null, 'Startprofil'), preset, desc);
      rows.push({ name: name, preset: preset, av: function () { return av; } });
      return box;
    }
    s.appendChild(h('div', { class: 'setup-grid' }, row('', 'viel', '🦊'), row('', 'lrs', '🐼')));
    s.appendChild(h('p', { class: 'small' }, 'Tipp: Ein Feld leer lassen, wenn nur ein Kind die App nutzt.'));
    s.appendChild(h('button', { class: 'btn primary big', onclick: function () {
      var st = S.get();
      rows.forEach(function (r) {
        var n = r.name.value.trim();
        if (n) st.profiles.push(S.newProfile(n, r.av(), r.preset.value));
      });
      if (!st.profiles.length) { alert('Bitte mindestens einen Namen eingeben.'); return; }
      S.save(); startScreen();
    } }, 'Los geht’s ➜'));
  }

  /* ---------- Wer lernt heute? ---------- */
  function startScreen() {
    app.profile = null; app.session = null; applyProfileStyle();
    var st = S.get();
    if (!st.profiles.length) { setupScreen(); return; }
    var s = screen('start');
    s.appendChild(h('h1', { class: 'title' }, '🌟 Lern-Abenteuer'));
    s.appendChild(h('h2', null, 'Wer lernt heute?'));
    var grid = h('div', { class: 'profiles' });
    st.profiles.forEach(function (p) {
      var d = p.days[u.todayStr()] || { points: 0, goal: false };
      grid.appendChild(h('button', { class: 'profile-card', onclick: function () { selectProfile(p); } },
        h('div', { class: 'avatar' }, p.avatar),
        h('div', { class: 'pname' }, p.name),
        h('div', { class: 'small' }, d.goal ? '🏆 Ziel heute geschafft!' : '⭐ ' + d.points + ' Punkte heute')));
    });
    s.appendChild(grid);
    s.appendChild(h('button', { class: 'parent-link', onclick: parentGate }, '⚙️ Eltern'));
  }

  function selectProfile(p) {
    app.profile = p;
    app.session = { start: Date.now(), points: 0, tasks: 0, lastBreak: Date.now(), goalReached: false, streak: 0, recent: [] };
    applyProfileStyle();
    LA.speech.configure(S.get().speech);
    homeScreen(true);
  }

  /* ---------- Fächerauswahl ---------- */
  function homeScreen(greet) {
    var p = app.profile;
    var s = screen('home');
    s.appendChild(h('div', { class: 'topbar' },
      h('button', { class: 'icon-btn', title: 'Zurück', onclick: startScreen }, '⬅'),
      h('div', { class: 'who' }, h('span', { class: 'avatar sm' }, p.avatar), ' ', p.name),
      h('button', { class: 'icon-btn', title: 'Meine Sammlung', onclick: albumScreen }, '📒')));
    var hello = 'Hallo ' + p.name + '! Was möchtest du üben?';
    s.appendChild(h('h2', { class: 'hello' },
      h('button', { class: 'speak-btn', onclick: function () { LA.speech.speak(hello); } }, '🔊'), ' ', hello));
    s.appendChild(progressBar(p, true));
    var tiles = h('div', { class: 'subjects' });
    Object.keys(S.SUBJECTS).forEach(function (key) {
      var sub = S.SUBJECTS[key], st = p.subjects[key];
      var lvl = A.levelOf(st), fr = A.frac(st);
      var stars = h('div', { class: 'stars' });
      for (var i = 1; i <= sub.max; i++) stars.appendChild(h('span', { class: i < lvl ? 'on' : i === lvl ? 'cur' : '' }, i <= lvl ? '★' : '☆'));
      tiles.appendChild(h('button', { class: 'subject-tile s-' + key, onclick: function () { playScreen(key); },
        onmouseenter: function () { if (p.settings.autoRead) LA.speech.speak(sub.name); } },
        h('div', { class: 'sicon' }, sub.icon),
        h('div', { class: 'sname' }, sub.name),
        h('div', { class: 'slevel' }, 'Stufe ' + lvl),
        h('div', { class: 'lvlbar' }, h('div', { style: { width: Math.round(fr * 100) + '%' } })),
        stars));
    });
    s.appendChild(tiles);
    s.appendChild(h('div', { class: 'home-foot' },
      h('button', { class: 'btn', onclick: albumScreen }, '📒 Meine Sammlung (' + p.stickers.length + ')'),
      h('button', { class: 'btn', onclick: function () { finishScreen(); } }, '👋 Fertig für heute')));
    if (greet && p.settings.autoRead) setTimeout(function () { LA.speech.speak(hello); }, 300);
  }

  /* ---------- Üben ---------- */
  function playScreen(subject) {
    var p = app.profile;
    var s = screen('play s-' + subject);
    var header = h('div', { class: 'topbar' });
    var area = h('div', { class: 'task-area' });
    s.appendChild(header); s.appendChild(area);

    function drawHeader() {
      var st = p.subjects[subject];
      header.innerHTML = '';
      header.appendChild(h('button', { class: 'icon-btn', title: 'Zur Auswahl', onclick: function () { homeScreen(); } }, '🏠'));
      header.appendChild(h('div', { class: 'subj-label' }, S.SUBJECTS[subject].icon + ' ' + S.SUBJECTS[subject].name + ' · Stufe ' + A.levelOf(st)));
      header.appendChild(h('div', { class: 'streak' + (app.session.streak >= 3 ? ' hot' : '') }, app.session.streak >= 3 ? '🔥 ' + app.session.streak : ''));
      header.appendChild(progressBar(p));
    }

    function makeTask() {
      var st = p.subjects[subject];
      var level = A.levelOf(st), frac = A.frac(st);
      var gen = LA.tasks[subject];
      var task = null, review = A.dueReview(p, subject);
      if (review && Math.random() < 0.4) {
        try { task = gen.fromReview(review.spec, level, p); if (task) task.isReview = true; } catch (e) { task = null; }
        if (!task) st.review.splice(st.review.indexOf(review), 1);
      }
      for (var i = 0; i < 8 && !task; i++) {
        try {
          var t = gen.generate(level, frac, p);
          var sig = t.solution;
          if (app.session.recent.indexOf(sig) >= 0 && i < 7) continue;
          task = t;
        } catch (e) { console.error(e); }
      }
      app.session.recent.push(task.solution);
      if (app.session.recent.length > 8) app.session.recent.shift();
      task.subject = subject;
      return task;
    }

    function next() {
      drawHeader();
      var task = makeTask();
      LA.render.task(area, task, p, function (quality, t) { done(quality, t); });
    }

    function done(quality, task) {
      var d = S.day(p);
      var pts = A.POINTS[quality];
      if (quality === 'perfect') app.session.streak++; else app.session.streak = 0;
      var bonus = quality === 'perfect' && app.session.streak > 0 && app.session.streak % 5 === 0 ? 5 : 0;
      var before = goalPoints(p);
      d.points += pts + bonus; app.session.points += pts + bonus;
      d.tasks++; app.session.tasks++;
      if (quality === 'perfect') d.first++;
      d.subj[subject] = d.subj[subject] || { n: 0, ok: 0 };
      d.subj[subject].n++; if (quality === 'perfect') d.subj[subject].ok++;
      var now = Date.now();
      d.minutes = (d.minutes || 0) + Math.min(3, (now - (app.session.lastAct || app.session.start)) / 60000);
      app.session.lastAct = now;
      if (task.wordKey) {
        var ws = p.wordStats[task.wordKey] = p.wordStats[task.wordKey] || { ok: 0, err: 0 };
        if (quality === 'perfect') ws.ok++; else ws.err++;
      }
      var res = A.record(p, subject, quality, task.review, task.isReview);
      S.save();

      floatPoints(pts + bonus, bonus);
      var after = goalPoints(p);
      var reachedNow = before < goal(p) && after >= goal(p);
      var chain = [];
      if (res.levelUp) chain.push(function (cb) { levelUpOverlay(subject, cb); });
      if (reachedNow) chain.push(function (cb) { goalOverlay(cb); });
      if ((Date.now() - app.session.lastBreak) / 60000 >= (p.settings.pauseMin || 15)) chain.push(function (cb) { breakOverlay(cb); });
      (function run() {
        if (!chain.length) { next(); return; }
        chain.shift()(run);
      })();
    }

    next();
  }

  function floatPoints(n, bonus) {
    var el = h('div', { class: 'float-points' }, '+' + n + (bonus ? ' 🔥' : ''));
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1400);
  }

  function overlay(content, buttons) {
    var ov = h('div', { class: 'overlay' }, h('div', { class: 'overlay-card' }, content, h('div', { class: 'overlay-btns' }, buttons)));
    document.body.appendChild(ov);
    return ov;
  }

  function levelUpOverlay(subject, cb) {
    var p = app.profile, lvl = A.levelOf(p.subjects[subject]);
    var name = LA.tasks[subject].levels[lvl - 1];
    LA.fx.play('level'); LA.fx.confetti(80);
    var msg = 'Neue Stufe! Du bist jetzt auf Stufe ' + lvl + ' im ' + S.SUBJECTS[subject].name + '.';
    LA.speech.speak(msg + ' Weiter so!');
    var ov = overlay([h('div', { class: 'big-emoji' }, '🚀'), h('h2', null, 'Neue Stufe: ' + lvl + '!'), h('p', null, name)],
      [h('button', { class: 'btn primary big', onclick: function () { ov.remove(); cb(); } }, 'Weiter ➜')]);
  }

  function awardSticker(p) {
    var d = S.day(p);
    if (d.stickers >= 3) return null;
    var free = LA.data.STICKERS.filter(function (x) { return p.stickers.indexOf(x) < 0; });
    var st = free.length ? u.pick(free) : '🌟';
    p.stickers.push(st); d.stickers++;
    return st;
  }

  function goalOverlay(cb) {
    var p = app.profile, d = S.day(p);
    if (p.settings.goalMode === 'session') app.session.goalReached = true;
    d.goal = true;
    var sticker = awardSticker(p);
    S.save();
    LA.fx.play('goal'); LA.fx.confetti(200); setTimeout(function () { LA.fx.confetti(120); }, 700);
    var msg = 'Hurra, ' + p.name + '! Du hast dein Ziel geschafft!' + (sticker ? ' Du bekommst ein neues Sammelbild.' : '');
    LA.speech.speak(msg);
    var ov = overlay([h('div', { class: 'big-emoji bounce' }, '🏆'), h('h2', null, 'Ziel geschafft!'),
      h('p', null, 'Du hast ' + goalPoints(p) + ' Punkte gesammelt. Darauf kannst du stolz sein!'),
      sticker ? h('div', { class: 'sticker-new' }, h('div', { class: 'small' }, 'Neues Sammelbild:'), h('div', { class: 'sticker big' }, sticker)) : null],
      [h('button', { class: 'btn big', onclick: function () { ov.remove(); finishScreen(); } }, '👋 Fertig für heute'),
        h('button', { class: 'btn primary big', onclick: function () { ov.remove(); cb(); } }, '💪 Weiter üben')]);
  }

  function breakOverlay(cb) {
    app.session.lastBreak = Date.now();
    var b = u.pick(BREAKS);
    LA.speech.speak('Zeit für eine kleine Pause! ' + b.replace(/[^\wäöüÄÖÜß!.,\s]/g, ''));
    var ov = overlay([h('div', { class: 'big-emoji' }, '🧃'), h('h2', null, 'Pause!'), h('p', { class: 'lead' }, b),
      h('p', { class: 'small' }, 'Dein Gehirn lernt besser mit kleinen Pausen.')],
      [h('button', { class: 'btn primary big', onclick: function () { ov.remove(); cb(); } }, 'Weiter ➜'),
        h('button', { class: 'btn big', onclick: function () { ov.remove(); finishScreen(); } }, 'Aufhören')]);
  }

  function finishScreen() {
    var p = app.profile, d = S.day(p), sess = app.session;
    S.save();
    var s = screen('finish');
    var msg = 'Toll gemacht, ' + p.name + '! Heute hast du ' + d.tasks + ' Aufgaben gelöst.';
    s.appendChild(h('div', { class: 'big-emoji' }, d.goal ? '🏆' : '🌟'));
    s.appendChild(h('h2', null, msg));
    s.appendChild(h('div', { class: 'card summary' },
      h('div', null, '⭐ Punkte heute: ', h('strong', null, d.points)),
      h('div', null, '✅ Gleich beim ersten Mal richtig: ', h('strong', null, d.first + ' von ' + d.tasks)),
      h('div', null, '📒 Sammelbilder: ', h('strong', null, p.stickers.length))));
    s.appendChild(h('button', { class: 'btn primary big', onclick: startScreen }, 'Tschüss! 👋'));
    LA.speech.speak(msg + ' Bis zum nächsten Mal!');
  }

  function albumScreen() {
    var p = app.profile;
    var s = screen('album');
    s.appendChild(h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: function () { homeScreen(); } }, '⬅'),
      h('div', { class: 'who' }, '📒 Sammlung von ' + p.name), h('span')));
    s.appendChild(h('p', { class: 'lead' }, 'Jedes Mal, wenn du dein Ziel schaffst, bekommst du ein neues Sammelbild. Du hast ' + p.stickers.length + ' von ' + LA.data.STICKERS.length + '.'));
    s.appendChild(h('div', { class: 'album' }, LA.data.STICKERS.map(function (st) {
      var have = p.stickers.indexOf(st) >= 0;
      return h('div', { class: 'sticker' + (have ? '' : ' locked') }, have ? st : '❔');
    })));
  }

  /* ---------- Elternbereich ---------- */
  function parentGate() {
    var st = S.get();
    var a = u.rand(12, 19), b = u.rand(6, 9);
    var q = st.parent.pin ? 'Bitte PIN eingeben:' : 'Für Eltern: Wie viel ist ' + a + ' · ' + b + '?';
    var inp = h('input', { type: 'password', inputmode: 'numeric', class: 'text-input' });
    var ov = overlay([h('h2', null, '⚙️ Elternbereich'), h('p', null, q), inp],
      [h('button', { class: 'btn', onclick: function () { ov.remove(); } }, 'Abbrechen'),
        h('button', { class: 'btn primary', onclick: check }, 'Öffnen')]);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    setTimeout(function () { inp.focus(); }, 50);
    function check() {
      var ok = st.parent.pin ? inp.value === st.parent.pin : parseInt(inp.value, 10) === a * b;
      if (ok) { ov.remove(); LA.parent.open(root, startScreen); }
      else { inp.value = ''; inp.classList.add('shake'); setTimeout(function () { inp.classList.remove('shake'); }, 400); }
    }
  }

  app.start = function () {
    root = document.getElementById('app');
    S.load();
    LA.speech.configure(S.get().speech);
    // Audio darf erst nach einer Nutzeraktion starten
    document.addEventListener('pointerdown', function once() { LA.fx.play('click'); document.removeEventListener('pointerdown', once); });
    startScreen();
  };
  app.startScreen = function () { startScreen(); };
  app.screen = screen;

  document.addEventListener('DOMContentLoaded', app.start);
})(window.LA);
