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

const NIVEAU_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// Verteilung der Niveaustufen pro Klassenstufe in Fünfteln.
// Quelle: Rahmenlehrplan Berlin-Brandenburg, Teil C Mathematik.
// Klassen 1–6 aus dem RLP-Diagramm; Klassen 7–8 durch Fortschreibung
// des diagonalen Musters.
const NIVEAU_DISTRIBUTION = {
  '1': { A: 4, B: 1 },
  '2': { A: 1, B: 3, C: 1 },
  '3': { B: 1, C: 3, D: 1 },
  '4': { C: 4, D: 1 },
  '5': { C: 1, D: 3, E: 1 },
  '6': { D: 4, E: 1 },
  '7': { D: 1, E: 3, F: 1 },
  '8': { E: 4, F: 1 },
}

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
    '3-4': [
      {
        type: 'place-value',
        code: 'ZD3',
        niveau: 'C',
        question: 'Trage die Zahl vierhundertdreiundzwanzigtausendsechzig in die Stellenwerttafel ein. Ziehe die Ziffern in die richtigen Felder.',
        number: 423060,
        columns: ['HT', 'ZT', 'T', 'H', 'Z', 'E'],
        answer: '423060',
        hint: 'Sprich die Zahl langsam: vier-HT, zwei-ZT, drei-T, null-H, sechs-Z, null-E.',
        difficulty: 2,
        explanation: '423.060 = 4 HT · 2 ZT · 3 T · 0 H · 6 Z · 0 E',
      },
    ],
    '5-6': [
      {
        type: 'number-line-fraction',
        code: 'ZO4',
        niveau: 'D',
        question: 'Wo liegt 3/4 auf dem Zahlenstrahl? Tippe auf die Stelle.',
        numerator: 3,
        denominator: 4,
        answer: '3/4',
        hint: 'Teile die Strecke von 0 bis 1 in 4 gleich große Abschnitte.',
        difficulty: 1,
        explanation: '3/4 liegt drei Viertel zwischen 0 und 1 – also direkt vor der 1.',
      },
    ],
  },
}

