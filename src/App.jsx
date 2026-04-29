import { useReducer, useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================
// CONSTANTS
// ============================================================

const PAGES = { PROFILE: 'profile', HOME: 'home', TASKS: 'tasks', MEDALS: 'medals', PROGRESS: 'progress', HELP: 'help' }

const COMPETENCY_AREAS = [
  { id: 'L1', name: 'Zahlen und Operationen', desc: 'Rechnen, Grundrechenarten, Zahlverständnis', emoji: '🧮', medalName: 'Mathe-Experte', color: 'sky' },
  { id: 'L2', name: 'Größen und Messen', desc: 'Längen, Gewichte, Zeit, Geld, Umrechnungen', emoji: '📏', medalName: 'Messprofi', color: 'pink' },
  { id: 'L3', name: 'Raum und Form', desc: 'Geometrische Formen, Körper, Symmetrie', emoji: '📐', medalName: 'Geometrie-Experte', color: 'sky-light' },
  { id: 'L4', name: 'Gleichungen und Funktionen', desc: 'Terme, Gleichungen, Zuordnungen', emoji: '⚡', medalName: 'Funktionsmeister', color: 'warning' },
  { id: 'L5', name: 'Daten und Zufall', desc: 'Diagramme, Tabellen, Wahrscheinlichkeit', emoji: '🎯', medalName: 'Zufallschecker', color: 'pink-light' },
]

const GRADE_LEVELS = [
  { grades: '1', label: 'Klasse 1', niveau: 'A' },
  { grades: '2', label: 'Klasse 2', niveau: 'A/B' },
  { grades: '3', label: 'Klasse 3', niveau: 'B/C' },
  { grades: '4', label: 'Klasse 4', niveau: 'C' },
  { grades: '5', label: 'Klasse 5', niveau: 'C/D' },
  { grades: '6', label: 'Klasse 6', niveau: 'D' },
  { grades: '7', label: 'Klasse 7', niveau: 'D/E' },
  { grades: '8', label: 'Klasse 8', niveau: 'E/F' },
]

const MOCK_GRADE_MAP = { '1': '1-2', '2': '1-2', '3': '3-4', '4': '3-4', '5': '5-6', '6': '5-6', '7': '7-8', '8': '7-8' }

const MATH_SYMBOLS = ['+', '−', '×', '÷', 'π', '√', '=', '%', '∑', '∞']

const AVATAR_EMOJIS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐼', '🦄', '🐲', '🌟', '🚀', '🎨', '⚽', '🎵', '🌈', '🦋', '🐝']

const COLOR_MAP = {
  sky: { bg: 'bg-sky', border: 'border-sky', text: 'text-sky', bgLight: 'bg-sky/10' },
  pink: { bg: 'bg-pink', border: 'border-pink', text: 'text-pink', bgLight: 'bg-pink/10' },
  'sky-light': { bg: 'bg-sky-light', border: 'border-sky-light', text: 'text-sky', bgLight: 'bg-sky-light/20' },
  warning: { bg: 'bg-warning', border: 'border-warning', text: 'text-warning', bgLight: 'bg-warning/10' },
  'pink-light': { bg: 'bg-pink-light', border: 'border-pink-light', text: 'text-pink', bgLight: 'bg-pink-light/20' },
}

// ============================================================
// MOCK DATA (Fallback when no API key)
// ============================================================

const MOCK_TASKS = {
  'L1': {
    '1-2': [
      { question: 'Was ergibt 3 + 4?', answer: '7', hint: 'Zähle von 3 weiter: 4, 5, 6, 7.', difficulty: 1, explanation: '3 + 4 = 7' },
      { question: 'Was ergibt 8 − 3?', answer: '5', hint: 'Nimm 3 von 8 weg.', difficulty: 1, explanation: '8 − 3 = 5' },
      { question: 'Ergänze: 6 + ___ = 10', answer: '4', hint: 'Was fehlt noch bis 10?', difficulty: 1, explanation: '6 + 4 = 10' },
      { question: 'Was ergibt 2 + 2 + 2?', answer: '6', hint: 'Rechne Schritt für Schritt.', difficulty: 1, explanation: '2 + 2 = 4, dann 4 + 2 = 6' },
      { question: 'Welche Zahl kommt nach 15?', answer: '16', hint: 'Zähle eins weiter.', difficulty: 1, explanation: 'Nach 15 kommt 16.' },
      { question: 'Was ergibt 9 − 5?', answer: '4', hint: 'Zähle von 5 bis 9.', difficulty: 2, explanation: '9 − 5 = 4' },
      { question: 'Was ist größer: 12 oder 8?', answer: '12', hint: 'Welche Zahl liegt weiter rechts auf dem Zahlenstrahl?', difficulty: 1, explanation: '12 > 8' },
      { question: 'Was ergibt 7 + 6?', answer: '13', hint: '7 + 3 = 10, dann noch 3 dazu.', difficulty: 2, explanation: '7 + 6 = 13' },
      { question: 'Ergänze: ___ + 5 = 12', answer: '7', hint: 'Rechne 12 − 5.', difficulty: 2, explanation: '7 + 5 = 12' },
      { question: 'Was ergibt 15 − 8?', answer: '7', hint: 'Rechne erst 15 − 5 = 10, dann 10 − 3.', difficulty: 2, explanation: '15 − 8 = 7' },
    ],
    '3-4': [
      { question: 'Was ergibt 45 + 37?', answer: '82', hint: '40 + 30 = 70, dann 5 + 7 = 12.', difficulty: 1, explanation: '45 + 37 = 82' },
      { question: 'Was ergibt 6 × 7?', answer: '42', hint: '6 × 7 ist das gleiche wie 7 × 6.', difficulty: 1, explanation: '6 × 7 = 42' },
      { question: 'Was ergibt 81 ÷ 9?', answer: '9', hint: 'Wie oft passt 9 in 81?', difficulty: 1, explanation: '81 ÷ 9 = 9' },
      { question: 'Runde 467 auf Hunderter.', answer: '500', hint: 'Schau auf die Zehnerstelle: 6 → aufrunden.', difficulty: 1, explanation: '467 ≈ 500' },
      { question: 'Was ergibt 100 − 36?', answer: '64', hint: '100 − 30 = 70, dann 70 − 6.', difficulty: 1, explanation: '100 − 36 = 64' },
      { question: 'Was ergibt 8 × 9?', answer: '72', hint: '8 × 10 = 80, minus 8.', difficulty: 2, explanation: '8 × 9 = 72' },
      { question: 'Was ergibt 256 + 144?', answer: '400', hint: 'Rechne stellenweise.', difficulty: 2, explanation: '256 + 144 = 400' },
      { question: 'Welcher Bruch ist gleich 0,5?', answer: '1/2', hint: 'Die Hälfte von 1.', difficulty: 2, explanation: '0,5 = 1/2' },
      { question: 'Was ergibt 132 ÷ 4?', answer: '33', hint: '120 ÷ 4 = 30, dann 12 ÷ 4 = 3.', difficulty: 3, explanation: '132 ÷ 4 = 33' },
      { question: 'Was ist die Hälfte von 248?', answer: '124', hint: 'Halbiere 200 und 48 getrennt.', difficulty: 2, explanation: '248 ÷ 2 = 124' },
    ],
    '5-6': [
      { question: 'Was ergibt 3/4 + 1/4?', answer: '1', hint: 'Gleicher Nenner – zähle die Zähler zusammen.', difficulty: 1, explanation: '3/4 + 1/4 = 4/4 = 1' },
      { question: 'Berechne 15% von 200.', answer: '30', hint: '10% = 20, 5% = 10.', difficulty: 2, explanation: '15% von 200 = 30' },
      { question: 'Was ergibt −3 + 7?', answer: '4', hint: 'Starte bei −3 und gehe 7 Schritte nach rechts.', difficulty: 1, explanation: '−3 + 7 = 4' },
      { question: 'Kürze den Bruch 12/18.', answer: '2/3', hint: 'Teile Zähler und Nenner durch 6.', difficulty: 2, explanation: '12/18 = 2/3' },
      { question: 'Was ergibt 2,5 × 4?', answer: '10', hint: '2 × 4 = 8, plus 0,5 × 4 = 2.', difficulty: 1, explanation: '2,5 × 4 = 10' },
      { question: 'Ordne: −2, 5, 0, −7, 3 (aufsteigend)', answer: '-7, -2, 0, 3, 5', hint: 'Negative Zahlen sind kleiner als 0.', difficulty: 2, explanation: '−7 < −2 < 0 < 3 < 5' },
      { question: 'Was ist der ggT von 24 und 36?', answer: '12', hint: 'Welche Zahl teilt beide ohne Rest?', difficulty: 3, explanation: 'ggT(24, 36) = 12' },
      { question: 'Was ergibt 1/3 von 90?', answer: '30', hint: 'Teile 90 durch 3.', difficulty: 1, explanation: '90 ÷ 3 = 30' },
      { question: 'Wandle 0,75 in einen Bruch um.', answer: '3/4', hint: '0,75 = 75/100 – jetzt kürzen.', difficulty: 2, explanation: '0,75 = 75/100 = 3/4' },
      { question: 'Was ergibt (−4) × (−3)?', answer: '12', hint: 'Minus mal Minus ergibt Plus.', difficulty: 2, explanation: '(−4) × (−3) = 12' },
    ],
    '7-8': [
      { question: 'Löse: 2x + 5 = 17. Was ist x?', answer: '6', hint: 'Erst −5, dann ÷2.', difficulty: 1, explanation: '2x = 12, x = 6' },
      { question: 'Was ergibt √144?', answer: '12', hint: 'Welche Zahl mal sich selbst ergibt 144?', difficulty: 1, explanation: '12 × 12 = 144' },
      { question: 'Berechne 3² + 4².', answer: '25', hint: '9 + 16 = ?', difficulty: 1, explanation: '9 + 16 = 25' },
      { question: 'Was ist 25% von 360?', answer: '90', hint: '25% = 1/4.', difficulty: 1, explanation: '360 ÷ 4 = 90' },
      { question: 'Vereinfache: 3(x + 2) − x', answer: '2x + 6', hint: 'Erst ausmultiplizieren, dann zusammenfassen.', difficulty: 2, explanation: '3x + 6 − x = 2x + 6' },
      { question: 'Löse: x/3 = 15. Was ist x?', answer: '45', hint: 'Multipliziere beide Seiten mit 3.', difficulty: 1, explanation: 'x = 15 × 3 = 45' },
      { question: 'Was ergibt 2⁵?', answer: '32', hint: '2 × 2 × 2 × 2 × 2', difficulty: 2, explanation: '2⁵ = 32' },
      { question: 'Berechne: (−2)³', answer: '-8', hint: '(−2) × (−2) × (−2)', difficulty: 2, explanation: '(−2)³ = −8' },
      { question: 'Was ist der Wert von 5! (Fakultät)?', answer: '120', hint: '5 × 4 × 3 × 2 × 1', difficulty: 3, explanation: '5! = 120' },
      { question: 'Löse: 3x − 7 = 2x + 5. Was ist x?', answer: '12', hint: 'Bringe x auf eine Seite.', difficulty: 2, explanation: 'x = 12' },
    ],
  },
  'L2': {
    '1-2': [
      { question: 'Wie viele Zentimeter sind 1 Meter?', answer: '100', hint: '1 m = ? cm', difficulty: 1, explanation: '1 m = 100 cm' },
      { question: 'Was ist länger: 50 cm oder 1 m?', answer: '1 m', hint: 'Wandle 1 m in cm um.', difficulty: 1, explanation: '1 m = 100 cm > 50 cm' },
      { question: 'Wie viele Minuten hat eine Stunde?', answer: '60', hint: 'Schau auf die Uhr!', difficulty: 1, explanation: '1 Stunde = 60 Minuten' },
      { question: 'Was kostet es, wenn du 3 Äpfel für je 1 Euro kaufst?', answer: '3', hint: '3 × 1 = ?', difficulty: 1, explanation: '3 × 1 € = 3 €' },
      { question: 'Wie viel Wechselgeld bekommst du bei 2 € und 1 € Kosten?', answer: '1', hint: '2 − 1 = ?', difficulty: 1, explanation: '2 € − 1 € = 1 € Wechselgeld' },
      { question: 'Was ist am längsten: 30 cm, 2 m, 50 cm?', answer: '2 m', hint: '2 m = 200 cm', difficulty: 2, explanation: '2 m = 200 cm > 50 cm > 30 cm' },
      { question: 'Wie schwer ist 1 Kilogramm in Gramm?', answer: '1000', hint: 'Kilo bedeutet tausend.', difficulty: 2, explanation: '1 kg = 1000 g' },
      { question: 'Welcher Monat hat 28 oder 29 Tage?', answer: 'Februar', hint: 'Der kürzeste Monat.', difficulty: 1, explanation: 'Der Februar hat 28 (oder 29) Tage.' },
      { question: 'Es ist 10 Uhr. In 3 Stunden ist es...?', answer: '13 Uhr', hint: '10 + 3 = ?', difficulty: 1, explanation: '10 + 3 = 13 Uhr' },
      { question: 'Was ist schwerer: 500 g oder 1 kg?', answer: '1 kg', hint: '1 kg = 1000 g', difficulty: 1, explanation: '1 kg = 1000 g > 500 g' },
    ],
    '3-4': [
      { question: 'Wie viele Meter sind 3 km?', answer: '3000', hint: '1 km = 1000 m', difficulty: 1, explanation: '3 × 1000 = 3000 m' },
      { question: 'Wie viele Sekunden hat eine Minute?', answer: '60', hint: 'Genau wie Minuten pro Stunde.', difficulty: 1, explanation: '1 Minute = 60 Sekunden' },
      { question: 'Was ist 2 kg 500 g in Gramm?', answer: '2500', hint: '2 kg = 2000 g, dann + 500 g.', difficulty: 2, explanation: '2000 + 500 = 2500 g' },
      { question: 'Wie viele Tage hat ein Schaltjahr?', answer: '366', hint: 'Ein normales Jahr hat 365 Tage.', difficulty: 1, explanation: '365 + 1 = 366 Tage' },
      { question: 'Rechne um: 1,5 Stunden = ? Minuten', answer: '90', hint: '1 Stunde = 60 Min, halbe Stunde = 30 Min.', difficulty: 2, explanation: '60 + 30 = 90 Minuten' },
      { question: 'Was ist 3,50 € + 2,75 €?', answer: '6,25', hint: 'Addiere erst die Euro, dann die Cent.', difficulty: 2, explanation: '3,50 + 2,75 = 6,25 €' },
      { question: 'Wie viele cm sind 4 m 35 cm?', answer: '435', hint: '4 m = 400 cm, dann + 35 cm.', difficulty: 2, explanation: '400 + 35 = 435 cm' },
      { question: 'Du kaufst 4 Hefte für je 1,25 €. Wie viel zahlst du?', answer: '5', hint: '4 × 1,25 = ?', difficulty: 2, explanation: '4 × 1,25 = 5,00 €' },
      { question: 'Wie viele Millimeter sind 5 cm?', answer: '50', hint: '1 cm = 10 mm', difficulty: 1, explanation: '5 × 10 = 50 mm' },
      { question: 'Ein Film dauert von 14:30 bis 16:15. Wie lange dauert er?', answer: '1 Stunde 45 Minuten', hint: 'Von 14:30 bis 16:30 sind 2 Stunden, aber...', difficulty: 3, explanation: '16:15 − 14:30 = 1 h 45 min' },
    ],
    '5-6': [
      { question: 'Rechne um: 3,5 km = ? m', answer: '3500', hint: '1 km = 1000 m', difficulty: 1, explanation: '3,5 × 1000 = 3500 m' },
      { question: 'Wie viel sind 750 ml in Litern?', answer: '0,75', hint: '1000 ml = 1 l', difficulty: 1, explanation: '750 ÷ 1000 = 0,75 l' },
      { question: 'Berechne den Umfang eines Rechtecks mit a=8cm, b=5cm.', answer: '26 cm', hint: 'U = 2 × (a + b)', difficulty: 2, explanation: '2 × (8+5) = 26 cm' },
      { question: 'Was sind 20% von 150 €?', answer: '30', hint: '10% = 15 €, also 20% = ?', difficulty: 2, explanation: '150 × 0,2 = 30 €' },
      { question: 'Rechne um: 2 h 30 min = ? Minuten', answer: '150', hint: '2 × 60 + 30', difficulty: 1, explanation: '120 + 30 = 150 Minuten' },
      { question: 'Ein Fahrrad kostet 250 €, du bekommst 15% Rabatt. Was zahlst du?', answer: '212,50', hint: '15% von 250 = 37,50', difficulty: 3, explanation: '250 − 37,50 = 212,50 €' },
      { question: 'Wie viele m² hat ein Zimmer mit 4 m × 3,5 m?', answer: '14', hint: 'Fläche = Länge × Breite', difficulty: 2, explanation: '4 × 3,5 = 14 m²' },
      { question: 'Rechne um: 4500 g = ? kg', answer: '4,5', hint: '1000 g = 1 kg', difficulty: 1, explanation: '4500 ÷ 1000 = 4,5 kg' },
      { question: 'Ein Zug fährt um 9:45 ab und kommt um 11:20 an. Wie lange fährt er?', answer: '1 Stunde 35 Minuten', hint: 'Von 9:45 bis 11:45 sind 2 Stunden, aber...', difficulty: 2, explanation: '11:20 − 9:45 = 1 h 35 min' },
      { question: 'Wie viele cm³ sind 2 Liter?', answer: '2000', hint: '1 l = 1000 cm³', difficulty: 2, explanation: '2 × 1000 = 2000 cm³' },
    ],
    '7-8': [
      { question: 'Berechne die Fläche eines Kreises mit r = 5 cm (π ≈ 3,14).', answer: '78,5', hint: 'A = π × r²', difficulty: 2, explanation: '3,14 × 25 = 78,5 cm²' },
      { question: 'Wie viel sind 0,003 km in Metern?', answer: '3', hint: '1 km = 1000 m', difficulty: 1, explanation: '0,003 × 1000 = 3 m' },
      { question: 'Berechne das Volumen eines Quaders: 6cm × 4cm × 3cm.', answer: '72', hint: 'V = l × b × h', difficulty: 1, explanation: '6 × 4 × 3 = 72 cm³' },
      { question: 'Ein Artikel kostet 80 € netto. Mit 19% MwSt kostet er...?', answer: '95,20', hint: '80 × 1,19 = ?', difficulty: 2, explanation: '80 × 1,19 = 95,20 €' },
      { question: 'Rechne 2,5 m² in cm² um.', answer: '25000', hint: '1 m² = 10000 cm²', difficulty: 2, explanation: '2,5 × 10000 = 25000 cm²' },
      { question: 'Wie schnell fährt ein Auto, das 150 km in 2 Stunden schafft?', answer: '75', hint: 'v = s ÷ t', difficulty: 1, explanation: '150 ÷ 2 = 75 km/h' },
      { question: 'Berechne die Oberfläche eines Würfels mit a = 5 cm.', answer: '150', hint: 'O = 6 × a²', difficulty: 2, explanation: '6 × 25 = 150 cm²' },
      { question: 'Wie viele Sekunden sind 2,5 Stunden?', answer: '9000', hint: '2,5 × 60 × 60', difficulty: 2, explanation: '2,5 × 3600 = 9000 s' },
      { question: 'Ein Dreieck hat die Seiten 3cm, 4cm, 5cm. Berechne den Umfang.', answer: '12', hint: 'U = a + b + c', difficulty: 1, explanation: '3 + 4 + 5 = 12 cm' },
      { question: 'Wie viel Wasser fasst ein Aquarium: 60cm × 30cm × 40cm (in Litern)?', answer: '72', hint: 'Volumen in cm³, dann ÷ 1000 für Liter.', difficulty: 3, explanation: '72000 cm³ = 72 Liter' },
    ],
  },
  'L3': {
    '1-2': [
      { question: 'Wie viele Ecken hat ein Dreieck?', answer: '3', hint: 'Drei-eck = 3 Ecken.', difficulty: 1, explanation: 'Ein Dreieck hat 3 Ecken.' },
      { question: 'Wie heißt eine Form mit 4 gleich langen Seiten?', answer: 'Quadrat', hint: 'Alle Seiten gleich lang, alle Winkel gleich.', difficulty: 1, explanation: 'Ein Quadrat hat 4 gleich lange Seiten.' },
      { question: 'Wie viele Seiten hat ein Rechteck?', answer: '4', hint: 'Recht-eck = 4 Ecken = 4 Seiten.', difficulty: 1, explanation: 'Ein Rechteck hat 4 Seiten.' },
      { question: 'Welche Form ist rund?', answer: 'Kreis', hint: 'Keine Ecken, keine Kanten.', difficulty: 1, explanation: 'Ein Kreis ist rund.' },
      { question: 'Hat ein Würfel runde Flächen?', answer: 'Nein', hint: 'Alle Flächen eines Würfels sind Quadrate.', difficulty: 1, explanation: 'Nein, alle Flächen eines Würfels sind quadratisch.' },
      { question: 'Wie viele Flächen hat ein Würfel?', answer: '6', hint: 'Oben, unten, vorne, hinten, links, rechts.', difficulty: 2, explanation: 'Ein Würfel hat 6 quadratische Flächen.' },
      { question: 'Was ist ein Zylinder? Nenne einen Gegenstand.', answer: 'Dose', hint: 'Rund oben und unten.', difficulty: 1, explanation: 'Eine Dose, ein Glas – das sind Zylinder.' },
      { question: 'Wie viele Ecken hat ein Sechseck?', answer: '6', hint: 'Sechs-eck = ? Ecken.', difficulty: 1, explanation: 'Ein Sechseck hat 6 Ecken.' },
      { question: 'Ist ein Ball eine Kugel?', answer: 'Ja', hint: 'Rund von allen Seiten.', difficulty: 1, explanation: 'Ja, ein Ball hat die Form einer Kugel.' },
      { question: 'Wie viele Symmetrieachsen hat ein Quadrat?', answer: '4', hint: 'Falte es in der Mitte – auf wie viele Arten geht das?', difficulty: 2, explanation: 'Ein Quadrat hat 4 Symmetrieachsen.' },
    ],
    '3-4': [
      { question: 'Wie viele Kanten hat ein Quader?', answer: '12', hint: '4 oben, 4 unten, 4 senkrechte.', difficulty: 1, explanation: 'Ein Quader hat 12 Kanten.' },
      { question: 'Was ist der Umfang eines Quadrats mit Seitenlänge 6 cm?', answer: '24 cm', hint: 'U = 4 × a', difficulty: 1, explanation: '4 × 6 = 24 cm' },
      { question: 'Berechne die Fläche: Rechteck 7 cm × 4 cm.', answer: '28 cm²', hint: 'A = l × b', difficulty: 1, explanation: '7 × 4 = 28 cm²' },
      { question: 'Wie viele rechte Winkel hat ein Rechteck?', answer: '4', hint: 'Alle Winkel in einem Rechteck sind gleich.', difficulty: 1, explanation: 'Ein Rechteck hat 4 rechte Winkel (je 90°).' },
      { question: 'Wie heißt ein Dreieck mit 3 gleich langen Seiten?', answer: 'gleichseitiges Dreieck', hint: 'Gleich-seitig = alle Seiten gleich.', difficulty: 2, explanation: 'Ein gleichseitiges Dreieck hat 3 gleich lange Seiten.' },
      { question: 'Wie viele Symmetrieachsen hat ein Kreis?', answer: 'unendlich viele', hint: 'Jeder Durchmesser ist eine Symmetrieachse.', difficulty: 2, explanation: 'Ein Kreis hat unendlich viele Symmetrieachsen.' },
      { question: 'Ist ein Quadrat auch ein Rechteck?', answer: 'Ja', hint: 'Ein Quadrat hat auch 4 rechte Winkel.', difficulty: 2, explanation: 'Ja, ein Quadrat ist ein spezielles Rechteck.' },
      { question: 'Wie groß ist ein rechter Winkel in Grad?', answer: '90', hint: 'Wie eine Zimmerecke.', difficulty: 1, explanation: 'Ein rechter Winkel = 90°.' },
      { question: 'Berechne den Umfang eines Dreiecks mit Seiten 3, 4, 5 cm.', answer: '12 cm', hint: 'U = a + b + c', difficulty: 2, explanation: '3 + 4 + 5 = 12 cm' },
      { question: 'Nenne einen Gegenstand, der die Form einer Pyramide hat.', answer: 'Dach', hint: 'Spitz nach oben...', difficulty: 1, explanation: 'z.B. ein Dach, Zelt oder eine ägyptische Pyramide.' },
    ],
    '5-6': [
      { question: 'Wie viele Ecken hat ein Würfel?', answer: '8', hint: 'Zähle oben 4 und unten 4.', difficulty: 1, explanation: 'Ein Würfel hat 8 Ecken.' },
      { question: 'Wie viele Kanten hat ein Quader?', answer: '12', hint: '4 oben, 4 unten, 4 senkrechte.', difficulty: 1, explanation: 'Ein Quader hat 12 Kanten.' },
      { question: 'Berechne den Umfang eines Quadrats mit Seitenlänge 5 cm.', answer: '20 cm', hint: 'U = 4 × a', difficulty: 1, explanation: '4 × 5 = 20 cm' },
      { question: 'Fläche eines Rechtecks: Länge 8 cm, Breite 3 cm.', answer: '24 cm²', hint: 'A = Länge × Breite', difficulty: 1, explanation: '8 × 3 = 24 cm²' },
      { question: 'Welche Form hat 3 Ecken?', answer: 'Dreieck', hint: 'Drei...', difficulty: 1, explanation: 'Ein Dreieck hat 3 Ecken.' },
      { question: 'Wie groß ist die Winkelsumme in einem Dreieck?', answer: '180°', hint: 'Alle drei Winkel zusammen.', difficulty: 2, explanation: 'Die Winkelsumme im Dreieck beträgt 180°.' },
      { question: 'Umfang eines Kreises mit r = 7 cm (π ≈ 3,14).', answer: '43,96 cm', hint: 'U = 2 × π × r', difficulty: 2, explanation: '2 × 3,14 × 7 ≈ 43,96 cm' },
      { question: 'Wie viele Symmetrieachsen hat ein Quadrat?', answer: '4', hint: '2 diagonale + 2 durch die Seitenmitten.', difficulty: 2, explanation: 'Ein Quadrat hat 4 Symmetrieachsen.' },
      { question: 'Volumen eines Würfels mit a = 4 cm.', answer: '64 cm³', hint: 'V = a³', difficulty: 3, explanation: '4³ = 64 cm³' },
      { question: 'Was ist der Unterschied zwischen Radius und Durchmesser?', answer: 'Der Durchmesser ist doppelt so lang wie der Radius', hint: 'd = 2 × r', difficulty: 1, explanation: 'd = 2r, der Radius geht vom Mittelpunkt zum Rand.' },
    ],
    '7-8': [
      { question: 'Berechne die Fläche eines Dreiecks: g=10cm, h=6cm.', answer: '30', hint: 'A = (g × h) / 2', difficulty: 1, explanation: '(10 × 6) / 2 = 30 cm²' },
      { question: 'Satz des Pythagoras: a=3, b=4. Wie lang ist c?', answer: '5', hint: 'c² = a² + b²', difficulty: 2, explanation: '9 + 16 = 25, √25 = 5' },
      { question: 'Berechne die Fläche eines Kreises: r=10cm (π ≈ 3,14).', answer: '314', hint: 'A = π × r²', difficulty: 2, explanation: '3,14 × 100 = 314 cm²' },
      { question: 'Wie groß ist die Winkelsumme im Viereck?', answer: '360°', hint: 'Ein Viereck lässt sich in 2 Dreiecke teilen.', difficulty: 1, explanation: '2 × 180° = 360°' },
      { question: 'Volumen eines Zylinders: r=3cm, h=10cm (π ≈ 3,14).', answer: '282,6', hint: 'V = π × r² × h', difficulty: 2, explanation: '3,14 × 9 × 10 = 282,6 cm³' },
      { question: 'Berechne die Diagonale eines Quadrats: a=5cm.', answer: '7,07', hint: 'd = a × √2', difficulty: 3, explanation: '5 × 1,414 ≈ 7,07 cm' },
      { question: 'Welcher Winkel ist ein stumpfer Winkel?', answer: 'zwischen 90° und 180°', hint: 'Größer als rechter Winkel, kleiner als gestreckter.', difficulty: 1, explanation: 'Stumpfe Winkel: 90° < α < 180°' },
      { question: 'Oberfläche einer Kugel: r=5cm (π ≈ 3,14).', answer: '314', hint: 'O = 4 × π × r²', difficulty: 3, explanation: '4 × 3,14 × 25 = 314 cm²' },
      { question: 'Berechne den Flächeninhalt eines Parallelogramms: g=8, h=5.', answer: '40', hint: 'A = g × h', difficulty: 1, explanation: '8 × 5 = 40 cm²' },
      { question: 'Was ist der Strahlensatz?', answer: 'Parallele Geraden teilen Strahlen im gleichen Verhältnis', hint: 'Es geht um Verhältnisse bei parallelen Geraden.', difficulty: 2, explanation: 'Werden Strahlen von parallelen Geraden geschnitten, entstehen gleiche Verhältnisse.' },
    ],
  },
  'L4': {
    '3-4': [
      { question: 'Ergänze: ___ + 8 = 15', answer: '7', hint: '15 − 8 = ?', difficulty: 1, explanation: '7 + 8 = 15' },
      { question: 'Setze fort: 2, 4, 6, 8, ___', answer: '10', hint: 'Immer +2.', difficulty: 1, explanation: '8 + 2 = 10' },
      { question: 'Setze fort: 5, 10, 15, 20, ___', answer: '25', hint: 'Immer +5.', difficulty: 1, explanation: '20 + 5 = 25' },
      { question: 'Was ist die Regel? 1, 4, 7, 10, 13...', answer: 'immer plus 3', hint: 'Wie viel kommt jeweils dazu?', difficulty: 2, explanation: 'Die Regel ist +3.' },
      { question: 'Finde x: x × 4 = 20', answer: '5', hint: '20 ÷ 4 = ?', difficulty: 1, explanation: '20 ÷ 4 = 5' },
      { question: 'Wenn 3 Äpfel 6 € kosten, was kostet 1 Apfel?', answer: '2', hint: '6 ÷ 3 = ?', difficulty: 1, explanation: '6 ÷ 3 = 2 €' },
      { question: 'Ergänze die Tabelle: x=1→y=3, x=2→y=6, x=3→y=?', answer: '9', hint: 'y = x × 3', difficulty: 2, explanation: '3 × 3 = 9' },
      { question: 'Setze fort: 100, 90, 80, 70, ___', answer: '60', hint: 'Immer −10.', difficulty: 1, explanation: '70 − 10 = 60' },
      { question: 'Finde x: 12 ÷ x = 4', answer: '3', hint: '12 ÷ ? = 4', difficulty: 2, explanation: '12 ÷ 3 = 4' },
      { question: 'Wenn x = 5, was ist 2x + 1?', answer: '11', hint: 'Setze 5 für x ein.', difficulty: 2, explanation: '2×5 + 1 = 11' },
    ],
    '5-6': [
      { question: 'Löse: x + 7 = 12', answer: '5', hint: '12 − 7 = ?', difficulty: 1, explanation: 'x = 12 − 7 = 5' },
      { question: 'Löse: 3x = 18', answer: '6', hint: '18 ÷ 3 = ?', difficulty: 1, explanation: 'x = 18 ÷ 3 = 6' },
      { question: 'Was ist der Wert von 2x + 3 wenn x = 4?', answer: '11', hint: 'Setze 4 ein.', difficulty: 1, explanation: '2×4 + 3 = 11' },
      { question: 'Löse: x − 5 = 8', answer: '13', hint: '8 + 5 = ?', difficulty: 1, explanation: 'x = 8 + 5 = 13' },
      { question: 'y = 2x. Wenn x=5, was ist y?', answer: '10', hint: '2 × 5 = ?', difficulty: 1, explanation: 'y = 2 × 5 = 10' },
      { question: 'Löse: 2x + 4 = 14', answer: '5', hint: 'Erst −4, dann ÷2.', difficulty: 2, explanation: '2x = 10, x = 5' },
      { question: 'Setze fort: 1, 3, 6, 10, ___ (Dreieckszahlen)', answer: '15', hint: '+2, +3, +4, +?', difficulty: 2, explanation: '10 + 5 = 15' },
      { question: 'y = 3x − 2. Wenn y = 7, was ist x?', answer: '3', hint: '7 + 2 = 9, dann 9 ÷ 3.', difficulty: 2, explanation: '3x = 9, x = 3' },
      { question: 'Sind 2x und x + x das Gleiche?', answer: 'Ja', hint: 'x + x = 2 mal x.', difficulty: 1, explanation: 'Ja, x + x = 2x.' },
      { question: 'Löse: x/2 = 8', answer: '16', hint: 'Beide Seiten × 2.', difficulty: 2, explanation: 'x = 8 × 2 = 16' },
    ],
    '7-8': [
      { question: 'Löse: 2x + 3 = 11', answer: '4', hint: 'Erst −3, dann ÷2.', difficulty: 1, explanation: '2x = 8, x = 4' },
      { question: 'Was ist der y-Achsenabschnitt von y = 3x + 5?', answer: '5', hint: 'Setze x = 0 ein.', difficulty: 1, explanation: 'y(0) = 5' },
      { question: 'Welche Steigung hat y = −2x + 1?', answer: '-2', hint: 'y = mx + b, m ist die Steigung.', difficulty: 1, explanation: 'm = −2' },
      { question: 'Löse: x + y = 10 und x − y = 4. Was ist x?', answer: '7', hint: 'Addiere beide Gleichungen.', difficulty: 2, explanation: '2x = 14, x = 7' },
      { question: 'Vereinfache: 2(3x − 1) + 4', answer: '6x + 2', hint: 'Ausmultiplizieren und zusammenfassen.', difficulty: 2, explanation: '6x − 2 + 4 = 6x + 2' },
      { question: 'Für f(x) = x², was ist f(3)?', answer: '9', hint: '3² = ?', difficulty: 1, explanation: 'f(3) = 9' },
      { question: 'Löse: 5(x − 2) = 3x + 4', answer: '7', hint: '5x − 10 = 3x + 4', difficulty: 2, explanation: '2x = 14, x = 7' },
      { question: 'Was ist die Nullstelle von y = 4x − 8?', answer: '2', hint: 'Setze y = 0.', difficulty: 2, explanation: '4x = 8, x = 2' },
      { question: 'Welcher Term: "das Dreifache einer Zahl minus 7"?', answer: '3x - 7', hint: 'x ist die unbekannte Zahl.', difficulty: 1, explanation: '3x − 7' },
      { question: 'Löse: x² = 49. Gib beide Lösungen an.', answer: '7 und -7', hint: 'Welche Zahlen ergeben quadriert 49?', difficulty: 3, explanation: 'x = 7 oder x = −7' },
    ],
  },
  'L5': {
    '1-2': [
      { question: 'Du wirfst eine Münze. Was kann passieren?', answer: 'Kopf oder Zahl', hint: 'Eine Münze hat zwei Seiten.', difficulty: 1, explanation: 'Kopf oder Zahl.' },
      { question: 'Zähle: Rot, Blau, Rot, Rot, Blau. Welche Farbe kommt öfter?', answer: 'Rot', hint: 'Zähle jede Farbe.', difficulty: 1, explanation: 'Rot: 3×, Blau: 2×.' },
      { question: 'Es gibt 4 rote und 1 blaue Kugel. Welche Farbe ziehst du wahrscheinlicher?', answer: 'Rot', hint: 'Welche Farbe gibt es öfter?', difficulty: 1, explanation: 'Rot ist wahrscheinlicher (4 von 5).' },
      { question: 'Wie viele Augen kann ein Würfel zeigen?', answer: '1, 2, 3, 4, 5 oder 6', hint: 'Schau dir einen Würfel an.', difficulty: 1, explanation: 'Ein Würfel hat die Zahlen 1 bis 6.' },
      { question: 'In der Klasse mögen 8 Kinder Eis und 5 Kuchen. Was ist beliebter?', answer: 'Eis', hint: '8 > 5', difficulty: 1, explanation: 'Eis (8 > 5).' },
      { question: 'Sortiere: 3, 1, 5, 2. Was kommt zuerst?', answer: '1', hint: 'Die kleinste Zahl zuerst.', difficulty: 1, explanation: '1, 2, 3, 5' },
      { question: 'Würfle: Ist es möglich, eine 7 zu würfeln?', answer: 'Nein', hint: 'Der Würfel hat nur 1–6.', difficulty: 1, explanation: 'Nein, ein Würfel zeigt nur 1–6.' },
      { question: 'Du hast 3 rote, 3 blaue Kugeln. Ist rot und blau gleich wahrscheinlich?', answer: 'Ja', hint: 'Gleich viele von jeder Farbe.', difficulty: 1, explanation: 'Ja, 3 = 3, also gleich wahrscheinlich.' },
      { question: 'Wie viele Kinder sind in einer Reihe: ●●●●●?', answer: '5', hint: 'Zähle die Punkte.', difficulty: 1, explanation: '5 Punkte = 5 Kinder.' },
      { question: 'Was ist wahrscheinlicher: Sonne morgen ODER Schnee im Juli?', answer: 'Sonne morgen', hint: 'Was passiert häufiger?', difficulty: 1, explanation: 'Sonne morgen ist viel wahrscheinlicher.' },
    ],
    '3-4': [
      { question: 'Du wirfst eine Münze. Wie viele mögliche Ergebnisse gibt es?', answer: '2', hint: 'Kopf oder Zahl.', difficulty: 1, explanation: 'Kopf und Zahl = 2 Ergebnisse.' },
      { question: '5 Mädchen und 7 Jungen. Wie viele Kinder insgesamt?', answer: '12', hint: '5 + 7 = ?', difficulty: 1, explanation: '5 + 7 = 12' },
      { question: 'Modus von 3, 5, 3, 7, 3, 8?', answer: '3', hint: 'Welche Zahl kommt am öftesten vor?', difficulty: 1, explanation: '3 kommt 3-mal vor.' },
      { question: 'Mittelwert von 4, 6, 8?', answer: '6', hint: 'Addiere alle und teile durch die Anzahl.', difficulty: 2, explanation: '(4+6+8) ÷ 3 = 6' },
      { question: '3 rote und 2 blaue Kugeln. Wie viele insgesamt?', answer: '5', hint: '3 + 2 = ?', difficulty: 1, explanation: '3 + 2 = 5 Kugeln' },
      { question: 'Ist es möglich: Ein Würfel zeigt die 7?', answer: 'unmöglich', hint: 'Ein Würfel hat 1–6.', difficulty: 1, explanation: 'Unmöglich, Würfel zeigt nur 1–6.' },
      { question: 'Alle Augen eines Würfels zusammen?', answer: '21', hint: '1+2+3+4+5+6', difficulty: 2, explanation: '1+2+3+4+5+6 = 21' },
      { question: 'Balken für Hund: 6 cm, Katze: 4 cm. Was ist beliebter?', answer: 'Hund', hint: 'Höherer Balken = mehr.', difficulty: 1, explanation: 'Hund (6 > 4).' },
      { question: '2 Münzen werfen: Wie viele verschiedene Ergebnisse?', answer: '4', hint: 'KK, KZ, ZK, ZZ', difficulty: 2, explanation: 'KK, KZ, ZK, ZZ = 4' },
      { question: 'Wahrscheinlicher: eine 6 oder KEINE 6 würfeln?', answer: 'keine 6 würfeln', hint: '5 von 6 sind keine 6.', difficulty: 2, explanation: 'P(keine 6) = 5/6 > P(6) = 1/6' },
    ],
    '5-6': [
      { question: 'Berechne den Mittelwert: 10, 20, 30, 40.', answer: '25', hint: 'Summe ÷ Anzahl', difficulty: 1, explanation: '100 ÷ 4 = 25' },
      { question: 'Wie groß ist die Wahrscheinlichkeit, eine 6 zu würfeln?', answer: '1/6', hint: '1 günstig von 6 möglichen.', difficulty: 1, explanation: 'P(6) = 1/6' },
      { question: 'Spannweite von 3, 8, 12, 5, 1?', answer: '11', hint: 'Größter − kleinster Wert.', difficulty: 1, explanation: '12 − 1 = 11' },
      { question: 'Was ist der Median von 2, 5, 1, 8, 3?', answer: '3', hint: 'Sortiere und nimm den mittleren Wert.', difficulty: 2, explanation: 'Sortiert: 1,2,3,5,8 → Median = 3' },
      { question: 'Wahrscheinlichkeit, aus 4 roten und 6 blauen eine rote zu ziehen?', answer: '4/10', hint: '4 günstig von 10 möglich.', difficulty: 2, explanation: 'P = 4/10 = 2/5' },
      { question: 'In einer Klasse: 12 mögen Fußball, 8 Basketball, 5 beides. Wie viele mögen mindestens eins?', answer: '15', hint: '12 + 8 − 5 (nicht doppelt zählen!)', difficulty: 3, explanation: '12 + 8 − 5 = 15' },
      { question: 'Du wirfst 2 Würfel. Wie viele mögliche Ergebnisse gibt es?', answer: '36', hint: '6 × 6', difficulty: 2, explanation: '6 × 6 = 36 Kombinationen' },
      { question: 'Mittelwert von 7, 3, 5, 9, 6?', answer: '6', hint: 'Summe: 30, Anzahl: 5', difficulty: 1, explanation: '30 ÷ 5 = 6' },
      { question: 'Wie viel Prozent sind 15 von 60?', answer: '25', hint: '15/60 × 100', difficulty: 2, explanation: '15/60 = 0,25 = 25%' },
      { question: 'Ein Glücksrad hat 4 gleiche Felder: rot, blau, grün, gelb. P(rot)?', answer: '1/4', hint: '1 von 4 Feldern.', difficulty: 1, explanation: 'P(rot) = 1/4 = 25%' },
    ],
    '7-8': [
      { question: 'Berechne den Median: 12, 5, 8, 3, 15, 7, 10.', answer: '8', hint: 'Sortieren, mittleren Wert nehmen.', difficulty: 1, explanation: 'Sortiert: 3,5,7,8,10,12,15 → Median=8' },
      { question: 'P(mindestens eine 6 bei 2 Würfeln)?', answer: '11/36', hint: 'Gegenwahrscheinlichkeit: P(keine 6) = 25/36.', difficulty: 3, explanation: '1 − 25/36 = 11/36' },
      { question: 'Was ist die Standardabweichung ein Maß für?', answer: 'Streuung', hint: 'Wie weit liegen Werte vom Mittelwert entfernt?', difficulty: 1, explanation: 'Die Standardabweichung misst die Streuung der Daten.' },
      { question: 'Mittelwert von 2, 4, 6, 8, 10, 12?', answer: '7', hint: '42 ÷ 6', difficulty: 1, explanation: '42 ÷ 6 = 7' },
      { question: 'P(gerade Zahl beim Würfeln)?', answer: '1/2', hint: '2, 4, 6 sind gerade – 3 von 6.', difficulty: 1, explanation: '3/6 = 1/2' },
      { question: 'Baumdiagramm: 2 Münzen. Wie viele Pfade?', answer: '4', hint: 'Jede Münze: 2 Möglichkeiten.', difficulty: 1, explanation: '2 × 2 = 4 Pfade' },
      { question: 'Was ist ein Boxplot?', answer: 'Diagramm mit Minimum, Q1, Median, Q3, Maximum', hint: 'Es zeigt die 5 wichtigsten Kennwerte.', difficulty: 2, explanation: 'Ein Boxplot stellt die 5-Punkt-Zusammenfassung grafisch dar.' },
      { question: 'Relative Häufigkeit: 30 Versuche, 12× Treffer?', answer: '0,4', hint: '12/30', difficulty: 1, explanation: '12/30 = 0,4 = 40%' },
      { question: 'Sind die Ereignisse "gerade Zahl" und "Zahl > 4" unabhängig?', answer: 'Nein', hint: 'Prüfe ob P(A∩B) = P(A)×P(B).', difficulty: 3, explanation: 'P(gerade)=1/2, P(>4)=1/3, P(gerade ∧ >4)=1/6=1/2×1/3, also ja, sie sind unabhängig.' },
      { question: 'Wie viele Möglichkeiten: 3 Buchstaben aus A,B,C,D (ohne Zurücklegen)?', answer: '24', hint: '4 × 3 × 2', difficulty: 2, explanation: '4! / 1! = 24 Permutationen' },
    ],
  },
}

function getMockTasks(competencyId, grade) {
  const compTasks = MOCK_TASKS[competencyId]
  const mockKey = MOCK_GRADE_MAP[grade] || grade
  if (!compTasks) return MOCK_TASKS['L1']['3-4']
  return compTasks[mockKey] || Object.values(compTasks)[0]
}

function mockCheckAnswer(correctAnswer, studentAnswer) {
  const normalize = (s) => s.toString().toLowerCase().trim()
    .replace(/,/g, '.').replace(/\s+/g, ' ')
    .replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/\s*€\s*/g, '').replace(/\s*cm[²³]?\s*/g, '').replace(/\s*°\s*/g, '')
  const a = normalize(correctAnswer)
  const b = normalize(studentAnswer)
  const correct = a === b || a.includes(b) || b.includes(a)
  return {
    correct,
    feedback: correct
      ? 'Super gemacht! Das ist richtig! 🎉'
      : `Das war leider nicht ganz richtig. Die richtige Antwort ist: ${correctAnswer}`,
    tip: correct
      ? 'Weiter so, du bist auf einem tollen Weg!'
      : 'Nicht aufgeben – beim nächsten Mal klappt es bestimmt!',
  }
}

