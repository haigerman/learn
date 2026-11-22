# 🌟 Lern-Abenteuer

Eine motivierende Lern-App für **Lesen, Schreiben und Rechnen** für Grundschulkinder und Kinder mit
Förderbedarf. Sie läuft im Browser am PC, passt die Schwierigkeit selbst an, liest vor und belohnt
mit Tageszielen und Sammelbildern.

- **Kein Server-Programm nötig:** nur HTML, CSS und JavaScript, keine Datenbank, kein PHP, kein Build-Schritt.
- **Datenschutz:** Alle Daten bleiben im Browser des PCs (`localStorage`). Es gibt keine Anmeldung, kein Tracking
  und keine externen Abrufe. Die Schrift ist lokal eingebunden.
- **Für mehrere Kinder:** Jedes Kind hat ein eigenes Profil mit eigenen Einstellungen, Stufen und Sammelbildern.

---

## Starten und veröffentlichen

### Variante A: Auf dem eigenen Webserver
1. Den kompletten Ordner (`index.html`, `css/`, `js/`, `fonts/`) per FTP/SFTP in ein Verzeichnis auf dem Webserver kopieren,
   z. B. `https://ihre-domain.de/lernen/`.
2. Die Adresse im Browser öffnen (am besten Microsoft Edge oder Google Chrome wegen der guten deutschen Vorlese-Stimmen).
3. Beim ersten Start die Kinder anlegen. Fertig.

Ein normaler Webspace genügt. Empfohlen wird HTTPS. Wenn die App nicht öffentlich auffindbar sein soll, kann das
Verzeichnis per `.htaccess`-Passwort geschützt werden.

### Variante B: Ganz ohne Server
`index.html` per Doppelklick öffnen. Das funktioniert genauso, der Spielstand wird dann im Browser für diese Datei gespeichert.

### Variante C: Kostenlos bei GitHub Pages
Im Repository unter *Settings → Pages → Build and deployment* die Quelle „Deploy from a branch“, den Branch und den Ordner `/ (root)`
wählen. Nach etwa einer Minute ist die App unter `https://<benutzername>.github.io/<repo>/` erreichbar.
(Beim kostenlosen GitHub-Konto geht das nur bei öffentlichen Repositories. Das ist unproblematisch, weil im Code keine
persönlichen Daten stehen: Namen und Fortschritte liegen nur im Browser.)

> **Wichtig:** Der Fortschritt wird pro Browser und PC gespeichert. Wenn die Kinder an verschiedenen Geräten üben,
> hat jedes Gerät einen eigenen Stand. Im Elternbereich unter „Daten“ kann man eine Sicherung herunterladen und auf
> einem anderen Gerät einspielen. Wer den Browserverlauf **inklusive Websitedaten** löscht, löscht auch den Spielstand.

---

## Bedienung

| Bereich | Was passiert |
|---|---|
| **Wer lernt heute?** | Das Kind wählt sein Profil (Figur und Name). |
| **Fächerauswahl** | Lesen 📖, Schreiben ✏️ oder Rechnen 🔢 – mit Stufe, Sternen und dem Tagesziel-Balken. |
| **Aufgaben** | 🔊 liest vor, 💡 gibt Hilfe. Bei Auswahlaufgaben gehen die Tasten 1–4, bei Zahlen die Zifferntasten und Enter. |
| **Ziel erreicht** | Konfetti, ein neues Sammelbild (höchstens 3 pro Tag) und die Wahl „Weiter üben“ oder „Fertig für heute“. |
| **⚙️ Eltern** (unten rechts) | Geschützt durch eine Rechenaufgabe oder eine PIN. Dort gibt es Fortschritt, Einstellungen, Lernwörter, Stimme und Datensicherung. |

### Startprofile (jederzeit änderbar)
- **Viel Unterstützung:** Alles wird vorgelesen, nur 3 Antworten zur Auswahl, Rechnen per Auswahl, Anschauungsmaterial
  (Punkte, Zehnerstangen) sofort sichtbar, Ziel 60 Punkte, Pausen-Erinnerung alle 10 Minuten.