function getMockTasks(competencyId, grade) {
  const mockKey = MOCK_GRADE_MAP[grade] || grade
  return MOCK_TASKS[competencyId]?.[mockKey] ?? []
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
  sessionId: 0,
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
      return { ...state, tasks: action.tasks, sessionId: state.sessionId + 1, currentTaskIndex: 0, answers: [], sessionActive: true, sessionComplete: false, isLoading: false, useMock: action.useMock || false }
    case 'LOADING_ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'SUBMIT_ANSWER': {
      const idx = state.answers.findIndex(a => a.taskIndex === action.answer.taskIndex)
      const next = idx >= 0
        ? state.answers.map((a, i) => (i === idx ? action.answer : a))
        : [...state.answers, action.answer]
      return { ...state, answers: next, isLoading: false }
    }
    case 'NEXT_TASK':
      return { ...state, currentTaskIndex: state.currentTaskIndex + 1 }
    case 'COMPLETE_SESSION': {
      const correctCount = state.answers.filter(a => a.correct).length
      const earned = correctCount >= Math.ceil(state.answers.length * 0.6)
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
// INTERACTIVE TASK COMPONENTS
// ============================================================

const COLUMN_LABELS = {
  HT: 'Hunderttausender',
  ZT: 'Zehntausender',
  T: 'Tausender',
  H: 'Hunderter',
  Z: 'Zehner',
  E: 'Einer',
}

function PlaceValueTask({ task, onChange, disabled }) {
  const digits = useMemo(
    () => String(task.number).padStart(task.columns.length, '0').split('').map((d, i) => ({ id: i, digit: d })),
    [task.number, task.columns.length],
  )
  const [slots, setSlots] = useState(() => task.columns.map(() => null))
  const [picked, setPicked] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)
  const [dragOverPool, setDragOverPool] = useState(false)

  useEffect(() => {
    const allFilled = slots.every(s => s !== null)
    onChange(allFilled ? slots.map(s => s.digit).join('') : '')
  }, [slots, onChange])

  const placedIds = new Set(slots.filter(Boolean).map(s => s.id))
  const pool = digits.filter(d => !placedIds.has(d.id))

  const placeChip = (chipId, targetIdx) => {
    setSlots(prev => {
      const fromIdx = prev.findIndex(s => s?.id === chipId)
      if (fromIdx === targetIdx) return prev
      const chip = digits.find(d => d.id === chipId)
      if (!chip) return prev
      const next = [...prev]
      const displaced = prev[targetIdx]
      next[targetIdx] = chip
      if (fromIdx >= 0) next[fromIdx] = displaced ?? null
      return next
    })
  }

  const removeFromSlot = (idx) => {
    setSlots(prev => { const next = [...prev]; next[idx] = null; return next })
  }

  const returnChipToPool = (chipId) => {
    setSlots(prev => {
      const fromIdx = prev.findIndex(s => s?.id === chipId)
      if (fromIdx < 0) return prev
      const next = [...prev]
      next[fromIdx] = null
      return next
    })
  }

  const handleSlotClick = (idx) => {
    if (disabled) return
    if (slots[idx]) { removeFromSlot(idx); return }
    if (picked) { placeChip(picked.id, idx); setPicked(null) }
  }

  const handleChipClick = (chip) => {
    if (disabled) return
    setPicked(prev => prev?.id === chip.id ? null : chip)
  }

  const handleDragStart = (chipId) => (e) => {
    if (disabled) return
    setDragId(chipId)
    setPicked(null)
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', String(chipId)) } catch { /* Safari */ }
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverSlot(null)
    setDragOverPool(false)
  }

  const handleSlotDragOver = (idx) => (e) => {
    if (disabled || dragId === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverSlot !== idx) setDragOverSlot(idx)
  }

  const handleSlotDragLeave = (idx) => () => {
    if (dragOverSlot === idx) setDragOverSlot(null)
  }

  const handleSlotDrop = (idx) => (e) => {
    if (disabled) return
    e.preventDefault()
    const idStr = e.dataTransfer.getData('text/plain')
    const chipId = idStr === '' ? dragId : parseInt(idStr, 10)
    if (chipId === null || Number.isNaN(chipId)) return
    placeChip(chipId, idx)
    handleDragEnd()
  }

  const handlePoolDragOver = (e) => {
    if (disabled || dragId === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!dragOverPool) setDragOverPool(true)
  }

  const handlePoolDragLeave = () => {
    if (dragOverPool) setDragOverPool(false)
  }

  const handlePoolDrop = (e) => {
    if (disabled) return
    e.preventDefault()
    const idStr = e.dataTransfer.getData('text/plain')
    const chipId = idStr === '' ? dragId : parseInt(idStr, 10)
    if (chipId === null || Number.isNaN(chipId)) return
    returnChipToPool(chipId)
    handleDragEnd()
  }

  return (
    <div className="bg-cream/50 border border-sky/20 rounded-2xl p-4 md:p-5">
      <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${task.columns.length}, minmax(0, 1fr))` }}>
        {task.columns.map((col, idx) => {
          const chip = slots[idx]
          const isDragHover = dragOverSlot === idx
          const isDragSource = chip && dragId === chip.id
          return (
            <div key={idx} className="flex flex-col items-center">
              <span className="font-body text-xs text-dark-light mb-1" title={COLUMN_LABELS[col] || col}>{col}</span>
              <div
                onDragOver={handleSlotDragOver(idx)}
                onDragLeave={handleSlotDragLeave(idx)}
                onDrop={handleSlotDrop(idx)}
                className={`w-full aspect-square min-h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all
                  ${chip
                    ? 'border-sky bg-white'
                    : isDragHover
                      ? 'border-pink bg-pink-light/30'
                      : picked
                        ? 'border-pink bg-pink-light/20'
                        : 'border-sky/40 bg-white/60'}
                  ${isDragHover ? 'scale-105' : ''}`}
              >
                {chip ? (
                  <button
                    type="button"
                    draggable={!disabled}
                    onDragStart={handleDragStart(chip.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSlotClick(idx)}
                    disabled={disabled}
                    aria-label={`${COLUMN_LABELS[col] || col} – ${chip.digit} (klicken zum Entfernen, ziehen zum Verschieben)`}
                    className={`w-full h-full rounded-xl font-heading font-bold text-2xl md:text-3xl text-dark transition-opacity
                      ${isDragSource ? 'opacity-30' : 'opacity-100'}
                      ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:text-pink'}`}
                  >
                    {chip.digit}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSlotClick(idx)}
                    disabled={disabled || (!picked && dragId === null)}
                    aria-label={`${COLUMN_LABELS[col] || col} – leer`}
                    className="w-full h-full rounded-xl font-heading font-bold text-2xl md:text-3xl text-transparent disabled:cursor-default"
                  >
                    0
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="font-body text-xs text-dark-light mb-2">Ziehe von hier:</p>
      <div
        onDragOver={handlePoolDragOver}
        onDragLeave={handlePoolDragLeave}
        onDrop={handlePoolDrop}
        className={`min-h-14 flex flex-wrap gap-2 rounded-xl p-2 transition-all
          ${dragOverPool ? 'bg-sky-light/30 ring-2 ring-sky/40' : 'bg-transparent'}`}
      >
        {pool.length === 0 && !dragOverPool && (
          <span className="font-body text-sm text-dark-light italic self-center">Alle Ziffern verteilt – ziehe sie hierher zurück oder klicke auf ein Feld.</span>
        )}
        {pool.map(chip => {
          const isDragSource = dragId === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              draggable={!disabled}
              onDragStart={handleDragStart(chip.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleChipClick(chip)}
              disabled={disabled}
              className={`w-12 h-12 rounded-xl font-heading font-bold text-2xl shadow-sm transition-all
                ${picked?.id === chip.id
                  ? 'bg-pink text-white scale-110 ring-2 ring-pink-dark'
                  : 'bg-sky-light/60 text-dark hover:bg-sky-light hover:scale-105'}
                ${isDragSource ? 'opacity-30' : 'opacity-100'}
                ${disabled ? 'cursor-default opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
            >
              {chip.digit}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NumberLineFractionTask({ task, onChange, disabled }) {
  const denom = task.denominator
  const [selected, setSelected] = useState(null)

  const handleClick = (e) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const clamped = Math.max(0, Math.min(1, x))
    const num = Math.round(clamped * denom)
    setSelected(num)
    onChange(`${num}/${denom}`)
  }

  const margin = 8
  const xPercent = (n) => margin + (n / denom) * (100 - 2 * margin)

  return (
    <div className="bg-cream/50 border border-sky/20 rounded-2xl p-4 md:p-6">
      <div
        onClick={handleClick}
        className={`relative w-full h-24 select-none ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <line x1={margin} y1="12" x2={100 - margin} y2="12" stroke="#3A3A5C" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: denom + 1 }, (_, i) => (
            <line
              key={i}
              x1={xPercent(i)}
              y1={i === 0 || i === denom ? 7 : 9}
              x2={xPercent(i)}
              y2={i === 0 || i === denom ? 17 : 15}
              stroke="#3A3A5C"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {selected !== null && (
          <div
            className="absolute top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink border-2 border-pink-dark pointer-events-none"
            style={{ left: `${xPercent(selected)}%` }}
          />
        )}
        <span className="absolute top-full mt-1 -translate-x-1/2 font-body text-sm text-dark" style={{ left: `${xPercent(0)}%` }}>0</span>
        <span className="absolute top-full mt-1 -translate-x-1/2 font-body text-sm text-dark" style={{ left: `${xPercent(denom)}%` }}>1</span>
      </div>
      {selected !== null && (
        <p className="mt-8 font-body text-sm text-dark-light text-center">
          Gesetzt: <span className="font-heading font-semibold text-dark">{selected}/{denom}</span>
        </p>
      )}
      {selected === null && (
        <p className="mt-8 font-body text-sm text-dark-light text-center">Tippe auf den Zahlenstrahl, um deine Stelle zu wählen.</p>
      )}
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
      if (!tasks || tasks.length === 0) {
        dispatch({ type: 'LOADING_ERROR', error: 'Für diese Auswahl sind im Demo-Modus keine Aufgaben verfügbar. Bitte API-Key in .env eintragen oder eine andere Klassenstufe wählen.' })
        return
      }
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
    if (state.currentTaskIndex >= state.tasks.length - 1) {
      dispatch({ type: 'COMPLETE_SESSION' })
    } else {
      dispatch({ type: 'NEXT_TASK' })
      setStudentAnswer('')
      setCurrentFeedback(null)
      setShowHint(false)
    }
  }, [state.currentTaskIndex, state.tasks.length, dispatch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (currentFeedback) handleNext()
      else handleSubmit()
    }
  }, [currentFeedback, handleNext, handleSubmit])

  // Session Complete
  if (state.sessionComplete) {
    const correctCount = state.answers.filter(a => a.correct).length
    const totalCount = state.answers.length || state.tasks.length || 1
    const required = Math.ceil(totalCount * 0.6)
    const comp = COMPETENCY_AREAS.find(c => c.id === state.selectedCompetency)
    const earned = correctCount >= required

    return (
      <div className="fade-in max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md text-center">
          <BrainMascot size="medium" mood={earned ? 'celebrate' : 'happy'} />
          <h2 className="font-heading font-bold text-3xl text-dark mt-4 mb-2">Ergebnis</h2>
          <p className="font-body text-dark-light mb-4">{comp?.name} – {GRADE_LEVELS.find(g => g.grades === state.selectedGrade)?.label}</p>

          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4 ${earned ? 'bg-success-light/30' : 'bg-error-light/30'}`}>
            <span className="text-4xl">{earned ? '🎉' : '💪'}</span>
            <div className="text-left">
              <p className="font-heading font-bold text-2xl text-dark">{correctCount} von {totalCount} richtig</p>
              <p className="font-body text-sm text-dark-light">
                {earned ? 'Medaille verdient!' : `Du brauchst ${required} richtige für die Medaille.`}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full progress-fill ${earned ? 'bg-success' : 'bg-warning'}`}
              style={{ width: `${(correctCount / totalCount) * 100}%` }}
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
            <p className="font-heading font-semibold text-sm text-dark">Aufgabe {state.currentTaskIndex + 1}/{state.tasks.length}</p>
            <p className="font-body text-xs text-success">{correctSoFar} richtig</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
          <div className="bg-sky h-full rounded-full transition-all duration-500" style={{ width: `${((state.currentTaskIndex + 1) / state.tasks.length) * 100}%` }} />
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

          {(task?.code || task?.niveau) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {task.code && (
                <span className="inline-block bg-pink-light/40 text-pink-dark font-body text-xs font-semibold px-2 py-0.5 rounded-md">{task.code}</span>
              )}
              {task.niveau && (
                <span className="inline-block bg-sky-light/40 text-sky-dark font-body text-xs font-semibold px-2 py-0.5 rounded-md">Niveaustufe {task.niveau}</span>
              )}
            </div>
          )}

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

          {task?.type === 'place-value' && (
            <div className="mb-4">
              <PlaceValueTask
                key={state.currentTaskIndex}
                task={task}
                onChange={setStudentAnswer}
                disabled={!!currentFeedback}
              />
            </div>
          )}
          {task?.type === 'number-line-fraction' && (
            <div className="mb-4">
              <NumberLineFractionTask
                key={state.currentTaskIndex}
                task={task}
                onChange={setStudentAnswer}
                disabled={!!currentFeedback}
              />
            </div>
          )}

          {!currentFeedback && !task?.type && (
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

          {!currentFeedback && task?.type && (
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!studentAnswer.trim() || state.isLoading}
                className="bg-sky text-white font-heading font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-sky-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? '...' : 'Antwort prüfen'}
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
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {!currentFeedback.correct && (
                  <button
                    onClick={() => setCurrentFeedback(null)}
                    className="flex-1 bg-white text-sky border-2 border-sky font-heading font-semibold px-6 py-2 rounded-xl shadow hover:bg-sky/10 transition-colors cursor-pointer"
                  >
                    🔁 Nochmal versuchen
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 bg-sky text-white font-heading font-semibold px-6 py-2 rounded-xl shadow hover:bg-sky-dark transition-colors cursor-pointer"
                >
                  {state.currentTaskIndex >= state.tasks.length - 1 ? '📊 Ergebnis anzeigen' : 'Nächste Aufgabe →'}
                </button>
              </div>
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
              <p className="font-body text-xs text-pink mt-1">60% richtige nötig</p>
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
                const passed = session.correctCount >= Math.ceil((session.totalCount || 1) * 0.6)
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
      case PAGES.TASKS: return <TasksPage key={state.sessionId} state={state} dispatch={dispatch} />
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
