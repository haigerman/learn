/* Lern-Abenteuer – Hilfsfunktionen */
window.LA = window.LA || {};

(function (LA) {
  'use strict';

  // Element-Helfer: h('div', {class:'x', onclick:fn}, 'Text', child, ...)
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pickN(arr, n, exclude) {
    var pool = arr.filter(function (x) { return !exclude || exclude.indexOf(x) < 0; });
    return shuffle(pool).slice(0, n);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  // Zahlen ohne Tausenderpunkt-Verwirrung bis 9999, danach mit Leerzeichen
  function fmt(n) {
    var s = String(n);
    if (Math.abs(n) < 10000) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // Vergleich zweier Zeichenketten: welche Zeichen der Eingabe passen (LCS)
  function diffChars(input, target) {
    var a = input.split(''), b = target.split('');
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var res = []; i = 0; j = 0;
    while (i < n) {
      if (j < m && a[i] === b[j]) { res.push({ ch: a[i], ok: true }); i++; j++; }
      else if (j < m && dp[i + 1][j] < dp[i][j + 1]) { j++; }
      else { res.push({ ch: a[i], ok: false }); i++; }
    }
    return { parts: res, common: dp[0][0], targetLen: m };
  }

  /* ---------- Silbentrennung (Heuristik für Sätze) ---------- */
  var VOWEL_UNITS = ['äu', 'eu', 'ei', 'ai', 'au', 'ie', 'aa', 'ee', 'oo', 'ey', 'ay'];
  var CONS_UNITS = ['sch', 'ch', 'ck', 'ph', 'qu', 'th'];
  var VOWELS = 'aeiouäöüy';
  var ONSETS = ['bl', 'br', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kn', 'kr', 'pl', 'pr', 'tr', 'zw',
    'schl', 'schm', 'schn', 'schr', 'schw', 'schl', 'pfl', 'pfr', 'spr', 'str'];
  var syllableDict = {};

  function registerSyllables(list) {
    list.forEach(function (s) {
      var parts = s.split('-');
      syllableDict[parts.join('').toLowerCase()] = parts.map(function (p) { return p.length; });
    });
  }

  function syllabify(word) {
    var lower = word.toLowerCase();
    if (syllableDict[lower]) {
      var lens = syllableDict[lower], out = [], pos = 0;
      lens.forEach(function (l) { out.push(word.substr(pos, l)); pos += l; });
      return out;
    }
    // In Einheiten zerlegen
    var units = [], i = 0;
    outer: while (i < lower.length) {
      var k;
      for (k = 0; k < VOWEL_UNITS.length; k++) {
        if (lower.substr(i, VOWEL_UNITS[k].length) === VOWEL_UNITS[k]) {
          units.push({ s: VOWEL_UNITS[k], v: true }); i += VOWEL_UNITS[k].length; continue outer;
        }
      }
      for (k = 0; k < CONS_UNITS.length; k++) {
        if (lower.substr(i, CONS_UNITS[k].length) === CONS_UNITS[k]) {
          units.push({ s: CONS_UNITS[k], v: false }); i += CONS_UNITS[k].length; continue outer;
        }
      }
      units.push({ s: lower[i], v: VOWELS.indexOf(lower[i]) >= 0 }); i++;
    }
    var nuclei = [];
    units.forEach(function (u, idx) { if (u.v) nuclei.push(idx); });
    if (nuclei.length < 2) return [word];
    var cuts = []; // Einheiten-Index, vor dem getrennt wird
    for (var n = 0; n < nuclei.length - 1; n++) {
      var a = nuclei[n], b = nuclei[n + 1];
      var cons = b - a - 1;
      if (cons === 0) cuts.push(b);
      else if (cons === 1) cuts.push(b - 1);
      else {
        var two = units[b - 2].s + units[b - 1].s;
        cuts.push(ONSETS.indexOf(two) >= 0 ? b - 2 : b - 1);
      }
    }
    // Einheiten-Index in Zeichenposition umrechnen
    var charPos = [], p = 0;
    units.forEach(function (u) { charPos.push(p); p += u.s.length; });
    var res = [], last = 0;
    cuts.forEach(function (c) { res.push(word.slice(last, charPos[c])); last = charPos[c]; });
    res.push(word.slice(last));
    return res.filter(function (x) { return x.length; });
  }

  LA.u = {
    h: h, rand: rand, pick: pick, shuffle: shuffle, pickN: pickN, clamp: clamp,
    todayStr: todayStr, daysBetween: daysBetween, fmt: fmt, diffChars: diffChars,
    syllabify: syllabify, registerSyllables: registerSyllables
  };
})(window.LA);
