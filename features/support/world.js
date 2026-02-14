const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { JSDOM } = require('jsdom');

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.dom = null;
        this.document = null;
        this.window = null;
    }

    /**
     * Create a minimal jsdom environment with stub DOM elements
     * so the app classes can be instantiated without a real browser.
     */
    setupDOM() {
        const html = `<!DOCTYPE html>
        <html><body>
            <!-- Screens -->
            <div id="home-screen" class="screen active"></div>
            <div id="start-screen" class="screen"></div>
            <div id="practice-screen" class="screen"></div>
            <div id="complete-screen" class="screen"></div>

            <!-- Practice display -->
            <span id="pose-number"></span>
            <span id="pose-name"></span>
            <span id="pose-subtitle"></span>
            <span id="sanskrit-name"></span>
            <p id="pose-description"></p>
            <div id="pose-svg"></div>
            <div id="breathing-indicator" class="breathing-indicator"><span class="breath-text"></span></div>
            <div id="breath-visual" class="breath-visual"></div>
            <span id="repetitions-container"><span id="repetitions-text"></span></span>
            <ul id="sub-steps"></ul>

            <!-- Timer -->
            <span id="timer-seconds"></span>
            <circle id="timer-progress" style="stroke: #7B68EE;"></circle>

            <!-- Progress -->
            <div id="progress-dots"></div>
            <div id="progress-fill" style="width: 0;"></div>
            <span id="program-badge-text"></span>

            <!-- Set indicator -->
            <div id="set-indicator">
                <span id="current-set">1</span>
                <span id="total-sets">1</span>
            </div>

            <!-- Settings modal -->
            <div id="settings-modal"></div>
            <span id="time-value">1</span>
            <span id="sets-value">1</span>
            <button id="time-decrease">-</button>
            <button id="time-increase">+</button>
            <button id="sets-decrease">-</button>
            <button id="sets-increase">+</button>
            <button id="close-settings">Close</button>
            <button id="save-settings">Done</button>

            <!-- Preset buttons -->
            <button class="preset-btn" data-time="15" data-multiplier="0.5">15</button>
            <button class="preset-btn" data-time="30" data-multiplier="1">30</button>
            <button class="preset-btn" data-time="60" data-multiplier="2">60</button>
            <button class="sets-preset-btn" data-sets="1">1</button>
            <button class="sets-preset-btn" data-sets="3">3</button>
            <button class="sets-preset-btn" data-sets="5">5</button>

            <!-- Buttons: Surya Namaskar -->
            <button id="start-btn">Start</button>
            <button id="pause-btn"><span id="pause-icon">⏸</span><span id="play-icon" style="display:none;">▶</span><span class="pause-text">Pause</span></button>
            <button id="skip-btn">Skip</button>
            <button id="restart-btn">Restart</button>
            <button id="restart-practice-btn">Restart Practice</button>
            <button id="settings-btn">Settings</button>

            <!-- Buttons: Meditation -->
            <button id="back-btn">Back</button>
            <button id="home-btn">Home</button>
            <button id="repeat-btn">Repeat</button>

            <!-- Completion stats -->
            <span id="stat-time"></span>
            <span id="stat-time-label"></span>
            <span id="stat-poses"></span>
            <span id="stat-steps"></span>
            <span id="stat-steps-label"></span>
            <span id="stat-sets"></span>
            <span id="stat-sets-label"></span>
            <span id="completion-message"></span>

            <!-- Program cards -->
            <div class="program-card" data-program="sleep-stretches"></div>
            <div class="program-card" data-program="anxiety-protocol"></div>
            <div class="program-card" data-program="home-kriya"></div>
        </body></html>`;

        this.dom = new JSDOM(html, { url: 'http://localhost' });
        this.window = this.dom.window;
        this.document = this.window.document;

        // Inject globals the app scripts expect
        global.document = this.document;
        global.window = this.window;
        global.localStorage = this.createMockLocalStorage();
        global.HTMLElement = this.window.HTMLElement;

        // Mock navigator.wakeLock
        if (!global.navigator) {
            global.navigator = { wakeLock: {} };
        }
        try {
            Object.defineProperty(global.navigator, 'wakeLock', {
                value: { request: async () => ({ release: async () => { }, addEventListener: () => { } }) },
                writable: true,
                configurable: true
            });
        } catch (e) {
            // Fallback for environments where navigator is immutable
            console.warn('Could not mock navigator.wakeLock', e);
        }

        global.setInterval = (fn, ms) => 42; // return a dummy id
        global.clearInterval = () => { };
        global.setTimeout = (fn, ms) => { fn(); return 1; };
        global.AudioContext = class {
            get currentTime() { return 0; }
            createOscillator() {
                return {
                    type: 'sine', frequency: { value: 0, setValueAtTime() { }, linearRampToValueAtTime() { } },
                    connect() { }, start() { }, stop() { }, addEventListener() { }
                };
            }
            createGain() {
                return {
                    gain: { value: 1, setValueAtTime() { }, linearRampToValueAtTime() { }, exponentialRampToValueAtTime() { } },
                    connect() { }
                };
            }
            get destination() { return {}; }
        };
        global.Image = this.window.Image;
    }

    /**
     * SKY Practice app DOM stubs — separate from setupDOM to avoid
     * polluting the existing Surya Namaskar / Meditation tests.
     */
    setupSkyDOM() {
        const html = `<!DOCTYPE html>
        <html><body>
            <!-- Screens -->
            <div id="home-screen" class="screen active"></div>
            <div id="practice-screen" class="screen"></div>
            <div id="rest-screen" class="screen"></div>
            <div id="complete-screen" class="screen"></div>

            <!-- Home -->
            <button id="guided-session-btn"></button>
            <button id="quick-practice-btn"></button>
            <div id="section-picker" style="display:none;"></div>
            <div id="section-cards"></div>

            <!-- Streak -->
            <span id="streak-count"></span>
            <div id="calendar-grid"></div>

            <!-- Practice header -->
            <button id="back-btn"></button>
            <span id="phase-badge-icon"></span>
            <span id="phase-badge-text"></span>
            <div id="progress-fill" style="width:0;"></div>
            <div id="progress-phases"></div>

            <span id="phase-name"></span>
            <span id="phase-subtitle"></span>
            <span id="phase-sanskrit"></span>
            <p id="phase-description"></p>

            <!-- Breathing bubble -->
            <div id="bubble-wrapper">
                <div id="breathing-bubble" class="breathing-bubble"></div>
            </div>
            <span id="bubble-label"></span>
            <span id="bubble-counter"></span>

            <!-- Counters -->
            <div id="breath-counter-display"><span id="breath-current"></span><span id="breath-total"></span></div>
            <div id="round-info"><span id="round-label"></span></div>
            <div id="rep-counter"><span id="rep-label"></span></div>

            <!-- Om -->
            <div id="om-display"><span id="om-instruction"></span></div>

            <!-- Timer -->
            <div id="timer-container">
                <span id="timer-text"></span>
                <circle id="timer-progress" style="stroke: #3b82f6;"></circle>
            </div>

            <!-- Audio selector -->
            <div id="audio-selector"><div id="audio-options"></div></div>

            <!-- Controls -->
            <button id="pause-btn"><span id="pause-icon"></span><span id="play-icon" style="display:none;"></span></button>
            <button id="skip-btn"></button>
            <button id="restart-btn"></button>

            <!-- Rest -->
            <span id="rest-countdown"></span>

            <!-- Completion -->
            <span id="stat-phases"></span>
            <span id="stat-time"></span>
            <span id="stat-time-label"></span>
            <span id="completion-message"></span>
            <button id="home-complete-btn"></button>
            <button id="repeat-complete-btn"></button>

            <!-- Modals -->
            <div id="disclaimer-modal"><p id="disclaimer-text"></p><button id="disclaimer-accept"></button></div>
            <button id="settings-btn"></button>
            <div id="settings-modal"><button id="close-settings"></button><button id="save-settings"></button></div>
            <button id="voice-toggle"></button>
        </body></html>`;

        this.dom = new JSDOM(html, { url: 'http://localhost' });
        this.window = this.dom.window;
        this.document = this.window.document;

        global.document = this.document;
        global.window = this.window;
        global.localStorage = this.createMockLocalStorage();
        global.HTMLElement = this.window.HTMLElement;

        if (!global.navigator) {
            global.navigator = { wakeLock: {} };
        }
        try {
            Object.defineProperty(global.navigator, 'wakeLock', {
                value: { request: async () => ({ release: async () => { }, addEventListener: () => { } }) },
                writable: true,
                configurable: true
            });
        } catch (e) { /* ignore */ }

        global.setInterval = (fn, ms) => 42;
        global.clearInterval = () => { };
        global.setTimeout = (fn, ms) => { fn(); return 1; };
        global.AudioContext = class {
            get state() { return 'running'; }
            resume() { return Promise.resolve(); }
            get currentTime() { return 0; }
            createOscillator() {
                return {
                    type: 'sine', frequency: { value: 0, setValueAtTime() { }, linearRampToValueAtTime() { } },
                    connect() { }, start() { }, stop() { }, addEventListener() { }
                };
            }
            createGain() {
                return {
                    gain: {
                        value: 1,
                        setValueAtTime() { },
                        linearRampToValueAtTime() { },
                        exponentialRampToValueAtTime() { },
                        cancelScheduledValues() { }
                    },
                    connect() { }
                };
            }
            createBiquadFilter() {
                return {
                    type: 'lowpass', frequency: { value: 0 },
                    connect() { }
                };
            }
            get destination() { return {}; }
        };
        global.Image = this.window.Image;
        global.AbortController = this.window.AbortController || class {
            constructor() { this.signal = { aborted: false }; }
            abort() { this.signal.aborted = true; }
        };
        global.DOMException = this.window.DOMException || class extends Error {
            constructor(msg, name) { super(msg); this.name = name; }
        };
    }

    cleanupSkyDOM() {
        this.cleanupDOM();
        delete global.AbortController;
        delete global.DOMException;
    }

    createMockLocalStorage() {
        const store = {};
        return {
            getItem: (key) => store[key] || null,
            setItem: (key, val) => { store[key] = String(val); },
            removeItem: (key) => { delete store[key]; },
            clear: () => { Object.keys(store).forEach(k => delete store[k]); }
        };
    }

    cleanupDOM() {
        delete global.document;
        delete global.window;
        delete global.localStorage;
        delete global.HTMLElement;
        delete global.navigator;
        delete global.setInterval;
        delete global.clearInterval;
        delete global.setTimeout;
        delete global.AudioContext;
        delete global.Image;
    }
}

setWorldConstructor(CustomWorld);
