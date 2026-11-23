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

  /* ---------- Ziele pro Fach ---------- */
  var SUBJ_KEYS = Object.keys(S.SUBJECTS);
  function goalOf(p, k) { return (p.settings.goals && p.settings.goals[k]) || 0; }
  function subjPoints(p, k) {
    if (p.settings.goalMode === 'session') return app.session && app.session.subjPts ? (app.session.subjPts[k] || 0) : 0;
    var d = p.days[u.todayStr()];
    return d && d.subj[k] ? (d.subj[k].pts || 0) : 0;
  }
  function subjReached(p, k) { var g = goalOf(p, k); return g > 0 && subjPoints(p, k) >= g; }
  function goalSubjects(p) { return SUBJ_KEYS.filter(function (k) { return goalOf(p, k) > 0; }); }
  function allReached(p) { var gs = goalSubjects(p); return gs.length > 0 && gs.every(function (k) { return subjReached(p, k); }); }
  function openSubjects(p) { return goalSubjects(p).filter(function (k) { return !subjReached(p, k); }); }

  function progressBar(p, k, big) {
    var g = goalOf(p, k), pts = subjPoints(p, k);
    var suffix = p.settings.goalMode === 'session' ? ' (diese Runde)' : ' heute';
    if (!g) {
      return h('div', { class: 'goalbar nogoal' + (big ? ' big' : '') },
        h('div', { class: 'goalbar-label' }, '⭐ ' + pts + ' Punkte' + suffix + ' · freies Üben'));
    }
    var pct = Math.min(100, Math.round(pts / g * 100)), reached = pts >= g;
    return h('div', { class: 'goalbar' + (big ? ' big' : '') + (reached ? ' reached' : '') },
      h('div', { class: 'goalbar-track' }, h('div', { class: 'goalbar-fill', style: { width: pct + '%' } }),
        h('span', { class: 'goalbar-flag' }, reached ? '✅' : '🏁')),
      h('div', { class: 'goalbar-label' }, '⭐ ' + pts + ' / ' + g + ' Punkte' + suffix));
  }

  // Übersicht: welche Fachziele sind geschafft?
  function goalSummary(p) {
    var gs = goalSubjects(p);
    if (!gs.length) return null;
    var done = gs.filter(function (k) { return subjReached(p, k); }).length;
    var all = done === gs.length;
    return h('div', { class: 'goal-summary' + (all ? ' all' : '') },
      h('span', { class: 'gs-title' }, all ? '🏆 Tagesziel geschafft!' : '🎯 Tagesziel:'),
      gs.map(function (k) {
        return h('span', { class: 'gs-item' + (subjReached(p, k) ? ' ok' : '') },
          S.SUBJECTS[k].icon + ' ' + (subjReached(p, k) ? '✅' : subjPoints(p, k) + '/' + goalOf(p, k)));
      }),
      all ? null : h('span', { class: 'gs-count' }, done + ' von ' + gs.length + ' Fächern'));
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
      var d = p.days[u.todayStr()] || { points: 0, goal: false, subj: {} };
      var marks = goalSubjects(p).map(function (k) { return S.SUBJECTS[k].icon + (d.subj[k] && d.subj[k].goal ? '✅' : ''); }).join('  ');
      grid.appendChild(h('button', { class: 'profile-card', onclick: function () { selectProfile(p); } },
        h('div', { class: 'avatar' }, p.avatar),
        h('div', { class: 'pname' }, p.name),
        h('div', { class: 'small' }, d.goal ? '🏆 Tagesziel geschafft!' : '⭐ ' + d.points + ' Punkte heute'),
        marks ? h('div', { class: 'small' }, marks) : null));
    });
    s.appendChild(grid);
    s.appendChild(h('button', { class: 'parent-link', onclick: parentGate }, '⚙️ Eltern'));
  }

  function selectProfile(p) {
    app.profile = p;
    app.session = { start: Date.now(), points: 0, subjPts: {}, tasks: 0, lastBreak: Date.now(), streak: 0, recent: [] };
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
    s.appendChild(goalSummary(p));
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
        stars,
        h('div', { class: 'tile-goal' }, progressBar(p, key))));
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
      header.appendChild(progressBar(p, subject));
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
      var wasReached = subjReached(p, subject), wasAll = allReached(p);
      d.points += pts + bonus; app.session.points += pts + bonus;
      app.session.subjPts[subject] = (app.session.subjPts[subject] || 0) + pts + bonus;
      d.tasks++; app.session.tasks++;
      if (quality === 'perfect') d.first++;
      d.subj[subject] = d.subj[subject] || { n: 0, ok: 0, pts: 0 };
      d.subj[subject].n++; if (quality === 'perfect') d.subj[subject].ok++;
      d.subj[subject].pts = (d.subj[subject].pts || 0) + pts + bonus;
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
      var subjNow = !wasReached && subjReached(p, subject);
      var allNow = !wasAll && allReached(p);
      var chain = [];
      if (res.levelUp) chain.push(function (cb) { levelUpOverlay(subject, cb); });
      if (subjNow) chain.push(function (cb) { subjectGoalOverlay(subject, allNow, cb); });
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

  // Fachziel geschafft: Sammelbild, Vorschlag für das nächste offene Fach.
  // Sind damit alle Fachziele erreicht, gibt es die große Tagesziel-Feier.
  function subjectGoalOverlay(subject, all, cb) {
    var p = app.profile, d = S.day(p), sub = S.SUBJECTS[subject];
    d.subj[subject].goal = true;
    if (all) d.goal = true;
    var sticker = awardSticker(p);
    S.save();
    var open = openSubjects(p);
    var msg, content;
    if (all) {
      LA.fx.play('goal'); LA.fx.confetti(220); setTimeout(function () { LA.fx.confetti(140); }, 700);
      msg = 'Hurra, ' + p.name + '! Du hast alle deine Tagesziele geschafft!';
      content = [h('div', { class: 'big-emoji bounce' }, '🏆'), h('h2', null, 'Tagesziel komplett!'),
        h('p', null, 'Alle Fächer geschafft: ' + goalSubjects(p).map(function (k) { return S.SUBJECTS[k].icon; }).join(' ') + ' – darauf kannst du richtig stolz sein!')];
    } else {
      LA.fx.play('level'); LA.fx.confetti(110);
      msg = 'Super, ' + p.name + '! Dein Ziel im ' + sub.name + ' ist geschafft!' +
        (open.length ? ' Jetzt fehlt noch ' + open.map(function (k) { return S.SUBJECTS[k].name; }).join(' und ') + '.' : '');
      content = [h('div', { class: 'big-emoji bounce' }, sub.icon), h('h2', null, sub.name + '-Ziel geschafft!'),
        h('p', null, 'Du hast ' + subjPoints(p, subject) + ' Punkte im ' + sub.name + ' gesammelt.'),
        open.length ? h('p', { class: 'small' }, 'Noch offen: ' + open.map(function (k) { return S.SUBJECTS[k].icon + ' ' + S.SUBJECTS[k].name; }).join(', ')) : null];
    }
    if (sticker) {
      msg += ' Du bekommst ein neues Sammelbild.';
      content.push(h('div', { class: 'sticker-new' }, h('div', { class: 'small' }, 'Neues Sammelbild:'), h('div', { class: 'sticker big' }, sticker)));
    }
    LA.speech.speak(msg);
    var btns = [];
    if (all) {
      btns.push(h('button', { class: 'btn big', onclick: function () { ov.remove(); finishScreen(); } }, '👋 Fertig für heute'));
      btns.push(h('button', { class: 'btn primary big', onclick: function () { ov.remove(); cb(); } }, '💪 Weiter üben'));
    } else {
      btns.push(h('button', { class: 'btn big', onclick: function () { ov.remove(); cb(); } }, 'Hier weiter üben'));
      if (open.length) {
        var nx = open[0];
        btns.push(h('button', { class: 'btn primary big', onclick: function () { ov.remove(); playScreen(nx); } },
          'Weiter mit ' + S.SUBJECTS[nx].icon + ' ' + S.SUBJECTS[nx].name + ' ➜'));
      }
    }
    var ov = overlay(content, btns);
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
      SUBJ_KEYS.filter(function (k) { return d.subj[k] || goalOf(p, k); }).map(function (k) {
        var pts = d.subj[k] ? d.subj[k].pts || 0 : 0, g = goalOf(p, k);
        return h('div', { class: 'sum-sub' }, S.SUBJECTS[k].icon + ' ' + S.SUBJECTS[k].name + ': ', h('strong', null, pts + (g ? ' / ' + g : '')),
          g && pts >= g ? ' ✅' : '');
      }),
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
    s.appendChild(h('p', { class: 'lead' }, 'Für jedes Fach-Ziel, das du schaffst, bekommst du ein neues Sammelbild. Du hast ' + p.stickers.length + ' von ' + LA.data.STICKERS.length + '.'));
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
