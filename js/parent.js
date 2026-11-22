/* Elternbereich: Fortschritt, Einstellungen, Lernwörter, Datensicherung */
(function (LA) {
  'use strict';
  var h = LA.u.h, u = LA.u, S = LA.store, A = LA.adapt;
  var root, onClose, tab = 'overview';

  function open(r, close) { root = r; onClose = close; draw(); }

  function draw() {
    LA.speech.stop();
    document.body.classList.remove('big-text', 'wide-spacing');
    root.innerHTML = '';
    var s = h('div', { class: 'screen parent' });
    root.appendChild(s);
    s.appendChild(h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: onClose }, '⬅'),
      h('div', { class: 'who' }, '⚙️ Elternbereich'), h('span')));
    var tabs = [['overview', '📊 Fortschritt'], ['kids', '👧 Kinder & Einstellungen'], ['words', '📝 Lernwörter'], ['speech', '🔊 Sprache & Ton'], ['data', '💾 Daten'], ['about', 'ℹ️ Konzept']];
    s.appendChild(h('div', { class: 'tabs' }, tabs.map(function (t) {
      return h('button', { class: 'tab' + (tab === t[0] ? ' active' : ''), onclick: function () { tab = t[0]; draw(); } }, t[1]);
    })));
    var body = h('div', { class: 'parent-body' });
    s.appendChild(body);
    ({ overview: overview, kids: kids, words: words, speech: speech, data: data, about: about })[tab](body);
  }

  /* ---------- Fortschritt ---------- */
  function overview(body) {
    var st = S.get();
    if (!st.profiles.length) { body.appendChild(h('p', null, 'Noch keine Kinder angelegt.')); return; }
    st.profiles.forEach(function (p) {
      var card = h('div', { class: 'card' });
      card.appendChild(h('h3', null, p.avatar + ' ' + p.name));
      // 14 Tage
      var daysEl = h('div', { class: 'chart' });
      var maxPts = goalMax(p);
      for (var i = 13; i >= 0; i--) {
        var dt = new Date(); dt.setDate(dt.getDate() - i);
        var key = u.todayStr(dt), d = p.days[key];
        var pts = d ? d.points : 0;
        daysEl.appendChild(h('div', { class: 'bar-col', title: key + ': ' + pts + ' Punkte, ' + (d ? d.tasks : 0) + ' Aufgaben' },
          h('div', { class: 'bar' + (d && d.goal ? ' goal' : ''), style: { height: Math.round(pts / maxPts * 100) + '%' } }),
          h('div', { class: 'bar-lbl' }, ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dt.getDay()])));
      }
      card.appendChild(h('div', { class: 'small' }, 'Punkte der letzten 14 Tage (grün = Ziel erreicht, Ziel: ' + p.settings.goal + ')'));
      card.appendChild(daysEl);
      var tbl = h('table', { class: 'stats' }, h('tr', null, h('th', null, 'Fach'), h('th', null, 'Stufe'), h('th', null, 'Inhalt'), h('th', null, 'ca. Jgst.'),
        h('th', null, 'Trefferquote*'), h('th', null, 'Aufgaben gesamt')));
      Object.keys(S.SUBJECTS).forEach(function (k) {
        var s = p.subjects[k], lvl = A.levelOf(s), acc = A.accuracy(s, 20);
        tbl.appendChild(h('tr', null, h('td', null, S.SUBJECTS[k].icon + ' ' + S.SUBJECTS[k].name), h('td', null, lvl + ' / ' + S.SUBJECTS[k].max),
          h('td', null, LA.tasks[k].levels[lvl - 1]), h('td', null, LA.tasks[k].grades[lvl - 1]),
          h('td', null, acc === null ? '–' : Math.round(acc * 100) + ' %'), h('td', null, s.tasks)));
      });
      card.appendChild(tbl);
      card.appendChild(h('div', { class: 'small' }, '* Anteil der letzten 20 Aufgaben, die ohne Hilfe im ersten Versuch gelöst wurden. Ideal sind ca. 70–85 % – dann ist es fordernd, aber machbar.'));
      var hard = Object.keys(p.wordStats).map(function (w) { return { w: w, s: p.wordStats[w] }; })
        .filter(function (x) { return x.s.err > 0; }).sort(function (a, b) { return b.s.err - a.s.err; }).slice(0, 12);
      if (hard.length) {
        card.appendChild(h('h4', null, 'Wörter, die noch schwerfallen'));
        card.appendChild(h('div', { class: 'chips' }, hard.map(function (x) { return h('span', { class: 'chip' }, x.w + ' (' + x.s.err + '× Hilfe, ' + x.s.ok + '× richtig)'); })));
      }
      var total = Object.keys(p.days).reduce(function (acc, k) { acc.t += p.days[k].tasks; acc.g += p.days[k].goal ? 1 : 0; acc.d += p.days[k].tasks ? 1 : 0; acc.m += p.days[k].minutes || 0; return acc; }, { t: 0, g: 0, d: 0, m: 0 });
      card.appendChild(h('p', { class: 'small' }, 'Lerntage: ' + total.d + ' · Ziel erreicht an ' + total.g + ' Tagen · Aufgaben insgesamt: ' + total.t + ' · Lernzeit ca. ' + Math.round(total.m) + ' Min. · Sammelbilder: ' + p.stickers.length));
      body.appendChild(card);
    });
  }
  function goalMax(p) {
    var m = p.settings.goal || 100;
    Object.keys(p.days).forEach(function (k) { m = Math.max(m, p.days[k].points); });
    return m;
  }

  /* ---------- Kinder & Einstellungen ---------- */
  var OPTS = [
    ['autoRead', 'Anweisungen automatisch vorlesen'],
    ['syllables', 'Silben farbig darstellen (blau/rot)'],
    ['bigText', 'Große Schrift'],
    ['spacing', 'Großer Buchstaben- und Zeilenabstand (hilft bei Leseschwäche)'],
    ['fewOptions', 'Weniger Antwortmöglichkeiten (3 statt 4)'],
    ['choiceMath', 'Rechnen: Antworten auswählen statt eintippen (bis Stufe 6)'],
    ['visualAids', 'Rechnen: Anschauungsmaterial (Punkte, Zehnerstangen) sofort zeigen']
  ];

  function kids(body) {
    var st = S.get();
    st.profiles.forEach(function (p, idx) {
      var card = h('div', { class: 'card' });
      var name = h('input', { type: 'text', value: p.name });
      name.addEventListener('change', function () { p.name = name.value.trim() || p.name; S.save(); });
      var av = h('div', { class: 'avatar-pick' }, LA.data.AVATARS.map(function (a) {
        return h('button', { class: 'av' + (a === p.avatar ? ' sel' : ''), onclick: function () { p.avatar = a; S.save(); draw(); } }, a);
      }));
      card.appendChild(h('h3', null, p.avatar + ' ' + p.name));
      card.appendChild(h('div', { class: 'form-grid' },
        h('label', null, 'Name'), name,
        h('label', null, 'Figur'), av,
        h('label', null, 'Punkteziel'), numberInput(p.settings.goal, 20, 500, 10, function (v) { p.settings.goal = v; }),
        h('label', null, 'Ziel gilt'), select([['day', 'pro Tag'], ['session', 'pro Übungsrunde']], p.settings.goalMode, function (v) { p.settings.goalMode = v; }),
        h('label', null, 'Pausen-Erinnerung'), select([[99999, 'aus'], [8, 'alle 8 Min.'], [10, 'alle 10 Min.'], [15, 'alle 15 Min.'], [20, 'alle 20 Min.'], [30, 'alle 30 Min.']],
          p.settings.pauseMin, function (v) { p.settings.pauseMin = parseInt(v, 10); })));
      card.appendChild(h('div', { class: 'small' }, 'Punkte: 10 für richtig im ersten Versuch, 6 mit Hilfe, 3 nach gezeigter Lösung, +5 Bonus für 5 in Folge. Ca. 8–12 Punkte pro Aufgabe.'));
      var checks = h('div', { class: 'checks' });
      OPTS.forEach(function (o) {
        var cb = h('input', { type: 'checkbox', checked: !!p.settings[o[0]] });
        cb.addEventListener('change', function () { p.settings[o[0]] = cb.checked; S.save(); });
        checks.appendChild(h('label', { class: 'check' }, cb, ' ', o[1]));
      });
      card.appendChild(checks);
      card.appendChild(h('h4', null, 'Aktuelle Stufen (passen sich automatisch an – hier nur bei Bedarf korrigieren)'));
      var lv = h('div', { class: 'form-grid' });
      Object.keys(S.SUBJECTS).forEach(function (k) {
        var s = p.subjects[k];
        var opts = LA.tasks[k].levels.map(function (n, i) { return [i + 1, (i + 1) + ': ' + n + ' (Jgst. ' + LA.tasks[k].grades[i] + ')']; });
        lv.appendChild(h('label', null, S.SUBJECTS[k].icon + ' ' + S.SUBJECTS[k].name));
        lv.appendChild(select(opts, A.levelOf(s), function (v) { s.level = parseInt(v, 10); s.skill = s.level + 0.1; }));
      });
      card.appendChild(lv);
      card.appendChild(h('div', { class: 'row-btns' },
        h('button', { class: 'btn danger', onclick: function () {
          if (confirm(p.name + ' und alle Fortschritte wirklich löschen?')) { st.profiles.splice(idx, 1); S.save(); draw(); }
        } }, '🗑 Kind löschen')));
      body.appendChild(card);
    });
    var nn = h('input', { type: 'text', placeholder: 'Name' });
    var pr = select(Object.keys(S.PRESETS).map(function (k) { return [k, S.PRESETS[k].label]; }), 'standard');
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '➕ Kind hinzufügen'), h('div', { class: 'form-grid' }, h('label', null, 'Name'), nn, h('label', null, 'Startprofil'), pr),
      h('button', { class: 'btn primary', onclick: function () {
        if (!nn.value.trim()) return;
        st.profiles.push(S.newProfile(nn.value.trim(), u.pick(LA.data.AVATARS), pr.value)); S.save(); draw();
      } }, 'Hinzufügen')));
    var pin = h('input', { type: 'text', inputmode: 'numeric', value: st.parent.pin || '', placeholder: 'leer = Rechenaufgabe' });
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '🔒 Zugang zum Elternbereich'),
      h('div', { class: 'form-grid' }, h('label', null, 'PIN (optional)'), pin),
      h('button', { class: 'btn', onclick: function () { st.parent.pin = pin.value.trim(); S.save(); alert('Gespeichert.'); } }, 'PIN speichern')));
  }

  function numberInput(val, min, max, step, onchange) {
    var i = h('input', { type: 'number', value: val, min: min, max: max, step: step });
    i.addEventListener('change', function () { var v = u.clamp(parseInt(i.value, 10) || min, min, max); i.value = v; onchange(v); S.save(); });
    return i;
  }
  function select(opts, val, onchange) {
    var s = h('select', null, opts.map(function (o) { return h('option', { value: o[0], selected: String(o[0]) === String(val) }, o[1]); }));
    if (onchange) s.addEventListener('change', function () { onchange(s.value); S.save(); });
    return s;
  }

  /* ---------- Lernwörter ---------- */
  function words(body) {
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '📝 Eigene Lernwörter (z. B. Wörter der Woche aus der Schule)'),
      h('p', null, 'Ein Wort pro Zeile. Mit Bindestrich in Silben trennen. Optional nach einem senkrechten Strich einen Beispielsatz – er wird beim Diktat vorgelesen.'),
      h('pre', { class: 'example' }, 'Schu-le | Ich gehe gern in die Schule.\nfröh-lich | Das Kind ist fröhlich.\nFahr-rad'),
      h('p', { class: 'small' }, 'Die Lernwörter erscheinen beim Schreiben ab Stufe 2 (Silben bauen), ab Stufe 4 zum Tippen und ab Stufe 5 bei den Rechtschreib-Strategien. Falsch geschriebene Wörter kommen automatisch zur Wiederholung.')));
    S.get().profiles.forEach(function (p) {
      var ta = h('textarea', { rows: 8 }, (p.customWords || []).join('\n'));
      var info = h('div', { class: 'small' });
      var saveBtn = h('button', { class: 'btn primary', onclick: function () {
        p.customWords = ta.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        S.save(); info.textContent = '✓ Gespeichert: ' + p.customWords.length + ' Wörter.';
      } }, 'Speichern');
      var test = h('button', { class: 'btn', onclick: function () {
        var cw = LA.tasks.schreiben.customWords({ customWords: ta.value.split('\n').filter(Boolean) });
        info.textContent = cw.map(function (w) { return w.syl.join('-'); }).join(' · ');
        if (cw[0]) LA.speech.speak(cw.map(function (w) { return w.word; }).join(', '));
      } }, '🔊 Probehören / Silben prüfen');
      body.appendChild(h('div', { class: 'card' }, h('h3', null, p.avatar + ' ' + p.name), ta, h('div', { class: 'row-btns' }, saveBtn, test), info));
    });
  }

  /* ---------- Sprache ---------- */
  function speech(body) {
    var st = S.get();
    var card = h('div', { class: 'card' });
    card.appendChild(h('h3', null, '🔊 Vorlese-Stimme'));
    if (!LA.speech.available) { card.appendChild(h('p', null, 'Dieser Browser unterstützt keine Sprachausgabe. Bitte Microsoft Edge oder Google Chrome verwenden.')); body.appendChild(card); return; }
    var voices = LA.speech.voices();
    var sel = select([['', 'Automatisch (beste verfügbare Stimme)']].concat(voices.map(function (v) { return [v.name, v.name + ' (' + v.lang + ')']; })), st.speech.voiceName,
      function (v) { st.speech.voiceName = v; LA.speech.configure(st.speech); });
    var rate = h('input', { type: 'range', min: 0.5, max: 1.2, step: 0.05, value: st.speech.rate });
    var rl = h('span', null, Math.round(st.speech.rate * 100) + ' %');
    rate.addEventListener('input', function () { st.speech.rate = parseFloat(rate.value); rl.textContent = Math.round(st.speech.rate * 100) + ' %'; LA.speech.configure(st.speech); S.save(); });
    card.appendChild(h('div', { class: 'form-grid' }, h('label', null, 'Stimme'), sel, h('label', null, 'Tempo'), h('div', null, rate, ' ', rl)));
    card.appendChild(h('button', { class: 'btn', onclick: function () { LA.speech.speak('Hallo! Ich lese dir die Aufgaben vor. Ba-na-ne. Wie viel ist sieben plus fünf?'); } }, '▶ Testen'));
    card.appendChild(h('p', { class: 'small' }, voices.length ? voices.length + ' deutsche Stimme(n) gefunden. ' : 'Noch keine deutsche Stimme gefunden – ggf. Seite neu laden. ',
      'Tipp: Microsoft Edge bietet sehr natürliche Stimmen (z. B. „Katja Online (Natural)“). Unter Windows können weitere Stimmen über Einstellungen → Zeit und Sprache → Sprache hinzugefügt werden.'));
    body.appendChild(card);
    var snd = h('input', { type: 'checkbox', checked: st.sound !== false });
    snd.addEventListener('change', function () { st.sound = snd.checked; LA.fx.setSound(snd.checked); S.save(); });
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '🔔 Töne'), h('label', { class: 'check' }, snd, ' Sanfte Töne bei richtigen Antworten und Erfolgen')));
  }

  /* ---------- Daten ---------- */
  function data(body) {
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '💾 Datensicherung'),
      h('p', null, 'Alle Daten werden nur in diesem Browser auf diesem Rechner gespeichert (localStorage). Es werden keine Daten ins Internet übertragen. ' +
        'Wenn Sie den Browser-Verlauf inklusive „Websitedaten“ löschen, gehen die Fortschritte verloren – sichern Sie deshalb ab und zu.'),
      h('div', { class: 'row-btns' },
        h('button', { class: 'btn primary', onclick: function () {
          var blob = new Blob([S.exportJSON()], { type: 'application/json' });
          var a = h('a', { href: URL.createObjectURL(blob), download: 'lernabenteuer-sicherung-' + u.todayStr() + '.json' });
          document.body.appendChild(a); a.click(); a.remove();
        } }, '⬇ Sicherung herunterladen'),
        (function () {
          var f = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
          f.addEventListener('change', function () {
            var r = new FileReader();
            r.onload = function () { try { S.importJSON(r.result); alert('Sicherung wiederhergestellt.'); draw(); } catch (e) { alert('Die Datei konnte nicht gelesen werden.'); } };
            if (f.files[0]) r.readAsText(f.files[0]);
          });
          return h('span', null, f, h('button', { class: 'btn', onclick: function () { f.click(); } }, '⬆ Sicherung einspielen'));
        })())));
    body.appendChild(h('div', { class: 'card' }, h('h3', null, '⚠️ Zurücksetzen'),
      h('button', { class: 'btn danger', onclick: function () {
        if (confirm('Wirklich ALLE Kinder und Fortschritte löschen?')) { S.reset(); onClose(); }
      } }, 'Alles löschen')));
  }

  /* ---------- Konzept ---------- */
  function about(body) {
    body.appendChild(h('div', { class: 'card prose', html: [
      '<h3>Wie die App lernt und motiviert</h3>',
      '<ul>',
      '<li><b>Selbstregulierende Schwierigkeit:</b> Jedes Fach hat Stufen (Lesen 7, Schreiben 7, Rechnen 11). Ziel ist eine Erfolgsquote von ca. 75–80 % im ersten Versuch – fordernd, aber machbar. Nach den ersten Aufgaben stuft sich die App schneller ein.</li>',
      '<li><b>Gestufte Hilfen statt Strafe:</b> Ein Fehler kostet keine Punkte. Er löst einen Hinweis aus (z. B. Silben vorsprechen, Punktebild, Zerlegung). Nach dem dritten Versuch wird die Lösung gezeigt – das Kind gibt sie selbst ein und erlebt so trotzdem Erfolg.</li>',
      '<li><b>Wiederholung mit Abstand:</b> Aufgaben, die nicht sofort klappten, kommen nach einigen Aufgaben und dann nach 1, 3 und 7 Tagen wieder (verteiltes Üben).</li>',
      '<li><b>Silbenmethode:</b> Wörter werden in farbigen Silben (blau/rot) gezeigt. Das erleichtert das Erlesen besonders bei Leseschwäche.</li>',
      '<li><b>Rechtschreib-Strategien:</b> Schwingen (Silben), Verlängern (Hund → Hunde), Merkwörter – mit kurzer Erklärung nach jeder Aufgabe.</li>',
      '<li><b>Rechnen mit Struktur:</b> Zehnerfeld mit Fünferstruktur, Zehnerstangen, Zerlegen beim Zehnerübergang, Einmaleins über Kernaufgaben – statt Abzählen.</li>',
      '<li><b>Motivation:</b> Tagesziel mit Fortschrittsbalken, Sammelbilder, Stufen-Sterne, Serien-Bonus. Kein Wettbewerb zwischen den Geschwistern, kein Zeitdruck, Lob für Anstrengung.</li>',
      '<li><b>Bewegungspausen:</b> Nach einstellbarer Zeit schlägt die App eine kurze Bewegungspause vor.</li>',
      '</ul>',
      '<h3>Tipps für Eltern</h3>',
      '<ul>',
      '<li>Lieber täglich 10–15 Minuten als einmal pro Woche eine Stunde.</li>',
      '<li>Loben Sie die Anstrengung („Du bist drangeblieben!“) statt nur das Ergebnis.</li>',
      '<li>Tragen Sie unter „Lernwörter“ die aktuellen Wörter aus der Schule ein.</li>',
      '<li>Die Stufen sind kein Notenersatz – entscheidend ist der eigene Fortschritt.</li>',
      '<li>Die App ersetzt keine Therapie (z. B. LRS-Förderung, Ergotherapie), kann sie aber gut ergänzen. Sprechen Sie gern mit Lehrkräften und Therapeuten über die Einstellungen.</li>',
      '</ul>'].join('') }));
  }

  LA.parent = { open: open };
})(window.LA);
