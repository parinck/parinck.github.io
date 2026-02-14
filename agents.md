# Yoga & Meditation App - Project Documentation ('agents.md')

## Overview
This repository contains three web applications built with Vanilla JavaScript, HTML, and CSS:
1.  **Surya Namaskar App**: A guided yoga practice assistant with configurable timers, sets, and audio cues.
2.  **Anxiety Busting Meditation App**: A guided meditation tool with specific breathing exercises and protocols.
3.  **SKY Practice App**: A Sudarshan Kriya home practice guide with 5 phases (Pranayama, Bhastrika, Om Chanting, Kriya, Savasana), breathing bubble animation, and progress tracking.

All apps share a similar architecture: a single-class application controller managing state, DOM updates, audio context, and timer logic.

## Technical Stack
-   **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3.
-   **Testing**: Behavior-Driven Development (BDD) with **Cucumber.js**.
-   **Test Environment**: **Node.js** with **jsdom** (simulated browser environment).
-   **Assertions**: Node.js built-in `assert` module.

## Testing Strategy
We implemented a robust BDD test suite that runs entirely in Node.js, avoiding the need for a real browser window. This ensures fast execution and easy CI integration.

### Infrastructure
-   **Runner**: `npm test` executes `cucumber-js`.
-   **Configuration**: `cucumber.js` defines the test profile.
-   **World**: `features/support/world.js` sets up a `jsdom` environment with mocked browser APIs (`localStorage`, `AudioContext`, `createOscillator`, `setInterval`, etc.) before each scenario.

### Key Test Files
-   **Features** (`features/*.feature`): Gherkin syntax describing valid behaviors.
    -   `surya_namaskar_data.feature`: Validates integrity of pose data (IDs, names, images).
    -   `meditation_data.feature`: Validates meditation programs and steps.
    -   `sky_practice_data.feature`: Validates SKY phase data (rhythms, round counts, audio options).
    -   `surya_namaskar_app.feature`: Tests app logic (timers, sets, navigation).
    -   `meditation_app.feature`: Tests meditation logic (multipliers, program selection).
    -   `sky_practice_app.feature`: Tests SKY app logic (disclaimer, pause, guided/quick modes, timer ring, preferences, progress tracking).
-   **Step Definitions** (`features/step_definitions/*.js`):
    -   `data_steps.js`: Logic for validating Surya Namaskar and Meditation static data files.
    -   `app_steps.js`: Logic for testing Surya Namaskar and Meditation app classes, using `vm` context to load scripts in isolation.
    -   `sky_data_steps.js`: Logic for validating SKY practice data structures.
    -   `sky_app_steps.js`: Logic for testing SKYPracticeApp class via `vm` context with dedicated DOM stubs.

## Project Structure

### Source Code
-   `surya-namaskar-app.js`: Main logic for Surya Namaskar app.
-   `surya-namaskar-poses.js`: Data file containing the 12 yoga poses (exported via CJS guard for tests).
-   `anxiety-meditation-app.js`: Main logic for Meditation app.
-   `anxiety-meditation-data.js`: Data file for meditation programs (exported via CJS guard for tests).
-   `sky-practice-app.js`: Main logic for SKY Practice app (`SKYPracticeApp` class).
-   `sky-practice-data.js`: Phase/step configuration for all 5 SKY phases (exported via CJS guard for tests).
-   `sky-practice-styles.css`: Teal glassmorphism theme with breathing bubble animation.
-   `sky-practice.html`: Full HTML structure for the SKY Practice app.

### Tests
-   `features/`: Directory containing all `.feature` files.
    -   `support/world.js`: Custom World with DOM/API mocks.
    -   `step_definitions/`: Step implementations.

## How to Run Tests
Execute the following command in the terminal:
```bash
npm test
```
This runs all scenarios defined in the `.feature` files.

## Test Coverage Summary
The test suite covers (85 scenarios, 271 steps):
1.  **Data Integrity**: Ensures all poses, programs, and SKY phases have required fields, valid IDs, correct rhythms, and round counts.
2.  **Timer Logic**: Verifies accurate countdowns, formatting (M:SS vs SS), and color changes across all apps.
3.  **Configuration**: Tests clamping logic for durations (5-120s), sets (1-10), and multipliers (0.25-3.0).
4.  **Navigation**: Ensures "Next", "Skip", "Pause", guided session, and quick practice section picker function correctly.
5.  **State Persistence**: Verifies `localStorage` reads/writes for user preferences (including SKY voice toggle, Savasana audio, and disclaimer acceptance).
6.  **Completion Stats**: Checks calculation of total time, poses/phases, and practice log entries upon completion.
7.  **Progress Tracking**: Validates SKY practice logging, deduplication, streak calculation, and 28-day calendar rendering.

## Future Improvements
-   **UI Testing**: While logic is fully tested via `jsdom`, visual regression testing (e.g., Playwright) could verify strict CSS rendering.
-   **Modularization**: Extracting core timer/audio logic into shared utility classes would improve code reuse between the two apps.
-   **TypeScript**: Migrating to TypeScript would add static type safety to the data structures.
