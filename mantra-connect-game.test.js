const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("mantra-connect-game.js", "utf8");
const styles = fs.readFileSync("mantra-games.css", "utf8");
const connectWordHtml = fs.readFileSync("connect-word.html", "utf8");
const malaBubbleHtml = fs.readFileSync("mala-bubble.html", "utf8");
const combinedHtml = fs.readFileSync("mantra-connect.html", "utf8");
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  document: undefined,
  localStorage: undefined
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox);

const core = sandbox.MantraGameCore;
const DEVANAGARI = /[\u0900-\u097F]/;
const MANTRA_ONLY = new Set(["राम", "रा", "म"]);
const GOD_NAMES = new Set([
  "शिव",
  "कृष्ण",
  "विष्णु",
  "सीता",
  "राधा",
  "हरि",
  "शंकर",
  "गणेश",
  "दुर्गा",
  "लक्ष्मी",
  "माधव",
  "गोविंद",
  "श्याम",
  "हनुमान",
  "नारायण",
  "महादेव"
]);

assert.ok(core, "core game API should be exposed");

const soundNeedles = [
  "soundToggle",
  "AudioContext",
  "webkitAudioContext",
  "playBell",
  "soundOn",
  "createOscillator"
];

soundNeedles.forEach((needle) => {
  assert.equal(source.includes(needle), false, `game script should not contain sound code: ${needle}`);
});

[
  ["connect-word", connectWordHtml],
  ["mala-bubble", malaBubbleHtml],
  ["mantra-connect", combinedHtml]
].forEach(([name, html]) => {
  assert.equal(html.includes("soundToggle"), false, `${name} page should not render a sound toggle`);
  assert.equal(html.includes("aria-label=\"Sound\""), false, `${name} page should not render sound controls`);
});

assert.equal(core.MANTRA.label, "राम", "game mantra should use Hindi Devanagari RAM");
assert.equal(core.MANTRA.sequence.join("|"), "रा|म", "connect sequence should use Devanagari syllables");
assert.equal(Array.isArray(core.GOD_NAME_UNITS), true, "Hindi God-name units should be exposed");
assert.equal(
  core.GOD_NAME_UNITS.length >= 12,
  true,
  "Hindi God-name list should have enough variety"
);
assert.equal(
  core.GOD_NAME_UNITS.every((unit) => DEVANAGARI.test(unit) && GOD_NAMES.has(unit)),
  true,
  "God-name list should contain Hindi devotional names"
);
assert.equal(Array.isArray(core.FILLER_UNITS), true, "filler units should be exposed for language-rule tests");
assert.equal(
  core.FILLER_UNITS.every((unit) => MANTRA_ONLY.has(unit) || GOD_NAMES.has(unit)),
  true,
  "grid filler should use Hindi mantra syllables or Hindi God names"
);
assert.equal(
  core.DISTRACTORS.every((word) => DEVANAGARI.test(word) && GOD_NAMES.has(word)),
  true,
  "bubble distractors should use Hindi God names"
);

assert.equal(
  core.sequenceFromPath([{ value: "रा" }, { value: "म" }]).join("|"),
  "रा|म",
  "selection path should map to syllable sequence"
);

assert.equal(
  core.matchesSequence([{ value: "रा" }, { value: "म" }], ["रा", "म"]),
  true,
  "correct syllable path should complete the mantra"
);

assert.equal(
  core.matchesSequence([{ value: "म" }, { value: "रा" }], ["रा", "म"]),
  false,
  "reversed syllable path should not complete the mantra"
);

assert.equal(
  core.isAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 }),
  true,
  "diagonal neighbors should be connectable"
);

assert.equal(
  core.isAdjacent({ row: 0, col: 0 }, { row: 2, col: 0 }),
  false,
  "non-neighbor tiles should not be connectable"
);

const board = core.createBoard({
  sequence: ["रा", "म"],
  size: 4,
  rng: () => 0
});

assert.equal(board.length, 16, "board should contain a 4x4 tile set");

const targetPath = board.filter((tile) => tile.pathIndex >= 0);
assert.equal(
  targetPath.map((tile) => tile.value).join("|"),
  "रा|म",
  "board should include one guaranteed adjacent mantra path"
);
assert.equal(
  core.isAdjacent(targetPath[0], targetPath[1]),
  true,
  "guaranteed mantra path should use adjacent tiles"
);

const visibleBoardHindi = board
  .map((tile) => tile.value)
  .filter((value) => DEVANAGARI.test(value));

assert.equal(
  visibleBoardHindi.every((value) => MANTRA_ONLY.has(value)),
  false,
  "board should include Hindi God-name filler tiles"
);
assert.equal(
  visibleBoardHindi.every((value) => MANTRA_ONLY.has(value) || GOD_NAMES.has(value)),
  true,
  "board Hindi text should be mantra syllables or God names"
);

const firstRing = core.getMalaProgress(27);
assert.equal(firstRing.count, 27, "27 chants should preserve the count");
assert.equal(firstRing.percent, 25, "27 chants should reach 25 percent");
assert.equal(firstRing.activeRing, 1, "27 chants should complete the first mandala ring");
assert.equal(firstRing.unlocked, false, "27 chants should not unlock the mandala");

