const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

// ─── Load SKY App with mocked DOM ────────────────────────────────────────────

function loadSKYApp(world) {
    world.setupSkyDOM();

    const dataCode = fs.readFileSync(path.resolve('sky-practice-data.js'), 'utf8');
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
        Date: global.Date,
        AbortController: global.AbortController,
        DOMException: global.DOMException,
        console: console
    });

    // Execute data file
    vm.runInContext(cleanData, context);

    // Execute app file
    const appCode = fs.readFileSync(path.resolve('sky-practice-app.js'), 'utf8');
    vm.runInContext(appCode, context);

    // Instantiate
    const app = vm.runInContext('new SKYPracticeApp()', context);
    return { app, context };
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

After(function () {
    if (this.cleanupSkyDOM) {
        this.cleanupSkyDOM();
    }
});

// ─── Initialization ──────────────────────────────────────────────────────────

Given('a SKY Practice app is initialized', function () {
    const { app, context } = loadSKYApp(this);
    this.skyApp = app;
    this.vmContext = context;
});

// ─── State assertions ────────────────────────────────────────────────────────

Then('the SKY app should not be paused', function () {
    assert.strictEqual(this.skyApp.isPaused, false);
});

Then('the SKY app should be paused', function () {
    assert.strictEqual(this.skyApp.isPaused, true);
});

Then('the SKY phase index should be {int}', function (idx) {
    assert.strictEqual(this.skyApp.currentPhaseIndex, idx);
});

Then('SKY voice should be enabled', function () {
    assert.strictEqual(this.skyApp.voiceEnabled, true);
});

// ─── Disclaimer ──────────────────────────────────────────────────────────────

Then('the disclaimer modal should be active', function () {
    assert.ok(this.skyApp.disclaimerModal.classList.contains('active'));
});

Then('the disclaimer modal should not be active', function () {
    assert.ok(!this.skyApp.disclaimerModal.classList.contains('active'));
});

When('I accept the SKY disclaimer', function () {
    this.skyApp.acceptDisclaimer();
});

// ─── Pause ───────────────────────────────────────────────────────────────────

When('I toggle SKY pause', function () {
    this.skyApp.togglePause();
});

// ─── Guided Session ──────────────────────────────────────────────────────────

When('I start a guided SKY session', function () {
    this.skyApp.startGuidedSession();
});

Then('the SKY app should have {int} active phases', function (count) {
    assert.strictEqual(this.skyApp.phases.length, count);
});

Then('SKY guided mode should be true', function () {
    assert.strictEqual(this.skyApp.isGuidedSession, true);
});

Then('there should be {int} progress dots', function (count) {
    const dots = global.document.getElementById('progress-phases')
        .querySelectorAll('.progress-dot');
    assert.strictEqual(dots.length, count);
});

// ─── Section Picker ──────────────────────────────────────────────────────────

When('I toggle the section picker', function () {
    this.skyApp.toggleSectionPicker();
});

Then('the section picker should be visible', function () {
    assert.strictEqual(this.skyApp.sectionPicker.style.display, 'block');
});

Then('the section picker should not be visible', function () {
    assert.strictEqual(this.skyApp.sectionPicker.style.display, 'none');
});

Then('the section cards should have {int} children', function (count) {
    assert.strictEqual(this.skyApp.sectionCards.children.length, count);
});

// ─── Timer Ring ──────────────────────────────────────────────────────────────

When('the SKY timer ring is updated with {int} remaining of {int}', function (remaining, total) {
    this.skyApp.updateTimerRing(remaining, total);
});

Then('the SKY timer text should show {string}', function (expected) {
    assert.strictEqual(String(this.skyApp.timerText.textContent), expected);
});

Then('the SKY timer progress color should be {string}', function (color) {
    assert.strictEqual(this.skyApp.timerProgress.style.stroke, color);
});

// ─── Preferences ─────────────────────────────────────────────────────────────

When('SKY voice is set to false', function () {
    this.skyApp.voiceEnabled = false;
});

When('SKY savasana audio is set to {string}', function (audio) {
    this.skyApp.savasanaAudio = audio;
});

When('I save SKY preferences', function () {
    this.skyApp.savePreferences();
});

// ─── Progress Tracking ───────────────────────────────────────────────────────

When('I log a SKY practice', function () {
    this.skyApp.logPractice();
});

Then('the SKY practice log should contain today', function () {
    const today = new Date().toISOString().split('T')[0];
    const log = this.skyApp.getPracticeLog();
    assert.ok(log.includes(today), `Log does not contain ${today}`);
});

Then('the SKY practice log should have {int} entry', function (count) {
    const log = this.skyApp.getPracticeLog();
    assert.strictEqual(log.length, count);
});

Then('the calendar should have {int} day cells', function (count) {
    const cells = global.document.getElementById('calendar-grid').children;
    assert.strictEqual(cells.length, count);
});

Then('the SKY streak should be {int}', function (expected) {
    assert.strictEqual(this.skyApp.calculateStreak(), expected);
});

// ─── Completion ──────────────────────────────────────────────────────────────

When('the SKY practice is completed', function () {
    this.skyApp.completePractice();
});

Then('the SKY stat phases should be {string}', function (expected) {
    assert.strictEqual(
        global.document.getElementById('stat-phases').textContent,
        expected
    );
});
