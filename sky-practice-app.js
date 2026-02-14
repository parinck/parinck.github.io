// Sudarshan Kriya (SKY) Home Practice — Main App Logic
class SKYPracticeApp {
    constructor() {
        this.currentPhaseIndex = 0;
        this.phases = [];            // Active phase list (all 5 or single)
        this.isGuidedSession = true;
        this.isPaused = false;
        this.voiceEnabled = true;
        this.savasanaAudio = 'silence';
        this.wakeLock = null;
        this.audioContext = null;
        this.breathingSoundNodes = [];
        this.abortController = null; // To cancel async phase runners
        this.practiceStartTime = null;
        this.savasanaOscillators = [];

        this.initElements();
        this.loadPreferences();
        this.initAudio();
        this.bindEvents();
        this.renderCalendar();
        this.checkDisclaimer();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════════════════

    initElements() {
        // Screens
        this.homeScreen = document.getElementById('home-screen');
        this.practiceScreen = document.getElementById('practice-screen');
        this.restScreen = document.getElementById('rest-screen');
        this.completeScreen = document.getElementById('complete-screen');

        // Home
        this.guidedBtn = document.getElementById('guided-session-btn');
        this.quickBtn = document.getElementById('quick-practice-btn');
        this.sectionPicker = document.getElementById('section-picker');
        this.sectionCards = document.getElementById('section-cards');

        // Streak
        this.streakCount = document.getElementById('streak-count');
        this.calendarGrid = document.getElementById('calendar-grid');

        // Practice
        this.backBtn = document.getElementById('back-btn');
        this.phaseBadgeIcon = document.getElementById('phase-badge-icon');
        this.phaseBadgeText = document.getElementById('phase-badge-text');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPhases = document.getElementById('progress-phases');

        this.phaseName = document.getElementById('phase-name');
        this.phaseSubtitle = document.getElementById('phase-subtitle');
        this.phaseSanskrit = document.getElementById('phase-sanskrit');
        this.phaseDescription = document.getElementById('phase-description');

        // Bubble
        this.breathingBubble = document.getElementById('breathing-bubble');
        this.bubbleLabel = document.getElementById('bubble-label');
        this.bubbleCounter = document.getElementById('bubble-counter');

        // Counters
        this.breathCounterDisplay = document.getElementById('breath-counter-display');
        this.breathCurrent = document.getElementById('breath-current');
        this.breathTotal = document.getElementById('breath-total');
        this.roundInfo = document.getElementById('round-info');
        this.roundLabel = document.getElementById('round-label');
        this.repCounter = document.getElementById('rep-counter');
        this.repLabel = document.getElementById('rep-label');

        // Om
        this.omDisplay = document.getElementById('om-display');
        this.omInstruction = document.getElementById('om-instruction');

        // Timer
        this.timerContainer = document.getElementById('timer-container');
        this.timerText = document.getElementById('timer-text');
        this.timerProgress = document.getElementById('timer-progress');

        // Audio selector
        this.audioSelector = document.getElementById('audio-selector');
        this.audioOptions = document.getElementById('audio-options');

        // Controls
        this.pauseBtn = document.getElementById('pause-btn');
        this.pauseIcon = document.getElementById('pause-icon');
        this.playIcon = document.getElementById('play-icon');
        this.skipBtn = document.getElementById('skip-btn');
        this.restartBtn = document.getElementById('restart-btn');

        // Rest
        this.restCountdown = document.getElementById('rest-countdown');

        // Completion
        this.statPhases = document.getElementById('stat-phases');
        this.statTime = document.getElementById('stat-time');
        this.statTimeLabel = document.getElementById('stat-time-label');
        this.completionMessage = document.getElementById('completion-message');
        this.homeCompleteBtn = document.getElementById('home-complete-btn');
        this.repeatCompleteBtn = document.getElementById('repeat-complete-btn');

        // Modals
        this.disclaimerModal = document.getElementById('disclaimer-modal');
        this.disclaimerAccept = document.getElementById('disclaimer-accept');
        this.disclaimerText = document.getElementById('disclaimer-text');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.voiceToggle = document.getElementById('voice-toggle');
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIO
    // ═══════════════════════════════════════════════════════════════════════════

    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playBeep(frequency = 800, duration = 150, type = 'sine') {
        if (!this.audioContext) return;
        try {
            this.resumeAudio();
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = frequency;
            osc.type = type;
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) { /* ignore */ }
    }

    playCountdownBeep() { this.playBeep(800, 100, 'sine'); }
    playFinalBeep() { this.playBeep(500, 300, 'triangle'); }

    playChime() {
        setTimeout(() => this.playBeep(523, 200, 'sine'), 0);
        setTimeout(() => this.playBeep(659, 200, 'sine'), 200);
        setTimeout(() => this.playBeep(784, 400, 'sine'), 400);
    }

    playOmTone(durationSec = 6) {
        if (!this.audioContext) return;
        this.resumeAudio();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const layers = [
            { freq: 136.1, type: 'sine', vol: 0.12 },  // Om fundamental
            { freq: 272.2, type: 'sine', vol: 0.06 },
            { freq: 408.3, type: 'triangle', vol: 0.03 },
        ];
        layers.forEach(l => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = l.type;
            osc.frequency.value = l.freq;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(l.vol, now + durationSec * 0.25);
            gain.gain.setValueAtTime(l.vol, now + durationSec * 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + durationSec + 0.1);
            this.breathingSoundNodes.push({ oscillator: osc, gain });
        });
    }

    startSavasanaAudio(type) {
        this.stopSavasanaAudio();
        if (type === 'silence' || !this.audioContext) return;
        this.resumeAudio();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        if (type === 'flute') {
            // Soft flute-like ambient via filtered oscillators
            const freqs = [392, 523, 659];
            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                osc.type = 'sine';
                osc.frequency.value = f;
                filter.type = 'lowpass';
                filter.frequency.value = 600;
                gain.gain.setValueAtTime(0.02, now);
                // Gentle LFO for tremolo
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.frequency.value = 0.3 + i * 0.1;
                lfoGain.gain.value = 0.01;
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);
                lfo.start(now);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                this.savasanaOscillators.push(osc, lfo, gain);
            });
        } else if (type === 'nidra') {
            // Gentle humming drone
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 174; // Solfeggio
            gain.gain.setValueAtTime(0.04, now);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            this.savasanaOscillators.push(osc, gain);
        }
    }

    stopSavasanaAudio() {
        this.savasanaOscillators.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) { /* ignore */ }
        });
        this.savasanaOscillators = [];
    }

    stopBreathingSounds() {
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        this.breathingSoundNodes.forEach(({ gain, oscillator }) => {
            try {
                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(gain.gain.value, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                oscillator.stop(now + 0.35);
            } catch (e) { /* already stopped */ }
        });
        this.breathingSoundNodes = [];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════════

    bindEvents() {
        // Navigation
        this.guidedBtn.addEventListener('click', () => this.startGuidedSession());
        this.quickBtn.addEventListener('click', () => this.toggleSectionPicker());
        this.backBtn.addEventListener('click', () => this.goHome());
        this.homeCompleteBtn.addEventListener('click', () => this.goHome());
        this.repeatCompleteBtn.addEventListener('click', () => this.repeatPractice());

        // Controls
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.skipBtn.addEventListener('click', () => this.skipPhase());
        this.restartBtn.addEventListener('click', () => this.repeatPractice());

        // Disclaimer
        this.disclaimerAccept.addEventListener('click', () => this.acceptDisclaimer());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettingsBtn.addEventListener('click', () => this.saveAndCloseSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });

        this.voiceToggle.addEventListener('click', () => {
            this.voiceEnabled = !this.voiceEnabled;
            this.voiceToggle.classList.toggle('active', this.voiceEnabled);
        });

        // Savasana audio preset buttons
        document.querySelectorAll('.audio-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.audio-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.savasanaAudio = btn.dataset.audio;
            });
        });

        // Resume audio on first interaction
        document.addEventListener('click', () => this.resumeAudio(), { once: true });

        // Wake lock re-acquire
        document.addEventListener('visibilitychange', async () => {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DISCLAIMER
    // ═══════════════════════════════════════════════════════════════════════════

    checkDisclaimer() {
        const accepted = localStorage.getItem('sky_disclaimer_accepted');
        if (!accepted) {
            this.disclaimerText.textContent = SKY_DISCLAIMER;
            this.disclaimerModal.classList.add('active');
        }
    }

    acceptDisclaimer() {
        localStorage.setItem('sky_disclaimer_accepted', 'true');
        this.disclaimerModal.classList.remove('active');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SETTINGS & PREFERENCES
    // ═══════════════════════════════════════════════════════════════════════════

    loadPreferences() {
        const voice = localStorage.getItem('sky_voice_enabled');
        if (voice !== null) this.voiceEnabled = voice === 'true';
        this.voiceToggle?.classList.toggle('active', this.voiceEnabled);

        const audio = localStorage.getItem('sky_savasana_audio');
        if (audio) {
            this.savasanaAudio = audio;
            document.querySelectorAll('.audio-preset-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.audio === audio);
            });
        }
    }

    savePreferences() {
        localStorage.setItem('sky_voice_enabled', this.voiceEnabled.toString());
        localStorage.setItem('sky_savasana_audio', this.savasanaAudio);
    }

    openSettings() { this.settingsModal.classList.add('active'); }
    closeSettingsModal() { this.settingsModal.classList.remove('active'); }
    saveAndCloseSettings() {
        this.savePreferences();
        this.closeSettingsModal();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WAKE LOCK
    // ═══════════════════════════════════════════════════════════════════════════

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (e) { /* ignore */ }
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            await this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SCREEN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    showScreen(screen) {
        [this.homeScreen, this.practiceScreen, this.restScreen, this.completeScreen]
            .forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    goHome() {
        this.abort();
        this.stopBreathingSounds();
        this.stopSavasanaAudio();
        this.releaseWakeLock();
        this.sectionPicker.style.display = 'none';
        this.showScreen(this.homeScreen);
        this.renderCalendar();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NAVIGATION MODES
    // ═══════════════════════════════════════════════════════════════════════════

    startGuidedSession() {
        this.isGuidedSession = true;
        this.phases = [...SKY_PHASES];
        this.currentPhaseIndex = 0;
        this.startPractice();
    }

    toggleSectionPicker() {
        if (this.sectionPicker.style.display === 'none') {
            this.sectionPicker.style.display = 'block';
            this.renderSectionCards();
        } else {
            this.sectionPicker.style.display = 'none';
        }
    }

    renderSectionCards() {
        this.sectionCards.innerHTML = '';
        SKY_PHASES.forEach(phase => {
            const card = document.createElement('div');
            card.className = 'section-card';
            card.innerHTML = `
                <span class="section-emoji">${phase.emoji}</span>
                <div class="section-info">
                    <h4>${phase.name}</h4>
                    <p>${phase.description}</p>
                </div>`;
            card.addEventListener('click', () => {
                this.isGuidedSession = false;
                this.phases = [phase];
                this.currentPhaseIndex = 0;
                this.startPractice();
            });
            this.sectionCards.appendChild(card);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRACTICE FLOW
    // ═══════════════════════════════════════════════════════════════════════════

    async startPractice() {
        this.practiceStartTime = Date.now();
        this.isPaused = false;
        this.updatePauseButton();
        await this.requestWakeLock();
        this.createProgressDots();
        this.showScreen(this.practiceScreen);
        this.runCurrentPhase();
    }

    createProgressDots() {
        this.progressPhases.innerHTML = '';
        this.phases.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'progress-dot';
            this.progressPhases.appendChild(dot);
        });
    }

    updateProgress() {
        const dots = this.progressPhases.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i < this.currentPhaseIndex) dot.classList.add('completed');
            else if (i === this.currentPhaseIndex) dot.classList.add('active');
        });
        const pct = (this.currentPhaseIndex / this.phases.length) * 100;
        this.progressFill.style.width = `${pct}%`;
    }

    setPhaseInfo(phase) {
        const meta = this.phases[this.currentPhaseIndex];
        this.phaseBadgeIcon.textContent = meta.emoji;
        this.phaseBadgeText.textContent = meta.shortName;
        this.updateProgress();
    }

    // Hide all dynamic sections
    resetPracticeUI() {
        this.breathingBubble.parentElement.style.display = 'none';
        this.breathCounterDisplay.style.display = 'none';
        this.roundInfo.style.display = 'none';
        this.repCounter.style.display = 'none';
        this.omDisplay.style.display = 'none';
        this.timerContainer.style.display = 'none';
        this.audioSelector.style.display = 'none';
        this.breathingBubble.className = 'breathing-bubble';
        this.bubbleLabel.textContent = '';
        this.bubbleCounter.textContent = '';
    }

    async runCurrentPhase() {
        if (this.currentPhaseIndex >= this.phases.length) {
            this.completePractice();
            return;
        }

        this.abortController = new AbortController();
        const phase = this.phases[this.currentPhaseIndex];
        this.resetPracticeUI();
        this.setPhaseInfo(phase);

        try {
            switch (phase.id) {
                case 'pranayama':
                    await this.runPranayama(phase.data);
                    break;
                case 'bhastrika':
                    await this.runBhastrika(phase.data);
                    break;
                case 'om-chanting':
                    await this.runOmChanting(phase.data);
                    break;
                case 'kriya':
                    await this.runKriya(phase.data);
                    break;
                case 'savasana':
                    await this.runSavasana(phase.data);
                    break;
            }
        } catch (e) {
            if (e.name === 'AbortError') return; // Cancelled
            console.error('Phase error:', e);
        }

        // Move to next phase
        if (!this.abortController.signal.aborted) {
            this.currentPhaseIndex++;
            this.runCurrentPhase();
        }
    }

    abort() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    skipPhase() {
        this.playFinalBeep();
        this.abort();
        this.currentPhaseIndex++;
        if (this.currentPhaseIndex >= this.phases.length) {
            this.completePractice();
        } else {
            this.resetPracticeUI();
            this.abortController = new AbortController();
            this.runCurrentPhase();
        }
    }

    async repeatPractice() {
        this.abort();
        this.stopBreathingSounds();
        this.stopSavasanaAudio();
        this.currentPhaseIndex = 0;
        this.isPaused = false;
        this.updatePauseButton();
        this.startPractice();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.updatePauseButton();
    }

    updatePauseButton() {
        if (this.isPaused) {
            this.pauseIcon.style.display = 'none';
            this.playIcon.style.display = 'block';
        } else {
            this.pauseIcon.style.display = 'block';
            this.playIcon.style.display = 'none';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY: Pausable sleep & countdown
    // ═══════════════════════════════════════════════════════════════════════════

    sleep(ms) {
        return new Promise((resolve, reject) => {
            const signal = this.abortController?.signal;
            if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }

            let elapsed = 0;
            const tick = 50; // Check every 50ms for pause
            const interval = setInterval(() => {
                if (signal?.aborted) {
                    clearInterval(interval);
                    reject(new DOMException('Aborted', 'AbortError'));
                    return;
                }
                if (!this.isPaused) {
                    elapsed += tick;
                    if (elapsed >= ms) {
                        clearInterval(interval);
                        resolve();
                    }
                }
            }, tick);
        });
    }

    async countdownTimer(totalSeconds, onTick) {
        for (let remaining = totalSeconds; remaining >= 0; remaining--) {
            if (this.abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            if (onTick) onTick(remaining, totalSeconds);
            if (remaining > 0) {
                if (remaining <= 5 && remaining > 0) this.playCountdownBeep();
                await this.sleep(1000);
            }
        }
        this.playFinalBeep();
    }

    updateTimerRing(remaining, total) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (remaining / total) * circumference;
        this.timerProgress.style.strokeDashoffset = offset;

        if (remaining >= 60) {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            this.timerText.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            this.timerText.textContent = remaining;
        }

        if (remaining <= 10) {
            this.timerProgress.style.stroke = '#e11d48';
        } else {
            this.timerProgress.style.stroke = '#3b82f6';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REST BETWEEN STAGES
    // ═══════════════════════════════════════════════════════════════════════════

    async showRest(seconds) {
        this.showScreen(this.restScreen);
        for (let i = seconds; i > 0; i--) {
            if (this.abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            this.restCountdown.textContent = i;
            if (i <= 3) this.playCountdownBeep();
            await this.sleep(1000);
        }
        this.playFinalBeep();
        this.showScreen(this.practiceScreen);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: PRANAYAMA
    // ═══════════════════════════════════════════════════════════════════════════

    async runPranayama(stages) {
        for (let s = 0; s < stages.length; s++) {
            const stage = stages[s];
            this.phaseName.textContent = stage.name;
            this.phaseSubtitle.textContent = stage.subtitle;
            this.phaseSanskrit.textContent = stage.sanskrit;
            this.phaseDescription.textContent = stage.description;

            // Show bubble + rep counter
            this.breathingBubble.parentElement.style.display = 'flex';
            this.repCounter.style.display = 'block';
            this.timerContainer.style.display = 'none';

            for (let rep = 1; rep <= stage.repetitions; rep++) {
                this.repLabel.textContent = `Breath ${rep} of ${stage.repetitions}`;
                await this.breathCycle(stage.rhythm);
            }

            // Rest between stages (except after last)
            if (s < stages.length - 1) {
                await this.showRest(stage.restSeconds);
            }
        }
    }

    async breathCycle(rhythm) {
        // Inhale
        this.breathingBubble.className = 'breathing-bubble inhale';
        this.bubbleLabel.textContent = 'Inhale';
        for (let c = 1; c <= rhythm.in; c++) {
            this.bubbleCounter.textContent = c;
            if (c === 1) this.playBeep(440, 100);
            await this.sleep(1000);
        }

        // Hold In
        this.breathingBubble.className = 'breathing-bubble hold-in';
        this.bubbleLabel.textContent = 'Hold';
        for (let c = 1; c <= rhythm.holdIn; c++) {
            this.bubbleCounter.textContent = c;
            await this.sleep(1000);
        }

        // Exhale
        this.breathingBubble.className = 'breathing-bubble exhale';
        this.bubbleLabel.textContent = 'Exhale';
        for (let c = 1; c <= rhythm.out; c++) {
            this.bubbleCounter.textContent = c;
            if (c === 1) this.playBeep(330, 100);
            await this.sleep(1000);
        }

        // Hold Out
        this.breathingBubble.className = 'breathing-bubble hold-out';
        this.bubbleLabel.textContent = 'Hold';
        for (let c = 1; c <= rhythm.holdOut; c++) {
            this.bubbleCounter.textContent = c;
            await this.sleep(1000);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: BHASTRIKA
    // ═══════════════════════════════════════════════════════════════════════════

    async runBhastrika(data) {
        this.phaseName.textContent = data.name;
        this.phaseSubtitle.textContent = data.subtitle;
        this.phaseSanskrit.textContent = data.sanskrit;
        this.phaseDescription.textContent = data.description;

        this.breathingBubble.parentElement.style.display = 'flex';
        this.breathCounterDisplay.style.display = 'flex';
        this.roundInfo.style.display = 'block';
        this.breathTotal.textContent = data.breathsPerRound;

        const pace = data.paceMs[data.defaultPace];

        for (let round = 1; round <= data.rounds; round++) {
            this.roundLabel.textContent = `Round ${round} of ${data.rounds}`;

            for (let breath = 1; breath <= data.breathsPerRound; breath++) {
                this.breathCurrent.textContent = breath;

                // Animate bubble: quick inhale+exhale
                this.breathingBubble.className = 'breathing-bubble inhale';
                this.bubbleLabel.textContent = 'In';
                this.bubbleCounter.textContent = breath;
                this.playBeep(600, 50);
                await this.sleep(pace / 2);

                this.breathingBubble.className = 'breathing-bubble exhale';
                this.bubbleLabel.textContent = 'Out';
                this.playBeep(400, 50);
                await this.sleep(pace / 2);
            }

            // Rest after each round
            if (round < data.rounds) {
                await this.showRest(data.restSeconds);
                // Re-show practice UI after rest
                this.breathingBubble.parentElement.style.display = 'flex';
                this.breathCounterDisplay.style.display = 'flex';
                this.roundInfo.style.display = 'block';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: OM CHANTING
    // ═══════════════════════════════════════════════════════════════════════════

    async runOmChanting(data) {
        this.phaseName.textContent = data.name;
        this.phaseSubtitle.textContent = data.subtitle;
        this.phaseSanskrit.textContent = data.sanskrit;
        this.phaseDescription.textContent = data.description;

        this.omDisplay.style.display = 'block';

        for (let i = 1; i <= data.repetitions; i++) {
            this.omInstruction.textContent = `Chant ${i} of ${data.repetitions}`;

            // Play Om tone
            this.playOmTone(data.chantDurationSeconds);
            await this.sleep(data.chantDurationSeconds * 1000);

            // Pause between chants
            if (i < data.repetitions) {
                this.omInstruction.textContent = 'Silence...';
                await this.sleep(data.pauseBetween * 1000);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 4: SUDARSHAN KRIYA
    // ═══════════════════════════════════════════════════════════════════════════

    async runKriya(data) {
        this.phaseName.textContent = data.name;
        this.phaseSubtitle.textContent = data.subtitle;
        this.phaseSanskrit.textContent = data.sanskrit;
        this.phaseDescription.textContent = data.description;

        this.breathingBubble.parentElement.style.display = 'flex';
        this.breathCounterDisplay.style.display = 'flex';
        this.roundInfo.style.display = 'block';

        // Three rounds
        for (let r = 0; r < data.rounds.length; r++) {
            const round = data.rounds[r];
            this.roundLabel.textContent = round.label;
            this.breathTotal.textContent = round.count;

            for (let breath = 1; breath <= round.count; breath++) {
                this.breathCurrent.textContent = breath;

                this.breathingBubble.className = 'breathing-bubble inhale';
                this.bubbleLabel.textContent = 'In';
                this.bubbleCounter.textContent = breath;
                this.playBeep(500, 40);
                await this.sleep(round.paceMs / 2);

                this.breathingBubble.className = 'breathing-bubble exhale';
                this.bubbleLabel.textContent = 'Out';
                await this.sleep(round.paceMs / 2);
            }

            // Brief pause between rounds
            if (r < data.rounds.length - 1) {
                this.breathingBubble.className = 'breathing-bubble';
                this.bubbleLabel.textContent = 'Pause';
                this.bubbleCounter.textContent = '';
                await this.sleep(3000);
            }
        }

        // 10 Deep Breaths
        this.roundLabel.textContent = '10 Deep Breaths';
        this.breathTotal.textContent = data.deepBreaths;

        for (let breath = 1; breath <= data.deepBreaths; breath++) {
            this.breathCurrent.textContent = breath;

            this.breathingBubble.className = 'breathing-bubble inhale';
            this.bubbleLabel.textContent = 'Deep In';
            this.bubbleCounter.textContent = breath;
            this.playBeep(440, 80);
            await this.sleep(data.deepBreathPaceMs / 2);

            this.breathingBubble.className = 'breathing-bubble exhale';
            this.bubbleLabel.textContent = 'Deep Out';
            this.playBeep(330, 80);
            await this.sleep(data.deepBreathPaceMs / 2);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 5: SAVASANA
    // ═══════════════════════════════════════════════════════════════════════════

    async runSavasana(data) {
        this.phaseName.textContent = data.name;
        this.phaseSubtitle.textContent = data.subtitle;
        this.phaseSanskrit.textContent = data.sanskrit;
        this.phaseDescription.textContent = data.description;

        // Show timer + audio selector
        this.timerContainer.style.display = 'flex';
        this.audioSelector.style.display = 'block';

        // Populate audio options
        this.audioOptions.innerHTML = '';
        data.audioOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'audio-option-btn' + (opt.id === this.savasanaAudio ? ' active' : '');
            btn.textContent = `${opt.icon} ${opt.label}`;
            btn.addEventListener('click', () => {
                this.audioOptions.querySelectorAll('.audio-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.stopSavasanaAudio();
                this.savasanaAudio = opt.id;
                this.startSavasanaAudio(opt.id);
            });
            this.audioOptions.appendChild(btn);
        });

        // Start ambient audio
        this.startSavasanaAudio(this.savasanaAudio);

        // 10-minute countdown
        const totalSec = data.durationMinutes * 60;
        await this.countdownTimer(totalSec, (remaining, total) => {
            this.updateTimerRing(remaining, total);
        });

        // Gentle chime at end
        this.stopSavasanaAudio();
        this.playChime();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPLETION
    // ═══════════════════════════════════════════════════════════════════════════

    completePractice() {
        this.stopBreathingSounds();
        this.stopSavasanaAudio();
        this.releaseWakeLock();
        this.progressFill.style.width = '100%';

        // Stats
        const elapsed = Math.round((Date.now() - this.practiceStartTime) / 1000);
        this.statPhases.textContent = this.phases.length;
        if (elapsed >= 60) {
            const mins = Math.round(elapsed / 60);
            this.statTime.textContent = mins;
            this.statTimeLabel.textContent = mins === 1 ? 'Minute' : 'Minutes';
        } else {
            this.statTime.textContent = elapsed;
            this.statTimeLabel.textContent = 'Seconds';
        }

        // Log practice
        this.logPractice();
        this.playChime();
        this.showScreen(this.completeScreen);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROGRESS TRACKING
    // ═══════════════════════════════════════════════════════════════════════════

    logPractice() {
        const today = new Date().toISOString().split('T')[0];
        const log = this.getPracticeLog();
        if (!log.includes(today)) {
            log.push(today);
            localStorage.setItem('sky_practice_log', JSON.stringify(log));
        }
    }

    getPracticeLog() {
        try {
            return JSON.parse(localStorage.getItem('sky_practice_log') || '[]');
        } catch { return []; }
    }

    calculateStreak() {
        const log = this.getPracticeLog().sort();
        if (log.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            if (log.includes(dateStr)) {
                streak++;
            } else if (i > 0) {
                break; // Allow today to be missing (streak starts from yesterday)
            }
        }
        return streak;
    }

    renderCalendar() {
        const log = this.getPracticeLog();
        const streak = this.calculateStreak();
        this.streakCount.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;

        this.calendarGrid.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Show last 28 days (4 weeks)
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = d.getDate();
            if (log.includes(dateStr)) cell.classList.add('practiced');
            if (i === 0) cell.classList.add('today');
            this.calendarGrid.appendChild(cell);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SKYPracticeApp();
});
