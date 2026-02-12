// Surya Namaskar App - Main JavaScript
class SuryaNamaskarApp {
    constructor() {
        this.currentPose = 0;
        this.currentSet = 1; // Current set number (1-indexed)
        this.totalSets = 1; // Total number of sets to complete
        this.poseDuration = 15; // Default 15 seconds per pose
        this.timeRemaining = 15;
        this.timerInterval = null;
        this.isPaused = false;
        this.audioContext = null;
        this.imageCache = new Map(); // Cache for preloaded images
        this.wakeLock = null; // Wake Lock to prevent screen from sleeping
        this.breathingSoundNodes = []; // Track active breathing sound oscillators

        this.initElements();
        this.loadPreferences(); // Load saved preferences from localStorage
        this.initAudio();
        this.bindEvents();
        this.createProgressDots();
        this.preloadImages(); // Preload all pose images for smooth transitions
    }

    /**
     * Preload all pose images into memory for instant display during practice.
     * Images are stored in a Map cache for quick retrieval.
     */
    preloadImages() {
        POSES.forEach(pose => {
            const img = new Image();
            img.src = pose.image;
            img.onload = () => {
                console.log(`✓ Cached: ${pose.name}`);
            };
            img.onerror = () => {
                console.warn(`✗ Failed to cache: ${pose.name}`);
            };
            this.imageCache.set(pose.image, img);
        });
    }

    /**
     * Get a cached image element or create a new one if not cached.
     * @param {string} imagePath - Path to the image
     * @returns {HTMLImageElement} - The cached or new image element
     */
    getCachedImage(imagePath) {
        if (this.imageCache.has(imagePath)) {
            // Return a clone of the cached image to avoid DOM conflicts
            return this.imageCache.get(imagePath).cloneNode(true);
        }
        // Fallback: create new image if not in cache
        const img = new Image();
        img.src = imagePath;
        return img;
    }

    initElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.practiceScreen = document.getElementById('practice-screen');
        this.completeScreen = document.getElementById('complete-screen');

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.restartPracticeBtn = document.getElementById('restart-practice-btn');

        // Icons
        this.pauseIcon = document.getElementById('pause-icon');
        this.playIcon = document.getElementById('play-icon');

        // Display elements
        this.poseNumber = document.getElementById('pose-number');
        this.poseName = document.getElementById('pose-name');
        this.poseSubtitle = document.getElementById('pose-subtitle');
        this.poseDescription = document.getElementById('pose-description');
        this.poseSvg = document.getElementById('pose-svg');
        this.breathingIndicator = document.getElementById('breathing-indicator');
        this.breathVisual = document.getElementById('breath-visual');
        this.setIndicator = document.getElementById('set-indicator');
        this.currentSetDisplay = document.getElementById('current-set');
        this.totalSetsDisplay = document.getElementById('total-sets');

        // Timer elements
        this.timerSeconds = document.getElementById('timer-seconds');
        this.timerProgress = document.getElementById('timer-progress');
        this.progressFill = document.getElementById('progress-fill');
        this.progressDots = document.getElementById('progress-dots');

        // Time configuration elements
        this.timeValue = document.getElementById('time-value');
        this.timeDecrease = document.getElementById('time-decrease');
        this.timeIncrease = document.getElementById('time-increase');
        this.presetBtns = document.querySelectorAll('.preset-btn');

        // Sets configuration elements
        this.setsValue = document.getElementById('sets-value');
        this.setsDecrease = document.getElementById('sets-decrease');
        this.setsIncrease = document.getElementById('sets-increase');
        this.setsPresetBtns = document.querySelectorAll('.sets-preset-btn');

