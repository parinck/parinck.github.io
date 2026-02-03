// Surya Namaskar App - Main JavaScript
class SuryaNamaskarApp {
    constructor() {
        this.currentPose = 0;
        this.poseDuration = 15; // Default 15 seconds per pose
        this.timeRemaining = 15;
        this.timerInterval = null;
        this.isPaused = false;
        this.audioContext = null;
        this.imageCache = new Map(); // Cache for preloaded images

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
    }

    savePreferences() {
        localStorage.setItem('suryaNamaskar_poseDuration', this.poseDuration.toString());
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

    startPractice() {
        this.currentPose = 0;
        this.showScreen(this.practiceScreen);
        this.loadPose();
        this.startTimer();
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
        this.breathingIndicator.querySelector('.breath-text').textContent = pose.breathing;

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

    skipPose() {
        this.playFinalBeep();
        this.nextPose();
    }

    restartPractice() {
        clearInterval(this.timerInterval);
        this.currentPose = 0;
        this.timeRemaining = this.poseDuration;
        this.isPaused = false;
        this.showScreen(this.practiceScreen);
        this.loadPose();
        this.startTimer();
    }

    completePractice() {
        clearInterval(this.timerInterval);
        this.progressFill.style.width = '100%';

        // Calculate and display actual practice time
        const totalSeconds = this.poseDuration * POSES.length;
        const statTime = document.getElementById('stat-time');
        const statTimeLabel = document.getElementById('stat-time-label');

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
