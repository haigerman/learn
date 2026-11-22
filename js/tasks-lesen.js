/* Lesen – Stufen orientiert am LehrplanPLUS Bayern (Deutsch, Lernbereich "Lesen – mit Texten und weiteren Medien umgehen")
   1 Anlaute hören (phonologische Bewusstheit)
   2 Silben klatschen & Reime erkennen
   3 Kurze Wörter lesen (Silbenmethode)
   4 Längere und ähnliche Wörter genau lesen
   5 Sätze verstehen (Ja/Nein, Lückensätze)
   6 Kurze Texte – Informationen finden
   7 Kurze Texte – Schlussfolgern */
(function (LA) {
  'use strict';
  var u = LA.u, D = LA.data, ui = LA.ui;

  var SIMILAR = { B: 'DP', D: 'BT', P: 'BT', M: 'NW', N: 'MH', E: 'FI', F: 'TE', G: 'KC', K: 'GH', T: 'DF',
    L: 'IT', R: 'LN', S: 'ZF', Z: 'SN', H: 'NK', W: 'MV', A: 'OE', O: 'AU', U: 'OÜ', I: 'EL', Ä: 'AE', Ö: 'OÜ', Ü: 'UÖ' };
  var LETTERS = 'ABDEFGHIKLMNOPRSTUWZ'.split('');

  function nOpt(p, n) { return p.settings.fewOptions ? Math.min(3, n) : n; }

  var anlautPool = D.WORDS.filter(function (w) { return !/^(sch|ch|ei|eu|au|st|sp|pf|qu|v|kn|y)/i.test(w.word); });

  function anlaut(level, frac, p, w) {
    w = w || u.pick(anlautPool);
    var first = w.word[0].toUpperCase();
    var n = nOpt(p, frac < 0.5 ? 3 : 4);
    var pool = frac > 0.5 && SIMILAR[first] ? SIMILAR[first].split('') : [];
    var others = u.pickN(LETTERS, 6, [first]);
    var distract = u.shuffle(pool).concat(others).filter(function (x, i, a) { return x !== first && a.indexOf(x) === i; }).slice(0, n - 1);
    return {
      type: 'choice', instr: 'Hör gut zu. Mit welchem Buchstaben beginnt das Wort?', say: w.word, listen: true,
      stim: function () { return ui.emoji(w.emoji); },
      options: u.shuffle([first].concat(distract)).map(function (l) {
        return { kind: 'letter', label: l + ' ' + l.toLowerCase(), correct: l === first };
      }),
      hints: [{ text: 'Sprich das Wort ganz langsam: ' + w.word, sayWord: true, slow: true }, { eliminate: true }],
      solution: w.word + ' beginnt mit ' + first + '.',
      review: { g: 'anlaut', w: w.word }
    };
  }

  function silben(level, frac, p, w) {
    w = w || u.pick(D.WORDS.filter(function (x) { return frac < 0.4 ? x.syl.length <= 2 : true; }));
    var n = w.syl.length;
    var opts = [1, 2, 3, 4];
    if (p.settings.fewOptions) opts = n <= 2 ? [1, 2, 3] : [2, 3, 4];
    return {
      type: 'choice', instr: 'Wie viele Silben hat das Wort? Sprich und klatsche mit!', say: w.word, listen: true,
      stim: function () { return ui.emoji(w.emoji); },
      options: opts.map(function (k) { return { kind: 'claps', value: k, label: String(k), correct: k === n }; }),
      hints: [{ text: 'Hör genau: ' + w.syl.join(' – '), speak: w.syl.join(' ... ') },
        { text: 'So sieht das Wort in Silben aus:', el: function () { return ui.word(w.word, w.syl, 'big'); } }],
      solution: w.syl.join(' – ') + ' hat ' + n + (n === 1 ? ' Silbe.' : ' Silben.'),
      review: { g: 'silben', w: w.word }
    };
  }

  function reim(level, frac, p, pair) {
    var pairs = D.RHYMES.filter(function (r) { return D.word(r[0]) && D.word(r[1]); });
    pair = pair || u.pick(pairs);
    if (Math.random() < 0.5 && !arguments[3]) pair = [pair[1], pair[0]];
    var base = D.word(pair[0]), match = D.word(pair[1]);
    var n = nOpt(p, 3);
    var ends = function (w) { return w.word.slice(-2).toLowerCase(); };
    var distract = u.pickN(D.WORDS.filter(function (w) { return ends(w) !== ends(base) && w.word !== base.word; }), n - 1);
    return {
      type: 'choice', instr: 'Was reimt sich auf ' + base.word + '?', say: '',
      stim: function () { return ui.emoji(base.emoji); },
      options: u.shuffle([match].concat(distract)).map(function (w) {
        return { kind: 'emoji', label: w.emoji, speak: w.word, correct: w === match };
      }),
      hints: [{ text: 'Hör dir alle Bilder an. Welches klingt am Ende wie ' + base.word + '?', speakOptions: true }, { eliminate: true }],
      solution: base.word + ' – ' + match.word + ' – das reimt sich!',
      review: { g: 'reim', p: [base.word, match.word] }
    };
  }

  function wortBild(level, frac, p, w) {
    var pool = level <= 3
      ? D.WORDS.filter(function (x) { return x.syl.length <= 2 && x.word.length <= (frac < 0.5 ? 4 : 6); })
      : D.WORDS.filter(function (x) { return x.word.length >= 4; });
    w = w || u.pick(pool);
    var n = nOpt(p, level <= 3 ? 3 : 4);
    var cand = D.WORDS.filter(function (x) { return x !== w; });
    if (level >= 4 || frac > 0.5) {
      var sim = cand.filter(function (x) { return x.word[0] === w.word[0] || x.word.slice(-2) === w.word.slice(-2); });
      if (sim.length >= n - 1) cand = sim;
    }
    var distract = u.pickN(cand, n - 1);
    return {
      type: 'choice', instr: 'Lies das Wort. Welches Bild passt?', noReadTarget: true,
      stim: function () { return ui.word(w.word, w.syl, 'big'); },
      options: u.shuffle([w].concat(distract)).map(function (x) { return { kind: 'emoji', label: x.emoji, correct: x === w }; }),
      hints: [{ text: 'Lies Silbe für Silbe. Die erste Silbe heißt: ' + w.syl[0], speak: 'Die erste Silbe heißt ' + w.syl[0] },
        { eliminate: true }, { text: 'Das Wort heißt: ' + w.word, sayWord: true }],
      say: w.word, solution: 'Das Wort heißt ' + w.word + '.',
      review: { g: 'wortBild', w: w.word }
    };
  }

  // Bild zeigen, unter ähnlichen Wörtern das richtige finden (genaues Lesen)
  var LOOKALIKE = function (w) {
    var vars = [], s = w.word;
    var swaps = [['b', 'd'], ['d', 'b'], ['p', 'b'], ['m', 'n'], ['n', 'm'], ['ei', 'ie'], ['ie', 'ei'], ['au', 'eu'], ['a', 'o'], ['o', 'a'],
      ['e', 'a'], ['u', 'o'], ['i', 'e'], ['t', 'd'], ['k', 'g'], ['r', 'l'], ['l', 'r'], ['s', 'z']];
    u.shuffle(swaps).forEach(function (sw) {
      var idx = s.indexOf(sw[0], 1);
      if (idx > 0) vars.push(s.slice(0, idx) + sw[1] + s.slice(idx + sw[0].length));
    });
    // Buchstaben vertauschen
    if (s.length > 3) { var i = u.rand(1, s.length - 2); vars.push(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)); }
    var real = D.WORDS.filter(function (x) { return x.word !== s && x.word[0] === s[0]; }).map(function (x) { return x.word; });
    return vars.concat(u.shuffle(real)).filter(function (v, i, a) { return v !== s && a.indexOf(v) === i; });
  };

  function bildWort(level, frac, p, w) {
    w = w || u.pick(D.WORDS.filter(function (x) { return x.word.length >= 4; }));
    var n = nOpt(p, frac < 0.5 ? 3 : 4);
    var distract = LOOKALIKE(w).slice(0, n - 1);
    return {
      type: 'choice', instr: 'Schau das Bild an. Welches Wort ist richtig geschrieben?', noReadTarget: true,
      stim: function () { return ui.emoji(w.emoji); },
      options: u.shuffle([w.word].concat(distract)).map(function (x) {
        return { kind: 'word', label: x, syl: x === w.word ? w.syl : null, correct: x === w.word };
      }),
      hints: [{ text: 'Lies jedes Wort ganz genau – Buchstabe für Buchstabe.', }, { eliminate: true }, { text: 'Hör zu:', sayWord: true }],
      say: w.word, solution: 'Richtig ist: ' + w.word,
      review: { g: 'bildWort', w: w.word }
    };
  }

  function janein(level, frac, p, idx) {
    if (idx === undefined) idx = u.rand(0, D.YESNO.length - 1);
    var item = D.YESNO[idx];
    return {
      type: 'choice', instr: 'Lies die Frage. Stimmt das?', noReadTarget: true,
      stim: function () { return ui.text(item[0], 'big'); },
      options: [{ kind: 'text', label: '👍 Ja', plain: true, correct: item[1] === true },
        { kind: 'text', label: '👎 Nein', plain: true, correct: item[1] === false }],
      hints: [{ text: 'Lies die Frage noch einmal langsam, Wort für Wort.' }, { text: 'Hör zu:', speak: item[0] }],
      solution: item[0] + ' – ' + (item[1] ? 'Ja!' : 'Nein!'),
      review: { g: 'janein', i: idx }
    };
  }

  function luecke(level, frac, p, idx) {
    if (idx === undefined) idx = u.rand(0, D.GAPS.length - 1);
    var g = D.GAPS[idx];
    var n = nOpt(p, 3);
    var opts = [g[1]].concat(g.slice(2, 1 + n));
    return {
      type: 'choice', instr: 'Lies den Satz. Welches Wort passt in die Lücke?', noReadTarget: true,
      stim: function () { return ui.text(g[0], 'big'); },
      options: u.shuffle(opts).map(function (x) { return { kind: 'word', label: x, correct: x === g[1] }; }),
      hints: [{ text: 'Setze jedes Wort in den Satz ein. Was ergibt Sinn?' }, { eliminate: true }],
      solution: g[0].replace('___', g[1]),
      review: { g: 'luecke', i: idx }
    };
  }

  function text(level, frac, p, idx) {
    var pool = D.TEXTS.map(function (t, i) { return i; }).filter(function (i) {
      var t = D.TEXTS[i];
      return level <= 6 ? !t.inf : (frac < 0.3 ? true : t.inf);
    });
    if (idx === undefined) idx = u.pick(pool);
    var t = D.TEXTS[idx];
    var n = nOpt(p, 3);
    var opts = t.a.slice(0, n);
    return {
      type: 'choice', instr: 'Lies den Text. Beantworte dann die Frage.', noReadTarget: true, manualNext: true,
      stim: function () {
        return LA.u.h('div', { class: 'textbox' }, ui.text(t.t), LA.u.h('div', { class: 'question' }, '❓ ', ui.text(t.q)));
      },
      say: t.q,
      options: u.shuffle(opts).map(function (x) { return { kind: 'word', label: x, correct: x === t.a[0] }; }),
      hints: [{ text: t.inf ? 'Die Antwort steht nicht direkt im Text. Überlege: Was passt zu dem, was passiert?' : 'Die Antwort steht im Text. Suche das passende Wort!' },
        { eliminate: true }, { text: 'Hör dir den Text an:', speak: t.t + ' ' + t.q }],
      solution: 'Richtig ist: ' + t.a[0],
      review: { g: 'text', i: idx }
    };
  }

  var GENS = { anlaut: anlaut, silben: silben, reim: reim, wortBild: wortBild, bildWort: bildWort, janein: janein, luecke: luecke, text: text };

  function generate(level, frac, p) {
    switch (level) {
      case 1: return anlaut(level, frac, p);
      case 2: return u.pick([silben, reim, anlaut, silben, reim])(level, frac, p);
      case 3: return Math.random() < 0.85 ? wortBild(level, frac, p) : silben(level, frac, p);
      case 4: return Math.random() < 0.5 ? wortBild(level, frac, p) : bildWort(level, frac, p);
      case 5: return Math.random() < (frac < 0.5 ? 0.6 : 0.35) ? janein(level, frac, p) : luecke(level, frac, p);
      case 6: return Math.random() < 0.8 ? text(level, frac, p) : luecke(level, frac, p);
      default: return Math.random() < 0.85 ? text(level, frac, p) : bildWort(level, frac, p);
    }
  }

  function fromReview(spec, level, p) {
    var f = GENS[spec.g]; if (!f) return null;
    if (spec.w) { var w = D.word(spec.w); if (!w) return null; return f(level, 0.5, p, w); }
    if (spec.p) return reim(level, 0.5, p, spec.p, true);
    if (spec.i !== undefined) return f(Math.max(level, spec.g === 'text' ? 6 : level), 0.5, p, spec.i);
    return null;
  }

  LA.tasks = LA.tasks || {};
  LA.tasks.lesen = { generate: generate, fromReview: fromReview,
    levels: ['Anlaute hören', 'Silben & Reime', 'Kurze Wörter lesen', 'Längere Wörter genau lesen', 'Sätze verstehen', 'Texte: Infos finden', 'Texte: Schlussfolgern'],
    grades: ['Vorkurs / 1', '1', '1', '1–2', '2', '2–3', '3–4'] };
})(window.LA);
