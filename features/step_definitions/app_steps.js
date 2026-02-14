const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// ─── Helpers to load app classes with mocked DOM ─────────────────────────────

function loadSuryaNamaskarApp(world) {
    world.setupDOM();

    // Load data first so POSES is globally available
    const dataCode = fs.readFileSync(path.resolve('surya-namaskar-poses.js'), 'utf8');
    // Strip the module.exports guard so it just sets global const
    const cleanData = dataCode.replace(/if\s*\(typeof module[^}]*}\s*/g, '');

    const context = vm.createContext({
        ...global,
        document: global.document,
        window: global.window,
        localStorage: global.localStorage,
        navigator: global.navigator,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval,
        setTimeout: global.setTimeout,
        AudioContext: global.AudioContext,
        Image: global.Image,
        console: console
    });

    // Execute data file to define POSES
    vm.runInContext(cleanData, context);

    // Execute app file to define SuryaNamaskarApp
    const appCode = fs.readFileSync(path.resolve('surya-namaskar-app.js'), 'utf8');
    vm.runInContext(appCode, context);

    // Instantiate
    const app = vm.runInContext('new SuryaNamaskarApp()', context);
    return { app, context };
}

function loadMeditationApp(world) {
    world.setupDOM();

    const dataCode = fs.readFileSync(path.resolve('anxiety-meditation-data.js'), 'utf8');
    // Strip multi-line module.exports guard
    const cleanData = dataCode.replace(/\/\/ CJS export[\s\S]*$/, '');

    const context = vm.createContext({
        ...global,
        document: global.document,
        window: global.window,
        localStorage: global.localStorage,
        navigator: global.navigator,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval,
        setTimeout: global.setTimeout,
        AudioContext: global.AudioContext,
        Image: global.Image,
        console: console
    });

    vm.runInContext(cleanData, context);

    const appCode = fs.readFileSync(path.resolve('anxiety-meditation-app.js'), 'utf8');
    vm.runInContext(appCode, context);

    const app = vm.runInContext('new AnxietyMeditationApp()', context);
    return { app, context };
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

After(function () {
    this.cleanupDOM();
});

// ═══════════════════════════════════════════════════════════════════════════════
// SURYA NAMASKAR APP STEPS
// ═══════════════════════════════════════════════════════════════════════════════

Given('a Surya Namaskar app is initialized', function () {
    const { app, context } = loadSuryaNamaskarApp(this);
    this.app = app;
    this.vmContext = context;
});

When('I adjust the time by {int}', function (delta) {
    this.app.adjustTime(delta);
});

When('I set the duration to {int}', function (seconds) {
    this.app.setDuration(seconds);
});

When('I adjust the sets by {int}', function (delta) {
    this.app.adjustSets(delta);
});

When('I set total sets to {int}', function (sets) {
    this.app.setTotalSets(sets);
});

When('the time remaining is {int}', function (seconds) {
    this.app.timeRemaining = seconds;
});

When('the timer display is updated', function () {
    this.app.updateTimerDisplay();
});

When('I toggle pause', function () {
    this.app.togglePause();
});

When('I advance to the next pose', function () {
    this.app.nextPose();
});

When('the practice is completed', async function () {
    await this.app.completePractice();
});

When('I save preferences', function () {
    this.app.savePreferences();
});

Then('the pose duration should be {int}', function (expected) {
    assert.strictEqual(this.app.poseDuration, expected);
});

Then('the total sets should be {int}', function (expected) {
    assert.strictEqual(this.app.totalSets, expected);
});

Then('the timer progress color should be {string}', function (color) {
    assert.strictEqual(this.app.timerProgress.style.stroke, color);
});

Then('the app should be paused', function () {
    assert.strictEqual(this.app.isPaused, true);
});

Then('the app should not be paused', function () {
    assert.strictEqual(this.app.isPaused, false);
});

Then('the current pose index should be {int}', function (index) {
    assert.strictEqual(this.app.currentPose, index);
});

Then('the total poses stat should be {string}', function (expected) {
    const el = global.document.getElementById('stat-poses');
    assert.strictEqual(el.textContent, expected);
});

Then('the total time stat should be {string}', function (expected) {
    const el = global.document.getElementById('stat-time');
    assert.strictEqual(el.textContent, expected);
});

Then('the time label should be {string}', function (expected) {
    const el = global.document.getElementById('stat-time-label');
    assert.strictEqual(el.textContent, expected);
});

Then('localStorage should have {string} as {string}', function (key, value) {
    assert.strictEqual(global.localStorage.getItem(key), value);
});

// ═══════════════════════════════════════════════════════════════════════════════
// MEDITATION APP STEPS
// ═══════════════════════════════════════════════════════════════════════════════

Given('a Meditation app is initialized', function () {
    const { app, context } = loadMeditationApp(this);
    this.medApp = app;
    this.vmContext = context;
});

Given('the multiplier is set to {float}', function (value) {
    this.medApp.setMultiplier(value);
});

When('I adjust the multiplier by {float}', function (delta) {
    this.medApp.adjustMultiplier(delta);
});

When('the step duration is {int} and time remaining is {int}', function (stepDur, remaining) {
    this.medApp.stepDuration = stepDur;
    this.medApp.timeRemaining = remaining;
});

When('the meditation timer display is updated', function () {
    this.medApp.updateTimerDisplay();
});

When('I select the {string} program', function (programId) {
    this.medApp.selectProgram(programId);
});

When('I toggle meditation pause', function () {
    this.medApp.togglePause();
});

When('the meditation practice is completed', async function () {
    await this.medApp.completePractice();
});

When('I save meditation preferences', function () {
    this.medApp.savePreferences();
});

Then('the multiplier should be {float}', function (expected) {
    assert.ok(Math.abs(this.medApp.timeMultiplier - expected) < 0.001,
        `Expected multiplier ${expected}, got ${this.medApp.timeMultiplier}`);
});

Then('the timer should show {string}', function (expected) {
    const el = global.document.getElementById('timer-seconds');
    assert.strictEqual(String(el.textContent), expected);
});

Then('the meditation timer progress color should be {string}', function (color) {
    assert.strictEqual(this.medApp.timerProgress.style.stroke, color);
});

Then('the current program name should be {string}', function (name) {
    assert.strictEqual(this.medApp.currentProgram.name, name);
});

Then('there should be {int} current steps', function (count) {
    assert.strictEqual(this.medApp.currentSteps.length, count);
});

Then('the meditation app should be paused', function () {
    assert.strictEqual(this.medApp.isPaused, true);
});

Then('the meditation app should not be paused', function () {
    assert.strictEqual(this.medApp.isPaused, false);
});

Then('the steps stat should be {string}', function (expected) {
    const el = global.document.getElementById('stat-steps');
    assert.strictEqual(el.textContent, expected);
});

Then('the meditation time stat should be {string}', function (expected) {
    const el = global.document.getElementById('stat-time');
    assert.strictEqual(el.textContent, expected);
});

Then('the meditation time label should be {string}', function (expected) {
    const el = global.document.getElementById('stat-time-label');
    assert.strictEqual(el.textContent, expected);
});
