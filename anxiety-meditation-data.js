// Anxiety Busting Meditation App - Data
// Three guided practice programs for deep sleep and anxiety relief

// ─── Program 1: Sleep Stretches (7 yoga poses) ───────────────────────────────
const SLEEP_STRETCHES = [
    {
        id: 1,
        name: "Hastapadasana",
        subtitle: "Forward Bend",
        sanskrit: "ಹಸ್ತಪದಾಸನ / हस्तपादासन",
        breathing: "EXHALE",
        description: "Stand with feet together. Exhale and fold forward from the hips, keeping your spine long. Let your hands rest on the floor beside your feet. Relax your neck and let your head hang heavy. Feel the stretch along the back of your legs and spine.",
        defaultDuration: 60,
        icon: "forward-bend",
        image: "images/anxiety/pose_1.png"
    },
    {
        id: 2,
        name: "Marjariasana",
        subtitle: "Cat & Cow Stretch",
        sanskrit: "ಮರ್ಜರಿ ಆಸನ / मार्जरीआसन",
        breathing: "INHALE",
        description: "Come onto all fours. As you inhale, drop your belly, lift your chest and tailbone (Cow). As you exhale, round your spine, tuck your chin to chest (Cat). Flow between these two positions with each breath. Release tension from your spine.",
        defaultDuration: 60,
        icon: "cat-cow",
        image: "images/anxiety/pose_2.png"
    },
    {
        id: 3,
        name: "Shishuasana",
        subtitle: "Child Pose",
        sanskrit: "ಶಿಶು ಆಸನ / शिशु आसन",
        breathing: "EXHALE",
        description: "Kneel on the floor, sit on your heels. Exhale and fold forward, resting your forehead on the mat. Extend your arms forward or rest them alongside your body. Breathe deeply and surrender to the ground. This is your safe resting place.",
        defaultDuration: 60,
        icon: "child-pose",
        image: "images/anxiety/pose_3.png"
    },
    {
        id: 4,
        name: "Baddha Konasana",
        subtitle: "Butterfly Pose",
        sanskrit: "ಬದ್ಧ ಕೋಣಾಸನ / बद्धकोणासन",
        breathing: "EXHALE",
        description: "Sit with soles of your feet together, knees dropped to the sides. Hold your feet and gently flap your knees like butterfly wings. Then fold forward slowly, bringing your chin toward your feet. Breathe into the stretch in your hips.",
        defaultDuration: 60,
        icon: "butterfly",
        image: "images/anxiety/pose_4.png"
    },
    {
        id: 5,
        name: "Viparita Karani",
        subtitle: "Legs Up the Wall Pose",
        sanskrit: "ವಿಪರೀತ ಕರಣಿ / विपरीत करणी",
        breathing: "INHALE",
        description: "Lie on your back and swing your legs up against the wall (or simply raise them up). Keep your arms relaxed at your sides, palms facing up. Close your eyes. This inversion calms the nervous system and reduces anxiety. Stay here and breathe.",
        defaultDuration: 90,
        icon: "legs-up",
        image: "images/anxiety/pose_5.png"
    },
    {
        id: 6,
        name: "Setu Bandhasana",
        subtitle: "Bridge Pose",
        sanskrit: "ಸೇತು ಬಂದಾಸನ / सेतु बंदासन",
        breathing: "INHALE",
        description: "Lie on your back, bend your knees and place feet flat on the floor hip-width apart. Inhale and lift your hips toward the ceiling. Interlace your fingers under your back. Open your chest and breathe deeply. Feel your spine lengthen.",
        defaultDuration: 60,
        icon: "bridge",
        image: "images/anxiety/pose_6.png"
    },
    {
        id: 7,
        name: "Supta Kapotasana",
        subtitle: "Supine Pigeon Pose",
        sanskrit: "ಸುಪ್ತ ಕಪೋತಾಸನ / सुप्तकपोथासन",
        breathing: "EXHALE",
        description: "Lie on your back. Cross your right ankle over your left knee. Reach through and hold the back of your left thigh. Gently draw your left knee toward your chest. Breathe into the deep hip stretch. Switch sides after half the time.",
        defaultDuration: 90,
        icon: "supine-pigeon",
        image: "images/anxiety/pose_7.png"
    }
];