// ============================================================
// API FUNCTIONS
// ============================================================

async function generateTasksAPI(competencyArea, gradeLevel) {
  const niveau = GRADE_LEVELS.find(g => g.grades === gradeLevel)?.niveau
  const competency = COMPETENCY_AREAS.find(c => c.id === competencyArea)

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Du bist ein Mathematik-Didaktiker für den Rahmenlehrplan Berlin-Brandenburg 2023.

Erstelle genau 10 Mathematik-Aufgaben für:
- Leitidee: ${competency.id} – ${competency.name}
- Klassenstufe: ${gradeLevel} (Niveaustufe ${niveau})
- Bezug: RLP Berlin-Brandenburg 2023, Teil C Mathematik

Anforderungen:
- Aufgaben passend zum Niveau der Klassenstufe
- Aufsteigende Schwierigkeit (1=leicht, 2=mittel, 3=schwer)
- Kurze, eindeutige Antworten (Zahl, kurzer Satz, mathematischer Ausdruck)
- Alle Texte auf Deutsch, kindgerecht und ermutigend

Antworte NUR mit einem JSON-Array:
[{"question":"...","answer":"...","hint":"...","difficulty":1,"explanation":"..."}]`
      }],
    }),
  })

  if (!response.ok) throw new Error(`API-Fehler: ${response.status}`)
  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Konnte keine Aufgaben lesen.')
  return JSON.parse(jsonMatch[0])
}

async function checkAnswerAPI(question, correctAnswer, studentAnswer) {
  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Du bist ein freundlicher Mathematik-Tutor.

Frage: ${question}
Korrekte Antwort: ${correctAnswer}
Antwort des Schülers: ${studentAnswer}

Bewerte flexibel (akzeptiere äquivalente Darstellungen: "1/2"="0,5"="0.5", "qm"="m²", kleine Tippfehler).

Antworte NUR mit JSON:
{"correct":true/false,"feedback":"Ermutigendes Feedback auf Deutsch","tip":"Hilfreicher Tipp oder Lob"}`
      }],
    }),
  })

  if (!response.ok) throw new Error(`API-Fehler: ${response.status}`)
  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Konnte Feedback nicht lesen.')
  return JSON.parse(jsonMatch[0])
}

