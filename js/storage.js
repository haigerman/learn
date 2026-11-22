/* Speicherung im Browser (localStorage) – nichts verlässt den Rechner */
(function (LA) {
  'use strict';
  var KEY = 'lernabenteuer.v1';
  var u = LA.u;

  var SUBJECTS = {
    lesen: { name: 'Lesen', icon: '📖', color: '#4d96ff', max: 7 },
    schreiben: { name: 'Schreiben', icon: '✏️', color: '#c77dff', max: 7 },
    rechnen: { name: 'Rechnen', icon: '🔢', color: '#ff9f43', max: 11 }
  };

  var PRESETS = {
    viel: {
      label: 'Viel Unterstützung',
      desc: 'Alles wird vorgelesen, wenige Antwortmöglichkeiten, Bilder und Rechenhilfen sofort sichtbar, kleinere Schritte.',
      settings: { autoRead: true, syllables: true, bigText: true, spacing: true, fewOptions: true, choiceMath: true,
        visualAids: true, goal: 60, pauseMin: 10 },
      levels: { lesen: 2, schreiben: 2, rechnen: 2 }
    },
    lrs: {
      label: 'Lese-/Rechtschreib-Unterstützung',
      desc: 'Anweisungen werden vorgelesen, Silben farbig, großer Buchstabenabstand. Rechnen normal.',
      settings: { autoRead: true, syllables: true, bigText: true, spacing: true, fewOptions: false, choiceMath: false,
        visualAids: false, goal: 100, pauseMin: 15 },
      levels: { lesen: 3, schreiben: 3, rechnen: 5 }
    },
    standard: {
      label: 'Standard',
      desc: 'Ausgewogene Einstellungen.',
      settings: { autoRead: false, syllables: true, bigText: false, spacing: false, fewOptions: false, choiceMath: false,
        visualAids: false, goal: 100, pauseMin: 20 },
      levels: { lesen: 4, schreiben: 4, rechnen: 4 }
    }
  };

  var state = null;

  function defaultState() {
    return { version: 1, profiles: [], parent: { pin: '' }, speech: { voiceName: '', rate: 0.85 }, sound: true };
  }

  function load() {
    try {
      state = JSON.parse(localStorage.getItem(KEY)) || defaultState();
    } catch (e) { state = defaultState(); }
    if (!state.profiles) state.profiles = [];
    state.profiles.forEach(migrateProfile);
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Speichern fehlgeschlagen', e); }
  }

  function newProfile(name, avatar, presetKey) {
    var pr = PRESETS[presetKey] || PRESETS.standard;
    var p = {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name, avatar: avatar, preset: presetKey,
      settings: Object.assign({ goalMode: 'day' }, pr.settings),
      subjects: {},
      days: {},
      stickers: [],
      customWords: [],
      wordStats: {},
      created: u.todayStr()
    };
    Object.keys(SUBJECTS).forEach(function (s) {
      p.subjects[s] = { skill: pr.levels[s] + 0.0, best: pr.levels[s], tasks: 0, history: [], review: [] };
    });
    return p;
  }

  function migrateProfile(p) {
    Object.keys(SUBJECTS).forEach(function (s) {
      if (!p.subjects[s]) p.subjects[s] = { skill: 1, best: 1, tasks: 0, history: [], review: [] };
      if (!p.subjects[s].review) p.subjects[s].review = [];
    });
    p.customWords = p.customWords || [];
    p.wordStats = p.wordStats || {};
    p.stickers = p.stickers || [];
    p.settings = Object.assign({ goalMode: 'day', sound: true }, p.settings);
  }

  function day(p, date) {
    date = date || u.todayStr();
    if (!p.days[date]) p.days[date] = { points: 0, tasks: 0, first: 0, minutes: 0, goal: false, stickers: 0, subj: {} };
    return p.days[date];
  }

  function exportJSON() { return JSON.stringify(state, null, 1); }
  function importJSON(txt) {
    var s = JSON.parse(txt);
    if (!s || !Array.isArray(s.profiles)) throw new Error('Ungültige Datei');
    state = s; state.profiles.forEach(migrateProfile); save();
  }
  function reset() { state = defaultState(); save(); }

  LA.store = {
    SUBJECTS: SUBJECTS, PRESETS: PRESETS,
    load: load, save: save, get: function () { return state; },
    newProfile: newProfile, day: day,
    profile: function (id) { return state.profiles.filter(function (p) { return p.id === id; })[0]; },
    exportJSON: exportJSON, importJSON: importJSON, reset: reset
  };
})(window.LA);