- **Lese-/Rechtschreib-Unterstützung:** Anweisungen werden vorgelesen, Silben farbig, großer Buchstaben- und Wortabstand,
  Rechnen normal (startet bei Stufe 5).
- **Standard:** ausgewogene Einstellungen.

Die Startstufen sind nur ein Ausgangspunkt. In den ersten 8 Aufgaben je Fach stuft sich die App schneller ein.

### Eigene Lernwörter
Im Elternbereich unter **Lernwörter** kann man die aktuellen Wörter aus der Schule eintragen, mit Silbentrennung und
optional einem Beispielsatz für das Diktat:
```
Schu-le | Ich gehe gern in die Schule.
fröh-lich | Das Kind ist fröhlich.
```

---

## Aufbau der Stufen und Bezug zum LehrplanPLUS Bayern

Die Inhalte orientieren sich am **LehrplanPLUS Grundschule Bayern**: Deutsch mit den Lernbereichen
„Lesen – mit Texten und weiteren Medien umgehen“ und „Richtig schreiben“ (Grundwortschatz, Rechtschreibstrategien),
Mathematik mit dem Lernbereich „Zahlen und Operationen“.

| Stufe | 📖 Lesen | ✏️ Schreiben | 🔢 Rechnen |
|---|---|---|---|
| 1 | Anlaute hören | Anlaute & fehlende Buchstaben | Mengen bis 10 strukturiert erfassen (Jgst. 1) |
| 2 | Silben klatschen, Reime | Wörter aus Silben bauen | Plus/Minus bis 10 mit Zehnerfeld (1) |
| 3 | Kurze Wörter lesen (Silbenfarben) | Lautgetreue Wörter aus Buchstaben bauen | Bis 20 ohne Zehnerübergang, Verdoppeln (1) |
| 4 | Längere und ähnliche Wörter genau lesen | Mitsprechwörter tippen | Bis 20 mit Zehnerübergang (1) |
| 5 | Sätze verstehen (Ja/Nein, Lückensätze) | Rechtschreibstrategien (Verlängern, Doppelkonsonant, ck/tz, ie, Dehnungs-h …) | Zahlraum bis 100 (2) |
| 6 | Kurze Texte: Informationen finden | Lernwörter/Grundwortschatz, Nomen groß | Einmaleins: Kernaufgaben ×1, 2, 5, 10 (2) |
| 7 | Kurze Texte: Schlussfolgern | Kurze Sätze schreiben (Diktat) | Ganzes Einmaleins, Geteilt, Platzhalter (2) |
| 8 | | | Zahlraum bis 1000 (3) |
| 9 | | | Sachaufgaben (2–3) |
| 10 | | | Mal & Geteilt bis 1000, halbschriftlich (3) |
| 11 | | | Große Zahlen, Runden, schriftliche Verfahren (4) |

Die Wortliste beim Schreiben ist **an den bayerischen Grundwortschatz angelehnt**, aber keine amtliche Kopie. Die
verbindlichen Wörter der Klasse trägt man am besten als eigene Lernwörter ein.

---

## Pädagogische und wissenschaftliche Grundlagen