// ─── Program 2: Anxiety Busting Protocol (5 stages) ─────────────────────────
const ANXIETY_PROTOCOL = [
    {
        id: 1,
        name: "Straw Breathing",
        subtitle: "Calming Breath",
        sanskrit: "शांत श्वास",
        breathing: "EXHALE",
        description: "Inhale deeply through your nose. Then exhale slowly through pursed lips, as if blowing through a straw. Make the exhale as long as possible. This activates your parasympathetic nervous system and instantly reduces anxiety. Repeat 8-10 times.",
        defaultDuration: 180,
        icon: "straw-breath",
        image: "images/anxiety/pose_8.png",
        repetitions: "8-10 times"
    },
    {
        id: 2,
        name: "Candle Blowing",
        subtitle: "Gentle Exhale",
        sanskrit: "मोमबत्ती श्वास",
        breathing: "EXHALE",
        description: "Imagine a candle flame in front of you. Inhale deeply through your nose. Exhale gently through your mouth — just enough to make the imaginary flame flicker but not go out. Control your breath with soft, steady exhalation. Repeat 8-10 times.",
        defaultDuration: 180,
        icon: "candle-blow",
        image: "images/anxiety/pose_9.png",
        repetitions: "8-10 times"
    },
    {
        id: 3,
        name: "Brahmari Pranayama",
        subtitle: "Humming Bee Breath",
        sanskrit: "भ्रामरी प्राणायाम",
        breathing: "EXHALE",
        description: "Close your eyes. Place your index fingers on the cartilage of your ears. Inhale deeply. As you exhale, make a long humming sound like a bee — 'Hmmmm'. Feel the vibration through your head and body. This soothes the nervous system profoundly. Repeat 5-6 times.",
        defaultDuration: 180,
        icon: "brahmari",
        image: "images/anxiety/pose_10.png",
        repetitions: "5-6 times"
    },
    {
        id: 4,
        name: "Om Namah Shivaya",
        subtitle: "Sacred Chanting",
        sanskrit: "ॐ नमः शिवाय",
        breathing: "HOLD",
        description: "Sit comfortably with eyes closed. Chant 'Om Namah Shivaya' slowly 11 times. Let each syllable resonate deeply: Om — Na-mah — Shi-vaa-ya. Feel the vibration filling your entire being. Chant softly and with devotion. This ancient mantra dissolves fear and anxiety.",
        defaultDuration: 720,
        icon: "om-chant",
        image: "images/anxiety/pose_11.png",
        repetitions: "11 times"
    },
    {
        id: 5,
        name: "Yoga Nidra",
        subtitle: "Yogic Sleep",
        sanskrit: "योग निद्रा",
        breathing: "INHALE",
        description: "Lie down on your back in Shavasana. Take your intention: 'I am Healthy & Happy'. Tighten and relax each part of your body — toes, feet, calves, thighs, hips, belly, chest, hands, arms, shoulders, neck, face. Chant OM 11 times. Remember again: 'I am Healthy & Happy'.",
        defaultDuration: 600,
        icon: "yoga-nidra",
        image: "images/anxiety/pose_12.png",
        subSteps: [
            "Lie down on your back",
            "Take an intention — I am Healthy & Happy",
            "Tighten and relax each part of the body",
            "Chant OM 11 Times",
            "Remember again — I am Healthy & Happy"
        ]
    }
];

// ─── Program 3: Home Sudarshan Kriya (4 stages) ─────────────────────────────
const HOME_KRIYA = [
    {
        id: 1,
        name: "Bhastrika",
        subtitle: "Bellows Breath",
        sanskrit: "भस्त्रिका प्राणायाम",
        breathing: "INHALE",
        description: "Sit in a comfortable position with spine straight. Take rapid, forceful breaths — both inhale and exhale are active and equal. Use your diaphragm like a bellows. This energizes the body and clears the mind. Complete 3 rounds with short pauses between each.",
        defaultDuration: 300,
        icon: "bhastrika",
        image: "images/anxiety/pose_13.png",
        repetitions: "3 rounds"
    },
    {
        id: 2,
        name: "OM Chanting",
        subtitle: "Sacred Sound",
        sanskrit: "ॐ जप",
        breathing: "EXHALE",
        description: "Sit with spine tall and eyes closed. Inhale deeply. As you exhale, chant a long, resonant 'OM'. Feel 'Aaa' in your belly, 'Ooo' in your chest, 'Mmm' vibrating through your head. Let the silence between each OM deepen your awareness. Chant 3 times.",
        defaultDuration: 180,
        icon: "om-symbol",
        image: "images/anxiety/pose_14.png",
        repetitions: "3 times"
    },
    {
        id: 3,
        name: "Breath Cycles",
        subtitle: "Long-Medium-Short",
        sanskrit: "श्वास चक्र",
        breathing: "INHALE",
        description: "Three rounds of rhythmic breathing: First, 20 long slow breaths (inhale 4 counts, exhale 4 counts). Then, 40 medium-paced breaths (inhale 2 counts, exhale 2 counts). Finally, 40 short rapid breaths (quick inhale-exhale). Pause between each segment. Repeat 3 times.",
        defaultDuration: 600,
        icon: "breath-cycles",
        image: "images/anxiety/pose_15.png",
        repetitions: "3 × (20 long + 40 medium + 40 short)"
    },
    {
        id: 4,
        name: "Shavasana",
        subtitle: "Corpse Pose Rest",
        sanskrit: "शवासन",
        breathing: "HOLD",
        description: "Lie down flat on your back. Let your feet fall open, arms relaxed at your sides with palms up. Close your eyes. Take 5-8 normal deep breaths, then let your breathing become natural. Rest here for 5-10 minutes. Let go completely. Allow deep restoration to happen.",
        defaultDuration: 480,
        icon: "shavasana",
        image: "images/anxiety/pose_16.png",
        repetitions: "5-10 minutes"
    }
];

// Program metadata for the home screen
const PROGRAMS = [
    {
        id: 'sleep-stretches',
        name: 'Sleep Stretches',
        emoji: '🧎',
        description: '7 calming yoga poses to release tension and prepare for deep sleep',
        steps: SLEEP_STRETCHES,
        color: '#7B68EE'
    },
    {
        id: 'anxiety-protocol',
        name: 'Anxiety Busting Protocol',
        emoji: '💆',
        description: 'Breathing exercises, chanting & Yoga Nidra for instant anxiety relief',
        steps: ANXIETY_PROTOCOL,
        color: '#4ECDC4'
    },
    {
        id: 'home-kriya',
        name: 'Home Sudarshan Kriya',
        emoji: '🧘',
        description: 'Complete Sudarshan Kriya practice with Bhastrika, OM & breath cycles',
        steps: HOME_KRIYA,
        color: '#E8A87C'
    }
];

// CJS export for Node.js tests (ignored in browsers)
if (typeof module !== 'undefined') {
    module.exports = { SLEEP_STRETCHES, ANXIETY_PROTOCOL, HOME_KRIYA, PROGRAMS };
}