async function generateTasks(competencyId, grade) {
  try {
    const tasks = await generateTasksAPI(competencyId, grade)
    return { tasks, isMock: false }
  } catch {
    return { tasks: getMockTasks(competencyId, grade), isMock: true }
  }
}

async function checkAnswer(question, correctAnswer, studentAnswer, useMock) {
  if (useMock) return mockCheckAnswer(correctAnswer, studentAnswer)
  try {
    return await checkAnswerAPI(question, correctAnswer, studentAnswer)
  } catch {
    return mockCheckAnswer(correctAnswer, studentAnswer)
  }
}

// ============================================================
// LOCALSTORAGE HELPERS
// ============================================================

const STORAGE_KEY_PROFILES = 'mathe-learnground-profiles'
const STORAGE_KEY_ACTIVE = 'mathe-learnground-active-profile'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles))
}

function loadActiveProfileId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE)
}

function saveActiveProfileId(id) {
  if (id) localStorage.setItem(STORAGE_KEY_ACTIVE, id)
  else localStorage.removeItem(STORAGE_KEY_ACTIVE)
}

// ============================================================
// STATE MANAGEMENT
// ============================================================

const initialState = {
  currentUser: null,
  profiles: loadProfiles(),
  currentPage: PAGES.PROFILE,
  selectedCompetency: null,
  selectedGrade: null,
  tasks: [],
  currentTaskIndex: 0,
  answers: [],
  sessionActive: false,
  sessionComplete: false,
  isLoading: false,
  error: null,
  useMock: false,
  medals: { L1: false, L2: false, L3: false, L4: false, L5: false },
  newMedalUnlocked: null,
  sessionHistory: [],
}

