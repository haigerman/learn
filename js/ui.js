/* Darstellungs-Bausteine: Silbenwörter, Punktefelder, Zehnersystem-Material */
(function (LA) {
  'use strict';
  var h = LA.u.h;

  function opts() { return (LA.app && LA.app.profile && LA.app.profile.settings) || {}; }

  // Wort in farbigen Silben (blau/rot wie in der Silbenmethode) mit Silbenbögen
  function word(w, syl, extraClass) {
    syl = syl || LA.u.syllabify(w);
    var useSyl = opts().syllables !== false;
    var el = h('span', { class: 'word' + (extraClass ? ' ' + extraClass : '') });
    if (!useSyl || syl.length < 2) {
      el.appendChild(h('span', { class: useSyl ? 'syl syl-a' : 'syl' }, w));
      return el;
    }
    syl.forEach(function (s, i) { el.appendChild(h('span', { class: 'syl ' + (i % 2 ? 'syl-b' : 'syl-a') }, s)); });
    return el;
  }

  // Satz/Text: jedes Wort in Silben
  function text(t, extraClass) {
    var el = h('p', { class: 'reading ' + (extraClass || '') });
    t.split(/(\s+)/).forEach(function (tok) {
      if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(' ')); return; }
      var m = tok.match(/^([^A-Za-zÄÖÜäöüß_]*)([A-Za-zÄÖÜäöüß]+|_+)([^A-Za-zÄÖÜäöüß_]*)$/);
      if (!m) { el.appendChild(document.createTextNode(tok)); return; }
      if (m[1]) el.appendChild(document.createTextNode(m[1]));
      if (/^_+$/.test(m[2])) el.appendChild(h('span', { class: 'gap' }, ' '));
      else el.appendChild(word(m[2]));
      if (m[3]) el.appendChild(document.createTextNode(m[3]));
    });
    return el;
  }

  function emoji(e, size) { return h('div', { class: 'emoji ' + (size || 'xl') }, e); }

  // Zehnerfeld(er): Liste von Farben pro Punkt, z. B. ['a','a','b'] ; 'x' = durchgestrichen
  function frames(dots, perFrame) {
    perFrame = perFrame || 10;
    var wrap = h('div', { class: 'frames' });
    var n = Math.max(dots.length, 1);
    var count = Math.ceil(n / perFrame);
    for (var f = 0; f < count; f++) {
      var fr = h('div', { class: 'frame' });
      for (var i = 0; i < perFrame; i++) {
        var d = dots[f * perFrame + i];
        fr.appendChild(h('span', { class: 'cell' }, d ? h('span', { class: 'dot dot-' + d }) : null));
      }
      wrap.appendChild(fr);
    }
    return wrap;
  }

  function dotsFor(a, b, op) {
    var arr = [], i;
    if (op === '+') { for (i = 0; i < a; i++) arr.push('a'); for (i = 0; i < b; i++) arr.push('b'); }
    else { for (i = 0; i < a; i++) arr.push(i >= a - b ? 'x' : 'a'); }
    return frames(arr);
  }

  // Würfelbild / strukturierte Menge
  function quantity(n) {
    var arr = []; for (var i = 0; i < n; i++) arr.push('a');
    return frames(arr);
  }

  // Hunderter (Platte), Zehner (Stange), Einer (Würfel)
  function blocks(n, color) {
    var wrap = h('div', { class: 'blocks' + (color ? ' blocks-' + color : '') });
    var H = Math.floor(n / 100), Z = Math.floor((n % 100) / 10), E = n % 10;
    for (var i = 0; i < H; i++) {
      var plate = h('span', { class: 'plate' });
      for (var k = 0; k < 100; k++) plate.appendChild(h('i'));
      wrap.appendChild(plate);
    }
    for (i = 0; i < Z; i++) wrap.appendChild(h('span', { class: 'rod' }, Array.apply(null, Array(10)).map(function () { return h('i'); })));
    var ones = h('span', { class: 'ones' });
    for (i = 0; i < E; i++) ones.appendChild(h('i'));
    if (E) wrap.appendChild(ones);
    return wrap;
  }

  function placeTable(n) {
    var s = String(n), cols = ['T', 'H', 'Z', 'E'].slice(4 - Math.max(2, s.length));
    var pad = s.padStart(cols.length, ' ');
    return h('table', { class: 'place' },
      h('tr', null, cols.map(function (c) { return h('th', null, c); })),
      h('tr', null, pad.split('').map(function (c) { return h('td', null, c.trim()); })));
  }

  // Punktefeld für Malaufgaben: rows × cols
  function array(rows, cols) {
    var g = h('div', { class: 'array', style: { gridTemplateColumns: 'repeat(' + cols + ', 1fr)' } });
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      g.appendChild(h('span', { class: 'dot ' + (r % 2 ? 'dot-b' : 'dot-a') + (c === 4 && cols > 5 ? ' gap5' : '') }));
    }
    return g;
  }

  function claps(n) {
    return h('div', { class: 'claps' }, Array.apply(null, Array(n)).map(function () { return h('span', null, '👏'); }));
  }

  LA.ui = { word: word, text: text, emoji: emoji, frames: frames, dotsFor: dotsFor, quantity: quantity,
    blocks: blocks, placeTable: placeTable, array: array, claps: claps };
})(window.LA);