        // Settings modal elements
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.saveSettings = document.getElementById('save-settings');
    }

    initAudio() {
        // Create AudioContext for beep sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playBeep(frequency = 800, duration = 150, type = 'sine') {
        if (!this.audioContext) return;

        try {
            // Resume audio context if suspended (browser requirement)
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
        // Higher pitched short beep for countdown
        this.playBeep(1000, 100, 'sine');
    }

    playFinalBeep() {
        // Lower pitched longer beep for pose change
        this.playBeep(600, 300, 'square');
    }

    /**
     * Stop any currently playing breathing sounds gracefully.
     */
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

    /**
     * Play a singing bowl style breathing cue.
     * @param {'INHALE'|'EXHALE'|'HOLD'|'START'} type - Breathing type
     */
    playBreathingSound(type) {
        if (!this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Stop previous breathing sound
            this.stopBreathingSound();

            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const duration = 3; // 3 seconds

            if (type === 'INHALE') {
                this._playSingingBowlInhale(ctx, now, duration);
            } else if (type === 'EXHALE') {
                this._playSingingBowlExhale(ctx, now, duration);
            } else if (type === 'HOLD') {
                this._playSingingBowlHold(ctx, now, duration);
            } else {
                // START - gentle singing bowl strike
                this._playSingingBowlStart(ctx, now, duration);
            }
        } catch (e) {
            console.log('Breathing sound error:', e);
        }
    }

    /**
     * Inhale: Warm rising harmonics - like a singing bowl being circled.
     * Two layered tones rising in pitch with gentle volume swell.
     */
    _playSingingBowlInhale(ctx, now, duration) {
        const layers = [
            { startFreq: 220, endFreq: 330, type: 'sine', vol: 0.12 },
            { startFreq: 440, endFreq: 660, type: 'sine', vol: 0.06 },
            { startFreq: 330, endFreq: 495, type: 'triangle', vol: 0.04 },
        ];

        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(layer.endFreq, now + duration);

            // Volume swells gently upward
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

    /**
     * Exhale: Warm descending harmonics - like a singing bowl fading.
     * Tones descend in pitch with natural volume decay.
     */
    _playSingingBowlExhale(ctx, now, duration) {
        const layers = [
            { startFreq: 330, endFreq: 220, type: 'sine', vol: 0.12 },
            { startFreq: 660, endFreq: 440, type: 'sine', vol: 0.06 },
            { startFreq: 495, endFreq: 330, type: 'triangle', vol: 0.04 },
        ];

        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(layer.endFreq, now + duration);

            // Volume starts present and fades out
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

    /**
     * Hold: Sustained resonant hum - like a singing bowl ringing steady.
     * Soft, steady tone with gentle pulsing.
     */
    _playSingingBowlHold(ctx, now, duration) {
        const layers = [
            { freq: 264, type: 'sine', vol: 0.08 },
            { freq: 528, type: 'sine', vol: 0.03 },
        ];

        layers.forEach(layer => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = layer.type;
            osc.frequency.setValueAtTime(layer.freq, now);

            // Gentle fade in, sustain, gentle fade out
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

        // Add subtle LFO tremolo for "alive" feel
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(3, now); // 3 Hz pulse
        lfoGain.gain.setValueAtTime(0.02, now);
        lfo.connect(lfoGain);
        lfoGain.connect(ctx.destination);
        lfo.start(now);
        lfo.stop(now + duration + 0.1);
        this.breathingSoundNodes.push({ oscillator: lfo, gain: lfoGain });
    }

    /**
     * Start: Single gentle singing bowl strike.
     */
    _playSingingBowlStart(ctx, now, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(396, now); // Solfeggio frequency - liberation

        // Sharp attack, long warm decay like a bowl being struck
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.1);

        this.breathingSoundNodes.push({ oscillator: osc, gain });

        // Add harmonic overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(792, now); // Octave above

        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + duration + 0.1);

        this.breathingSoundNodes.push({ oscillator: osc2, gain: gain2 });
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startPractice());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.skipBtn.addEventListener('click', () => this.skipPose());
        this.restartBtn.addEventListener('click', () => this.restartPractice());
        this.restartPracticeBtn.addEventListener('click', () => this.restartPractice());

        // Time configuration events
        this.timeDecrease.addEventListener('click', () => this.adjustTime(-5));
        this.timeIncrease.addEventListener('click', () => this.adjustTime(5));

        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                this.setDuration(time);
            });
        });

        // Sets configuration events
        this.setsDecrease.addEventListener('click', () => this.adjustSets(-1));
        this.setsIncrease.addEventListener('click', () => this.adjustSets(1));

        this.setsPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sets = parseInt(btn.dataset.sets);
                this.setTotalSets(sets);
            });
        });

        // Settings modal events
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveAndCloseSettings());

        // Close modal on overlay click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });

        // Resume audio context on any user interaction
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        // Handle visibility change - re-acquire wake lock if page becomes visible again
        document.addEventListener('visibilitychange', async () => {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });
    }

    adjustTime(delta) {
        const newTime = Math.max(5, Math.min(120, this.poseDuration + delta));
        this.setDuration(newTime);
    }

    setDuration(seconds) {
        this.poseDuration = seconds;
        this.timeValue.textContent = seconds;

        // Update preset buttons active state
        this.presetBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.time) === seconds);
        });
    }

    adjustSets(delta) {
        const newSets = Math.max(1, Math.min(10, this.totalSets + delta));
        this.setTotalSets(newSets);
    }

    setTotalSets(sets) {
        this.totalSets = sets;
        this.setsValue.textContent = sets;

        // Update preset buttons active state
        this.setsPresetBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.sets) === sets);
        });
    }

    // Wake Lock API to prevent screen from sleeping
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('✓ Wake Lock activated - screen will stay on');

                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                });
            } else {
                console.log('Wake Lock API not supported on this device');
            }
        } catch (err) {
            console.log(`Wake Lock error: ${err.name}, ${err.message}`);
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock !== null) {
            await this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake Lock manually released');
        }
    }

    // LocalStorage methods
    loadPreferences() {
        const savedDuration = localStorage.getItem('suryaNamaskar_poseDuration');
        if (savedDuration) {
            const duration = parseInt(savedDuration);
            this.poseDuration = duration;
            this.timeRemaining = duration;
            this.timeValue.textContent = duration;

            // Update preset buttons
            this.presetBtns.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.time) === duration);
            });
        }

        const savedSets = localStorage.getItem('suryaNamaskar_totalSets');
        if (savedSets) {
            const sets = parseInt(savedSets);
            this.totalSets = sets;
            this.setsValue.textContent = sets;

            // Update preset buttons
            this.setsPresetBtns.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.sets) === sets);
            });
        }
    }

    savePreferences() {
        localStorage.setItem('suryaNamaskar_poseDuration', this.poseDuration.toString());
        localStorage.setItem('suryaNamaskar_totalSets', this.totalSets.toString());
    }

    // Settings modal methods
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

    createProgressDots() {
        this.progressDots.innerHTML = '';
        for (let i = 0; i < POSES.length; i++) {
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
            if (index < this.currentPose) {
                dot.classList.add('completed');
            } else if (index === this.currentPose) {
                dot.classList.add('active');
            }
        });
    }

    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.practiceScreen.classList.remove('active');
        this.completeScreen.classList.remove('active');
        screen.classList.add('active');
    }

    async startPractice() {
        this.currentPose = 0;
        this.currentSet = 1;
        await this.requestWakeLock(); // Prevent screen from sleeping
        this.showScreen(this.practiceScreen);
        this.updateSetIndicator();
        this.loadPose();
        this.startTimer();
    }

    updateSetIndicator() {
        if (this.totalSets > 1) {
            this.setIndicator.style.display = 'flex';
            this.currentSetDisplay.textContent = this.currentSet;
            this.totalSetsDisplay.textContent = this.totalSets;
        } else {
            this.setIndicator.style.display = 'none';
        }
    }

    loadPose() {
        const pose = POSES[this.currentPose];

        // Update display
        this.poseNumber.textContent = pose.id;
        this.poseName.textContent = pose.name;
        this.poseSubtitle.textContent = pose.subtitle;
        this.poseDescription.textContent = pose.description;

        // Use cached image for instant display
        const cachedImg = this.getCachedImage(pose.image);
        cachedImg.alt = pose.name;
        cachedImg.className = 'pose-image';
        this.poseSvg.innerHTML = '';
        this.poseSvg.appendChild(cachedImg);

        // Update breathing indicator
        this.breathingIndicator.className = 'breathing-indicator';
        if (pose.breathing === 'INHALE') {
            this.breathingIndicator.classList.add('inhale');
        } else if (pose.breathing === 'EXHALE') {
            this.breathingIndicator.classList.add('exhale');
        } else {
            this.breathingIndicator.classList.add('hold');
        }
        
        // Update breath visual (large indicator)
        this.breathVisual.className = 'breath-visual';
        if (pose.breathing === 'INHALE') {
            this.breathVisual.classList.add('inhale');
        } else if (pose.breathing === 'EXHALE') {
            this.breathVisual.classList.add('exhale');
        } else {
            this.breathVisual.classList.add('hold');
        }
        this.breathingIndicator.querySelector('.breath-text').textContent = pose.breathing;

        // Play breathing sound cue
        this.playBreathingSound(pose.breathing);

        // Update progress
        this.updateProgressDots();
        const progressPercent = ((this.currentPose) / POSES.length) * 100;
        this.progressFill.style.width = `${progressPercent}%`;

        // Reset timer display
        this.timeRemaining = this.poseDuration;
        this.updateTimerDisplay();
    }

    startTimer() {
        this.isPaused = false;
        this.updatePauseButton();

        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeRemaining--;
                this.updateTimerDisplay();

                // Play beep for last 5 seconds
                if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
                    this.playCountdownBeep();
                    this.timerSeconds.classList.add('warning');
                    setTimeout(() => this.timerSeconds.classList.remove('warning'), 300);
                }

                // Time's up
                if (this.timeRemaining <= 0) {
                    this.playFinalBeep();
                    this.nextPose();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerSeconds.textContent = this.timeRemaining;

        // Update circular progress
        const circumference = 2 * Math.PI * 54; // r = 54
        const offset = circumference - (this.timeRemaining / this.poseDuration) * circumference;
        this.timerProgress.style.strokeDashoffset = offset;

        // Change color for last 5 seconds
        if (this.timeRemaining <= 5) {
            this.timerProgress.style.stroke = '#FF6B6B';
        } else {
            this.timerProgress.style.stroke = '#FF8C00';
        }
    }

    nextPose() {
        clearInterval(this.timerInterval);

        if (this.currentPose < POSES.length - 1) {
            this.currentPose++;
            this.loadPose();
            this.startTimer();
        } else {
            // Check if there are more sets to complete
            if (this.currentSet < this.totalSets) {
                this.currentSet++;
                this.currentPose = 0;
                this.updateSetIndicator();
                this.loadPose();
                this.startTimer();
                // Play a special sound for new set
                this.playSetCompleteSound();
            } else {
                this.completePractice();
            }
        }
    }

    playSetCompleteSound() {
        // Play ascending tones to indicate new set
        setTimeout(() => this.playBeep(440, 150), 0);
        setTimeout(() => this.playBeep(550, 150), 150);
        setTimeout(() => this.playBeep(660, 200), 300);
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

    skipPose() {
        this.playFinalBeep();
        this.nextPose();
    }

    async restartPractice() {
        clearInterval(this.timerInterval);
        this.currentPose = 0;
        this.currentSet = 1;
        this.timeRemaining = this.poseDuration;
        this.isPaused = false;
        await this.requestWakeLock(); // Ensure wake lock is active
        this.showScreen(this.practiceScreen);
        this.updateSetIndicator();
        this.loadPose();
        this.startTimer();
    }

    async completePractice() {
        clearInterval(this.timerInterval);
        await this.releaseWakeLock(); // Release wake lock when practice is complete
        this.progressFill.style.width = '100%';

        // Calculate and display actual practice time (including all sets)
        const totalSeconds = this.poseDuration * POSES.length * this.totalSets;
        const totalPoses = POSES.length * this.totalSets;
        const statTime = document.getElementById('stat-time');
        const statTimeLabel = document.getElementById('stat-time-label');
        const statPoses = document.getElementById('stat-poses');
        const statSets = document.getElementById('stat-sets');
        const statSetsLabel = document.getElementById('stat-sets-label');

        // Update poses count
        statPoses.textContent = totalPoses;

        // Update sets count
        if (statSets && statSetsLabel) {
            statSets.textContent = this.totalSets;
            statSetsLabel.textContent = this.totalSets === 1 ? 'Set' : 'Sets';
        }

        if (totalSeconds >= 60) {
            const minutes = Math.round(totalSeconds / 60 * 10) / 10; // Round to 1 decimal
            statTime.textContent = minutes % 1 === 0 ? minutes.toFixed(0) : minutes.toFixed(1);
            statTimeLabel.textContent = minutes === 1 ? 'Minute' : 'Minutes';
        } else {
            statTime.textContent = totalSeconds;
            statTimeLabel.textContent = totalSeconds === 1 ? 'Second' : 'Seconds';
        }

        // Play completion sound
        setTimeout(() => this.playBeep(523, 200), 0);
        setTimeout(() => this.playBeep(659, 200), 200);
        setTimeout(() => this.playBeep(784, 400), 400);

        this.showScreen(this.completeScreen);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SuryaNamaskarApp();
});