function appReducer(state, action) {
  switch (action.type) {
    // ---- Profile actions ----
    case 'REGISTER': {
      const newProfile = {
        id: 'profile_' + Date.now(),
        name: action.name.trim(),
        emoji: action.emoji || '🌟',
        createdAt: new Date().toISOString(),
        medals: { L1: false, L2: false, L3: false, L4: false, L5: false },
        sessionHistory: [],
      }
      const updatedProfiles = [...state.profiles, newProfile]
      saveProfiles(updatedProfiles)
      saveActiveProfileId(newProfile.id)
      return {
        ...state,
        profiles: updatedProfiles,
        currentUser: newProfile,
        medals: newProfile.medals,
        sessionHistory: newProfile.sessionHistory,
        currentPage: PAGES.HOME,
      }
    }
    case 'LOGIN': {
      const profile = state.profiles.find(p => p.id === action.profileId)
      if (!profile) return state
      saveActiveProfileId(profile.id)
      return {
        ...state,
        currentUser: profile,
        medals: profile.medals,
        sessionHistory: profile.sessionHistory,
        currentPage: PAGES.HOME,
      }
    }
    case 'LOGOUT': {
      saveActiveProfileId(null)
      return {
        ...state,
        currentUser: null,
        medals: { L1: false, L2: false, L3: false, L4: false, L5: false },
        sessionHistory: [],
        currentPage: PAGES.PROFILE,
        selectedCompetency: null,
        selectedGrade: null,
        tasks: [],
        currentTaskIndex: 0,
        answers: [],
        sessionActive: false,
        sessionComplete: false,
      }
    }
    case 'DELETE_PROFILE': {
      const filtered = state.profiles.filter(p => p.id !== action.profileId)
      saveProfiles(filtered)
      if (state.currentUser?.id === action.profileId) {
        saveActiveProfileId(null)
        return { ...state, profiles: filtered, currentUser: null, medals: { L1: false, L2: false, L3: false, L4: false, L5: false }, sessionHistory: [], currentPage: PAGES.PROFILE }
      }
      return { ...state, profiles: filtered }
    }
    // ---- Existing actions ----
    case 'NAVIGATE':
      return { ...state, currentPage: action.page }
    case 'SELECT_COMPETENCY':
      return { ...state, selectedCompetency: action.id }
    case 'SELECT_GRADE':
      return { ...state, selectedGrade: action.grade }
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null }
    case 'TASKS_LOADED':
      return { ...state, tasks: action.tasks, currentTaskIndex: 0, answers: [], sessionActive: true, sessionComplete: false, isLoading: false, useMock: action.useMock || false }
    case 'LOADING_ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'SUBMIT_ANSWER':
      return { ...state, answers: [...state.answers, action.answer], isLoading: false }
    case 'NEXT_TASK':
      return { ...state, currentTaskIndex: state.currentTaskIndex + 1 }
    case 'COMPLETE_SESSION': {
      const correctCount = state.answers.filter(a => a.correct).length
      const earned = correctCount >= 6
      const isNew = earned && !state.medals[state.selectedCompetency]
      const newMedals = earned ? { ...state.medals, [state.selectedCompetency]: true } : state.medals
      const newEntry = {
        competencyId: state.selectedCompetency,
        grade: state.selectedGrade,
        date: new Date().toISOString(),
        correctCount,
        totalCount: state.answers.length,
      }
      const newHistory = [...state.sessionHistory, newEntry]
      // Persist to localStorage
      if (state.currentUser) {
        const updatedProfile = { ...state.currentUser, medals: newMedals, sessionHistory: newHistory }
        const updatedProfiles = state.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        saveProfiles(updatedProfiles)
        return {
          ...state,
          sessionActive: false,
          sessionComplete: true,
          medals: newMedals,
          newMedalUnlocked: isNew ? state.selectedCompetency : null,
          sessionHistory: newHistory,
          currentUser: updatedProfile,
          profiles: updatedProfiles,
        }
      }
      return {
        ...state,
        sessionActive: false,
        sessionComplete: true,
        medals: newMedals,
        newMedalUnlocked: isNew ? state.selectedCompetency : null,
        sessionHistory: newHistory,
      }
    }
    case 'DISMISS_CELEBRATION':
      return { ...state, newMedalUnlocked: null }
    case 'RESET_SESSION':
      return { ...state, selectedCompetency: null, selectedGrade: null, tasks: [], currentTaskIndex: 0, answers: [], sessionActive: false, sessionComplete: false, error: null, useMock: false }
    default:
      return state
  }
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function FloatingSymbols() {
  const symbols = useMemo(() =>
    MATH_SYMBOLS.map((sym, i) => ({
      sym,
      left: `${(i * 11 + 3) % 95}%`,
      duration: `${20 + (i * 4) % 15}s`,
      delay: `${i * 2.8}s`,
      size: `${1.4 + (i % 3) * 0.6}rem`,
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {symbols.map((s, i) => (
        <span
          key={i}
          className="math-symbol"
          style={{ left: s.left, fontSize: s.size, animationDuration: s.duration, animationDelay: s.delay }}
        >
          {s.sym}
        </span>
      ))}
    </div>
  )
}

function BrainMascot({ size = 'large' }) {
  const sizeClass = size === 'large' ? 'w-[36rem] h-[36rem] -mt-16' : size === 'medium' ? 'w-52 h-52' : 'w-24 h-24'

  return (
    <div className={`brain-bounce relative inline-flex items-center justify-center ${sizeClass}`}>
      <img src="/brain-mascot.svg" alt="Mathe Learnground Maskottchen" className="w-full h-full object-contain drop-shadow-md" />
    </div>
  )
}

function Navigation({ currentPage, onNavigate, currentUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { page: PAGES.HOME, label: 'Learnground', icon: '🏠' },
    { page: PAGES.TASKS, label: 'Meine Aufgaben', icon: '📝' },
    { page: PAGES.MEDALS, label: 'Medaillen', icon: '🏅' },
    { page: PAGES.PROGRESS, label: 'Fortschritt', icon: '📊' },
    { page: PAGES.HELP, label: 'Hilfe', icon: '❓' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b border-sky/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate(PAGES.HOME)}
          className="font-heading font-bold text-xl text-dark flex items-center gap-2 hover:text-sky transition-colors cursor-pointer"
        >
          <img src="/brain-mascot.svg" alt="Brain" className="w-8 h-8 object-contain" />
          <span>Mathe <span className="text-sky">Learnground</span></span>
        </button>

        {currentUser && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-3 py-2 rounded-xl text-sm font-body font-semibold transition-all cursor-pointer
                  ${currentPage === item.page
                    ? 'bg-sky/10 text-sky'
                    : 'text-dark-light hover:text-dark hover:bg-cream-dark/50'}`}
              >
                <span className="mr-1">{item.icon}</span> {item.label}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-sky/20">
              <span className="text-lg">{currentUser.emoji}</span>
              <span className="font-body font-semibold text-sm text-dark">{currentUser.name}</span>
              <button
                onClick={onLogout}
                className="ml-1 text-xs px-2 py-1 rounded-lg text-dark-light hover:bg-error/10 hover:text-error font-heading font-semibold transition-colors cursor-pointer"
              >
                Wechseln
              </button>
            </div>
          </div>
        )}

        <button
          className="md:hidden text-2xl p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-sky/20 shadow-lg">
          {currentUser && navItems.map(item => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setMenuOpen(false) }}
              className={`w-full text-left px-6 py-3 font-body font-semibold transition-colors cursor-pointer
                ${currentPage === item.page ? 'bg-sky/10 text-sky' : 'text-dark-light hover:bg-cream'}`}
            >
              <span className="mr-2">{item.icon}</span> {item.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => { onLogout(); setMenuOpen(false) }}
              className="w-full text-left px-6 py-3 font-body font-semibold text-dark-light hover:bg-cream border-t border-sky/20 cursor-pointer"
            >
              <span className="mr-2">{currentUser.emoji}</span>
              {currentUser.name} – Profil wechseln
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

function MedalBadge({ competencyId, earned, size = 'medium', showLabel = true }) {
  const comp = COMPETENCY_AREAS.find(c => c.id === competencyId)
  const sizeClass = size === 'large' ? 'w-28 h-28 text-5xl' : size === 'medium' ? 'w-20 h-20 text-3xl' : 'w-12 h-12 text-xl'

  const bgColors = {
    L1: 'from-sky to-sky-dark',
    L2: 'from-pink to-pink-dark',
    L3: 'from-sky-light to-sky',
    L4: 'from-warning to-warning-light',
    L5: 'from-pink-light to-pink',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClass} rounded-full flex items-center justify-center shadow-lg relative transition-all
        ${earned
          ? `bg-gradient-to-br ${bgColors[competencyId]} border-4 border-white`
          : 'bg-gray-200 border-4 border-gray-300 grayscale opacity-60'}`}
      >
        <span className={earned ? '' : 'grayscale opacity-50'}>{comp?.emoji}</span>
        {earned && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
            ✓
          </div>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={`font-heading font-semibold text-sm ${earned ? 'text-dark' : 'text-gray-400'}`}>
            {comp?.medalName}
          </p>
          {!earned && <p className="text-xs text-gray-400">Noch nicht verdient</p>}
        </div>
      )}
    </div>
  )
}

function ConfettiOverlay({ competencyId, onDismiss }) {
  const comp = COMPETENCY_AREAS.find(c => c.id === competencyId)
  const colors = ['#F4A4B8', '#7EC8E3', '#FFD93D', '#6BCB77', '#FF6B6B', '#B8E0F0', '#FADADD']

  const confetti = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      color: colors[i % colors.length],
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
      shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '2px',
    })), [])

  useEffect(() => {
    const t = setTimeout(onDismiss, 8000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-dark/60 backdrop-blur-sm" onClick={onDismiss}>
      {confetti.map((c, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.shape,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        />
      ))}
      <div className="medal-unlock bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="text-6xl mb-4">{comp?.emoji}</div>
        <h2 className="font-heading font-bold text-3xl text-dark mb-2 shimmer-text">
          Herzlichen Glückwunsch!
        </h2>
        <p className="font-body text-lg text-dark-light mb-2">
          Du hast die Medaille verdient:
        </p>
        <p className="font-heading font-bold text-2xl text-sky mb-1">{comp?.medalName}</p>
        <p className="font-body text-dark-light mb-6">{comp?.name}</p>
        <button
          onClick={onDismiss}
          className="bg-sky text-white font-heading font-semibold px-8 py-3 rounded-2xl shadow-md hover:bg-sky-dark transition-colors cursor-pointer"
        >
          Weiter
        </button>
      </div>
    </div>
  )
}

function LoadingSpinner({ text = 'Laden...' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <BrainMascot size="medium" mood="thinking" />
      <div className="w-10 h-10 border-4 border-sky/30 border-t-sky rounded-full animate-spin" />
      <p className="font-body text-dark-light text-lg">{text}</p>
    </div>
  )
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-error-light/20 border-2 border-error/30 rounded-2xl p-6 text-center fade-in mt-4">
      <p className="text-3xl mb-2">😟</p>
      <p className="font-body text-dark font-semibold mb-2">Ups, etwas ist schiefgelaufen!</p>
      <p className="font-body text-dark-light text-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="bg-error text-white font-heading font-semibold px-6 py-2 rounded-xl hover:bg-error/80 transition-colors cursor-pointer">
          Erneut versuchen
        </button>
      )}
    </div>
  )
}

