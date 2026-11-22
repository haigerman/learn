/* Vorlesen mit der Sprachausgabe des Browsers (Web Speech API) */
(function (LA) {
  'use strict';
  var synth = window.speechSynthesis;
  var voices = [];
  var settings = { voiceName: '', rate: 0.85 };

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(function (v) { return /^de/i.test(v.lang); });
  }
  if (synth) {
    loadVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = loadVoices;
  }

  // Bevorzugt natürliche Stimmen (Edge "Natural", Google Deutsch)
  function bestVoice() {
    if (!voices.length) loadVoices();
    if (settings.voiceName) {
      var chosen = voices.filter(function (v) { return v.name === settings.voiceName; })[0];
      if (chosen) return chosen;
    }
    var prefs = [/natural/i, /online/i, /google/i, /katja|conrad|amala|seraphina|florian/i, /anna|petra|markus|yannick/i];
    for (var i = 0; i < prefs.length; i++) {
      var m = voices.filter(function (v) { return prefs[i].test(v.name) && /de-DE/i.test(v.lang); })[0];
      if (m) return m;
    }
    return voices.filter(function (v) { return /de-DE/i.test(v.lang); })[0] || voices[0] || null;
  }

  // Ein paar Ausspracheregeln für die Sprachausgabe
  function prepare(text) {
    return String(text)
      .replace(/_{2,}/g, ' … ')
      .replace(/(\d)\s*·\s*(\d)/g, '$1 mal $2')
      .replace(/(\d)\s*×\s*(\d)/g, '$1 mal $2')
      .replace(/(\d)\s*:\s*(\d)/g, '$1 geteilt durch $2')
      .replace(/(\d)\s*−\s*(\d)/g, '$1 minus $2')
      .replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2')
      .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
      .replace(/\?\s*=/g, ' wie viel ist ');
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!synth || !text) { if (opts.onend) opts.onend(); return; }
    if (!opts.queue) synth.cancel();
    var u = new SpeechSynthesisUtterance(prepare(text));
    var v = bestVoice();
    if (v) u.voice = v;
    u.lang = 'de-DE';
    u.rate = (opts.rate || 1) * settings.rate;
    u.pitch = 1.05;
    if (opts.onend) u.onend = opts.onend;
    synth.speak(u);
  }

  function stop() { if (synth) synth.cancel(); }

  LA.speech = {
    available: !!synth,
    speak: speak,
    stop: stop,
    voices: function () { loadVoices(); return voices; },
    configure: function (s) { Object.assign(settings, s || {}); },
    settings: settings
  };
})(window.LA);
