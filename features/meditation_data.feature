Feature: Meditation Program Data Integrity
  As a developer
  I want the meditation programs data to be complete and valid
  So that the app correctly presents all three guided programs

  Scenario: Sleep Stretches has 7 poses
    Given the meditation data is loaded
    Then Sleep Stretches should have 7 steps

  Scenario: Anxiety Protocol has 5 stages
    Given the meditation data is loaded
    Then Anxiety Protocol should have 5 steps

  Scenario: Home Kriya has 4 stages
    Given the meditation data is loaded
    Then Home Kriya should have 4 steps

  Scenario: All meditation steps have required fields
    Given the meditation data is loaded
    Then every meditation step should have "id, name, subtitle, breathing, description, defaultDuration"

  Scenario: All default durations are positive numbers
    Given the meditation data is loaded
    Then every default duration should be greater than 0

  Scenario: Yoga Nidra has sub-steps
    Given the meditation data is loaded
    Then the step named "Yoga Nidra" in Anxiety Protocol should have sub-steps

  Scenario: PROGRAMS metadata has 3 entries
    Given the meditation data is loaded
    Then PROGRAMS should have 3 entries

  Scenario: Each program has valid metadata
    Given the meditation data is loaded
    Then every program should have "id, name, emoji, description, steps, color"

  Scenario: Each program's steps array is non-empty
    Given the meditation data is loaded
    Then every program's steps array should not be empty

  Scenario: Program IDs are unique
    Given the meditation data is loaded
    Then all program IDs should be unique
