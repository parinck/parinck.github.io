const { Given, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const path = require('path');

// ─── Surya Namaskar Data ─────────────────────────────────────────────────────

let POSES;

Given('the Surya Namaskar poses are loaded', function () {
    const data = require(path.resolve('surya-namaskar-poses.js'));
    POSES = data.POSES;
});

Then('there should be {int} poses', function (count) {
    assert.strictEqual(POSES.length, count);
});

Then('every pose should have an {string} field', function (field) {
    POSES.forEach((pose, i) => {
        assert.ok(pose[field] !== undefined, `Pose ${i + 1} is missing "${field}"`);
    });
});

Then('every pose should have a {string} field', function (field) {
    POSES.forEach((pose, i) => {
        assert.ok(pose[field] !== undefined, `Pose ${i + 1} is missing "${field}"`);
    });
});

Then('the pose IDs should be sequential from {int} to {int}', function (start, end) {
    for (let i = start; i <= end; i++) {
        assert.strictEqual(POSES[i - 1].id, i, `Expected pose ID ${i} at index ${i - 1}`);
    }
});

Then('every breathing value should be one of {string}', function (valuesStr) {
    const valid = valuesStr.split(', ').map(v => v.trim());
    POSES.forEach((pose, i) => {
        assert.ok(valid.includes(pose.breathing),
            `Pose ${i + 1} has invalid breathing "${pose.breathing}"`);
    });
});

Then('every image path should start with {string}', function (prefix) {
    POSES.forEach((pose, i) => {
        assert.ok(pose.image.startsWith(prefix),
            `Pose ${i + 1} image "${pose.image}" doesn't start with "${prefix}"`);
    });
});

Then('every image path should end with {string}', function (suffix) {
    POSES.forEach((pose, i) => {
        assert.ok(pose.image.endsWith(suffix),
            `Pose ${i + 1} image "${pose.image}" doesn't end with "${suffix}"`);
    });
});

// ─── Meditation Data ─────────────────────────────────────────────────────────

let SLEEP_STRETCHES, ANXIETY_PROTOCOL, HOME_KRIYA, PROGRAMS;

Given('the meditation data is loaded', function () {
    const data = require(path.resolve('anxiety-meditation-data.js'));
    SLEEP_STRETCHES = data.SLEEP_STRETCHES;
    ANXIETY_PROTOCOL = data.ANXIETY_PROTOCOL;
    HOME_KRIYA = data.HOME_KRIYA;
    PROGRAMS = data.PROGRAMS;
});

Then('Sleep Stretches should have {int} steps', function (count) {
    assert.strictEqual(SLEEP_STRETCHES.length, count);
});

Then('Anxiety Protocol should have {int} steps', function (count) {
    assert.strictEqual(ANXIETY_PROTOCOL.length, count);
});

Then('Home Kriya should have {int} steps', function (count) {
    assert.strictEqual(HOME_KRIYA.length, count);
});

Then('every meditation step should have {string}', function (fieldsStr) {
    const fields = fieldsStr.split(', ').map(f => f.trim().replace(/"/g, ''));
    const allSteps = [...SLEEP_STRETCHES, ...ANXIETY_PROTOCOL, ...HOME_KRIYA];
    allSteps.forEach((step, i) => {
        fields.forEach(field => {
            assert.ok(step[field] !== undefined,
                `Step ${i + 1} ("${step.name || 'unknown'}") is missing "${field}"`);
        });
    });
});

Then('every default duration should be greater than {int}', function (min) {
    const allSteps = [...SLEEP_STRETCHES, ...ANXIETY_PROTOCOL, ...HOME_KRIYA];
    allSteps.forEach((step, i) => {
        assert.ok(step.defaultDuration > min,
            `Step "${step.name}" has duration ${step.defaultDuration} which is not > ${min}`);
    });
});

Then('the step named {string} in Anxiety Protocol should have sub-steps', function (name) {
    const step = ANXIETY_PROTOCOL.find(s => s.name === name);
    assert.ok(step, `Step "${name}" not found in Anxiety Protocol`);
    assert.ok(Array.isArray(step.subSteps) && step.subSteps.length > 0,
        `Step "${name}" should have non-empty subSteps`);
});

Then('PROGRAMS should have {int} entries', function (count) {
    assert.strictEqual(PROGRAMS.length, count);
});

Then('every program should have {string}', function (fieldsStr) {
    const fields = fieldsStr.split(', ').map(f => f.trim().replace(/"/g, ''));
    PROGRAMS.forEach((prog, i) => {
        fields.forEach(field => {
            assert.ok(prog[field] !== undefined,
                `Program "${prog.name || i}" is missing "${field}"`);
        });
    });
});

Then("every program's steps array should not be empty", function () {
    PROGRAMS.forEach(prog => {
        assert.ok(Array.isArray(prog.steps) && prog.steps.length > 0,
            `Program "${prog.name}" has empty steps`);
    });
});

Then('all program IDs should be unique', function () {
    const ids = PROGRAMS.map(p => p.id);
    const unique = new Set(ids);
    assert.strictEqual(unique.size, ids.length, 'Duplicate program IDs found');
});