// ============================================================
// PAGE: HOME
// ============================================================

function ProfilePage({ state, dispatch }) {
  const [showRegister, setShowRegister] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🌟')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleRegister = () => {
    if (!newName.trim()) return
    dispatch({ type: 'REGISTER', name: newName, emoji: selectedEmoji })
  }

  if (showRegister) {
    return (
      <div className="fade-in max-w-md mx-auto text-center pt-8">
        <BrainMascot size="medium" />
        <h2 className="font-heading font-bold text-3xl text-dark mt-4 mb-2">Neues Profil erstellen</h2>
        <p className="font-body text-dark-light mb-6">Wähle einen Namen und ein Bild für dein Profil!</p>
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block font-heading font-semibold text-sm text-dark mb-2 text-left">Dein Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              placeholder="z.B. Lena, Max, ..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-sky/30 font-body text-dark text-lg focus:border-sky focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-dark mb-2 text-left">Dein Profilbild</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all cursor-pointer
                    ${selectedEmoji === emoji ? 'bg-sky/20 ring-2 ring-sky scale-110' : 'hover:bg-cream-dark/50'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-cream rounded-xl p-3">
            <span className="text-3xl">{selectedEmoji}</span>
            <span className="font-heading font-semibold text-dark">{newName.trim() || '...'}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRegister(false)}
              className="flex-1 px-4 py-3 rounded-xl font-heading font-semibold text-dark-light border-2 border-gray-200 hover:bg-cream-dark/50 transition-colors cursor-pointer"
            >
              Zurück
            </button>
            <button
              onClick={handleRegister}
              disabled={!newName.trim()}
              className="flex-1 px-4 py-3 rounded-xl font-heading font-bold text-white bg-sky hover:bg-sky-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
            >
              Los geht's!
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in max-w-lg mx-auto text-center pt-8">
      <BrainMascot size="medium" />
      <h2 className="font-heading font-bold text-3xl text-dark mt-4 mb-2">Willkommen bei Mathe Learnground!</h2>
      <p className="font-body text-dark-light mb-6">Wer bist du heute?</p>
      {state.profiles.length > 0 && (
        <div className="space-y-3 mb-6">
          {state.profiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
              <button
                onClick={() => dispatch({ type: 'LOGIN', profileId: profile.id })}
                className="flex-1 flex items-center gap-4 cursor-pointer text-left"
              >
                <span className="text-3xl">{profile.emoji}</span>
                <div>
                  <p className="font-heading font-semibold text-dark">{profile.name}</p>
                  <p className="font-body text-xs text-dark-light">
                    {Object.values(profile.medals).filter(Boolean).length}/5 Medaillen · {profile.sessionHistory.length} Sessions
                  </p>
                </div>
              </button>
              {confirmDelete === profile.id ? (
                <div className="flex gap-1">
                  <button onClick={() => dispatch({ type: 'DELETE_PROFILE', profileId: profile.id })} className="text-xs px-2 py-1 rounded-lg bg-error text-white font-heading font-semibold cursor-pointer">Ja</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-dark font-heading font-semibold cursor-pointer">Nein</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(profile.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-error text-sm transition-all cursor-pointer p-1"
                  title="Profil löschen"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowRegister(true)}
        className="w-full bg-sky text-white font-heading font-bold text-lg px-6 py-4 rounded-2xl shadow-lg hover:bg-sky-dark hover:shadow-xl transition-all cursor-pointer"
      >
        ➕ Neues Profil erstellen
      </button>
    </div>
  )
}

function HomePage({ state, dispatch }) {
  const earnedCount = Object.values(state.medals).filter(Boolean).length
  const totalTasks = state.sessionHistory.reduce((sum, s) => sum + s.totalCount, 0)

  return (
    <div className="fade-in">
      <section className="text-center pt-0 pb-2">
        <BrainMascot size="large" />
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-dark -mt-12">
          Mathe <span className="text-sky">Learnground</span>
        </h1>
        <p className="font-body text-lg md:text-xl text-dark-light mt-2 max-w-lg mx-auto">
          Mathe weiterdenken – Diagnose und Förderung in der Praxis umsetzen
        </p>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', page: PAGES.TASKS })}
          className="mt-6 bg-sky text-white font-heading font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:bg-sky-dark hover:shadow-xl transition-all cursor-pointer"
        >
          🚀 Jetzt starten
        </button>
      </section>

      {state.sessionHistory.length > 0 && (
        <section className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-heading font-bold text-2xl text-sky">{totalTasks}</p>
            <p className="font-body text-xs text-dark-light">Aufgaben</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-heading font-bold text-2xl text-pink">{earnedCount}/5</p>
            <p className="font-body text-xs text-dark-light">Medaillen</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="font-heading font-bold text-2xl text-success">{state.sessionHistory.length}</p>
            <p className="font-body text-xs text-dark-light">Sessions</p>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-heading font-bold text-2xl text-dark text-center mb-6">
          Deine 5 Kompetenzbereiche
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {COMPETENCY_AREAS.map(comp => (
            <button
              key={comp.id}
              onClick={() => {
                dispatch({ type: 'SELECT_COMPETENCY', id: comp.id })
                dispatch({ type: 'NAVIGATE', page: PAGES.TASKS })
              }}
              className="bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-sky/40 hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{comp.emoji}</span>
                <MedalBadge competencyId={comp.id} earned={state.medals[comp.id]} size="small" showLabel={false} />
              </div>
              <h3 className="font-heading font-semibold text-sm text-dark group-hover:text-sky transition-colors">{comp.name}</h3>
              <p className="font-body text-xs text-dark-light mt-1">{comp.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ============================================================
// PAGE: TASKS
// ============================================================

function TasksPage({ state, dispatch }) {
  const [studentAnswer, setStudentAnswer] = useState('')
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'START_LOADING' })
    try {
      const { tasks, isMock } = await generateTasks(state.selectedCompetency, state.selectedGrade)
      dispatch({ type: 'TASKS_LOADED', tasks, useMock: isMock })
    } catch (err) {
      dispatch({ type: 'LOADING_ERROR', error: err.message })
    }
  }, [state.selectedCompetency, state.selectedGrade, dispatch])

  const handleSubmit = useCallback(async () => {
    if (!studentAnswer.trim()) return
    dispatch({ type: 'START_LOADING' })
    try {
      const task = state.tasks[state.currentTaskIndex]
      const feedback = await checkAnswer(task.question, task.answer, studentAnswer, state.useMock)
      dispatch({
        type: 'SUBMIT_ANSWER',
        answer: { taskIndex: state.currentTaskIndex, studentAnswer, correct: feedback.correct, feedback: feedback.feedback, tip: feedback.tip },
      })
      setCurrentFeedback(feedback)
    } catch (err) {
      dispatch({ type: 'LOADING_ERROR', error: err.message })
    }
  }, [state.tasks, state.currentTaskIndex, studentAnswer, state.useMock, dispatch])

  const handleNext = useCallback(() => {
    if (state.currentTaskIndex >= 9) {
      dispatch({ type: 'COMPLETE_SESSION' })
    } else {
      dispatch({ type: 'NEXT_TASK' })
      setStudentAnswer('')
      setCurrentFeedback(null)
      setShowHint(false)
    }
  }, [state.currentTaskIndex, dispatch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (currentFeedback) handleNext()
      else handleSubmit()
    }
  }, [currentFeedback, handleNext, handleSubmit])

  // Session Complete
  if (state.sessionComplete) {
    const correctCount = state.answers.filter(a => a.correct).length
    const comp = COMPETENCY_AREAS.find(c => c.id === state.selectedCompetency)
    const earned = correctCount >= 6

    return (
      <div className="fade-in max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md text-center">
          <BrainMascot size="medium" mood={earned ? 'celebrate' : 'happy'} />
          <h2 className="font-heading font-bold text-3xl text-dark mt-4 mb-2">Ergebnis</h2>
          <p className="font-body text-dark-light mb-4">{comp?.name} – {GRADE_LEVELS.find(g => g.grades === state.selectedGrade)?.label}</p>

          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4 ${earned ? 'bg-success-light/30' : 'bg-error-light/30'}`}>
            <span className="text-4xl">{earned ? '🎉' : '💪'}</span>
            <div className="text-left">
              <p className="font-heading font-bold text-2xl text-dark">{correctCount} von 10 richtig</p>
              <p className="font-body text-sm text-dark-light">
                {earned ? 'Medaille verdient!' : 'Du brauchst 6 richtige für die Medaille.'}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full progress-fill ${earned ? 'bg-success' : 'bg-warning'}`}
              style={{ width: `${correctCount * 10}%` }}
            />
          </div>

          <div className="space-y-2 mb-6 text-left max-h-80 overflow-y-auto">
            {state.answers.map((ans, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${ans.correct ? 'bg-success/5' : 'bg-error/5'}`}>
                <span className="text-lg mt-0.5">{ans.correct ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-dark font-semibold">{state.tasks[i]?.question}</p>
                  <p className="font-body text-xs text-dark-light">
                    Deine Antwort: <span className={ans.correct ? 'text-success font-semibold' : 'text-error'}>{ans.studentAnswer}</span>
                    {!ans.correct && <span className="text-dark-light"> (Richtig: {state.tasks[i]?.answer})</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => { dispatch({ type: 'RESET_SESSION' }); dispatch({ type: 'SELECT_COMPETENCY', id: state.selectedCompetency }) }}
              className="bg-sky text-white font-heading font-semibold px-6 py-3 rounded-2xl shadow-md hover:bg-sky-dark transition-colors cursor-pointer"
            >
              Nochmal versuchen
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET_SESSION' })}
              className="bg-white text-dark border-2 border-sky/30 font-heading font-semibold px-6 py-3 rounded-2xl hover:border-sky transition-colors cursor-pointer"
            >
              Neuen Bereich wählen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (state.isLoading && !state.sessionActive) {
    return <LoadingSpinner text="Aufgaben werden generiert..." />
  }

  // Task Solving
  if (state.sessionActive && state.tasks.length > 0) {
    const task = state.tasks[state.currentTaskIndex]
    const comp = COMPETENCY_AREAS.find(c => c.id === state.selectedCompetency)
    const correctSoFar = state.answers.filter(a => a.correct).length

    return (
      <div className="fade-in max-w-2xl mx-auto">
        {state.useMock && (
          <div className="bg-warning-light/30 border border-warning/40 rounded-xl px-4 py-2 mb-4 text-center">
            <p className="font-body text-sm text-dark-light">
              📋 Demo-Modus – Für KI-generierte Aufgaben API-Key in <code className="bg-white px-1 rounded text-xs">.env</code> eintragen
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{comp?.emoji}</span>
            <div>
              <p className="font-heading font-semibold text-sm text-dark">{comp?.name}</p>
              <p className="font-body text-xs text-dark-light">{GRADE_LEVELS.find(g => g.grades === state.selectedGrade)?.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-heading font-semibold text-sm text-dark">Aufgabe {state.currentTaskIndex + 1}/10</p>
            <p className="font-body text-xs text-success">{correctSoFar} richtig</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
          <div className="bg-sky h-full rounded-full transition-all duration-500" style={{ width: `${(state.currentTaskIndex + 1) * 10}%` }} />
        </div>

        <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-md transition-all
          ${currentFeedback ? (currentFeedback.correct ? 'pulse-correct border-2 border-success' : 'pulse-incorrect border-2 border-error') : 'border-2 border-transparent'}`}>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3].map(d => (
              <span key={d} className={`text-sm ${d <= (task?.difficulty || 1) ? 'text-warning' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="font-body text-xs text-dark-light ml-1">
              {(task?.difficulty || 1) === 1 ? 'Leicht' : (task?.difficulty || 1) === 2 ? 'Mittel' : 'Schwer'}
            </span>
          </div>

          <h3 className="font-heading font-bold text-xl md:text-2xl text-dark mb-6">{task?.question}</h3>

          {!currentFeedback && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm font-body text-sky hover:text-sky-dark transition-colors mb-4 cursor-pointer"
            >
              💡 {showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
            </button>
          )}
          {showHint && !currentFeedback && (
            <div className="bg-warning-light/20 border border-warning/30 rounded-xl p-3 mb-4 fade-in">
              <p className="font-body text-sm text-dark">{task?.hint}</p>
            </div>
          )}

          {!currentFeedback && (
            <div className="flex gap-3">
              <input
                type="text"
                value={studentAnswer}
                onChange={e => setStudentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Deine Antwort..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-sky/30 focus:border-sky focus:outline-none font-body text-lg text-dark bg-cream/50"
                disabled={state.isLoading}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!studentAnswer.trim() || state.isLoading}
                className="bg-sky text-white font-heading font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-sky-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? '...' : 'Prüfen'}
              </button>
            </div>
          )}

          {currentFeedback && (
            <div className={`rounded-2xl p-4 mt-4 fade-in ${currentFeedback.correct ? 'bg-success/10' : 'bg-error/10'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{currentFeedback.correct ? '🎉' : '💪'}</span>
                <div>
                  <p className="font-body text-dark font-semibold">{currentFeedback.feedback}</p>
                  <p className="font-body text-sm text-dark-light mt-1">{currentFeedback.tip}</p>
                  {!currentFeedback.correct && task?.explanation && (
                    <p className="font-body text-sm text-dark mt-2">
                      <span className="font-semibold">Erklärung:</span> {task.explanation}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="mt-4 bg-sky text-white font-heading font-semibold px-6 py-2 rounded-xl shadow hover:bg-sky-dark transition-colors cursor-pointer w-full"
              >
                {state.currentTaskIndex >= 9 ? '📊 Ergebnis anzeigen' : 'Nächste Aufgabe →'}
              </button>
            </div>
          )}
        </div>

        {state.error && <ErrorMessage message={state.error} />}
      </div>
    )
  }

  // Selection
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="flex flex-col items-center mb-4">
        <img src="/brain-reading.svg" alt="Brain liest ein Buch" className="w-48 h-48 object-contain drop-shadow-md" />
      </div>
      <h2 className="font-heading font-bold text-3xl text-dark text-center mb-2">Meine Aufgaben</h2>
      <p className="font-body text-dark-light text-center mb-8">Wähle einen Kompetenzbereich und deine Klassenstufe.</p>

      <div className="mb-8">
        <h3 className="font-heading font-semibold text-lg text-dark mb-3">1. Kompetenzbereich wählen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPETENCY_AREAS.map(comp => {
            const colors = COLOR_MAP[comp.color]
            const selected = state.selectedCompetency === comp.id
            return (
              <button
                key={comp.id}
                onClick={() => dispatch({ type: 'SELECT_COMPETENCY', id: comp.id })}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer
                  ${selected ? `${colors.border} ${colors.bgLight} shadow-md` : 'border-gray-200 bg-white hover:border-sky/30 hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{comp.emoji}</span>
                  <div>
                    <p className="font-heading font-semibold text-sm text-dark">{comp.name}</p>
                    <p className="font-body text-xs text-dark-light">{comp.id}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {state.selectedCompetency && (
        <div className="mb-8 fade-in">
          <h3 className="font-heading font-semibold text-lg text-dark mb-3">2. Klassenstufe wählen</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GRADE_LEVELS.map(gl => {
              const selected = state.selectedGrade === gl.grades
              return (
                <button
                  key={gl.grades}
                  onClick={() => dispatch({ type: 'SELECT_GRADE', grade: gl.grades })}
                  className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer
                    ${selected ? 'border-sky bg-sky/10 shadow-md' : 'border-gray-200 bg-white hover:border-sky/30'}`}
                >
                  <p className="font-heading font-semibold text-dark">{gl.label}</p>
                  <p className="font-body text-xs text-dark-light">Niveau {gl.niveau}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {state.selectedCompetency && state.selectedGrade && (
        <div className="text-center fade-in">
          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className="bg-sky text-white font-heading font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:bg-sky-dark hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {state.isLoading ? 'Aufgaben werden erstellt...' : '🎯 10 Aufgaben generieren'}
          </button>
        </div>
      )}

      {state.error && <ErrorMessage message={state.error} onRetry={handleGenerate} />}
    </div>
  )
}

// ============================================================
// PAGE: MEDALS
// ============================================================

function MedalsPage({ state }) {
  const earnedCount = Object.values(state.medals).filter(Boolean).length

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-3xl text-dark mb-2">Deine Medaillen</h2>
        <p className="font-body text-dark-light">
          {earnedCount === 5
            ? '🌟 Alle Medaillen gesammelt – du bist ein Mathe-Champion!'
            : `${earnedCount} von 5 Medaillen verdient`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
        {COMPETENCY_AREAS.map(comp => (
          <div key={comp.id} className="bg-white rounded-2xl p-5 shadow-sm text-center w-full">
            <MedalBadge competencyId={comp.id} earned={state.medals[comp.id]} size="large" />
            <p className="font-body text-xs text-dark-light mt-3">{comp.name}</p>
            {!state.medals[comp.id] && (
              <p className="font-body text-xs text-pink mt-1">6/10 richtige nötig</p>
            )}
          </div>
        ))}
      </div>

      {earnedCount === 5 && (
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-r from-warning-light to-warning rounded-2xl px-8 py-4 shadow-lg">
            <p className="font-heading font-bold text-2xl text-dark">🏆 Mathe-Champion! 🏆</p>
            <p className="font-body text-dark-light text-sm mt-1">Du hast alle 5 Kompetenzbereiche gemeistert!</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// PAGE: PROGRESS
// ============================================================

function RadarChart({ sessionHistory }) {
  const size = 260
  const center = size / 2
  const maxR = size / 2 - 40

  const rates = COMPETENCY_AREAS.map(comp => {
    const sessions = sessionHistory.filter(s => s.competencyId === comp.id)
    if (sessions.length === 0) return 0
    return sessions.reduce((sum, s) => sum + s.correctCount / s.totalCount, 0) / sessions.length
  })

  const angleOffset = -Math.PI / 2
  const getPoint = (i, r) => {
    const angle = angleOffset + (2 * Math.PI * i) / 5
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = rates.map((r, i) => getPoint(i, r * maxR))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
  const labelPoints = COMPETENCY_AREAS.map((_, i) => getPoint(i, maxR + 25))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map(level => {
        const pts = Array.from({ length: 5 }, (_, i) => getPoint(i, level * maxR))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z'
        return <path key={level} d={path} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      })}

      {Array.from({ length: 5 }, (_, i) => {
        const p = getPoint(i, maxR)
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />
      })}

      <path d={dataPath} fill="rgba(126,200,227,0.25)" stroke="#7EC8E3" strokeWidth="2.5" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#7EC8E3" stroke="white" strokeWidth="2" />
      ))}

      {labelPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#3A3A5C">
          {COMPETENCY_AREAS[i].emoji}
        </text>
      ))}
    </svg>
  )
}

function ProgressPage({ state }) {
  const totalTasks = state.sessionHistory.reduce((sum, s) => sum + s.totalCount, 0)
  const totalCorrect = state.sessionHistory.reduce((sum, s) => sum + s.correctCount, 0)
  const successRate = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0
  const earnedCount = Object.values(state.medals).filter(Boolean).length

  if (state.sessionHistory.length === 0) {
    return (
      <div className="fade-in text-center py-16">
        <BrainMascot size="large" />
        <h2 className="font-heading font-bold text-2xl text-dark mt-6 mb-2">Noch keine Daten</h2>
        <p className="font-body text-dark-light max-w-sm mx-auto">
          Löse zuerst ein paar Aufgaben, um deinen Fortschritt hier zu sehen!
        </p>
      </div>
    )
  }

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h2 className="font-heading font-bold text-3xl text-dark text-center mb-6">Dein Fortschritt</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="font-heading font-bold text-3xl text-sky">{totalTasks}</p>
          <p className="font-body text-xs text-dark-light">Aufgaben gelöst</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="font-heading font-bold text-3xl text-success">{successRate}%</p>
          <p className="font-body text-xs text-dark-light">Erfolgsquote</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="font-heading font-bold text-3xl text-pink">{earnedCount}/5</p>
          <p className="font-body text-xs text-dark-light">Medaillen</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="font-heading font-bold text-3xl text-warning">{state.sessionHistory.length}</p>
          <p className="font-body text-xs text-dark-light">Sessions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="font-heading font-semibold text-lg text-dark text-center mb-4">Kompetenz-Übersicht</h3>
        <RadarChart sessionHistory={state.sessionHistory} />
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {COMPETENCY_AREAS.map(comp => (
            <span key={comp.id} className="font-body text-xs text-dark-light">{comp.emoji} {comp.name}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading font-semibold text-lg text-dark mb-4">Letzte Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="font-heading font-semibold text-xs text-dark-light py-2 pr-4">Datum</th>
                <th className="font-heading font-semibold text-xs text-dark-light py-2 pr-4">Bereich</th>
                <th className="font-heading font-semibold text-xs text-dark-light py-2 pr-4">Klasse</th>
                <th className="font-heading font-semibold text-xs text-dark-light py-2 text-right">Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {[...state.sessionHistory].reverse().map((session, i) => {
                const comp = COMPETENCY_AREAS.find(c => c.id === session.competencyId)
                const gl = GRADE_LEVELS.find(g => g.grades === session.grade)
                const passed = session.correctCount >= 6
                return (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="font-body text-sm text-dark-light py-2 pr-4">
                      {new Date(session.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="font-body text-sm text-dark py-2 pr-4">{comp?.emoji} {comp?.name}</td>
                    <td className="font-body text-sm text-dark-light py-2 pr-4">{gl?.label}</td>
                    <td className={`font-heading font-semibold text-sm py-2 text-right ${passed ? 'text-success' : 'text-error'}`}>
                      {session.correctCount}/{session.totalCount} {passed ? '🏅' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// PAGE: HELP
// ============================================================

function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: 'Wie funktioniert Mathe Learnground?', a: 'Wähle einen der 5 mathematischen Kompetenzbereiche und deine Klassenstufe. Die App erstellt dann 10 passende Aufgaben für dich. Nach dem Lösen bekommst du sofort Feedback.' },
    { q: 'Wie bekomme ich eine Medaille?', a: 'Du musst mindestens 6 von 10 Aufgaben in einem Kompetenzbereich richtig lösen. Dann wird deine Medaille freigeschaltet! Es gibt 5 Medaillen – eine pro Kompetenzbereich.' },
    { q: 'Was bedeuten die Kompetenzbereiche?', a: 'Die 5 Kompetenzbereiche (Leitideen) stammen aus dem Rahmenlehrplan Berlin-Brandenburg: L1 Zahlen und Operationen, L2 Größen und Messen, L3 Raum und Form, L4 Gleichungen und Funktionen, L5 Daten und Zufall.' },
    { q: 'Kann ich Aufgaben wiederholen?', a: 'Ja! Du kannst jederzeit einen Kompetenzbereich erneut auswählen und neue Aufgaben generieren. Jede Session wird in deinem Fortschritt gespeichert.' },
    { q: 'Werden meine Daten gespeichert?', a: 'Nein. Alle Daten bleiben nur während der aktuellen Sitzung im Browser. Wenn du die Seite neu lädst, starten alle Fortschritte von vorne.' },
  ]

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <h2 className="font-heading font-bold text-3xl text-dark text-center mb-2">Hilfe & Informationen</h2>
      <p className="font-body text-dark-light text-center mb-8">Häufige Fragen und Projektinformationen</p>

      <div className="space-y-3 mb-8">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-cream/50 transition-colors"
            >
              <span className="font-heading font-semibold text-dark text-sm">{faq.q}</span>
              <span className="text-sky text-lg ml-2">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 fade-in">
                <p className="font-body text-sm text-dark-light">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading font-semibold text-lg text-dark mb-3">Über das Projekt</h3>
        <div className="space-y-3 font-body text-sm text-dark-light">
          <p>
            <span className="font-semibold text-dark">Mathe Learnground</span> ist ein Projekt zur mathematischen
            Diagnose und Förderung, entwickelt am math.media.lab der Humboldt-Universität zu Berlin.
          </p>
          <p>
            Die Aufgaben basieren auf dem <span className="font-semibold text-dark">Rahmenlehrplan Berlin-Brandenburg 2023</span>,
            Teil C Mathematik, und decken die Klassenstufen 1–8 ab.
          </p>
          <p>
            Die App nutzt KI-Technologie (Claude von Anthropic) zur individualisierten Aufgabengenerierung
            und Bewertung von Schülerantworten.
          </p>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-dark-light">
              Konzept & Entwicklung: Klara-Marie Schmidt<br />
              math.media.lab – Humboldt-Universität zu Berlin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Auto-login: restore last active profile on mount
  useEffect(() => {
    const savedId = loadActiveProfileId()
    if (savedId) {
      const profiles = loadProfiles()
      const profile = profiles.find(p => p.id === savedId)
      if (profile) {
        dispatch({ type: 'LOGIN', profileId: profile.id })
      }
    }
  }, [])

  const handleNavigate = useCallback((page) => {
    dispatch({ type: 'NAVIGATE', page })
  }, [])

  const renderPage = () => {
    if (!state.currentUser && state.currentPage !== PAGES.PROFILE) {
      return <ProfilePage state={state} dispatch={dispatch} />
    }
    switch (state.currentPage) {
      case PAGES.PROFILE: return <ProfilePage state={state} dispatch={dispatch} />
      case PAGES.HOME: return <HomePage state={state} dispatch={dispatch} />
      case PAGES.TASKS: return <TasksPage state={state} dispatch={dispatch} />
      case PAGES.MEDALS: return <MedalsPage state={state} />
      case PAGES.PROGRESS: return <ProgressPage state={state} />
      case PAGES.HELP: return <HelpPage />
      default: return <HomePage state={state} dispatch={dispatch} />
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body text-dark relative overflow-hidden">
      <FloatingSymbols />
      <Navigation
        currentPage={state.currentPage}
        onNavigate={handleNavigate}
        currentUser={state.currentUser}
        onLogout={() => dispatch({ type: 'LOGOUT' })}
      />
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8">
        {renderPage()}
      </main>
      {state.newMedalUnlocked && (
        <ConfettiOverlay
          competencyId={state.newMedalUnlocked}
          onDismiss={() => dispatch({ type: 'DISMISS_CELEBRATION' })}
        />
      )}
    </div>
  )
}