const fullMala = core.getMalaProgress(108);
assert.equal(fullMala.count, 108, "108 chants should preserve the count");
assert.equal(fullMala.percent, 100, "108 chants should reach 100 percent");
assert.equal(fullMala.activeRing, 4, "108 chants should complete all mandala rings");
assert.equal(fullMala.unlocked, true, "108 chants should unlock the mandala");

assert.equal(
  core.chooseRiverWord({
    target: "राम",
    distractors: ["शिव"],
    correctChance: 0.5,
    rng: () => 0.1
  }),
  "राम",
  "river should emit target words when the random roll is inside the target chance"
);

assert.equal(
  core.chooseRiverWord({
    target: "राम",
    distractors: ["शिव"],
    correctChance: 0.5,
    rng: () => 0.9
  }),
  "शिव",
  "river should emit distractors outside the target chance"
);

assert.match(
  styles,
  /\.river-token\s*\{[\s\S]*border-radius:\s*999px/,
  "Mala Bubble tokens should be shaped like bubbles"
);
assert.match(
  styles,
  /\.river-token::after\s*\{/,
  "Mala Bubble tokens should have a bubble highlight"
);

const connectBoardSize = styles.match(/--connect-board-size:\s*clamp\(\s*(\d+)px,\s*[\d.]+vw,\s*(\d+)px\s*\)/);
assert.ok(connectBoardSize, "Connect Word board should use a responsive capped board size");
assert.equal(
  Number(connectBoardSize[2]) <= 500,
  true,
  "Connect Word board max size should prevent oversized tablet/desktop tiles"
);
assert.match(
  styles,
  /\.grid-wrap\s*\{[\s\S]*width:\s*min\(100%,\s*var\(--connect-board-size\)\)/,
  "Connect Word grid should use the capped board size variable"
);

assert.equal(typeof core.getRiverProfile, "function", "river tuning profile should be exposed");

const desktopRiver = core.getRiverProfile({ width: 760, calm: 100, streak: 20 });
assert.equal(desktopRiver.laneCount <= 4, true, "desktop river should avoid too many lanes");
assert.equal(desktopRiver.spawnEvery >= 720, true, "desktop river should not overspawn tokens");
assert.equal(desktopRiver.maxTokens <= 10, true, "desktop river should cap active token density");
assert.equal(desktopRiver.speedMin <= 36, true, "desktop river tokens should be slow enough to click");
assert.equal(desktopRiver.speedMax <= 62, true, "desktop river speed should stay controlled");

const mobileRiver = core.getRiverProfile({ width: 390, calm: 100, streak: 20 });
assert.equal(mobileRiver.laneCount, 3, "mobile river should keep the vertical three-lane feel");
assert.equal(
  mobileRiver.maxTokens >= desktopRiver.maxTokens,
  true,
  "mobile river can keep higher density than desktop"
);

assert.equal(typeof core.findRiverHit, "function", "river should expose forgiving hit detection");

const hitRecords = [
  { id: "a", done: false, rect: { left: 100, top: 100, right: 200, bottom: 154 } },
  { id: "b", done: false, rect: { left: 300, top: 100, right: 404, bottom: 154 } }
];

assert.equal(
  core.findRiverHit(hitRecords, { x: 210, y: 130 }, { padding: 16 }).id,
  "a",
  "river hit detection should catch clicks slightly outside a moving token"
);

assert.equal(
  core.findRiverHit(hitRecords, { x: 260, y: 130 }, { padding: 16 }),
  null,
  "river hit detection should ignore clicks outside the padded hit zone"
);

assert.equal(typeof core.getInitialMode, "function", "separate pages should resolve their initial mode");
assert.equal(
  core.getInitialMode({ game: "mala-bubble", mode: "" }),
  "river",
  "Mala Bubble should start in bubble/river mode"
);
assert.equal(
  core.getInitialMode({ game: "connect-word", mode: "" }),
  "connect",
  "Connect Word should start in connect mode"
);
assert.equal(
  core.getInitialMode({ game: "", mode: "river" }),
  "river",
  "combined page should still respect explicit mode"
);

assert.equal(typeof core.getConnectProfile, "function", "connect tuning profile should be exposed");
const soloConnect = core.getConnectProfile({ game: "connect-word" });
assert.equal(soloConnect.completeDelay <= 140, true, "connect-only page should refresh quickly after a match");
assert.equal(soloConnect.wrongDelay <= 160, true, "connect-only page should recover quickly from a wrong path");
assert.equal(soloConnect.partialHold >= 700, true, "connect-only page should allow tap-tap selection");

assert.equal(typeof core.getTargetText, "function", "separate pages should resolve target display text");
assert.equal(
  core.getTargetText({ game: "mala-bubble", mantra: "राम", sequence: ["रा", "म"] }),
  "राम",
  "Mala Bubble target should show the full mantra"
);
assert.equal(
  core.getTargetText({ game: "connect-word", mantra: "राम", sequence: ["रा", "म"] }),
  "रा म",
  "Connect Word target should show the connect sequence"
);
