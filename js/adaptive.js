/* Selbstregulierende Schwierigkeit
   Ziel: ca. 75–80 % Aufgaben im ersten Versuch richtig ("Zone der nächsten Entwicklung").
   Jedes Fach hat einen kontinuierlichen Fähigkeitswert (skill). Die Stufe steigt, wenn skill
   die nächste ganze Zahl erreicht, und sinkt erst mit Puffer (Hysterese), damit es nicht "flattert". */
(function (LA) {
  'use strict';
  var u = LA.u;

  var STEP = { perfect: 0.15, helped: -0.32, solved: -0.55 };
  var POINTS = { perfect: 10, helped: 6, solved: 3 };
  var REVIEW_DAYS = [1, 3, 7];

  function levelOf(s) {
    if (typeof s.level !== 'number') s.level = Math.max(1, Math.floor(s.skill));
    return s.level;
  }

  function frac(s) { return u.clamp(s.skill - levelOf(s), 0, 0.99); }

  function record(profile, subject, quality, reviewSpec, isReview) {
    var s = profile.subjects[subject];
    var max = LA.store.SUBJECTS[subject].max;
    var oldLevel = levelOf(s);
    s.tasks++;
    s.history.push({ q: quality, l: oldLevel, t: Date.now() });
    if (s.history.length > 40) s.history.shift();

    var d = STEP[quality];
    // Einstufungsphase: die ersten Aufgaben bewegen sich schneller nach oben
    if (s.tasks <= 8 && quality === 'perfect') d *= 3;
    // Serie von 3 perfekten Antworten: kleiner Extraschub
    var last = s.history.slice(-3);
    if (last.length === 3 && last.every(function (x) { return x.q === 'perfect'; })) d += 0.05;

    if (!isReview || quality !== 'perfect') s.skill = u.clamp(s.skill + d, 1, max + 0.99);

    var res = { levelUp: false, levelDown: false };
    if (s.skill >= oldLevel + 1 && oldLevel < max) {
      s.level = oldLevel + 1; s.skill = s.level + 0.05; res.levelUp = true;
    } else if (s.skill < oldLevel - 0.35 && oldLevel > 1) {
      s.level = oldLevel - 1; s.skill = s.level + 0.6; res.levelDown = true;
    }
    if (s.level > (s.best || 1)) s.best = s.level;

    // Wiederholung (verteiltes Üben): Fehler kommen später wieder
    if (reviewSpec) {
      var key = JSON.stringify(reviewSpec);
      var entry = s.review.filter(function (r) { return r.key === key; })[0];
      if (quality !== 'perfect') {
        if (!entry) { entry = { key: key, spec: reviewSpec, box: 0 }; s.review.push(entry); }
        entry.box = 0; entry.dueTask = s.tasks + u.rand(3, 5); entry.dueDate = null;
      } else if (entry) {
        entry.box++;
        if (entry.box > REVIEW_DAYS.length) s.review.splice(s.review.indexOf(entry), 1);
        else {
          var dt = new Date(); dt.setDate(dt.getDate() + REVIEW_DAYS[entry.box - 1]);
          entry.dueDate = u.todayStr(dt); entry.dueTask = null;
        }
      }
      if (s.review.length > 40) s.review.shift();
    }
    return res;
  }

  function dueReview(profile, subject) {
    var s = profile.subjects[subject], today = u.todayStr();
    var due = s.review.filter(function (r) {
      return (r.dueTask && s.tasks >= r.dueTask) || (r.dueDate && r.dueDate <= today);
    });
    return due.length ? due[0] : null;
  }

  // Trefferquote (erster Versuch) der letzten n Aufgaben
  function accuracy(s, n) {
    var h = s.history.slice(-(n || 20));
    if (!h.length) return null;
    return h.filter(function (x) { return x.q === 'perfect'; }).length / h.length;
  }

  LA.adapt = { record: record, levelOf: levelOf, frac: frac, dueReview: dueReview, accuracy: accuracy, POINTS: POINTS };
})(window.LA);