| Prinzip | Umsetzung in der App | Hintergrund (Auswahl) |
|---|---|---|
| **Passende Schwierigkeit** | Fähigkeitswert pro Fach; Ziel ist eine Erfolgsquote von ca. 75–85 % im ersten Versuch. Die Stufe steigt bei Erfolg und sinkt mit Puffer, damit sie nicht hin und her springt. | Wygotski (Zone der nächsten Entwicklung); Wilson et al. (2019), *Nature Communications*: „Eighty-Five Percent Rule“ |
| **Fehlerfreundliches Lernen** | Fehler kosten keine Punkte. Erst kommen gestufte Hilfen, nach dem 3. Versuch die Lösung, die das Kind dann selbst eingibt. | Errorless-Learning-Ansätze in der Förderpädagogik; Hattie & Timperley (2007) zu lernförderlichem Feedback |
| **Verteiltes Wiederholen** | Nicht sofort gelöste Aufgaben kommen nach einigen Aufgaben und dann nach 1, 3 und 7 Tagen wieder. | Cepeda et al. (2006); Dunlosky et al. (2013); Roediger & Karpicke (2006, Testing-Effekt) |
| **Silbenbasiertes Lesen** | Wörter in blau/roten Silben mit Silbenbögen; Hinweise sprechen Silben vor. | Müller et al. (2017), *Frontiers in Psychology*: silbenbasiertes Lesetraining bei schwachen Lesern |
| **Lesbarkeit bei LRS** | Gut lesbare Schrift (Andika, einstöckiges a/g), optional großer Buchstaben- und Wortabstand. Keine „Legasthenie-Schrift“, weil deren Nutzen nicht belegt ist. | Zorzi et al. (2012), *PNAS* (Buchstabenabstand); Wery & Diliberto (2017), Kuster et al. (2018) (keine Vorteile von Dyslexie-Schriften) |
| **Vorlesen** | Alle Anweisungen per Sprachausgabe; Lesetexte werden nicht automatisch vorgelesen, damit das Kind wirklich selbst liest. | Wood et al. (2018), Metaanalyse zu Text-to-Speech bei Leseschwierigkeiten |
| **Rechtschreibstrategien** | Schwingen (Silben), Verlängern (Hund → Hunde), Merkwörter – mit kurzer Erklärung nach jeder Aufgabe. | Strategieorientierte Ansätze wie FRESCH; LehrplanPLUS „Richtig schreiben“ |
| **Rechnen ohne Abzählen** | Zehnerfeld mit Fünferstruktur, Zehnerstangen und Hunderterplatten, Zehnerübergang in Schritten, Einmaleins über Kern- und Nachbaraufgaben. | Fachdidaktik Mathematik (z. B. Gaidoschik zur Ablösung vom zählenden Rechnen) |
| **Motivation** | Wahlfreiheit beim Fach, sichtbarer Fortschritt (Sterne, Balken), Tagesziel, Sammelbilder, Lob für Anstrengung, kein Zeitdruck, kein Vergleich zwischen den Geschwistern. | Selbstbestimmungstheorie (Deci & Ryan); Sailer & Homner (2020), Metaanalyse Gamification; Mueller & Dweck (1998) |
| **Kurze Einheiten und Bewegung** | Pausen-Erinnerung mit Bewegungsaufgabe nach einstellbarer Zeit. | Studien zu aktiven Pausen (z. B. Donnelly & Lambourne, 2011) |
| **Reizarme Gestaltung** | Ruhige Farben, eine Aufgabe pro Bildschirm, große Schaltflächen. | Fisher, Godwin & Seltman (2014): visuelle Überfrachtung lenkt ab |

> Die App ersetzt keine Förderung durch Fachleute (z. B. LRS-Therapie, Lerntherapie, Ergotherapie), kann diese aber gut
> ergänzen. Empfehlung: lieber täglich 10–15 Minuten als selten und lange.

---

## Technik

```
index.html            Einstieg
css/style.css         Gestaltung
fonts/                Schrift Andika (SIL Open Font License 1.1)
js/util.js            Hilfsfunktionen, Silbentrennung
js/speech.js          Vorlesen (Web Speech API)
js/effects.js         Töne, Konfetti
js/data.js            Wortschatz, Sätze, Texte, Sammelbilder
js/storage.js         Profile, Voreinstellungen, Speicherung
js/adaptive.js        Schwierigkeitsanpassung, Wiederholungsplan, Punkte
js/ui.js              Silbenwörter, Zehnerfeld, Zehnerstangen, Punktefelder
js/tasks-*.js         Aufgabengeneratoren je Fach und Stufe
js/render.js          Ablauf einer Aufgabe (Hilfen, Rückmeldung, Eingabe)
js/parent.js          Elternbereich
js/app.js             Bildschirme und Spielablauf
```

**Inhalte erweitern:** Neue Bildwörter kommen in `js/data.js` in die Liste `RAW_WORDS` (Format `"Sil-ben|Emoji|Artikel"`).
Dort stehen auch die Lesetexte (`TEXTS`), Ja/Nein-Fragen, Lückensätze und Diktatsätze.

**Schrift:** Andika © SIL International, lizenziert unter der [SIL Open Font License 1.1](https://openfontlicense.org).
