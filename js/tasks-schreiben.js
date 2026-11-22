/* Schreiben – orientiert am LehrplanPLUS Bayern (Deutsch, "Richtig schreiben") und an
   rechtschreibstrategischen Ansätzen (Silben schwingen, Verlängern, Merkwörter – vgl. FRESCH-Methode)
   1 Anlaute & fehlende Buchstaben
   2 Wörter aus Silben bauen
   3 Lautgetreue Wörter aus Buchstaben bauen
   4 Mitsprechwörter schreiben (tippen)
   5 Rechtschreibstrategien: richtige Schreibung finden
   6 Lernwörter / Grundwortschatz schreiben, Nomen groß
   7 Kurze Sätze schreiben (Diktat) */
(function (LA) {
  'use strict';
  var u = LA.u, D = LA.data, ui = LA.ui;

  function nOpt(p, n) { return p.settings.fewOptions ? Math.min(3, n) : n; }

  // Eigene Lernwörter der Eltern: "Schu-le | Ich gehe in die Schule."
  function customWords(p) {
    return (p.customWords || []).map(function (line) {
      var parts = line.split('|');
      var syl = parts[0].trim().split('-').map(function (s) { return s.trim(); }).filter(Boolean);
      var word = syl.join('');
      if (syl.length === 1) syl = u.syllabify(word);
      return { word: word, syl: syl, emoji: '', sentence: (parts[1] || '').trim(), custom: true, tags: D.tagsFor(word) };
    }).filter(function (w) { return w.word.length > 1; });
  }

  function gwsWords(maxGrade) {
    return D.GWS.filter(function (g) { return g[2] <= maxGrade; }).map(function (g) {
      return { word: g[0], syl: u.syllabify(g[0]), emoji: '', sentence: g[1], tags: D.tagsFor(g[0]) };
    });
  }

  function findWord(w, p) {
    return D.word(w) || customWords(p).filter(function (x) { return x.word === w; })[0] ||
      gwsWords(3).filter(function (x) { return x.word === w; })[0];
  }

  function sayFor(w) { return w.sentence ? w.word + '. ' + w.sentence + ' ' + w.word + '.' : w.word; }
  function stimFor(w) {
    return function () {
      return w.emoji ? ui.emoji(w.emoji) : LA.u.h('div', { class: 'emoji xl listen' }, '👂');
    };
  }

  /* 1: fehlender Anfangsbuchstabe */
  function anfang(level, frac, p, w) {
    if (!w && Math.random() < 0.4) return LA.tasks.lesen.generate(1, frac, p);
    var pool = D.WORDS.filter(function (x) { return !/^(sch|ch|ei|eu|au|st|sp|pf|qu|v)/i.test(x.word); });
    w = w || u.pick(pool);
    var first = w.word[0];
    var n = nOpt(p, frac < 0.5 ? 3 : 4);
    var letters = u.pickN('ABDEFGHIKLMNOPRSTUWZ'.split(''), n - 1, [first]);
    return {
      type: 'choice', instr: 'Welcher Buchstabe fehlt am Anfang?', say: w.word, listen: true,
      stim: function () {
        return LA.u.h('div', { class: 'stack' }, ui.emoji(w.emoji, 'lg'),
          LA.u.h('div', { class: 'word big' }, LA.u.h('span', { class: 'gap-letter' }, '_'), LA.u.h('span', null, w.word.slice(1))));
      },
      options: u.shuffle([first].concat(letters)).map(function (l) { return { kind: 'letter', label: l, correct: l === first }; }),
      hints: [{ text: 'Sprich das Wort langsam. Was hörst du ganz am Anfang?', sayWord: true, slow: true }, { eliminate: true }],
      solution: w.word, wordKey: w.word,
      review: { g: 'anfang', w: w.word }
    };
  }

  /* 2: Silben-Bausteine */
  function silbenBau(level, frac, p, w) {
    var cw = customWords(p).filter(function (x) { return x.syl.length >= 2; });
    if (!w) {
      if (cw.length && Math.random() < 0.35) w = u.pick(cw);
      else w = u.pick(D.WORDS.filter(function (x) { return x.syl.length >= 2 && x.syl.length <= (frac < 0.6 ? 2 : 4); }));
    }
    var extra = frac > 0.4 && !p.settings.fewOptions ? [u.pick(u.pick(D.WORDS.filter(function (x) { return x.syl.length > 1 && x !== w; })).syl)] : [];
    var target = w.syl.map(function (s, i) { return i === 0 ? s : s.toLowerCase(); });
    return {
      type: 'build', instr: 'Hör gut zu. Baue das Wort aus den Silben!', say: sayFor(w), listen: true,
      stim: stimFor(w), tiles: u.shuffle(target.concat(extra)), target: target, tileClass: 'syl-tile',
      hints: [{ text: 'Sprich das Wort in Silben und schwinge mit: ' + w.syl.join(' – '), speak: w.syl.join(' ... ') },
        { text: 'Die erste Silbe ist: ' + target[0], placeFirst: true }],
      solution: w.syl.join(' – '), wordKey: w.word,
      review: { g: 'silbenBau', w: w.word }
    };
  }

  /* 3: Buchstaben-Bausteine */
  function buchstabenBau(level, frac, p, w) {
    var maxLen = frac < 0.4 ? 4 : (frac < 0.8 ? 5 : 6);
    w = w || u.pick(D.WORDS.filter(function (x) { return x.lg1 && x.word.length <= maxLen && x.word.length >= 3; }));
    var letters = w.word.split('');
    var nDis = p.settings.fewOptions ? 0 : (frac < 0.5 ? 1 : 2);
    var dis = u.pickN('abdefgilmnorstu'.split(''), nDis, letters);
    return {
      type: 'build', instr: 'Hör gut zu. Baue das Wort aus Buchstaben!', say: sayFor(w), listen: true,
      stim: stimFor(w), tiles: u.shuffle(letters.concat(dis)), target: letters, tileClass: 'letter-tile',
      hints: [{ text: 'Sprich in Silben: ' + w.syl.join(' – ') + '. Welchen Laut hörst du zuerst?', speak: w.syl.join(' ... ') },
        { text: 'Der erste Buchstabe ist schon da.', placeFirst: true },
        { text: 'So sieht das Wort aus:', el: function () { return ui.word(w.word, w.syl, 'big'); } }],
      solution: w.word, wordKey: w.word,
      review: { g: 'buchstabenBau', w: w.word }
    };
  }

  /* 4 & 6: Wort tippen */
  function tippen(level, frac, p, w) {
    if (!w) {
      var cw = customWords(p);
      if (cw.length && Math.random() < 0.4) w = u.pick(cw);
      else if (level <= 4) {
        var maxSyl = frac < 0.5 ? 2 : 3;
        w = u.pick(D.WORDS.filter(function (x) { return x.lg2 && x.syl.length <= maxSyl; }));
      } else {
        w = Math.random() < 0.5 ? u.pick(gwsWords(frac < 0.4 ? 1 : 3)) : u.pick(D.WORDS.filter(function (x) { return x.tags.length; }));
      }
    }
    var strict = level >= 6;
    var tag = w.tags && w.tags[0];
    return {
      type: 'text', instr: 'Hör gut zu und schreibe das Wort.', say: sayFor(w), listen: true,
      stim: stimFor(w), answer: w.word, caseSensitive: strict,
      hints: [{ text: 'Sprich das Wort in Silben: ' + w.syl.join(' – '), speak: w.syl.join(' ... '), slots: true },
        { text: 'Das Wort beginnt so:', el: function () { return ui.word(w.syl[0], [w.syl[0]], 'big'); } },
        tag ? { text: strategyText(w.word, tag) } : { text: 'Achte auf jeden Laut, den du hörst.' }],
      explain: tag ? strategyText(w.word, tag) : null,
      solution: w.word, wordKey: w.word,
      review: { g: 'tippen', w: w.word, l: level }
    };
  }

  /* 5: Richtige Schreibung finden (Strategien) */
  var STRAT_TAGS = ['auslaut', 'doppel', 'ck', 'tz', 'ie', 'dehnungs-h', 'ß', 'v', 'ä'];

  function plural(word) {
    // grobe Verlängerung für Hinweise: nur für bekannte Wörter
    var map = { Hund: 'Hunde', Mond: 'Monde', Pferd: 'Pferde', Kleid: 'Kleider', Zug: 'Züge', Berg: 'Berge', Burg: 'Burgen',
      Kind: 'Kinder', Bild: 'Bilder', Tag: 'Tage', Wald: 'Wälder', Hand: 'Hände', Mund: 'Münder', Freund: 'Freunde',
      Stadt: 'Städte', Krebs: 'Krebse', sind: 'sind', und: 'und', rund: 'runde' };
    return map[word];
  }

  function strategyText(word, tag) {
    switch (tag) {
      case 'auslaut':
        var pl = plural(word);
        return pl && pl !== word ? 'Verlängere das Wort: ' + word + ' – ' + pl + '. Jetzt hörst du, wie man es am Ende schreibt!'
          : 'Am Wortende klingt d wie t und g wie k. Verlängere das Wort, dann hörst du es!';
      case 'doppel': return 'Sprich in Silben: ' + u.syllabify(word).join(' – ') + '. Nach einem kurzen Selbstlaut kommt oft ein doppelter Mitlaut.';
      case 'ck': return 'Nach einem kurzen Selbstlaut schreibt man ck (nie kk): ' + u.syllabify(word).join(' – ') + '.';
      case 'tz': return 'Nach einem kurzen Selbstlaut schreibt man tz (nie zz): ' + u.syllabify(word).join(' – ') + '.';
      case 'ie': return 'Das i klingt lang. Ein langes i schreibt man fast immer ie.';
      case 'dehnungs-h': return 'Das ist ein Merkwort mit Dehnungs-h. Das h macht den Selbstlaut lang. Merke es dir gut!';
      case 'ß': return 'Nach einem langen Selbstlaut schreibt man ß, wenn es scharf klingt.';
      case 'v': return 'Merkwort mit V: Es klingt wie f, wird aber mit V geschrieben.';
      case 'ä': return 'Merkwort mit ä. Oft hilft: Gibt es ein verwandtes Wort mit a?';
      case 'doppelvokal': return 'Merkwort mit doppeltem Selbstlaut (aa, ee, oo).';
      default: return 'Das ist ein Merkwort. Schau es dir genau an!';
    }
  }

  function wrongVariants(word, tag) {
    var v = [];
    function rep(re, s) { var r = word.replace(re, s); if (r !== word) v.push(r); }
    switch (tag) {
      case 'auslaut': rep(/d(s?)$/, 't$1'); rep(/g(s?)$/, 'k$1'); rep(/b(s?)$/, 'p$1'); break;
      case 'doppel': rep(/([bdfglmnprst])\1/, '$1'); break;
      case 'ck': rep('ck', 'k'); rep('ck', 'kk'); break;
      case 'tz': rep('tz', 'z'); rep('tz', 'zz'); break;
      case 'ie': rep('ie', 'i'); rep('ie', 'ih'); break;
      case 'dehnungs-h': rep(/([aeiouäöü])h/, '$1'); rep(/([aeiou])h/, '$1$1'); break;
      case 'ß': rep('ß', 's'); rep('ß', 'ss'); break;
      case 'v': rep(/^V/, 'F'); rep(/^v/, 'f'); rep(/^V/, 'W'); break;
      case 'ä': rep('ä', 'e'); rep('ä', 'a'); break;
    }
    return v.filter(function (x, i, a) { return x !== word && a.indexOf(x) === i; });
  }

  function genericWrong(word) {
    var out = [];
    var swaps = [['e', 'ä'], ['t', 'd'], ['n', 'nn'], ['l', 'll'], ['ei', 'ai'], ['eu', 'oi'], ['s', 'ß'], ['i', 'ie'], ['f', 'v']];
    swaps.forEach(function (sw) {
      var idx = word.indexOf(sw[0], 1);
      if (idx > 0) out.push(word.slice(0, idx) + sw[1] + word.slice(idx + sw[0].length));
    });
    out = u.shuffle(out);
    // Notfall-Varianten für sehr kurze Wörter (z. B. Uhr, Ohr)
    out.push(word + 'e', word.slice(0, -1) + word.slice(-1) + word.slice(-1), word.replace(/[aeiouäöü]/, function (v) { return v + v; }));
    return out;
  }

  function schreibung(level, frac, p, w) {
    if (!w) {
      var pool = D.WORDS.concat(gwsWords(3)).concat(customWords(p)).filter(function (x) {
        return x.tags.some(function (t) { return STRAT_TAGS.indexOf(t) >= 0; });
      });
      w = u.pick(pool);
    }
    var tag = w.tags.filter(function (t) { return STRAT_TAGS.indexOf(t) >= 0; })[0] || w.tags[0];
    var n = nOpt(p, 3);
    var wrong = wrongVariants(w.word, tag).concat(genericWrong(w.word)).filter(function (x, i, a) { return x !== w.word && a.indexOf(x) === i; }).slice(0, n - 1);
    return {
      type: 'choice', instr: 'Hör zu. Welches Wort ist richtig geschrieben?', say: sayFor(w), listen: true,
      stim: stimFor(w),
      options: u.shuffle([w.word].concat(wrong)).map(function (x) { return { kind: 'word', label: x, nosyl: true, correct: x === w.word }; }),
      hints: [{ text: strategyText(w.word, tag) }, { eliminate: true }],
      explain: strategyText(w.word, tag), alwaysExplain: true, manualNext: true,
      solution: w.word, wordKey: w.word,
      review: { g: 'schreibung', w: w.word }
    };
  }

  /* Nomen erkennen */
  var NON_NOUNS = ['laufen', 'schön', 'schnell', 'spielen', 'rot', 'lesen', 'klein', 'leise', 'fahren', 'lustig', 'müde', 'singen', 'warm', 'groß'];
  function nomen(level, frac, p) {
    var w = u.pick(D.WORDS);
    var n = nOpt(p, 3);
    var others = u.pickN(NON_NOUNS, n - 1);
    return {
      type: 'choice', instr: 'Welches Wort ist ein Nomen? Nomen schreibt man groß.', noReadTarget: false,
      say: '', stim: null,
      options: u.shuffle([w.word.toLowerCase()].concat(others)).map(function (x) {
        return { kind: 'word', label: x, nosyl: true, correct: x === w.word.toLowerCase() };
      }),
      hints: [{ text: 'Probiere: Kannst du "der", "die" oder "das" davor sagen? Dann ist es ein Nomen.' }, { eliminate: true }],
      explain: w.art + ' ' + w.word + ' – Nomen schreibt man groß!', alwaysExplain: true, manualNext: true,
      solution: w.art + ' ' + w.word
    };
  }

  /* 7: Sätze schreiben */
  function satz(level, frac, p, idx) {
    var pool = D.SENTENCES.map(function (s, i) { return i; }).filter(function (i) { return D.SENTENCES[i][1] <= (frac < 0.4 ? 1 : frac < 0.8 ? 2 : 3); });
    if (idx === undefined) idx = u.pick(pool);
    var s = D.SENTENCES[idx][0];
    var words = s.replace(/[.!?]$/, '').split(' ');
    return {
      type: 'text', sentence: true, instr: 'Hör gut zu und schreibe den Satz.', say: s, listen: true,
      stim: function () { return LA.u.h('div', { class: 'emoji xl listen' }, '👂'); },
      answer: s, caseSensitive: true, manualNext: true,
      hints: [{ text: 'Der Satz hat ' + words.length + ' Wörter. Hör noch einmal langsam zu.', speak: words.join(' ... ') },
        { text: 'So fangen die Wörter an:', el: function () { return LA.u.h('div', { class: 'word big' }, words.map(function (w) { return w[0] + '… '; }).join(' ')); } },
        { text: 'Denke an: Satzanfang und Nomen groß, Punkt am Ende.' }],
      solution: s,
      review: { g: 'satz', i: idx }
    };
  }

  var GENS = { anfang: anfang, silbenBau: silbenBau, buchstabenBau: buchstabenBau, tippen: tippen, schreibung: schreibung, satz: satz };

  function generate(level, frac, p) {
    switch (level) {
      case 1: return anfang(level, frac, p);
      case 2: return Math.random() < 0.8 ? silbenBau(level, frac, p) : anfang(level, frac, p);
      case 3: return Math.random() < 0.75 ? buchstabenBau(level, frac, p) : silbenBau(level, frac, p);
      case 4: return Math.random() < 0.75 ? tippen(level, frac, p) : buchstabenBau(level, frac, p);
      case 5: return Math.random() < 0.65 ? schreibung(level, frac, p) : tippen(level, frac, p);
      case 6: var r = Math.random(); return r < 0.55 ? tippen(level, frac, p) : r < 0.8 ? schreibung(level, frac, p) : nomen(level, frac, p);
      default: return Math.random() < 0.6 ? satz(level, frac, p) : tippen(6, frac, p);
    }
  }

  function fromReview(spec, level, p) {
    var f = GENS[spec.g]; if (!f) return null;
    if (spec.w) { var w = findWord(spec.w, p); if (!w) return null; return f(spec.l || level, 0.5, p, w); }
    if (spec.i !== undefined) return f(level, 0.5, p, spec.i);
    return null;
  }

  LA.tasks.schreiben = { generate: generate, fromReview: fromReview, customWords: customWords,
    levels: ['Anlaute & fehlende Buchstaben', 'Wörter aus Silben bauen', 'Wörter aus Buchstaben bauen', 'Mitsprechwörter schreiben', 'Rechtschreib-Strategien', 'Lernwörter & Nomen groß', 'Sätze schreiben'],
    grades: ['1', '1', '1', '1–2', '2–3', '2–4', '3–4'] };
})(window.LA);
