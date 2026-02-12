// Anxiety Busting Meditation App - Main JavaScript
class AnxietyMeditationApp {
    constructor() {
        this.currentStep = 0;
        this.currentProgram = null;
        this.currentSteps = [];
        this.timeMultiplier = 1.0;
        this.stepDuration = 60; // Calculated per step
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.isPaused = false;
        this.audioContext = null;
        this.wakeLock = null;
        this.breathingSoundNodes = [];
        this.imageCache = new Map();

        this.initElements();
        this.loadPreferences();
        this.initAudio();
        this.bindEvents();
        this.preloadAllImages();
    }

    initElements() {
        // Screens
        this.homeScreen = document.getElementById('home-screen');
        this.practiceScreen = document.getElementById('practice-screen');
        this.completeScreen = document.getElementById('complete-screen');

        // Buttons
        this.backBtn = document.getElementById('back-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.repeatBtn = document.getElementById('repeat-btn');

        // Icons
        this.pauseIcon = document.getElementById('pause-icon');
        this.playIcon = document.getElementById('play-icon');

        // Display elements
        this.programBadgeText = document.getElementById('program-badge-text');
        this.poseNumber = document.getElementById('pose-number');
        this.poseName = document.getElementById('pose-name');
        this.poseSubtitle = document.getElementById('pose-subtitle');
        this.sanskritName = document.getElementById('sanskrit-name');
        this.poseDescription = document.getElementById('pose-description');
        this.poseSvg = document.getElementById('pose-svg');
        this.breathingIndicator = document.getElementById('breathing-indicator');
        this.breathVisual = document.getElementById('breath-visual');
        this.repetitionsContainer = document.getElementById('repetitions-container');
        this.repetitionsText = document.getElementById('repetitions-text');
        this.subStepsEl = document.getElementById('sub-steps');

        // Timer elements
        this.timerSeconds = document.getElementById('timer-seconds');
        this.timerProgress = document.getElementById('timer-progress');
        this.progressFill = document.getElementById('progress-fill');
        this.progressDots = document.getElementById('progress-dots');

        // Settings elements
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.saveSettings = document.getElementById('save-settings');
        this.timeValue = document.getElementById('time-value');
        this.timeDecrease = document.getElementById('time-decrease');
        this.timeIncrease = document.getElementById('time-increase');
        this.presetBtns = document.querySelectorAll('.preset-btn');
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // ─── Audio Methods ──────────────────────────────────────────────────────

    playBeep(frequency = 800, duration = 150, type = 'sine') {
        if (!this.audioContext) return;
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Audio playback error:', e);
        }
    }

    playCountdownBeep() {
        this.playBeep(800, 100, 'sine');
    }

    playFinalBeep() {
        this.playBeep(500, 300, 'triangle');
    }

    stopBreathingSound() {
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

    playBreathingSound(type) {
        if (!this.audioContext) return;
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.stopBreathingSound();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 3;

            if (type === 'INHALE') {
                this._playSingingBowlInhale(ctx, now, duration);
            } else if (type === 'EXHALE') {
                this._playSingingBowlExhale(ctx, now, duration);
            } else if (type === 'HOLD') {
                this._playSingingBowlHold(ctx, now, duration);
            } else {
                this._playSingingBowlStart(ctx, now, duration);
            }
        } catch (e) {
            console.log('Breathing sound error:', e);
        }
    }

    _playSingingBowlInhale(ctx, now, duration) {
        const layers = [
            { startFreq: 220, endFreq: 330, type: 'sine', vol: 0.10 },
            { startFreq: 440, endFreq: 660, type: 'sine', vol: 0.05 },
            { startFreq: 330, endFreq: 495, type: 'triangle', vol: 0.03 },
        ];
        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(layer.endFreq, now + duration);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(layer.vol, now + duration * 0.6);
            gain.gain.exponentialRampToValueAtTime(layer.vol * 0.5, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.1);
            this.breathingSoundNodes.push({ oscillator: osc, gain });
        });
    }

    _playSingingBowlExhale(ctx, now, duration) {
        const layers = [
            { startFreq: 330, endFreq: 220, type: 'sine', vol: 0.10 },
            { startFreq: 660, endFreq: 440, type: 'sine', vol: 0.05 },
            { startFreq: 495, endFreq: 330, type: 'triangle', vol: 0.03 },
        ];
        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(layer.endFreq, now + duration);
            gain.gain.setValueAtTime(layer.vol, now);
            gain.gain.exponentialRampToValueAtTime(layer.vol * 0.7, now + duration * 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.1);
            this.breathingSoundNodes.push({ oscillator: osc, gain });
        });
    }

    _playSingingBowlHold(ctx, now, duration) {
        const layers = [
            { freq: 264, type: 'sine', vol: 0.07 },
            { freq: 528, type: 'sine', vol: 0.03 },
        ];
        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(layer.vol, now + 0.5);
            gain.gain.setValueAtTime(layer.vol, now + duration - 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.1);
            this.breathingSoundNodes.push({ oscillator: osc, gain });
        });
        // LFO tremolo
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(3, now);
        lfoGain.gain.setValueAtTime(0.02, now);
        lfo.connect(lfoGain);
        lfoGain.connect(ctx.destination);
        lfo.start(now);
        lfo.stop(now + duration + 0.1);
        this.breathingSoundNodes.push({ oscillator: lfo, gain: lfoGain });
    }

    _playSingingBowlStart(ctx, now, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(396, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.06, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.1);
        this.breathingSoundNodes.push({ oscillator: osc, gain });
        // Harmonic overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(792, now);
        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + duration + 0.1);
        this.breathingSoundNodes.push({ oscillator: osc2, gain: gain2 });
    }

    // ─── Event Binding ──────────────────────────────────────────────────────

    bindEvents() {
        // Program card clicks
        document.querySelectorAll('.program-card').forEach(card => {
            card.addEventListener('click', () => {
                const programId = card.dataset.program;
                this.selectProgram(programId);
            });
        });

        // Practice controls
        this.backBtn.addEventListener('click', () => this.goHome());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.skipBtn.addEventListener('click', () => this.skipStep());
        this.restartBtn.addEventListener('click', () => this.restartPractice());

        // Completion buttons
        this.homeBtn.addEventListener('click', () => this.goHome());
        this.repeatBtn.addEventListener('click', () => this.restartPractice());

        // Settings
        this.timeDecrease.addEventListener('click', () => this.adjustMultiplier(-0.25));
        this.timeIncrease.addEventListener('click', () => this.adjustMultiplier(0.25));
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mult = parseFloat(btn.dataset.multiplier);
                this.setMultiplier(mult);
            });
        });
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveAndCloseSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });

        // Resume audio on first interaction
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        // Re-acquire wake lock on visibility change
        document.addEventListener('visibilitychange', async () => {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });
    }

    // ─── Settings ───────────────────────────────────────────────────────────

    adjustMultiplier(delta) {
        const newMult = Math.max(0.25, Math.min(3, this.timeMultiplier + delta));
        this.setMultiplier(newMult);
    }

    setMultiplier(value) {
        this.timeMultiplier = value;
        this.timeValue.textContent = value.toFixed(value % 1 === 0 ? 0 : 1);
        // Some values end up like 1.0000000000000002 due to float math
        const display = Math.round(value * 100) / 100;
        this.timeValue.textContent = display % 1 === 0 ? display.toFixed(0) : display;

        this.presetBtns.forEach(btn => {
            const bv = parseFloat(btn.dataset.multiplier);
            btn.classList.toggle('active', Math.abs(bv - value) < 0.01);
        });
    }

    openSettings() {
        this.settingsModal.classList.add('active');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    saveAndCloseSettings() {
        this.savePreferences();
        this.closeSettingsModal();
    }

    loadPreferences() {
        const savedMult = localStorage.getItem('anxietyMeditation_multiplier');
        if (savedMult) {
            this.setMultiplier(parseFloat(savedMult));
        }
    }

    savePreferences() {
        localStorage.setItem('anxietyMeditation_multiplier', this.timeMultiplier.toString());
    }

    // ─── Wake Lock ──────────────────────────────────────────────────────────

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => { });
            }
        } catch (err) {
            console.log(`Wake Lock error: ${err.name}`);
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock !== null) {
            await this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    // ─── Screen Management ──────────────────────────────────────────────────

    showScreen(screen) {
        this.homeScreen.classList.remove('active');
        this.practiceScreen.classList.remove('active');
        this.completeScreen.classList.remove('active');
        screen.classList.add('active');
    }

    goHome() {
        clearInterval(this.timerInterval);
        this.stopBreathingSound();
        this.releaseWakeLock();
        this.showScreen(this.homeScreen);
    }

    // ─── Program Selection ──────────────────────────────────────────────────

    selectProgram(programId) {
        const program = PROGRAMS.find(p => p.id === programId);
        if (!program) return;

        this.currentProgram = program;
        this.currentSteps = program.steps;
        this.currentStep = 0;

        this.programBadgeText.textContent = program.name;
        this.createProgressDots();
        this.startPractice();
    }

    // ─── Practice Flow ──────────────────────────────────────────────────────

    async startPractice() {
        this.currentStep = 0;
        await this.requestWakeLock();
        this.showScreen(this.practiceScreen);
        this.loadStep();
        this.startTimer();
    }

    createProgressDots() {
        this.progressDots.innerHTML = '';
        for (let i = 0; i < this.currentSteps.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'progress-dot';
            dot.dataset.index = i;
            this.progressDots.appendChild(dot);
        }
    }

    updateProgressDots() {
        const dots = this.progressDots.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < this.currentStep) {
                dot.classList.add('completed');
            } else if (index === this.currentStep) {
                dot.classList.add('active');
            }
        });
    }

    loadStep() {
        const step = this.currentSteps[this.currentStep];

        // Update display
        this.poseNumber.textContent = step.id;
        this.poseName.textContent = step.name;
        this.poseSubtitle.textContent = step.subtitle;
        this.poseDescription.textContent = step.description;

        // Sanskrit name
        if (step.sanskrit) {
            this.sanskritName.textContent = step.sanskrit;
            this.sanskritName.style.display = 'block';
        } else {
            this.sanskritName.style.display = 'none';
        }

        // Pose image
        this.poseSvg.innerHTML = '';
        if (step.image) {
            const cachedImg = this.getCachedImage(step.image);
            cachedImg.alt = step.name;
            cachedImg.className = 'pose-image';
            this.poseSvg.appendChild(cachedImg);
        }

        // Breathing indicator
        this.breathingIndicator.className = 'breathing-indicator';
        if (step.breathing === 'INHALE') {
            this.breathingIndicator.classList.add('inhale');
        } else if (step.breathing === 'EXHALE') {
            this.breathingIndicator.classList.add('exhale');
        } else {
            this.breathingIndicator.classList.add('hold');
        }
        this.breathingIndicator.querySelector('.breath-text').textContent = step.breathing;

        // Breath visual
        this.breathVisual.className = 'breath-visual';
        if (step.breathing === 'INHALE') {
            this.breathVisual.classList.add('inhale');
        } else if (step.breathing === 'EXHALE') {
            this.breathVisual.classList.add('exhale');
        } else {
            this.breathVisual.classList.add('hold');
        }

        // Play breathing sound
        this.playBreathingSound(step.breathing);

        // Repetitions badge
        if (step.repetitions) {
            this.repetitionsContainer.style.display = 'block';
            this.repetitionsText.textContent = step.repetitions;
        } else {
            this.repetitionsContainer.style.display = 'none';
        }

        // Sub-steps (Yoga Nidra)
        if (step.subSteps && step.subSteps.length > 0) {
            this.subStepsEl.style.display = 'block';
            this.subStepsEl.innerHTML = step.subSteps.map(s => `<li>${s}</li>`).join('');
        } else {
            this.subStepsEl.style.display = 'none';
        }

        // Update progress
        this.updateProgressDots();
        const progressPercent = (this.currentStep / this.currentSteps.length) * 100;
        this.progressFill.style.width = `${progressPercent}%`;

        // Calculate duration for this step
        this.stepDuration = Math.round(step.defaultDuration * this.timeMultiplier);
        this.timeRemaining = this.stepDuration;
        this.updateTimerDisplay();
    }

    startTimer() {
        this.isPaused = false;
        this.updatePauseButton();

        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeRemaining--;
                this.updateTimerDisplay();

                // Countdown beeps for last 5 seconds
                if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
                    this.playCountdownBeep();
                    this.timerSeconds.classList.add('warning');
                    setTimeout(() => this.timerSeconds.classList.remove('warning'), 300);
                }

                // Time's up
                if (this.timeRemaining <= 0) {
                    this.playFinalBeep();
                    this.nextStep();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        // Show minutes:seconds if > 60
        if (this.timeRemaining >= 60) {
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = this.timeRemaining % 60;
            this.timerSeconds.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            this.timerSeconds.textContent = this.timeRemaining;
        }

        // Update circular progress
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (this.timeRemaining / this.stepDuration) * circumference;
        this.timerProgress.style.strokeDashoffset = offset;

        // Change color for last 10 seconds
        if (this.timeRemaining <= 10) {
            this.timerProgress.style.stroke = '#FF6B9D';
        } else {
            this.timerProgress.style.stroke = '#7B68EE';
        }
    }

    nextStep() {
        clearInterval(this.timerInterval);

        if (this.currentStep < this.currentSteps.length - 1) {
            this.currentStep++;
            this.loadStep();
            this.startTimer();

            // Transition sound
            setTimeout(() => this.playBeep(440, 150), 0);
            setTimeout(() => this.playBeep(550, 150), 150);
        } else {
            this.completePractice();
        }
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

    skipStep() {
        this.playFinalBeep();
        this.nextStep();
    }

    async restartPractice() {
        clearInterval(this.timerInterval);
        this.currentStep = 0;
        this.isPaused = false;
        await this.requestWakeLock();
        this.showScreen(this.practiceScreen);
        this.loadStep();
        this.startTimer();
    }

    async completePractice() {
        clearInterval(this.timerInterval);
        this.stopBreathingSound();
        await this.releaseWakeLock();
        this.progressFill.style.width = '100%';

        // Calculate stats
        const totalSeconds = this.currentSteps.reduce((sum, s) => sum + Math.round(s.defaultDuration * this.timeMultiplier), 0);
        const totalSteps = this.currentSteps.length;

        const statSteps = document.getElementById('stat-steps');
        const statStepsLabel = document.getElementById('stat-steps-label');
        const statTime = document.getElementById('stat-time');
        const statTimeLabel = document.getElementById('stat-time-label');

        statSteps.textContent = totalSteps;
        statStepsLabel.textContent = totalSteps === 1 ? 'Step' : 'Steps';

        if (totalSeconds >= 60) {
            const minutes = Math.round(totalSeconds / 60);
            statTime.textContent = minutes;
            statTimeLabel.textContent = minutes === 1 ? 'Minute' : 'Minutes';
        } else {
            statTime.textContent = totalSeconds;
            statTimeLabel.textContent = 'Seconds';
        }

        // Custom completion messages
        const messages = {
            'sleep-stretches': 'Your body is now deeply relaxed and ready for restful sleep. Sweet dreams. 🌙',
            'anxiety-protocol': 'Your anxiety has melted away. You are calm, healthy and happy. Om Shanti. ✨',
            'home-kriya': 'Your Sudarshan Kriya is complete. Energy flows freely through you. Jai Gurudev. 🙏'
        };
        const completionMsg = document.getElementById('completion-message');
        completionMsg.textContent = messages[this.currentProgram.id] || 'Practice complete. Namaste. 🙏';

        // Completion chime — ethereal bells
        setTimeout(() => this.playBeep(523, 200, 'sine'), 0);
        setTimeout(() => this.playBeep(659, 200, 'sine'), 200);
        setTimeout(() => this.playBeep(784, 400, 'sine'), 400);

        this.showScreen(this.completeScreen);
    }

    // ─── Image Preloading & Caching ─────────────────────────────────────────

    preloadAllImages() {
        const allSteps = [...SLEEP_STRETCHES, ...ANXIETY_PROTOCOL, ...HOME_KRIYA];
        allSteps.forEach(step => {
            if (step.image) {
                const img = new Image();
                img.src = step.image;
                this.imageCache.set(step.image, img);
            }
        });
    }

    getCachedImage(src) {
        if (this.imageCache.has(src)) {
            return this.imageCache.get(src).cloneNode();
        }
        const img = new Image();
        img.src = src;
        this.imageCache.set(src, img);
        return img.cloneNode();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AnxietyMeditationApp();
});

