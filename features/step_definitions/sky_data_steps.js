const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const path = require('path');

// ─── Load SKY Data ───────────────────────────────────────────────────────────

let SKY_DATA = null;

function ensureSkyData() {
    if (!SKY_DATA) {
        SKY_DATA = require(path.resolve('sky-practice-data.js'));
    }
    return SKY_DATA;
}

Given('the SKY practice data is loaded', function () {
    ensureSkyData();
});

// ─── SKY_PHASES ──────────────────────────────────────────────────────────────

Then('SKY_PHASES should have {int} entries', function (count) {
    const { SKY_PHASES } = ensureSkyData();
    assert.strictEqual(SKY_PHASES.length, count);
});

Then('all SKY phase IDs should be unique', function () {
    const { SKY_PHASES } = ensureSkyData();
    const ids = SKY_PHASES.map(p => p.id);
    assert.strictEqual(new Set(ids).size, ids.length, 'Duplicate phase IDs found');
});

Then('every SKY phase should have {string}', function (fieldsStr) {
    const { SKY_PHASES } = ensureSkyData();
    const fields = fieldsStr.split(', ').map(f => f.trim());
    SKY_PHASES.forEach((phase, i) => {
        fields.forEach(field => {
            assert.ok(phase[field] !== undefined,
                `Phase "${phase.name || i}" is missing "${field}"`);
        });
    });
});

// ─── Pranayama ───────────────────────────────────────────────────────────────

Then('PRANAYAMA_PHASES should have {int} stages', function (count) {
    const { PRANAYAMA_PHASES } = ensureSkyData();
    assert.strictEqual(PRANAYAMA_PHASES.length, count);
});

Then('every Pranayama stage rhythm should be 4-4-6-2', function () {
    const { PRANAYAMA_PHASES } = ensureSkyData();
    PRANAYAMA_PHASES.forEach(stage => {
        const r = stage.rhythm;
        assert.strictEqual(r.in, 4, `Stage "${stage.name}" inhale should be 4`);
        assert.strictEqual(r.holdIn, 4, `Stage "${stage.name}" holdIn should be 4`);
        assert.strictEqual(r.out, 6, `Stage "${stage.name}" exhale should be 6`);
        assert.strictEqual(r.holdOut, 2, `Stage "${stage.name}" holdOut should be 2`);
    });
});

Then('every Pranayama stage should have positive repetitions', function () {
    const { PRANAYAMA_PHASES } = ensureSkyData();
    PRANAYAMA_PHASES.forEach(stage => {
        assert.ok(stage.repetitions > 0,
            `Stage "${stage.name}" has ${stage.repetitions} repetitions`);
    });
});

Then('every Pranayama stage should have a restSeconds value', function () {
    const { PRANAYAMA_PHASES } = ensureSkyData();
    PRANAYAMA_PHASES.forEach(stage => {
        assert.ok(typeof stage.restSeconds === 'number',
            `Stage "${stage.name}" missing restSeconds`);
    });
});

// ─── Bhastrika ───────────────────────────────────────────────────────────────

Then('Bhastrika should have {int} rounds', function (count) {
    const { BHASTRIKA_PHASE } = ensureSkyData();
    assert.strictEqual(BHASTRIKA_PHASE.rounds, count);
});

Then('Bhastrika should have {int} breaths per round', function (count) {
    const { BHASTRIKA_PHASE } = ensureSkyData();
    assert.strictEqual(BHASTRIKA_PHASE.breathsPerRound, count);
});

Then('Bhastrika should have pace options {string}', function (optionsStr) {
    const { BHASTRIKA_PHASE } = ensureSkyData();
    const expected = optionsStr.split(', ').map(s => s.trim());
    assert.deepStrictEqual(BHASTRIKA_PHASE.paceOptions, expected);
});

Then('Bhastrika paceMs should have values for each pace option', function () {
    const { BHASTRIKA_PHASE } = ensureSkyData();
    BHASTRIKA_PHASE.paceOptions.forEach(opt => {
        assert.ok(BHASTRIKA_PHASE.paceMs[opt] > 0,
            `paceMs missing or invalid for "${opt}"`);
    });
});

// ─── Om Chanting ─────────────────────────────────────────────────────────────

Then('Om Chanting should have {int} repetitions', function (count) {
    const { OM_PHASE } = ensureSkyData();
    assert.strictEqual(OM_PHASE.repetitions, count);
});

Then('Om Chanting chant duration should be greater than {int}', function (min) {
    const { OM_PHASE } = ensureSkyData();
    assert.ok(OM_PHASE.chantDurationSeconds > min);
});

// ─── Kriya ───────────────────────────────────────────────────────────────────

Then('Kriya should have {int} rounds', function (count) {
    const { KRIYA_PHASE } = ensureSkyData();
    assert.strictEqual(KRIYA_PHASE.rounds.length, count);
});

Then('Kriya round paces should decrease across rounds', function () {
    const { KRIYA_PHASE } = ensureSkyData();
    const paces = KRIYA_PHASE.rounds.map(r => r.paceMs);
    for (let i = 1; i < paces.length; i++) {
        assert.ok(paces[i] < paces[i - 1],
            `Round ${i + 1} pace ${paces[i]} should be less than round ${i} pace ${paces[i - 1]}`);
    }
});

Then('Kriya round counts should be {string}', function (countsStr) {
    const { KRIYA_PHASE } = ensureSkyData();
    const expected = countsStr.split(', ').map(Number);
    const actual = KRIYA_PHASE.rounds.map(r => r.count);
    assert.deepStrictEqual(actual, expected);
});

Then('Kriya should have {int} deep breaths', function (count) {
    const { KRIYA_PHASE } = ensureSkyData();
    assert.strictEqual(KRIYA_PHASE.deepBreaths, count);
});

// ─── Savasana ────────────────────────────────────────────────────────────────

Then('Savasana duration should be {int} minutes', function (minutes) {
    const { SAVASANA_PHASE } = ensureSkyData();
    assert.strictEqual(SAVASANA_PHASE.durationMinutes, minutes);
});

Then('Savasana should have at least {int} audio option', function (min) {
    const { SAVASANA_PHASE } = ensureSkyData();
    assert.ok(SAVASANA_PHASE.audioOptions.length >= min);
});

Then('every Savasana audio option should have {string}', function (fieldsStr) {
    const { SAVASANA_PHASE } = ensureSkyData();
    const fields = fieldsStr.split(', ').map(f => f.trim());
    SAVASANA_PHASE.audioOptions.forEach((opt, i) => {
        fields.forEach(field => {
            assert.ok(opt[field] !== undefined,
                `Audio option ${i} missing "${field}"`);
        });
    });
});

// ─── Disclaimer ──────────────────────────────────────────────────────────────

Then('the SKY_DISCLAIMER should not be empty', function () {
    const { SKY_DISCLAIMER } = ensureSkyData();
    assert.ok(SKY_DISCLAIMER && SKY_DISCLAIMER.length > 0);
});
