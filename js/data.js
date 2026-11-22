/* Wortschatz, Sätze und Texte
   Wörter: "Sil-ben|Bild|Artikel"  – Silben sind von Hand getrennt (Silbenmethode). */
(function (LA) {
  'use strict';

  var RAW_WORDS = [
    'Hund|🐕|der', 'Kat-ze|🐈|die', 'Maus|🐭|die', 'Haus|🏠|das', 'Baum|🌳|der', 'Ball|⚽|der',
    'Au-to|🚗|das', 'Son-ne|☀️|die', 'Mond|🌙|der', 'Stern|⭐|der', 'Fisch|🐟|der', 'Vo-gel|🐦|der',
    'En-te|🦆|die', 'I-gel|🦔|der', 'Ap-fel|🍎|der', 'Ba-na-ne|🍌|die', 'Bir-ne|🍐|die',
    'To-ma-te|🍅|die', 'Me-lo-ne|🍉|die', 'Kir-sche|🍒|die', 'Zi-tro-ne|🍋|die', 'Möh-re|🥕|die',
    'Brot|🍞|das', 'Kä-se|🧀|der', 'Ei|🥚|das', 'Eis|🍦|das', 'Tor-te|🎂|die', 'Ku-chen|🍰|der',
    'Piz-za|🍕|die', 'Milch|🥛|die', 'Tas-se|☕|die', 'Lö-we|🦁|der', 'Ti-ger|🐯|der', 'Af-fe|🐒|der',
    'Bär|🐻|der', 'Ha-se|🐰|der', 'Pferd|🐴|das', 'Kuh|🐄|die', 'Schwein|🐷|das', 'Schaf|🐑|das',
    'Zie-ge|🐐|die', 'Bie-ne|🐝|die', 'Schne-cke|🐌|die', 'Frosch|🐸|der', 'Schlan-ge|🐍|die',
    'Kro-ko-dil|🐊|das', 'E-le-fant|🐘|der', 'Gi-raf-fe|🦒|die', 'Ze-bra|🦓|das', 'Pin-gu-in|🐧|der',
    'Eu-le|🦉|die', 'Spin-ne|🕷️|die', 'Wal|🐋|der', 'Del-fin|🐬|der', 'Ok-to-pus|🐙|der',
    'Schmet-ter-ling|🦋|der', 'Rau-pe|🐛|die', 'Blu-me|🌸|die', 'Ro-se|🌹|die', 'Tul-pe|🌷|die',
    'Kak-tus|🌵|der', 'Pilz|🍄|der', 'Blatt|🍃|das', 'Wol-ke|☁️|die', 'Re-gen|🌧️|der',
    'Schnee|❄️|der', 'Blitz|⚡|der', 'Re-gen-bo-gen|🌈|der', 'Feu-er|🔥|das', 'Berg|⛰️|der',
    'In-sel|🏝️|die', 'Schiff|🚢|das', 'Boot|⛵|das', 'Zug|🚂|der', 'Bus|🚌|der', 'Ra-ke-te|🚀|die',
    'Fahr-rad|🚲|das', 'Flug-zeug|✈️|das', 'Trak-tor|🚜|der', 'Am-pel|🚦|die', 'Uhr|⏰|die',
    'Bril-le|👓|die', 'Ho-se|👖|die', 'Schuh|👟|der', 'So-cke|🧦|die', 'Kleid|👗|das',
    'Kro-ne|👑|die', 'Ring|💍|der', 'Hand|✋|die', 'Fuß|🦶|der', 'Ohr|👂|das', 'Na-se|👃|die',
    'Mund|👄|der', 'Zahn|🦷|der', 'Herz|❤️|das', 'Buch|📖|das', 'Stift|✏️|der', 'Sche-re|✂️|die',
    'Brief|✉️|der', 'Tür|🚪|die', 'Bett|🛏️|das', 'Lam-pe|💡|die', 'Schlüs-sel|🔑|der',
    'Glo-cke|🔔|die', 'Ge-schenk|🎁|das', 'Bal-lon|🎈|der', 'Trom-mel|🥁|die', 'Gi-tar-re|🎸|die',
    'Gei-ge|🎻|die', 'Ker-ze|🕯️|die', 'Stuhl|🪑|der', 'Ham-mer|🔨|der', 'Ka-me-ra|📷|die',
    'Te-le-fon|☎️|das', 'Ro-bo-ter|🤖|der', 'Dra-che|🐉|der', 'Ge-spenst|👻|das', 'Burg|🏰|die',
    'Zelt|⛺|das', 'Kür-bis|🎃|der', 'Tan-ne|🎄|die', 'Schnee-mann|⛄|der', 'Mais|🌽|der',
    'Erd-bee-re|🍓|die', 'Trau-be|🍇|die', 'A-na-nas|🍍|die', 'Bre-zel|🥨|die', 'Ho-nig|🍯|der',
    'Kof-fer|🧳|der', 'Ted-dy|🧸|der', 'Wür-fel|🎲|der', 'Huhn|🐔|das', 'Hahn|🐓|der',
    'Wolf|🐺|der', 'Fuchs|🦊|der', 'Kä-fer|🐞|der', 'A-mei-se|🐜|die', 'Hai|🦈|der',
    'Krebs|🦀|der', 'Mu-schel|🐚|die', 'Ka-mel|🐫|das', 'Pan-da|🐼|der', 'Ko-a-la|🐨|der',
    'Hams-ter|🐹|der', 'Pa-pa-gei|🦜|der', 'Gur-ke|🥒|die', 'Kar-tof-fel|🥔|die',
    'Zwie-bel|🧅|die', 'Fah-ne|🚩|die', 'No-te|🎵|die', 'Schirm|🌂|der', 'Waa-ge|⚖️|die',
    'Ma-gnet|🧲|der', 'Tor|🥅|das', 'Po-kal|🏆|der', 'Rol-ler|🛴|der',
    'Pin-sel|🖌️|der', 'Do-se|🥫|die', 'Löf-fel|🥄|der'
  ];

  function tagsFor(word) {
    var w = word.toLowerCase(), t = [];
    if (/ie/.test(w)) t.push('ie');
    if (/ck/.test(w)) t.push('ck');
    if (/tz/.test(w)) t.push('tz');
    if (/([bdfglmnprst])\1/.test(w)) t.push('doppel');
    if (/[aeiouäöü]h(?![aeiouäöü])/.test(w)) t.push('dehnungs-h');
    if (/[dgb]$/.test(w) || /[dgb]s$/.test(w)) t.push('auslaut');
    if (/^v/.test(w)) t.push('v');
    if (/ß/.test(w)) t.push('ß');
    if (/ä/.test(w)) t.push('ä');
    if (/(aa|ee|oo)/.test(w)) t.push('doppelvokal');
    if (/(qu|chs|y|c(?!h|k)|äu|eu|pf|v)/.test(w)) t.push('besonders');
    return t;
  }

  var WORDS = RAW_WORDS.map(function (raw) {
    var p = raw.split('|');
    var syl = p[0].split('-');
    var word = syl.join('');
    var tags = tagsFor(word);
    return {
      word: word, syl: syl, emoji: p[1], art: p[2], tags: tags,
      // lg1: lautgetreu mit einfachen Buchstaben (für Buchstaben-Bausteine)
      lg1: tags.length === 0 && !/(sch|ch|ei|au|eu|st|sp|er$)/i.test(word),
      // lg2: Mitsprechwörter – so schreiben, wie man deutlich in Silben spricht
      lg2: tags.length === 0
    };
  });

  // Reimpaare (beide müssen im Wortschatz sein)
  var RHYMES = [['Haus', 'Maus'], ['Hund', 'Mund'], ['Hose', 'Rose'], ['Glocke', 'Socke'], ['Kuh', 'Schuh'],
    ['Ei', 'Hai'], ['Hase', 'Nase'], ['Zahn', 'Hahn'], ['Brot', 'Boot'], ['Melone', 'Zitrone'],
    ['Krone', 'Zitrone'], ['Rose', 'Dose']];

  // Ja/Nein-Fragen zum Satzverständnis
  var YESNO = [
    ['Kann ein Fisch schwimmen?', true], ['Kann ein Hund fliegen?', false], ['Ist die Sonne gelb?', true],
    ['Ist Schnee heiß?', false], ['Hat eine Katze vier Beine?', true], ['Hat ein Vogel Federn?', true],
    ['Wächst ein Apfel am Baum?', true], ['Ist eine Maus größer als ein Elefant?', false],
    ['Kann man ein Buch lesen?', true], ['Ist Wasser nass?', true], ['Kann ein Auto singen?', false],
    ['Isst man Suppe mit der Gabel?', false], ['Schläft man in einem Bett?', true],
    ['Ist eine Banane blau?', false], ['Hat eine Woche sieben Tage?', true], ['Ist es nachts dunkel?', true],
    ['Trägt man Schuhe an den Händen?', false], ['Kann eine Schnecke schnell rennen?', false],
    ['Ist Feuer heiß?', true], ['Kann ein Baum laufen?', false], ['Gibt die Kuh Milch?', true],
    ['Wohnt ein Fisch im Wasser?', true], ['Ist eine Tomate ein Tier?', false],
    ['Fährt ein Zug auf Schienen?', true], ['Kann ein Pinguin fliegen?', false],
    ['Hat ein Jahr zwölf Monate?', true], ['Kann man mit einer Schere schneiden?', true],
    ['Ist ein Elefant klein?', false], ['Hat ein Huhn vier Beine?', false], ['Kann eine Biene summen?', true],
    ['Ist Zucker salzig?', false], ['Bellt eine Katze?', false], ['Leuchten Sterne in der Nacht?', true],
    ['Ist Gras grün?', true], ['Kann ein Stein sprechen?', false], ['Braucht ein Fahrrad Räder?', true],
    ['Wohnt ein Bär im Kühlschrank?', false], ['Kommt nach Montag der Dienstag?', true],
    ['Isst ein Hase gern Möhren?', true], ['Ist ein Berg flach?', false]
  ];

  // Lückensätze: [Satz mit ___, richtig, falsch, falsch]
  var GAPS = [
    ['Der Hund ___ laut.', 'bellt', 'fliegt', 'liest'],
    ['Die Katze trinkt ___.', 'Milch', 'Steine', 'Schuhe'],
    ['Im Winter fällt ___.', 'Schnee', 'Käse', 'Gras'],
    ['Ich putze meine ___.', 'Zähne', 'Wolken', 'Sterne'],
    ['Am Himmel scheint die ___.', 'Sonne', 'Maus', 'Gabel'],
    ['Das Baby ___ im Bett.', 'schläft', 'fährt', 'rechnet'],
    ['Ich lese ein ___.', 'Buch', 'Brot', 'Bein'],
    ['Der Fisch schwimmt im ___.', 'Wasser', 'Wald', 'Bett'],
    ['Die Biene fliegt zur ___.', 'Blume', 'Schule', 'Garage'],
    ['Im Herbst fallen die ___ vom Baum.', 'Blätter', 'Autos', 'Schuhe'],
    ['Wir fahren mit dem ___ zur Schule.', 'Bus', 'Bett', 'Brot'],
    ['Der Bäcker backt ___.', 'Brot', 'Steine', 'Socken'],
    ['Wenn es regnet, nehme ich einen ___.', 'Schirm', 'Löffel', 'Hund'],
    ['Der Frosch springt in den ___.', 'Teich', 'Kühlschrank', 'Rucksack'],
    ['Nachts leuchtet der ___.', 'Mond', 'Tisch', 'Apfel'],
    ['Ich trinke ein Glas ___.', 'Wasser', 'Sand', 'Papier'],
    ['Die Kuh steht auf der ___.', 'Weide', 'Wolke', 'Treppe'],
    ['Im Sommer ist es ___.', 'warm', 'eckig', 'leise'],
    ['Die Feuerwehr löscht das ___.', 'Feuer', 'Eis', 'Buch'],
    ['Mit dem Stift kann ich ___.', 'malen', 'kochen', 'schwimmen'],
    ['Der Vogel baut ein ___.', 'Nest', 'Auto', 'Bett'],
    ['Ich ziehe meine ___ an.', 'Jacke', 'Suppe', 'Lampe'],
    ['Oma schneidet das Brot mit dem ___.', 'Messer', 'Kamm', 'Ball'],
    ['Der Zug hält am ___.', 'Bahnhof', 'Baum', 'Bauch']
  ];

  // Kurze Texte mit Frage. q = Frage, a = [richtig, falsch, falsch], inf = Schlussfolgern nötig
  var TEXTS = [
    { t: 'Tom hat einen Hund. Der Hund heißt Bello. Bello spielt gern mit dem Ball.', q: 'Wie heißt der Hund?', a: ['Bello', 'Tom', 'Ball'] },
    { t: 'Lena geht in den Garten. Dort pflückt sie rote Erdbeeren. Sie isst gleich drei davon.', q: 'Was pflückt Lena?', a: ['Erdbeeren', 'Äpfel', 'Blumen'] },
    { t: 'Es regnet. Mia zieht ihre Gummistiefel an. Dann springt sie in eine Pfütze.', q: 'Was zieht Mia an?', a: ['Gummistiefel', 'eine Mütze', 'Hausschuhe'] },
    { t: 'Opa backt einen Kuchen. Ben hilft ihm. Ben darf den Teig rühren.', q: 'Wer backt den Kuchen?', a: ['Opa', 'Ben', 'Mama'] },
    { t: 'Die Katze Mimi liegt auf dem Sofa. Sie schnurrt. Dann schläft sie ein.', q: 'Wo liegt Mimi?', a: ['auf dem Sofa', 'im Garten', 'unter dem Bett'] },
    { t: 'Am Samstag fährt Familie Huber an den See. Die Kinder baden. Papa liest ein Buch.', q: 'Was macht Papa?', a: ['Er liest.', 'Er badet.', 'Er kocht.'] },
    { t: 'Paul hat Geburtstag. Er wird neun Jahre alt. Er bekommt ein rotes Fahrrad.', q: 'Was bekommt Paul?', a: ['ein Fahrrad', 'einen Ball', 'ein Buch'] },
    { t: 'Max hat Hunger. Er öffnet den Kühlschrank. Er nimmt sich einen Joghurt.', q: 'Was nimmt Max?', a: ['einen Joghurt', 'eine Wurst', 'einen Apfel'] },
    { t: 'In der Nacht ist es dunkel. Die Eule wacht auf. Sie fliegt los und sucht eine Maus.', q: 'Wann wacht die Eule auf?', a: ['in der Nacht', 'am Morgen', 'am Mittag'] },
    { t: 'Leo und Sara bauen eine Höhle aus Decken. Sie nehmen eine Taschenlampe mit hinein. Dann lesen sie eine Geschichte.', q: 'Was nehmen sie mit in die Höhle?', a: ['eine Taschenlampe', 'einen Hund', 'ein Eis'] },
    { t: 'Am Sonntag wandert Familie Maier auf einen Berg. Oben steht eine Hütte. Dort essen alle eine Brezel.', q: 'Was essen alle in der Hütte?', a: ['eine Brezel', 'eine Pizza', 'eine Suppe'] },
    { t: 'Ali füttert seine Hasen. Sie bekommen Möhren und frisches Heu. Danach macht er den Stall sauber.', q: 'Was bekommen die Hasen?', a: ['Möhren und Heu', 'Nudeln', 'Fisch'] },
    { t: 'Im Herbst sammelt das Eichhörnchen Nüsse. Es versteckt sie im Wald. Im Winter hat es dann genug zu essen.', q: 'Warum sammelt das Eichhörnchen Nüsse?', a: ['Damit es im Winter Essen hat.', 'Weil es damit spielen will.', 'Weil es Nüsse verkauft.'], inf: true },
    { t: 'Anna will einen Schneemann bauen. Aber die Sonne scheint warm, und der Schnee schmilzt.', q: 'Warum klappt es mit dem Schneemann nicht?', a: ['Der Schnee schmilzt.', 'Anna hat keine Lust.', 'Es ist Nacht.'], inf: true },
    { t: 'Ein kleiner Vogel ist aus dem Nest gefallen. Lisa ruft ihre Mama. Gemeinsam setzen sie ihn vorsichtig zurück.', q: 'Wie fühlt sich der Vogel wohl am Ende?', a: ['sicher', 'wütend', 'hungrig'], inf: true },
    { t: 'Jonas spielt Fußball. Er schießt ein Tor. Sein Team jubelt laut.', q: 'Warum jubelt das Team?', a: ['Jonas hat ein Tor geschossen.', 'Es fängt an zu regnen.', 'Das Spiel fällt aus.'], inf: true },
    { t: 'Heute ist Montag. Morgen hat Emma Schwimmen. Sie packt schon ihre Badesachen ein.', q: 'An welchem Tag hat Emma Schwimmen?', a: ['am Dienstag', 'am Montag', 'am Freitag'], inf: true },
    { t: 'Ben zieht seine dicke Jacke, eine Mütze und Handschuhe an. Draußen ist alles weiß.', q: 'Welche Jahreszeit ist es?', a: ['Winter', 'Sommer', 'Frühling'], inf: true },
    { t: 'Mila gießt jeden Tag ihre Sonnenblume. Nach ein paar Wochen ist die Blume größer als Mila.', q: 'Was ist mit der Sonnenblume passiert?', a: ['Sie ist gewachsen.', 'Sie ist verwelkt.', 'Sie ist umgefallen.'], inf: true },
    { t: 'Der Bus kommt um acht Uhr. Tim wacht erst um acht Uhr auf.', q: 'Was passiert wohl?', a: ['Tim verpasst den Bus.', 'Tim ist zu früh.', 'Tim fährt Zug.'], inf: true }
  ];

  // Wörter aus dem Grundwortschatz-Umfeld (Jgst. 1–4) mit Beispielsatz für das Diktat.
  // g: 1 = Jgst. 1/2, 3 = Jgst. 3/4
  var GWS = [
    ['Schule', 'Ich gehe gern in die Schule.', 1], ['fahren', 'Wir fahren mit dem Bus.', 1],
    ['spielen', 'Wir spielen im Garten.', 1], ['lesen', 'Ich lese ein Buch.', 1],
    ['groß', 'Der Elefant ist groß.', 1], ['klein', 'Die Maus ist klein.', 1],
    ['viel', 'Ich habe viel Zeit.', 1], ['vier', 'Ich habe vier Stifte.', 1],
    ['vor', 'Vor dem Haus steht ein Baum.', 1], ['von', 'Der Brief ist von Oma.', 1],
    ['und', 'Ich und du.', 1], ['sind', 'Wir sind Freunde.', 1], ['nicht', 'Ich bin nicht müde.', 1],
    ['immer', 'Ich lache immer.', 1], ['dann', 'Dann gehen wir nach Hause.', 1],
    ['kommen', 'Kommst du mit?', 1], ['gehen', 'Wir gehen in den Park.', 1],
    ['sehen', 'Ich sehe einen Vogel.', 1], ['Kind', 'Das Kind lacht.', 1],
    ['Mutter', 'Meine Mutter liest.', 1], ['Vater', 'Mein Vater kocht.', 1],
    ['heute', 'Heute scheint die Sonne.', 1], ['Name', 'Wie ist dein Name?', 1],
    ['Tag', 'Der Tag ist schön.', 1], ['Jahr', 'Ein Jahr hat zwölf Monate.', 1],
    ['Wasser', 'Ich trinke Wasser.', 1], ['essen', 'Wir essen Nudeln.', 1],
    ['Hand', 'Gib mir die Hand.', 1], ['alle', 'Alle Kinder spielen.', 1], ['Oma', 'Oma backt Kuchen.', 1],
    ['Opa', 'Opa liest die Zeitung.', 1], ['Ball', 'Der Ball ist rund.', 1], ['Mama', 'Mama lacht.', 1],
    ['rot', 'Die Tomate ist rot.', 1], ['malen', 'Ich male ein Bild.', 1], ['Hose', 'Die Hose ist blau.', 1],
    ['Freund', 'Mein Freund heißt Ali.', 3], ['fröhlich', 'Das Kind ist fröhlich.', 3],
    ['müde', 'Am Abend bin ich müde.', 3], ['Zeit', 'Hast du Zeit?', 3], ['Sommer', 'Im Sommer ist es warm.', 3],
    ['Winter', 'Im Winter schneit es.', 3], ['Woche', 'Die Woche hat sieben Tage.', 3],
    ['morgen', 'Morgen ist Sonntag.', 3], ['Zimmer', 'Mein Zimmer ist ordentlich.', 3],
    ['Straße', 'Die Straße ist nass.', 3], ['Fenster', 'Das Fenster ist offen.', 3],
    ['wohnen', 'Wir wohnen in Bayern.', 3], ['Uhr', 'Die Uhr tickt.', 3],
    ['trinken', 'Wir trinken Tee.', 3], ['schnell', 'Der Hase ist schnell.', 3],
    ['leise', 'Sei bitte leise.', 3], ['Kopf', 'Mein Kopf ist warm.', 3], ['Fuß', 'Mein Fuß tut weh.', 3],
    ['Bild', 'Das Bild ist bunt.', 3], ['Lehrer', 'Der Lehrer erklärt die Aufgabe.', 3],
    ['Klasse', 'Unsere Klasse macht einen Ausflug.', 3], ['Pause', 'In der Pause spielen wir.', 3],
    ['Ferien', 'In den Ferien fahren wir weg.', 3], ['Familie', 'Meine Familie ist groß.', 3],
    ['Geburtstag', 'Heute habe ich Geburtstag.', 3], ['Weihnachten', 'An Weihnachten schmücken wir den Baum.', 3],
    ['Fahrrad', 'Mein Fahrrad ist neu.', 3], ['Rucksack', 'Mein Rucksack ist schwer.', 3],
    ['backen', 'Wir backen Plätzchen.', 3], ['plötzlich', 'Plötzlich klingelt es.', 3],
    ['Brücke', 'Wir gehen über die Brücke.', 3], ['ziehen', 'Wir ziehen den Schlitten.', 3],
    ['fühlen', 'Ich fühle mich gut.', 3], ['Stadt', 'München ist eine große Stadt.', 3],
    ['Wald', 'Im Wald leben viele Tiere.', 3], ['wissen', 'Ich weiß die Antwort.', 3],
    ['hoffentlich', 'Hoffentlich scheint morgen die Sonne.', 3], ['Gefahr', 'Rot bedeutet Gefahr.', 3]
  ];

  // Diktat-Sätze (kurz, lautgetreu zuerst)
  var SENTENCES = [
    ['Der Hund bellt.', 1], ['Mama liest.', 1], ['Die Sonne scheint.', 1], ['Wir malen.', 1],
    ['Ich bin müde.', 1], ['Oma backt Kuchen.', 1], ['Das Auto ist rot.', 1], ['Der Vogel singt.', 1],
    ['Wir spielen Ball.', 1], ['Ich esse einen Apfel.', 1], ['Im Winter ist es kalt.', 2],
    ['Wir fahren mit dem Bus.', 2], ['Die Katze schläft auf dem Sofa.', 2], ['Heute gehe ich in die Schule.', 2],
    ['Mein Freund kommt morgen.', 2], ['Der Igel hat viele Stacheln.', 2], ['Im Sommer baden wir im See.', 2],
    ['Die Schnecke ist langsam.', 2], ['Papa trinkt eine Tasse Tee.', 2], ['Wir wohnen in einem Haus.', 2],
    ['Am Wochenende fahren wir in die Berge.', 3], ['Mein Fahrrad steht im Keller.', 3],
    ['Plötzlich fängt es an zu regnen.', 3], ['Die Kinder spielen fröhlich im Garten.', 3]
  ];

  // Sammelbilder für erreichte Ziele
  var STICKERS = ['🦄', '🐲', '🦖', '🐳', '🦩', '🦚', '🦥', '🦦', '🐙', '🦜', '🐢', '🦔', '🐼', '🦁', '🐯', '🦊',
    '🐨', '🐸', '🦋', '🐞', '🌻', '🍀', '🌈', '🌟', '🚀', '🛸', '🏰', '🎡', '🎠', '🏆', '👑', '💎',
    '🎸', '🥁', '🎨', '🧩', '⚽', '🏀', '🛹', '🚂', '🚒', '🚁', '⛵', '🗻', '🌋', '🍉', '🍦', '🧁', '🍩', '🎁'];

  var AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐯', '🐨', '🦄', '🐲', '🐵', '🐧', '🦉', '🐢', '🚀', '⚽', '🤖', '🦖'];

  // Wörterbuch für die Silbentrennung (Zusammensetzungen etc.)
  var EXTRA_SYL = ['Gum-mi-stie-fel', 'Ta-schen-lam-pe', 'Eich-hörn-chen', 'Ba-de-sa-chen', 'Kühl-schrank',
    'Ge-burts-tag', 'Fuß-ball', 'Feu-er-wehr', 'Haus-schu-he', 'Son-nen-blu-me', 'Hand-schu-he',
    'Fa-mi-li-e', 'Fe-ri-en', 'Wo-chen-en-de', 'Bahn-hof', 'Ruck-sack', 'Mit-tag', 'Mor-gen',
    'Ge-schich-te', 'Schwim-men', 'ge-mein-sam', 'Weih-nach-ten', 'Plätz-chen',
    'Schlit-ten', 'Pfüt-ze', 'Erd-bee-ren', 'Jo-ghurt', 'Lieb-lings-tier', 'Kin-der', 'Sta-cheln',
    'drau-ßen', 'Sonn-tag', 'Mon-tag', 'Diens-tag', 'Frei-tag', 'Sams-tag', 'Kü-che', 'Ho-ckey'];

  LA.u.registerSyllables(RAW_WORDS.map(function (w) { return w.split('|')[0]; }));
  LA.u.registerSyllables(EXTRA_SYL);

  LA.data = {
    WORDS: WORDS, RHYMES: RHYMES, YESNO: YESNO, GAPS: GAPS, TEXTS: TEXTS, GWS: GWS,
    SENTENCES: SENTENCES, STICKERS: STICKERS, AVATARS: AVATARS,
    word: function (w) { return WORDS.filter(function (x) { return x.word === w; })[0]; },
    tagsFor: tagsFor
  };
})(window.LA);
