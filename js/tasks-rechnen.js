/* Rechnen – orientiert am LehrplanPLUS Bayern (Mathematik, "Zahlen und Operationen")
   Jgst. 1: Zahlraum bis 20 · Jgst. 2: bis 100, Einmaleins · Jgst. 3: bis 1000 · Jgst. 4: bis 1 000 000
   Grundidee: strukturierte Mengen (Zehnerfeld, Fünferstruktur) statt Abzählen; Zehnerübergang schrittweise;
   Einmaleins über Kernaufgaben (×1, ×2, ×5, ×10) und Nachbaraufgaben. */
(function (LA) {
  'use strict';
  var u = LA.u, ui = LA.ui, h = LA.u.h;

  function nOpt(p, n) { return p.settings.fewOptions ? Math.min(3, n) : n; }

  function numOptions(ans, n, spread) {
    var set = [ans], tries = 0;
    var near = [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2];
    near = u.shuffle(near);
    while (set.length < n && tries++ < 60) {
      var c = tries < 6 ? near[tries - 1] : ans + u.rand(-spread, spread);
      if (c >= 0 && set.indexOf(c) < 0) set.push(c);
    }
    return u.shuffle(set);
  }

  // Grundgerüst einer Rechenaufgabe
  function make(a, op, b, ans, level, p, extra) {
    extra = extra || {};
    var opSym = { '+': '+', '-': '−', '*': '·', '/': ':' }[op];
    var display = extra.display || (u.fmt(a) + ' ' + opSym + ' ' + u.fmt(b) + ' = ?');
    var useChoice = p.settings.choiceMath && level <= 6 || extra.choice;
    var t = {
      type: useChoice ? 'choice' : 'number',
      instr: extra.instr || 'Rechne:', readAll: true,
      say: extra.say || display.replace('?', ''),
      stim: function () { return h('div', { class: 'equation' }, display.split('?').reduce(function (acc, part, i, arr) {
        acc.push(part); if (i < arr.length - 1) acc.push(h('span', { class: 'qbox' }, '?')); return acc; }, [])); },
      answer: ans,
      hints: extra.hints || [],
      solution: display.replace('?', u.fmt(ans)),
      review: { g: 'arith', a: a, op: op, b: b, l: level, d: extra.display || null, k: extra.kind || null },
      autoHint: p.settings.visualAids && extra.hints && extra.hints.length && level <= 7
    };
    if (useChoice) {
      t.options = numOptions(ans, nOpt(p, 4), Math.max(3, Math.round(ans * 0.2))).map(function (x) {
        return { kind: 'num', label: u.fmt(x), correct: x === ans };
      });
    }
    return t;
  }

  /* ---------- Hinweis-Bausteine ---------- */
  function hintDots(a, b, op) {
    return { text: op === '+' ? 'Schau auf die Punkte: ' + a + ' und ' + b + ' dazu.' : 'Schau auf die Punkte: ' + a + ', davon ' + b + ' weg.',
      el: function () { return ui.dotsFor(a, b, op); } };
  }
  function hintBridge(a, b, op) {
    if (op === '+') {
      var toTen = 10 - (a % 10), rest = b - toTen;
      var nextTen = a + toTen;
      return { text: 'Rechne in zwei Schritten: erst bis ' + nextTen + ', dann weiter. ' + a + ' + ' + toTen + ' = ' + nextTen + ', dann ' + nextTen + ' + ' + rest + ' = ?' };
    }
    var down = a % 10, rest2 = b - down, ten = a - down;
    return { text: 'Rechne in zwei Schritten: erst bis ' + ten + ', dann weiter. ' + a + ' − ' + down + ' = ' + ten + ', dann ' + ten + ' − ' + rest2 + ' = ?' };
  }
  function hintBlocks(a, b, op) {
    return { text: op === '+' ? 'Erst die Zehner, dann die Einer zusammenzählen.' : 'Erst die Zehner, dann die Einer abziehen.',
      el: function () { return h('div', { class: 'stack' }, ui.blocks(a), h('div', { class: 'opbig' }, op === '+' ? '+' : '−'), ui.blocks(b, 'b')); } };
  }
  function hintSplit(a, b, op) {
    var Z = Math.floor(b / 10) * 10, E = b % 10;
    if (!Z || !E) return { text: 'Rechne erst mit den Zehnern, dann mit den Einern.' };
    var mid = op === '+' ? a + Z : a - Z;
    return { text: 'Zerlege: ' + a + (op === '+' ? ' + ' : ' − ') + Z + ' = ' + mid + ', dann ' + mid + (op === '+' ? ' + ' : ' − ') + E + ' = ?' };
  }
  function hintMul(a, b) {
    var core = [1, 2, 5, 10];
    var tip;
    if (core.indexOf(b) >= 0 || core.indexOf(a) >= 0) tip = 'Tipp: ' + a + ' · ' + b + ' bedeutet ' + a + '-mal die ' + b + '.';
    else {
      var near = b > 5 ? (b >= 8 ? 10 : 5) : (b >= 3 ? 2 : 1);
      if (near === 10) tip = 'Nachbaraufgabe: 10 · ' + a + ' = ' + (10 * a) + '. ' + b + ' · ' + a + ' ist ' + (10 - b) + '-mal ' + a + ' weniger.';
      else tip = 'Nachbaraufgabe: ' + near + ' · ' + a + ' = ' + (near * a) + '. Dann noch ' + (b - near) + '-mal ' + a + ' dazu.';
    }
    return [{ text: tip }, { text: 'So sieht ' + b + ' · ' + a + ' aus (' + b + ' Reihen mit je ' + a + '):', el: function () { return ui.array(b, a); } }];
  }

  /* ---------- Stufen ---------- */
  function mengen(level, frac, p) {
    var max = frac < 0.5 ? 6 : 10;
    var n = u.rand(1, max);
    return {
      type: 'choice', instr: 'Wie viele Punkte siehst du? Versuche es ohne einzeln zu zählen!',
      stim: function () { return ui.quantity(n); },
      options: numOptions(n, nOpt(p, 3), 2).filter(function (x) { return x > 0; }).map(function (x) { return { kind: 'num', label: String(x), correct: x === n }; }),
      answer: n,
      hints: [{ text: n > 5 ? 'Eine Reihe hat 5 Punkte. 5 und noch ' + (n - 5) + '.' : 'Schau genau: Eine ganze Reihe sind 5.' }, { eliminate: true }],
      solution: 'Es sind ' + n + ' Punkte.',
      review: { g: 'mengen', n: n }
    };
  }

  function bis10(level, frac, p) {
    var op = Math.random() < (frac < 0.4 ? 0.75 : 0.5) ? '+' : '-';
    var max = frac < 0.5 ? 6 : 10;
    var a, b;
    if (op === '+') { a = u.rand(1, max - 1); b = u.rand(1, max - a); }
    else { a = u.rand(2, max); b = u.rand(1, a - 1); }
    var ans = op === '+' ? a + b : a - b;
    var t = make(a, op, b, ans, level, p, { hints: [hintDots(a, b, op)] });
    if (frac < 0.5) t.autoHint = true;
    return t;
  }

  function bis20ohne(level, frac, p) {
    var kind = u.pick(['plus', 'minus', 'plus', 'double', 'ten']);
    var a, b, op;
    if (kind === 'double') { a = u.rand(1, frac < 0.5 ? 5 : 10); b = a; op = '+'; }
    else if (kind === 'ten') { a = 10; b = u.rand(1, 10); op = Math.random() < 0.6 ? '+' : '-'; if (op === '-') { a = 10 + b; b = u.rand(1, 9); b = a - 10; } }
    else if (kind === 'plus') { a = u.rand(11, 18); b = u.rand(1, 19 - a); op = '+'; }
    else { a = u.rand(12, 19); b = u.rand(1, a - 11); op = '-'; }
    var ans = op === '+' ? a + b : a - b;
    var hints = [kind === 'double' ? { text: 'Verdoppeln: ' + a + ' und noch einmal ' + a + '.', el: function () { return ui.dotsFor(a, b, '+'); } }
      : a > 10 ? { text: 'Schau nur auf die Einer: ' + (a - 10) + (op === '+' ? ' + ' : ' − ') + b + '. Der Zehner bleibt.' } : hintDots(a, b, op),
      hintDots(a, b, op)];
    return make(a, op, b, ans, level, p, { hints: hints });
  }

  function bis20mit(level, frac, p) {
    var op = Math.random() < 0.55 ? '+' : '-';
    var a, b;
    if (op === '+') { a = u.rand(frac < 0.5 ? 7 : 3, 9); b = u.rand(11 - a, 9); }
    else { a = u.rand(11, frac < 0.5 ? 15 : 18); b = u.rand(a - 9, 9); }
    var ans = op === '+' ? a + b : a - b;
    return make(a, op, b, ans, level, p, { hints: [hintBridge(a, b, op), hintDots(a, b, op)] });
  }

  function bis100(level, frac, p) {
    var op = Math.random() < 0.55 ? '+' : '-';
    var a, b, ans, kind;
    var r = Math.random();
    if (frac < 0.33) kind = r < 0.5 ? 'ZZ' : 'ZEE';
    else if (frac < 0.66) kind = r < 0.5 ? 'ZEZ' : 'ZEEu';
    else kind = 'ZEZE';
    do {
      if (kind === 'ZZ') { a = u.rand(1, 9) * 10; b = u.rand(1, 9) * 10; }
      else if (kind === 'ZEE') { a = u.rand(11, 89); b = u.rand(1, 9); if (op === '+' ? (a % 10) + b > 9 : (a % 10) < b) continue; }
      else if (kind === 'ZEZ') { a = u.rand(11, 89); b = u.rand(1, 8) * 10; }
      else if (kind === 'ZEEu') { a = u.rand(11, 89); b = u.rand(2, 9); if (op === '+' ? (a % 10) + b < 10 : (a % 10) >= b) continue; }
      else { a = u.rand(21, 89); b = u.rand(11, 69); }
      if (op === '-' && b > a) { var t = a; a = b; b = t; }
      ans = op === '+' ? a + b : a - b;
    } while (!ans || ans > 100 || ans < 0 || a === b);
    var hints = [kind === 'ZEEu' ? hintBridge(a, b, op) : hintSplit(a, b, op), hintBlocks(a, b, op)];
    return make(a, op, b, ans, level, p, { hints: hints });
  }

  function einmaleins(level, frac, p, onlyCore) {
    var rows = onlyCore ? (frac < 0.5 ? [2, 10, 5] : [1, 2, 5, 10, 3, 4]) : [2, 3, 4, 5, 6, 7, 8, 9, 10];
    var a = u.pick(rows), b = u.rand(1, 10);
    if (Math.random() < 0.5) { var t = a; a = b; b = t; }
    var r = Math.random();
    if (!onlyCore && r < 0.3) {
      // Geteilt
      var prod = a * b;
      return make(prod, '/', a, b, level, p, { hints: [{ text: 'Denke an die Malaufgabe: Wie oft passt ' + a + ' in ' + prod + '? ? · ' + a + ' = ' + prod }].concat(hintMul(a, b).slice(1)) });
    }
    if (!onlyCore && r < 0.45 && level >= 7) {
      // Platzhalter
      return make(a, '*', b, b, level, p, { display: a + ' · ? = ' + (a * b), say: a + ' mal wie viel ist ' + (a * b) + '?', kind: 'platz',
        hints: [{ text: 'Zähle in ' + a + 'er-Schritten bis ' + (a * b) + '. Wie viele Schritte?' }] });
    }
    return make(a, '*', b, a * b, level, p, { hints: hintMul(a, b) });
  }

  function bis1000(level, frac, p) {
    var op = Math.random() < 0.55 ? '+' : '-';
    var a, b, kind = frac < 0.33 ? 'H' : frac < 0.66 ? 'Z' : 'HZE';
    do {
      if (kind === 'H') { a = u.rand(1, 9) * 100; b = u.rand(1, 9) * 100; if (Math.random() < 0.5) { a += u.rand(1, 9) * 10; } }
      else if (kind === 'Z') { a = u.rand(100, 950); b = u.rand(1, 9) * 10; }
      else { a = u.rand(120, 900); b = u.rand(11, 399); }
      if (op === '-' && b > a) { var t = a; a = b; b = t; }
    } while ((op === '+' ? a + b : a - b) > 1000 || a === b);
    var ans = op === '+' ? a + b : a - b;
    return make(a, op, b, ans, level, p, { hints: [{ text: 'Rechne Stelle für Stelle: erst Hunderter, dann Zehner, dann Einer.', el: function () { return h('div', { class: 'stack' }, ui.placeTable(a), ui.placeTable(b)); } }, hintSplit(a, b, op)] });
  }

  var NAMES = ['Lena', 'Max', 'Ali', 'Mia', 'Ben', 'Sara', 'Tom', 'Emma', 'Leo', 'Anna'];
  var THINGS = [['Murmeln', '🔵'], ['Äpfel', '🍎'], ['Sticker', '⭐'], ['Bonbons', '🍬'], ['Stifte', '✏️'], ['Muscheln', '🐚']];

  function sachaufgabe(level, frac, p) {
    var n = u.pick(NAMES), th = u.pick(THINGS), a, b, text, ans, op;
    var kind = u.pick(frac < 0.5 ? ['plus', 'minus'] : ['plus', 'minus', 'mal', 'geteilt']);
    if (kind === 'plus') { a = u.rand(5, 50); b = u.rand(3, 40); ans = a + b; op = '+'; text = n + ' hat ' + a + ' ' + th[0] + '. Dann bekommt ' + (n === 'Max' || n === 'Ben' || n === 'Tom' || n === 'Ali' || n === 'Leo' ? 'er' : 'sie') + ' noch ' + b + ' dazu. Wie viele ' + th[0] + ' sind es jetzt?'; }
    else if (kind === 'minus') { a = u.rand(20, 90); b = u.rand(3, a - 5); ans = a - b; op = '-'; text = n + ' hat ' + a + ' ' + th[0] + '. ' + b + ' davon verschenkt ' + (/^(Max|Ben|Tom|Ali|Leo)$/.test(n) ? 'er' : 'sie') + '. Wie viele ' + th[0] + ' bleiben übrig?'; }
    else if (kind === 'mal') { a = u.rand(2, 9); b = u.rand(2, 9); ans = a * b; op = '*'; text = 'In einer Tüte sind ' + b + ' ' + th[0] + '. ' + n + ' kauft ' + a + ' Tüten. Wie viele ' + th[0] + ' sind das?'; }
    else { b = u.rand(2, 6); ans = u.rand(2, 9); a = ans * b; op = '/'; text = n + ' verteilt ' + a + ' ' + th[0] + ' gerecht an ' + b + ' Kinder. Wie viele bekommt jedes Kind?'; }
    var opSym = { '+': '+', '-': '−', '*': '·', '/': ':' }[op];
    return {
      type: p.settings.choiceMath ? 'choice' : 'number', instr: 'Lies (oder hör) die Rechengeschichte.', say: text, readAll: true, manualNext: true,
      stim: function () { return h('div', { class: 'textbox' }, h('div', { class: 'emoji lg' }, th[1]), ui.text(text)); },
      answer: ans,
      options: p.settings.choiceMath ? numOptions(ans, nOpt(p, 4), 5).map(function (x) { return { kind: 'num', label: String(x), correct: x === ans }; }) : null,
      hints: [{ text: 'Was weißt du? Welche Zahlen kommen vor? Kommt etwas dazu, geht etwas weg, oder wird verteilt?' },
        { text: 'Die Rechnung heißt: ' + (op === '/' ? a + ' : ' + b : op === '*' ? a + ' · ' + b : a + ' ' + opSym + ' ' + b) }],
      solution: (op === '/' ? a + ' : ' + b : op === '*' ? a + ' · ' + b : a + ' ' + opSym + ' ' + b) + ' = ' + ans,
      review: null
    };
  }

  function bis1000mul(level, frac, p) {
    var r = Math.random();
    var a, b;
    if (r < 0.35) { a = u.rand(2, 9); b = u.rand(2, 9) * 10; return make(a, '*', b, a * b, level, p, { hints: [{ text: a + ' · ' + (b / 10) + ' = ' + (a * b / 10) + ', also ' + a + ' · ' + b + ' = ? (zehnmal so viel)' }] }); }
    if (r < 0.65) { a = u.rand(12, 49); b = u.rand(2, 6); if (a * b > 1000) a = 20;
      var Z = Math.floor(a / 10) * 10, E = a % 10;
      return make(a, '*', b, a * b, level, p, { hints: [{ text: 'Zerlege: ' + Z + ' · ' + b + ' = ' + (Z * b) + ' und ' + E + ' · ' + b + ' = ' + (E * b) + '. Dann zusammenzählen.' }] }); }
    b = u.rand(2, 9); var q = u.rand(11, 40); a = q * b;
    var qZ = Math.floor(q / 10) * 10;
    return make(a, '/', b, q, level, p, { hints: [{ text: 'Zerlege ' + a + ' in ' + (qZ * b) + ' und ' + (a - qZ * b) + '. Teile beide durch ' + b + '.' }] });
  }

  function million(level, frac, p) {
    var r = Math.random(), a, b;
    if (r < 0.3) {
      a = u.rand(1000, 9999); var t = Math.round(a / 100) * 100;
      return make(a, 'r', 100, t, level, p, { display: a + ' gerundet auf Hunderter = ?', say: 'Runde ' + a + ' auf Hunderter.', kind: 'runden',
        hints: [{ text: 'Schau auf die Zehnerstelle: Ist sie 5 oder größer, wird aufgerundet.' }] });
    }
    if (r < 0.65) {
      var op = Math.random() < 0.5 ? '+' : '-';
      a = u.rand(1200, 8999); b = u.rand(150, 2999);
      if (op === '-' && b > a) { var tt = a; a = b; b = tt; }
      return make(a, op, b, op === '+' ? a + b : a - b, level, p, { hints: [{ text: 'Schreibe die Zahlen untereinander (schriftlich) und rechne von rechts nach links: Einer, Zehner, Hunderter, Tausender.' }] });
    }
    a = u.rand(102, 999); b = u.rand(2, 9);
    return make(a, '*', b, a * b, level, p, { hints: [{ text: 'Zerlege: ' + Math.floor(a / 100) * 100 + ' · ' + b + ', ' + (Math.floor(a / 10) % 10) * 10 + ' · ' + b + ' und ' + (a % 10) + ' · ' + b + '. Dann alles addieren.' }] });
  }

  function generate(level, frac, p) {
    switch (level) {
      case 1: return mengen(level, frac, p);
      case 2: return Math.random() < 0.8 ? bis10(level, frac, p) : mengen(level, 1, p);
      case 3: return Math.random() < 0.85 ? bis20ohne(level, frac, p) : bis10(level, 1, p);
      case 4: return Math.random() < 0.75 ? bis20mit(level, frac, p) : bis20ohne(level, frac, p);
      case 5: return Math.random() < 0.85 ? bis100(level, frac, p) : bis20mit(level, frac, p);
      case 6: return Math.random() < 0.7 ? einmaleins(level, frac, p, true) : bis100(level, frac, p);
      case 7: return Math.random() < 0.75 ? einmaleins(level, frac, p, false) : bis100(level, 0.8, p);
      case 8: return Math.random() < 0.7 ? bis1000(level, frac, p) : einmaleins(level, 0.8, p, false);
      case 9: return Math.random() < 0.6 ? sachaufgabe(level, frac, p) : bis1000(level, frac, p);
      case 10: var r = Math.random(); return r < 0.45 ? bis1000mul(level, frac, p) : r < 0.7 ? bis1000(level, 0.9, p) : sachaufgabe(level, 0.9, p);
      default: return Math.random() < 0.7 ? million(level, frac, p) : bis1000mul(level, frac, p);
    }
  }

  function fromReview(spec, level, p) {
    if (spec.g === 'mengen') return mengen(level, 1, p);
    if (spec.g !== 'arith') return null;
    var a = spec.a, b = spec.b, op = spec.op, ans, hints = [], extra = {};
    if (op === '+') ans = a + b; else if (op === '-') ans = a - b;
    else if (op === '*') ans = spec.k === 'platz' ? b : a * b;
    else if (op === '/') ans = a / b;
    else if (op === 'r') ans = Math.round(a / 100) * 100;
    if (spec.d) { extra.display = spec.d; extra.kind = spec.k; }
    if (op === '+' || op === '-') {
      if (a <= 10 && b <= 10 && a + b <= 10) hints = [hintDots(a, b, op)];
      else if (a <= 20 && b < 10) hints = [hintBridge(a, b, op), hintDots(a, b, op)];
      else if (a <= 100) hints = [hintSplit(a, b, op), hintBlocks(a, b, op)];
      else hints = [hintSplit(a, b, op)];
    } else if (op === '*' && b <= 10 && a <= 10 && spec.k !== 'platz') hints = hintMul(a, b);
    extra.hints = hints;
    return make(a, op, b, ans, spec.l || level, p, extra);
  }

  LA.tasks.rechnen = { generate: generate, fromReview: fromReview,
    levels: ['Mengen bis 10 erfassen', 'Plus & Minus bis 10', 'Bis 20 ohne Zehnerübergang', 'Bis 20 mit Zehnerübergang', 'Zahlraum bis 100',
      'Einmaleins: Kernaufgaben', 'Einmaleins & Geteilt', 'Zahlraum bis 1000', 'Sachaufgaben', 'Mal & Geteilt bis 1000', 'Große Zahlen & schriftlich'],
    grades: ['1', '1', '1', '1', '2', '2', '2', '3', '2–3', '3', '4'] };
})(window.LA);
