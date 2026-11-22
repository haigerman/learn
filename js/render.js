/* Darstellung und Ablauf einer einzelnen Aufgabe
   Fehlerfreundlich: Fehler kosten keine Punkte, sondern lösen gestufte Hilfen aus.
   Nach mehreren Fehlversuchen wird die Lösung gezeigt und das Kind gibt sie selbst ein ("fehlerfreies Lernen"). */
(function (LA) {
  'use strict';
  var h = LA.u.h, u = LA.u, ui = LA.ui;

  var PRAISE = ['Super!', 'Richtig!', 'Klasse!', 'Toll gemacht!', 'Prima!', 'Genau!', 'Spitze!', 'Stark!', 'Sehr gut!'];
  var PRAISE_EFFORT = ['Gut, dass du drangeblieben bist!', 'Du hast nicht aufgegeben – super!', 'Geschafft! Üben macht stark.', 'Prima, du hast es herausgefunden!'];
  var RETRY = ['Noch nicht ganz. Probier es noch einmal!', 'Fast! Schau noch einmal genau.', 'Kein Problem – Fehler helfen beim Lernen. Noch ein Versuch!'];

  function speakTask(task, p) {
    var parts = [task.instr];
    if (task.say && (task.listen || task.readAll)) parts.push(task.say);
    LA.speech.speak(parts.join(' '));
  }

  function render(container, task, p, onDone) {
    var attempts = 0, hintIdx = 0, hintsUsed = 0, solutionShown = false, finished = false;
    LA.render.current = task;
    var autoRead = p.settings.autoRead;

    container.innerHTML = '';
    var card = h('div', { class: 'task-card' });
    var instrRow = h('div', { class: 'instr' },
      h('button', { class: 'speak-btn', title: 'Vorlesen', 'aria-label': 'Vorlesen', onclick: function () { speakTask(task, p); } }, '🔊'),
      h('span', null, task.instr));
    card.appendChild(instrRow);

    var stimWrap = h('div', { class: 'stim' });
    if (task.stim) stimWrap.appendChild(task.stim());
    // Hörbutton für das Zielwort (z. B. Diktat), wenn es nicht gelesen werden soll
    if (task.say && task.listen) {
      stimWrap.appendChild(h('button', { class: 'listen-btn', onclick: function () { LA.speech.speak(task.say); } }, '👂 Nochmal hören'));
    }
    card.appendChild(stimWrap);

    var hintBox = h('div', { class: 'hint-box hidden' });
    var answerArea = h('div', { class: 'answer-area' });
    var feedback = h('div', { class: 'feedback' });
    card.appendChild(answerArea);
    card.appendChild(hintBox);
    card.appendChild(feedback);

    var helpBtn = h('button', { class: 'help-btn', onclick: function () { hintsUsed++; showHint(); } }, '💡 Hilfe');
    card.appendChild(h('div', { class: 'task-tools' }, helpBtn));
    container.appendChild(card);

    /* ---------- Hinweise ---------- */
    function showHint() {
      var hints = task.hints || [];
      if (hintIdx >= hints.length) { showSolution(); return; }
      var hi = hints[hintIdx++];
      applyHint(hi);
    }

    function applyHint(hi) {
      if (hi.eliminate) { eliminateOne(); if (!hi.text) { LA.speech.speak('Eine falsche Antwort ist jetzt weg.'); return; } }
      hintBox.classList.remove('hidden');
      var item = h('div', { class: 'hint' }, h('span', { class: 'hint-icon' }, '💡'), h('span', null, hi.text || 'Eine falsche Antwort ist weg.'));
      hintBox.appendChild(item);
      if (hi.el) hintBox.appendChild(h('div', { class: 'hint-visual' }, hi.el()));
      if (hi.slots && task.answer) showSlots();
      if (hi.placeFirst && api.placeFirst) api.placeFirst();
      if (hi.speakOptions && task.options) {
        LA.speech.speak(task.options.map(function (o) { return o.speak || o.label; }).join(', '));
      } else if (hi.sayWord && task.say) {
        LA.speech.speak((hi.text || '') + ' ' + (hi.text && hi.text.indexOf(task.say) >= 0 ? '' : task.say), { rate: hi.slow ? 0.7 : 1 });
      } else if (hi.speak) {
        LA.speech.speak(hi.text && hi.speak !== hi.text ? hi.text.split(':')[0] + ': ' + hi.speak : hi.speak, { rate: 0.85 });
      } else if (hi.text) {
        LA.speech.speak(hi.text);
      }
      hintBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showSlots() {
      var n = String(task.answer).length;
      hintBox.appendChild(h('div', { class: 'slots' }, Array.apply(null, Array(n)).map(function () { return h('span'); })));
    }

    function showSolution() {
      if (solutionShown) return;
      solutionShown = true;
      hintBox.classList.remove('hidden');
      hintBox.appendChild(h('div', { class: 'hint solution' }, h('span', { class: 'hint-icon' }, '👀'),
        h('span', null, 'So geht es: ', h('strong', null, task.solution)),
        h('div', { class: 'small' }, task.type === 'choice' ? 'Tippe jetzt die richtige Antwort an.' : 'Gib es jetzt selbst ein – du schaffst das!')));
      LA.speech.speak('So geht es: ' + task.solution + '. ' + (task.type === 'choice' ? 'Tippe jetzt die richtige Antwort an.' : 'Gib es jetzt selbst ein.'));
      if (api.markSolution) api.markSolution();
      helpBtn.disabled = true;
    }

    function eliminateOne() {
      var btns = answerArea.querySelectorAll('.opt:not(.correct-opt):not(.gone)');
      var wrong = Array.prototype.filter.call(btns, function (b) { return b.dataset.correct !== '1'; });
      if (wrong.length > 1 || (wrong.length === 1 && btns.length > 2)) { var b = u.pick(wrong); b.classList.add('gone'); b.disabled = true; }
    }

    /* ---------- Antwort prüfen ---------- */
    function correct() {
      if (finished) return;
      finished = true;
      var quality = solutionShown ? 'solved' : (attempts === 0 && hintsUsed === 0 ? 'perfect' : 'helped');
      LA.fx.play('correct');
      card.classList.add('is-correct');
      var msg = quality === 'perfect' ? u.pick(PRAISE) : u.pick(PRAISE_EFFORT);
      feedback.className = 'feedback ok';
      feedback.innerHTML = '';
      feedback.appendChild(h('div', { class: 'fb-main' }, '✅ ' + msg));
      var needNext = task.manualNext || quality !== 'perfect';
      var explainText = task.explain && (task.alwaysExplain || quality !== 'perfect') ? task.explain : null;
      if (explainText) { feedback.appendChild(h('div', { class: 'fb-explain' }, '💬 ', explainText)); needNext = true; }
      LA.speech.speak(msg + (explainText ? ' ' + explainText : ''));
      helpBtn.disabled = true;
      var go = function () { if (go.done) return; go.done = true; document.removeEventListener('keydown', onKey); onDone(quality, task); };
      var onKey = function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      if (needNext) {
        var nb = h('button', { class: 'btn primary next-btn', onclick: go }, 'Weiter ➜');
        feedback.appendChild(nb);
        setTimeout(function () { document.addEventListener('keydown', onKey); nb.focus(); }, 300);
      } else {
        setTimeout(go, 1300);
      }
    }

    function wrong(detailEl) {
      if (finished) return;
      attempts++;
      LA.fx.play('retry');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      feedback.className = 'feedback retry';
      feedback.innerHTML = '';
      var msg = u.pick(RETRY);
      feedback.appendChild(h('div', { class: 'fb-main' }, '🤔 ' + msg));
      if (detailEl) feedback.appendChild(detailEl);
      if (!solutionShown) {
        if (attempts >= 3) { setTimeout(showSolution, 400); }
        else if ((task.hints || []).length > hintIdx) { LA.speech.speak(msg); setTimeout(showHint, 900); }
        else if (attempts >= 2) { setTimeout(showSolution, 400); }
        else LA.speech.speak(msg);
      } else {
        LA.speech.speak('Schau auf die Lösung und probier es noch einmal.');
      }
    }

    /* ---------- Antworttypen ---------- */
    var api = {};

    function optionContent(o) {
      if (o.kind === 'emoji') return h('span', { class: 'opt-emoji' }, o.label);
      if (o.kind === 'letter') return h('span', { class: 'opt-letter' }, o.label);
      if (o.kind === 'claps') return h('span', { class: 'opt-claps' }, h('strong', null, o.label), ui.claps(o.value));
      if (o.kind === 'num') return h('span', { class: 'opt-num' }, o.label);
      if (o.kind === 'word') return o.nosyl ? h('span', { class: 'word' }, o.label) : ui.text(o.label, 'opt-text');
      return h('span', { class: 'opt-plain' }, o.label);
    }

    if (task.type === 'choice') {
      var grid = h('div', { class: 'options n' + task.options.length + ' kind-' + task.options[0].kind });
      task.options.forEach(function (o) {
        var b = h('button', { class: 'opt', 'data-correct': o.correct ? '1' : '0' }, optionContent(o));
        b.addEventListener('click', function () {
          if (finished || b.disabled) return;
          if (o.correct) { b.classList.add('correct-opt'); correct(); }
          else { b.classList.add('wrong-opt', 'gone'); b.disabled = true; wrong(); }
        });
        if (o.speak) b.addEventListener('contextmenu', function (e) { e.preventDefault(); LA.speech.speak(o.speak); });
        grid.appendChild(b);
      });
      answerArea.appendChild(grid);
      api.markSolution = function () { var c = grid.querySelector('[data-correct="1"]'); if (c) c.classList.add('pulse'); };
      // Tastatur 1–4
      api.keys = function (e) {
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= task.options.length) { var bt = grid.children[n - 1]; if (bt && !bt.disabled) bt.click(); }
      };
    }

    if (task.type === 'number') {
      var display = h('div', { class: 'num-display', 'aria-live': 'polite' });
      var val = '';
      var upd = function () { display.textContent = val || ' '; display.classList.toggle('empty', !val); };
      var check = function () {
        if (!val) return;
        var n = parseInt(val, 10);
        if (n === task.answer) { display.classList.add('ok'); correct(); }
        else {
          var hint = null;
          var diff = Math.abs(n - task.answer);
          if (diff === 1) hint = h('div', { class: 'fb-explain' }, 'Ganz knapp daneben – nur 1 Unterschied!');
          else if (diff === 10) hint = h('div', { class: 'fb-explain' }, 'Schau nochmal auf die Zehner!');
          wrong(hint); val = ''; upd();
        }
      };
      var press = function (k) {
        if (finished) return;
        LA.fx.play('click');
        if (k === '⌫') val = val.slice(0, -1);
        else if (k === '✓') { check(); return; }
        else if (val.length < 7) val += k;
        upd();
      };
      var pad = h('div', { class: 'numpad' }, ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✓'].map(function (k) {
        return h('button', { class: 'key' + (k === '✓' ? ' key-ok' : k === '⌫' ? ' key-del' : ''), onclick: function () { press(k); } }, k);
      }));
      answerArea.appendChild(h('div', { class: 'num-wrap' }, display, pad));
      upd();
      api.keys = function (e) {
        if (/^[0-9]$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('⌫');
        else if (e.key === 'Enter') press('✓');
      };
    }

    if (task.type === 'text') {
      var input = h('input', { class: 'text-input' + (task.sentence ? ' sentence' : ''), type: 'text', autocomplete: 'off', autocorrect: 'off',
        autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Antwort' });
      var diffBox = h('div', { class: 'diff' });
      var specials = h('div', { class: 'specials' }, ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(function (c) {
        return h('button', { class: 'key small', onclick: function () {
          var s = input.selectionStart || input.value.length;
          input.value = input.value.slice(0, s) + c + input.value.slice(input.selectionEnd || s);
          input.focus(); input.setSelectionRange(s + 1, s + 1);
        } }, c);
      }));
      var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
      var checkText = function () {
        if (finished) return;
        var val2 = norm(input.value);
        if (!val2) return;
        var target = task.answer;
        var cmpVal = val2, cmpTarget = target;
        var punctNote = false;
        if (task.sentence && !/[.!?]$/.test(val2) && /[.!?]$/.test(target)) { cmpVal = val2 + target.slice(-1); punctNote = true; }
        if (!task.caseSensitive) { cmpVal = cmpVal.toLowerCase(); cmpTarget = cmpTarget.toLowerCase(); }
        if (cmpVal === cmpTarget) {
          input.classList.add('ok'); input.disabled = true;
          if (!task.caseSensitive && val2 !== target) task.explain = (task.explain ? task.explain + ' ' : '') + 'Denke daran: ' + target + ' – so wird es geschrieben.';
          if (punctNote) task.explain = 'Super! Denk beim nächsten Mal an den Punkt am Satzende.';
          correct();
          return;
        }
        // Rückmeldung: welche Buchstaben stimmen schon?
        var d = u.diffChars(val2, target);
        diffBox.innerHTML = '';
        var near = val2.toLowerCase() === target.toLowerCase();
        var view = h('div', { class: 'diff-view' }, d.parts.map(function (pt) {
          return h('span', { class: pt.ok ? 'd-ok' : 'd-bad' }, pt.ch === ' ' ? ' ' : pt.ch);
        }));
        var info = near ? 'Fast perfekt! Achte auf Groß- und Kleinschreibung.' :
          d.common + ' von ' + d.targetLen + ' Zeichen sind schon richtig. Die grünen Buchstaben stimmen.';
        wrong(h('div', { class: 'fb-explain' }, view, h('div', null, info)));
        input.select();
      };
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); checkText(); } });
      answerArea.appendChild(h('div', { class: 'text-wrap' }, input, specials,
        h('button', { class: 'btn primary', onclick: checkText }, '✓ Prüfen'), diffBox));
      setTimeout(function () { input.focus(); }, 50);
      api.keys = null;
    }

    if (task.type === 'build') {
      var placed = [];
      var slotRow = h('div', { class: 'build-slots' });
      var tileRow = h('div', { class: 'build-tiles' });
      var tiles = task.tiles.map(function (t, i) {
        var b = h('button', { class: 'tile ' + (task.tileClass || '') }, t);
        b.addEventListener('click', function () {
          if (finished) return;
          LA.fx.play('click');
          if (b.parentNode === tileRow) { place(b, i); }
          else { unplace(b); }
        });
        b.dataset.i = i;
        return b;
      });
      tiles.forEach(function (b) { tileRow.appendChild(b); });
      var place = function (b) { slotRow.appendChild(b); placed.push(b); refresh(); maybeCheck(); };
      var unplace = function (b) { if (b.classList.contains('locked')) return; tileRow.appendChild(b); placed.splice(placed.indexOf(b), 1); refresh(); };
      var refresh = function () {
        slotRow.classList.toggle('empty', placed.length === 0);
        // Silbenfarben
        placed.forEach(function (b, i) { b.classList.toggle('syl-b', task.tileClass === 'syl-tile' && i % 2 === 1); });
      };
      var maybeCheck = function () {
        if (placed.length < task.target.length) return;
        var got = placed.map(function (b) { return b.textContent; });
        if (got.join('') === task.target.join('')) { slotRow.classList.add('ok'); correct(); }
        else {
          // Richtig liegende Bausteine vom Anfang her festhalten, Rest zurücklegen
          var keep = 0;
          while (keep < got.length && got[keep] === task.target[keep]) keep++;
          var back = placed.slice(keep);
          setTimeout(function () { back.forEach(function (b) { unplace(b); }); }, 700);
          placed.slice(0, keep).forEach(function (b) { b.classList.add('locked'); });
          wrong(keep ? h('div', { class: 'fb-explain' }, 'Der Anfang stimmt schon: ' + got.slice(0, keep).join('')) : null);
        }
      };
      api.placeFirst = function () {
        var need = task.target[placed.length];
        // nur wenn bisher alles richtig liegt
        var ok = placed.every(function (b, i) { return b.textContent === task.target[i]; });
        if (!ok) { placed.slice().forEach(unplace); need = task.target[0]; }
        var cand = Array.prototype.filter.call(tileRow.children, function (b) { return b.textContent === need; })[0];
        if (cand) { place(cand); cand.classList.add('locked'); }
      };
      api.markSolution = function () {
        hintBox.appendChild(h('div', { class: 'hint-visual' }, ui.word(task.target.join(''), task.tileClass === 'syl-tile' ? task.target : null, 'big')));
      };
      answerArea.appendChild(h('div', { class: 'build' }, slotRow, tileRow));
      refresh();
    }

    // Tastatursteuerung
    var keyHandler = function (e) {
      if (finished || !document.body.contains(card)) { document.removeEventListener('keydown', keyHandler); return; }
      if (api.keys) api.keys(e);
    };
    document.addEventListener('keydown', keyHandler);

    if (autoRead) setTimeout(function () { speakTask(task, p); }, 250);
    else if (task.say && task.listen) setTimeout(function () { LA.speech.speak(task.say); }, 250);

    if (task.autoHint && task.hints && task.hints.length) {
      // Bei "Viel Unterstützung": Anschauungsmaterial sofort zeigen (zählt nicht als Hilfe)
      var vis = task.hints.filter(function (x) { return x.el; })[0];
      if (vis) {
        hintBox.classList.remove('hidden');
        hintBox.appendChild(h('div', { class: 'hint-visual' }, vis.el()));
      }
    }
  }

  LA.render = { task: render, speakTask: speakTask };
})(window.LA);
