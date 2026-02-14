// Sudarshan Kriya (SKY) Home Practice — Data
// All phase and step configuration for the SKY Practice App

// ─── Phase 1: 3-Stage Pranayama (Ujjayi) ─────────────────────────────────────
const PRANAYAMA_PHASES = [
    {
        id: 'pranayama-1',
        stage: 1,
        name: 'Ujjayi Pranayama — Stage 1',
        subtitle: 'Hands on Lower Ribs',
        sanskrit: 'उज्जायी प्राणायाम — चरण १',
        description: 'Place your hands gently on your lower ribs. Breathe with Ujjayi (ocean breath) — a soft, whispering sound in the throat. Follow the rhythm: Inhale for 4, Hold for 4, Exhale for 6, Hold for 2.',
        handPlacement: 'Lower Ribs',
        icon: '🫁',
        rhythm: { in: 4, holdIn: 4, out: 6, holdOut: 2 },
        repetitions: 8,
        restSeconds: 10
    },
    {
        id: 'pranayama-2',
        stage: 2,
        name: 'Ujjayi Pranayama — Stage 2',
        subtitle: 'Hands on Middle Ribs',
        sanskrit: 'उज्जायी प्राणायाम — चरण २',
        description: 'Move your hands to your middle ribs, at the sides of your chest. Continue the same Ujjayi breath with the 4-4-6-2 rhythm. Feel the ribs expand and contract beneath your palms.',
        handPlacement: 'Middle Ribs',
        icon: '🫁',
        rhythm: { in: 4, holdIn: 4, out: 6, holdOut: 2 },
        repetitions: 8,
        restSeconds: 10
    },
    {
        id: 'pranayama-3',
        stage: 3,
        name: 'Ujjayi Pranayama — Stage 3',
        subtitle: 'Hands Over Shoulders',
        sanskrit: 'उज्जायी प्राणायाम — चरण ३',
        description: 'Cross your arms and place your hands over opposite shoulders. Continue with the 4-4-6-2 Ujjayi breath. Feel the breath fill the upper chest and collarbones. 6 repetitions for this stage.',
        handPlacement: 'Over Shoulders',
        icon: '🫁',
        rhythm: { in: 4, holdIn: 4, out: 6, holdOut: 2 },
        repetitions: 6,
        restSeconds: 10
    }
];

// ─── Phase 2: Bhastrika (Bellows Breath) ──────────────────────────────────────
const BHASTRIKA_PHASE = {
    id: 'bhastrika',
    name: 'Bhastrika',
    subtitle: 'Bellows Breath',
    sanskrit: 'भस्त्रिका प्राणायाम',
    description: 'Sit tall with fists near shoulders. As you inhale, thrust arms upward and open fingers. As you exhale, bring fists back to shoulders with force. Each breath is one count.',
    icon: '💨',
    rounds: 3,
    breathsPerRound: 20,
    paceOptions: ['slow', 'medium', 'fast'],
    defaultPace: 'medium',
    restSeconds: 10,
    // Pace in milliseconds per breath
    paceMs: { slow: 2000, medium: 1200, fast: 700 }
};

// ─── Phase 3: Om Chanting ─────────────────────────────────────────────────────
const OM_PHASE = {
    id: 'om-chanting',
    name: 'Om Chanting',
    subtitle: 'Sacred Sound',
    sanskrit: 'ॐ जप',
    description: 'Sit with your spine tall and eyes closed. Inhale deeply. As you exhale, chant a long, resonant "OM". Feel "Aaa" in your belly, "Ooo" in your chest, "Mmm" vibrating through your head.',
    icon: '🕉️',
    repetitions: 3,
    pauseBetween: 2,
    chantDurationSeconds: 8
};

// ─── Phase 4: Sudarshan Kriya (Variable Breath Cycles) ───────────────────────
const KRIYA_PHASE = {
    id: 'kriya',
    name: 'Sudarshan Kriya',
    subtitle: 'The Core Breath',
    sanskrit: 'सुदर्शन क्रिया',
    description: 'The heart of the practice. Three rounds of rhythmic breathing at increasing speeds, concluding with 10 deep breaths.',
    icon: '🌊',
    rounds: [
        { count: 20, pace: 'slow', label: 'Round 1 — Slow', paceMs: 3000 },
        { count: 40, pace: 'medium', label: 'Round 2 — Medium', paceMs: 1500 },
        { count: 40, pace: 'fast', label: 'Round 3 — Fast', paceMs: 800 }
    ],
    deepBreaths: 10,
    deepBreathPaceMs: 4000
};

// ─── Phase 5: Savasana (Deep Rest) ────────────────────────────────────────────
const SAVASANA_PHASE = {
    id: 'savasana',
    name: 'Savasana',
    subtitle: 'Deep Rest',
    sanskrit: 'शवासन — योग निद्रा',
    description: 'Lie down flat on your back. Let your feet fall open, arms relaxed at your sides with palms up. Close your eyes. Let go completely and allow deep restoration to happen.',
    icon: '🧘',
    durationMinutes: 10,
    audioOptions: [
        { id: 'silence', label: 'Ambient Silence', icon: '🔇' },
        { id: 'flute', label: 'Soft Flute', icon: '🎶' },
        { id: 'nidra', label: 'Guided Yoga Nidra', icon: '🧠' }
    ],
    defaultAudio: 'silence'
};

// ─── All Phases (ordered) ─────────────────────────────────────────────────────
const SKY_PHASES = [
    {
        id: 'pranayama',
        name: '3-Stage Pranayama',
        shortName: 'Pranayama',
        emoji: '🫁',
        color: '#3b82f6',
        description: 'Ujjayi breath in 3 stages with 4-4-6-2 rhythm',
        data: PRANAYAMA_PHASES
    },
    {
        id: 'bhastrika',
        name: 'Bhastrika',
        shortName: 'Bhastrika',
        emoji: '💨',
        color: '#d97706',
        description: '3 rounds of 20 forceful breaths',
        data: BHASTRIKA_PHASE
    },
    {
        id: 'om-chanting',
        name: 'Om Chanting',
        shortName: 'Om',
        emoji: '🕉️',
        color: '#6366f1',
        description: '3 long resonant Om chants',
        data: OM_PHASE
    },
    {
        id: 'kriya',
        name: 'Sudarshan Kriya',
        shortName: 'Kriya',
        emoji: '🌊',
        color: '#e11d48',
        description: 'Variable-speed breath cycles (20-40-40)',
        data: KRIYA_PHASE
    },
    {
        id: 'savasana',
        name: 'Deep Rest (Savasana)',
        shortName: 'Savasana',
        emoji: '🧘',
        color: '#8b5cf6',
        description: '10-minute guided relaxation',
        data: SAVASANA_PHASE
    }
];

// ─── Safety Disclaimer ────────────────────────────────────────────────────────
const SKY_DISCLAIMER = `This app is a practice tool for those who have already learned Sudarshan Kriya (SKY) from a certified Art of Living instructor. It is not a substitute for learning from a qualified teacher. If you have not yet taken the Art of Living Happiness Program, please find a course near you before using this app.`;

// CJS export for Node.js tests (ignored in browsers)
if (typeof module !== 'undefined') {
    module.exports = { PRANAYAMA_PHASES, BHASTRIKA_PHASE, OM_PHASE, KRIYA_PHASE, SAVASANA_PHASE, SKY_PHASES, SKY_DISCLAIMER };
}
