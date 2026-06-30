(function (root) {
  "use strict";

  const MALA_GOAL = 108;
  const RING_SIZE = 27;
  const GRID_SIZE = 4;
  const DISPLAY_BEADS = 36;
  const MANTRA = { id: "ram", label: "राम", sequence: ["रा", "म"] };
  const GOD_NAME_UNITS = [
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
  ];
  const FILLER_UNITS = GOD_NAME_UNITS.concat(MANTRA.sequence);
  const DISTRACTORS = GOD_NAME_UNITS.slice();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomInt(rng, max) {
    return Math.floor(clamp(rng(), 0, 0.999999) * max);
  }

  function hasDevanagari(value) {
    return /[\u0900-\u097F]/.test(value);
  }

  function sequenceFromPath(path) {
    return path.map((tile) => tile.value);
  }

  function matchesSequence(path, sequence) {
    const units = sequenceFromPath(path);
    return units.length === sequence.length && units.every((unit, index) => unit === sequence[index]);
  }

  function matchesPrefix(path, sequence) {
    const units = sequenceFromPath(path);
    return units.every((unit, index) => unit === sequence[index]);
  }

  function isAdjacent(a, b) {
    const rowDelta = Math.abs(a.row - b.row);
    const colDelta = Math.abs(a.col - b.col);
    return rowDelta <= 1 && colDelta <= 1 && rowDelta + colDelta > 0;
  }

  function neighborIndexes(index, size, used) {
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        const nextRow = row + rowOffset;
        const nextCol = col + colOffset;

        if (nextRow < 0 || nextCol < 0 || nextRow >= size || nextCol >= size) {
          continue;
        }

        const nextIndex = nextRow * size + nextCol;

        if (!used.has(nextIndex)) {
          neighbors.push(nextIndex);
        }
      }
    }

    return neighbors.sort((a, b) => a - b);
  }

  function buildPath(sequence, size, rng) {
    const total = size * size;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const path = [randomInt(rng, total)];
      const used = new Set(path);

      while (path.length < sequence.length) {
        const options = neighborIndexes(path[path.length - 1], size, used);

        if (!options.length) {
          break;
        }

        const next = options[randomInt(rng, options.length)];
        path.push(next);
        used.add(next);
      }

      if (path.length === sequence.length) {
        return path;
      }
    }

    return sequence.map((_, index) => index);
  }

  function createBoard(options) {
    const sequence = options.sequence;
    const size = options.size || GRID_SIZE;
    const rng = options.rng || Math.random;

    if (!Array.isArray(sequence) || sequence.length === 0) {
      throw new Error("A mantra sequence is required.");
    }

    if (sequence.length > size * size) {
      throw new Error("The mantra sequence is longer than the board.");
    }

    const board = Array.from({ length: size * size }, (_, index) => {
      const row = Math.floor(index / size);
      const col = index % size;

      return {
        id: `tile-${index}`,
        index,
        row,
        col,
        value: FILLER_UNITS[randomInt(rng, FILLER_UNITS.length)],
        pathIndex: -1
      };
    });

    buildPath(sequence, size, rng).forEach((index, pathIndex) => {
      board[index].value = sequence[pathIndex];
      board[index].pathIndex = pathIndex;
    });

    return board;
  }

  function getMalaProgress(count) {
    const safeCount = clamp(Math.floor(Number(count) || 0), 0, MALA_GOAL);

    return {
      count: safeCount,
      percent: Math.round((safeCount / MALA_GOAL) * 100),
      activeRing: safeCount >= MALA_GOAL ? 4 : Math.floor(safeCount / RING_SIZE),
      unlocked: safeCount >= MALA_GOAL
    };
  }

  function chooseRiverWord(options) {
    const target = options.target;
    const distractors = options.distractors || DISTRACTORS;
    const correctChance = options.correctChance ?? 0.44;
    const rng = options.rng || Math.random;

    if (rng() < correctChance) {
      return target;
    }

    return distractors[randomInt(rng, distractors.length)] || target;
  }

  function getRiverProfile(options) {
    const width = Number(options?.width) || 0;
    const calm = clamp(Number(options?.calm) || 0, 0, 100);
    const streak = Math.max(0, Number(options?.streak) || 0);
    const isDesktop = width >= 640;

    if (isDesktop) {
      return {
        laneCount: 4,
        spawnEvery: Math.round(clamp(1320 - calm * 3.2 - streak * 5, 720, 1320)),
        maxTokens: 9,
        speedMin: 34,
        speedMax: 58,
        drift: 14,
        yStart: -58,
        exitPadding: 86
      };
    }

    return {
      laneCount: 3,
      spawnEvery: Math.round(clamp(1020 - calm * 4.2 - streak * 10, 520, 1020)),
      maxTokens: 14,
      speedMin: 44,
      speedMax: 86,
      drift: 22,
      yStart: -48,
      exitPadding: 70
    };
  }

  function findRiverHit(records, point, options) {
    const padding = Math.max(0, Number(options?.padding) || 0);
    let best = null;

    records.forEach((record) => {
      if (record.done || !record.rect) {
        return;
      }

      const left = record.rect.left - padding;
      const right = record.rect.right + padding;
      const top = record.rect.top - padding;
      const bottom = record.rect.bottom + padding;

      if (point.x < left || point.x > right || point.y < top || point.y > bottom) {
        return;
      }

      const dx = point.x < record.rect.left ? record.rect.left - point.x : point.x > record.rect.right ? point.x - record.rect.right : 0;
      const dy = point.y < record.rect.top ? record.rect.top - point.y : point.y > record.rect.bottom ? point.y - record.rect.bottom : 0;
      const distance = dx * dx + dy * dy;

      if (!best || distance < best.distance) {
        best = { distance, record };
      }
    });

    return best?.record || null;
  }

  function getInitialMode(options) {
    const game = options?.game || "";
    const mode = options?.mode || "";

    if (game === "mala-bubble") {
      return "river";
    }

    if (game === "connect-word") {
      return "connect";
    }

    return mode === "river" ? "river" : "connect";
  }

  function getConnectProfile(options) {
    const isSolo = options?.game === "connect-word";

    return {
      completeDelay: isSolo ? 95 : 220,
      wrongDelay: isSolo ? 130 : 220,
      partialHold: isSolo ? 1100 : 0
    };
  }

  function getTargetText(options) {
    if (options?.game === "mala-bubble") {
      return options.mantra;
    }

    return options.sequence.join(" ");
  }

  const core = {
    MALA_GOAL,
    GRID_SIZE,
    DISPLAY_BEADS,
    MANTRA,
    GOD_NAME_UNITS,
    FILLER_UNITS,
    DISTRACTORS,
    sequenceFromPath,
    matchesSequence,
    matchesPrefix,
    isAdjacent,
    createBoard,
    getMalaProgress,
    chooseRiverWord,
    getRiverProfile,
    findRiverHit,
    getInitialMode,
    getConnectProfile,
    getTargetText
  };

  root.MantraGameCore = core;

  if (!root.document) {
    return;
  }

  const doc = root.document;

  function init() {
    const app = doc.querySelector("[data-app]");

    if (!app) {
      return;
    }

    const els = {
      grid: doc.getElementById("tileGrid"),
      gridWrap: doc.getElementById("gridWrap"),
      pathLine: doc.getElementById("pathLine"),
      pathGlow: doc.getElementById("pathGlow"),
      stage: doc.getElementById("stage"),
      river: doc.getElementById("riverStage"),
      beadText: doc.getElementById("beadText"),
      beadMini: doc.getElementById("beadMini"),
      malaFill: doc.getElementById("malaFill"),
      malaBeads: doc.getElementById("malaBeads"),
      ringText: doc.getElementById("ringText"),
      calmFill: doc.getElementById("calmFill"),
      calmText: doc.getElementById("calmText"),
      streakText: doc.getElementById("streakText"),
      targetText: doc.getElementById("targetText"),
      unlock: doc.getElementById("unlock"),
      burstLayer: doc.getElementById("burstLayer"),
      resetButtons: doc.querySelectorAll("[data-reset]"),
      modeButtons: doc.querySelectorAll("[data-mode]")
    };

    const game = app.dataset.game || "";
    const connectProfile = getConnectProfile({ game });

    const state = {
      mode: getInitialMode({ game, mode: app.dataset.mode }),
      board: [],
      selected: [],
      selecting: false,
      locked: false,
      partialClearTimer: 0,
      beadCount: loadBeads(),
      calm: 42,
      streak: 0,
      river: {
        id: 0,
        raf: 0,
        tokens: [],
        lastSpawn: 0
      }
    };

    function loadBeads() {
      try {
        return Number(root.localStorage?.getItem("mala-mantra-beads") || 0);
      } catch (_error) {
        return 0;
      }
    }

    function saveBeads() {
      try {
        root.localStorage?.setItem("mala-mantra-beads", String(state.beadCount));
      } catch (_error) {
        // Storage is optional for local files.
      }
    }

    function setupMalaBeads() {
      if (!els.malaBeads) {
        return;
      }

      els.malaBeads.innerHTML = "";

      for (let index = 0; index < DISPLAY_BEADS; index += 1) {
        const bead = doc.createElement("span");
        bead.style.setProperty("--i", index);
        els.malaBeads.appendChild(bead);
      }
    }

    function updateProgress() {
      const progress = getMalaProgress(state.beadCount);
      const activeBeads = Math.round((progress.percent / 100) * DISPLAY_BEADS);

      if (els.beadText) {
        els.beadText.textContent = `${progress.count} / ${MALA_GOAL}`;
      }

      if (els.beadMini) {
        els.beadMini.textContent = `${progress.count}`;
      }

      if (els.malaFill) {
        els.malaFill.style.width = `${progress.percent}%`;
      }

      if (els.ringText) {
        els.ringText.textContent = `${progress.activeRing} / 4`;
      }

      if (els.malaBeads) {
        els.malaBeads.dataset.ring = String(progress.activeRing);
      }

      Array.from(els.malaBeads?.children || []).forEach((bead, index) => {
        bead.classList.toggle("active", index < activeBeads);
      });

      app.classList.toggle("is-unlocked", progress.unlocked);
      els.unlock?.classList.toggle("show", progress.unlocked);
      els.unlock?.setAttribute("aria-hidden", progress.unlocked ? "false" : "true");
    }

    function updateCalm() {
      if (els.calmFill) {
        els.calmFill.style.width = `${state.calm}%`;
      }

      if (els.calmText) {
        els.calmText.textContent = `${state.calm}`;
      }

      if (els.streakText) {
        els.streakText.textContent = `${state.streak}`;
      }

      els.river?.style.setProperty("--calm", state.calm);
    }

    function addChant(sourceTile) {
      if (state.beadCount >= MALA_GOAL) {
        return;
      }

      state.beadCount += 1;
      saveBeads();
      updateProgress();
      showBurst(sourceTile);
    }

    function showBurst(sourceEl) {
      if (!els.stage || !els.burstLayer) {
        return;
      }

      const bounds = sourceEl?.getBoundingClientRect();
      const stageBounds = els.stage.getBoundingClientRect();
      const x = bounds ? bounds.left + bounds.width / 2 - stageBounds.left : stageBounds.width / 2;
      const y = bounds ? bounds.top + bounds.height / 2 - stageBounds.top : stageBounds.height / 2;

      for (let index = 0; index < 8; index += 1) {
        const spark = doc.createElement("span");
        spark.className = "spark";
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty("--a", `${index * 45}deg`);
        els.burstLayer.appendChild(spark);
        setTimeout(() => spark.remove(), 640);
      }
    }

    function renderBoard() {
      if (!els.grid) {
        return;
      }

      state.board = createBoard({ sequence: MANTRA.sequence, size: GRID_SIZE });
      state.selected = [];
      state.locked = false;
      els.grid.innerHTML = "";
      clearPathLine();

      state.board.forEach((tile) => {
        const button = doc.createElement("button");
        button.className = "tile";
        button.type = "button";
        button.textContent = tile.value;
        button.dataset.index = String(tile.index);
        button.setAttribute("aria-label", tile.value);

        if (hasDevanagari(tile.value)) {
          button.lang = "hi";
        }

        if (tile.value.length >= 5) {
          button.classList.add("long");
        }

        els.grid.appendChild(button);
      });
    }

    function tileFromElement(element) {
      const tileEl = element?.closest?.(".tile");

      if (!tileEl || !els.grid?.contains(tileEl)) {
        return null;
      }

      return {
        el: tileEl,
        tile: state.board[Number(tileEl.dataset.index)]
      };
    }

    function clearSelection() {
      root.clearTimeout(state.partialClearTimer);
      state.partialClearTimer = 0;
      state.selected = [];
      els.grid?.querySelectorAll(".tile").forEach((tile) => {
        tile.classList.remove("selected", "wrong", "right");
      });
      clearPathLine();
    }

    function clearPathLine() {
      if (!els.pathLine || !els.pathGlow) {
        return;
      }

      els.pathLine.setAttribute("points", "");
      els.pathGlow.setAttribute("points", "");
    }

    function drawPathLine() {
      if (!els.gridWrap || !els.pathLine || !els.pathGlow) {
        return;
      }

      const wrapBounds = els.gridWrap.getBoundingClientRect();
      const points = state.selected.map((entry) => {
        const tileBounds = entry.el.getBoundingClientRect();
        const x = tileBounds.left + tileBounds.width / 2 - wrapBounds.left;
        const y = tileBounds.top + tileBounds.height / 2 - wrapBounds.top;
        return `${x},${y}`;
      });

      els.pathLine.setAttribute("points", points.join(" "));
      els.pathGlow.setAttribute("points", points.join(" "));
    }

    function markWrong() {
      state.locked = true;
      state.selecting = false;
      state.streak = 0;
      updateCalm();

      state.selected.forEach((entry) => entry.el.classList.add("wrong"));
      setTimeout(() => {
        clearSelection();
        state.locked = false;
      }, connectProfile.wrongDelay);
    }

    function completeConnect(sourceEl) {
      state.locked = true;
      state.selecting = false;
      state.streak += 1;
      state.calm = clamp(state.calm + 4, 0, 100);
      updateCalm();

      state.selected.forEach((entry) => entry.el.classList.add("right"));
      addChant(sourceEl);

      setTimeout(() => {
        renderBoard();
      }, connectProfile.completeDelay);
    }

    function addTile(tileEl, tile) {
      if (state.locked || state.selected.some((entry) => entry.tile.index === tile.index)) {
        return;
      }

      const previous = state.selected[state.selected.length - 1]?.tile;

      if (previous && !isAdjacent(previous, tile)) {
        return;
      }

      if (state.selected.length >= MANTRA.sequence.length) {
        return;
      }

      tileEl.classList.add("selected");
      state.selected.push({ el: tileEl, tile });
      drawPathLine();

      if (!matchesPrefix(state.selected.map((entry) => entry.tile), MANTRA.sequence)) {
        markWrong();
        return;
      }

      if (state.selected.length === MANTRA.sequence.length) {
        if (matchesSequence(state.selected.map((entry) => entry.tile), MANTRA.sequence)) {
          completeConnect(tileEl);
        } else {
          markWrong();
        }
      }
    }

    function startSelection(event) {
      if (state.mode !== "connect" || state.locked) {
        return;
      }

      const result = tileFromElement(event.target);

      if (!result) {
        return;
      }

      event.preventDefault();
      state.selecting = true;

      if (!state.selected.length || !matchesPrefix(state.selected.map((entry) => entry.tile), MANTRA.sequence)) {
        clearSelection();
      } else {
        root.clearTimeout(state.partialClearTimer);
        state.partialClearTimer = 0;
      }

      addTile(result.el, result.tile);
    }

    function continueSelection(event) {
      if (!state.selecting || state.mode !== "connect" || state.locked) {
        return;
      }

      const element = doc.elementFromPoint(event.clientX, event.clientY);
      const result = tileFromElement(element);

      if (result) {
        addTile(result.el, result.tile);
      }
    }

    function continueSelectionFromTarget(event) {
      if (!state.selecting || state.mode !== "connect" || state.locked) {
        return;
      }

      const result = tileFromElement(event.target);

      if (result) {
        addTile(result.el, result.tile);
      }
    }

    function endSelection() {
      if (!state.selecting) {
        return;
      }

      state.selecting = false;

      const selectedTiles = state.selected.map((entry) => entry.tile);

      if (selectedTiles.length > 0 && matchesPrefix(selectedTiles, MANTRA.sequence) && connectProfile.partialHold > 0) {
        root.clearTimeout(state.partialClearTimer);
        state.partialClearTimer = root.setTimeout(clearSelection, connectProfile.partialHold);
        return;
      }

      if (state.selected.length > 0 && !matchesSequence(selectedTiles, MANTRA.sequence)) {
        markWrong();
      }
    }

    function switchMode(mode) {
      state.mode = mode;
      app.dataset.mode = mode;

      els.modeButtons.forEach((button) => {
        const active = button.dataset.mode === mode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (mode === "river" && els.river) {
        startRiver();
      } else {
        stopRiver();
        clearRiverTokens();
      }
    }

    function activeRiverTokenCount() {
      return state.river.tokens.reduce((count, record) => count + (record.done ? 0 : 1), 0);
    }

    function spawnRiverToken(timestamp, stageBounds, profile) {
      const word = chooseRiverWord({
        target: MANTRA.label,
        distractors: DISTRACTORS,
        correctChance: state.streak > 8 ? 0.56 : 0.46
      });
      const isTarget = word === MANTRA.label;
      const token = doc.createElement("button");
      const laneCount = profile.laneCount;
      const lane = randomInt(Math.random, laneCount);
      const x = ((lane + 0.5) / laneCount) * stageBounds.width + (Math.random() * 24 - 12);
      const speed = profile.speedMin + Math.random() * (profile.speedMax - profile.speedMin);
      const record = {
        id: state.river.id,
        el: token,
        word,
        isTarget,
        x,
        y: profile.yStart,
        yStart: profile.yStart,
        speed,
        drift: Math.random() * profile.drift - profile.drift / 2,
        exitPadding: profile.exitPadding,
        born: timestamp,
        done: false
      };

      state.river.id += 1;
      token.className = `river-token ${isTarget ? "target" : "distractor"}`;
      token.type = "button";
      token.textContent = word;
      token.setAttribute("aria-label", word);

      if (hasDevanagari(word)) {
        token.lang = "hi";
      }

      if (word.length >= 5) {
        token.classList.add("long");
      }

      token.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        catchRiverToken(record);
      });

      els.river.appendChild(token);
      state.river.tokens.push(record);
    }

    function catchRiverToken(record) {
      if (record.done) {
        return;
      }

      record.done = true;

      if (record.isTarget) {
        record.el.classList.add("caught");
        state.streak += 1;
        state.calm = clamp(state.calm + 5, 0, 100);
        addChant(record.el);
      } else {
        record.el.classList.add("missed");
        state.streak = 0;
        state.calm = clamp(state.calm - 9, 0, 100);
      }

      updateCalm();
      setTimeout(() => removeRiverToken(record), 280);
    }

    function handleRiverPointerDown(event) {
      if (state.mode !== "river" || event.target.closest?.(".river-token")) {
        return;
      }

      const stageBounds = els.river.getBoundingClientRect();
      const padding = stageBounds.width >= 640 ? 34 : 18;
      const candidates = state.river.tokens.map((record) => ({
        record,
        done: record.done,
        rect: record.el.getBoundingClientRect()
      }));
      const hit = findRiverHit(candidates, { x: event.clientX, y: event.clientY }, { padding });

      if (hit) {
        event.preventDefault();
        catchRiverToken(hit.record);
      }
    }

    function removeRiverToken(record) {
      record.el.remove();
      state.river.tokens = state.river.tokens.filter((token) => token !== record);
    }

    function clearRiverTokens() {
      state.river.tokens.forEach((record) => record.el.remove());
      state.river.tokens = [];
    }

    function tickRiver(timestamp) {
      if (state.mode !== "river") {
        state.river.raf = 0;
        return;
      }

      if (!state.river.lastSpawn) {
        state.river.lastSpawn = timestamp;
      }

      const stageBounds = els.river.getBoundingClientRect();
      const profile = getRiverProfile({
        width: stageBounds.width,
        calm: state.calm,
        streak: state.streak
      });

      if (timestamp - state.river.lastSpawn > profile.spawnEvery && activeRiverTokenCount() < profile.maxTokens) {
        spawnRiverToken(timestamp, stageBounds, profile);
        state.river.lastSpawn = timestamp;
      }

      const stageHeight = stageBounds.height;

      state.river.tokens.slice().forEach((record) => {
        if (record.done) {
          return;
        }

        const elapsed = Math.max(0, timestamp - record.born) / 1000;
        record.y = record.yStart + elapsed * record.speed;
        const sway = Math.sin(elapsed * 2.1 + record.id) * record.drift;
        record.el.style.transform = `translate3d(${record.x + sway}px, ${record.y}px, 0)`;

        if (record.y > stageHeight + record.exitPadding) {
          if (record.isTarget) {
            state.streak = 0;
            state.calm = clamp(state.calm - 3, 0, 100);
            updateCalm();
          }

          removeRiverToken(record);
        }
      });

      state.river.raf = root.requestAnimationFrame(tickRiver);
    }

    function startRiver() {
      if (!els.river) {
        return;
      }

      if (state.river.raf) {
        return;
      }

      state.river.lastSpawn = 0;
      state.river.raf = root.requestAnimationFrame(tickRiver);
    }

    function stopRiver() {
      if (state.river.raf) {
        root.cancelAnimationFrame(state.river.raf);
        state.river.raf = 0;
      }
    }

    function resetGame() {
      state.beadCount = 0;
      state.calm = 42;
      state.streak = 0;
      state.locked = false;
      saveBeads();
      updateProgress();
      updateCalm();
      renderBoard();
      clearRiverTokens();
    }

    els.grid?.addEventListener("pointerdown", startSelection);
    els.grid?.addEventListener("pointerover", continueSelectionFromTarget);
    els.river?.addEventListener("pointerdown", handleRiverPointerDown);
    doc.addEventListener("pointermove", continueSelection);
    doc.addEventListener("pointerup", endSelection);
    doc.addEventListener("pointercancel", endSelection);

    els.modeButtons.forEach((button) => {
      button.addEventListener("click", () => switchMode(button.dataset.mode));
    });

    els.resetButtons.forEach((button) => {
      button.addEventListener("click", resetGame);
    });

    root.addEventListener("resize", drawPathLine);

    if (els.targetText) {
      els.targetText.textContent = getTargetText({
        game,
        mantra: MANTRA.label,
        sequence: MANTRA.sequence
      });
    }
    setupMalaBeads();
    updateProgress();
    updateCalm();
    renderBoard();
    switchMode(state.mode);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
