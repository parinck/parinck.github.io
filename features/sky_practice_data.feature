Feature: SKY Practice Data Integrity
  As a developer
  I want the SKY practice phase data to be complete and valid
  So that the app correctly guides through all five Sudarshan Kriya phases

  Scenario: SKY_PHASES has 5 entries
    Given the SKY practice data is loaded
    Then SKY_PHASES should have 5 entries

  Scenario: Phase IDs are unique
    Given the SKY practice data is loaded
    Then all SKY phase IDs should be unique

  Scenario: Every phase has required metadata
    Given the SKY practice data is loaded
    Then every SKY phase should have "id, name, shortName, emoji, color, description, data"

  Scenario: Pranayama has 3 stages
    Given the SKY practice data is loaded
    Then PRANAYAMA_PHASES should have 3 stages

  Scenario: Pranayama stages each have correct rhythm
    Given the SKY practice data is loaded
    Then every Pranayama stage rhythm should be 4-4-6-2

  Scenario: Pranayama stages have positive repetitions
    Given the SKY practice data is loaded
    Then every Pranayama stage should have positive repetitions

  Scenario: Pranayama stages have rest seconds
    Given the SKY practice data is loaded
    Then every Pranayama stage should have a restSeconds value

  Scenario: Bhastrika has 3 rounds of 20 breaths
    Given the SKY practice data is loaded
    Then Bhastrika should have 3 rounds
    And Bhastrika should have 20 breaths per round

  Scenario: Bhastrika has valid pace options
    Given the SKY practice data is loaded
    Then Bhastrika should have pace options "slow, medium, fast"
    And Bhastrika paceMs should have values for each pace option

  Scenario: Om Chanting has 3 repetitions
    Given the SKY practice data is loaded
    Then Om Chanting should have 3 repetitions

  Scenario: Om Chanting has positive chant duration
    Given the SKY practice data is loaded
    Then Om Chanting chant duration should be greater than 0

  Scenario: Kriya has 3 rounds with increasing speed
    Given the SKY practice data is loaded
    Then Kriya should have 3 rounds
    And Kriya round paces should decrease across rounds

  Scenario: Kriya round counts are 20, 40, 40
    Given the SKY practice data is loaded
    Then Kriya round counts should be "20, 40, 40"

  Scenario: Kriya has 10 deep breaths
    Given the SKY practice data is loaded
    Then Kriya should have 10 deep breaths

  Scenario: Savasana has 10-minute duration
    Given the SKY practice data is loaded
    Then Savasana duration should be 10 minutes

  Scenario: Savasana has at least one audio option
    Given the SKY practice data is loaded
    Then Savasana should have at least 1 audio option

  Scenario: Savasana audio options have id, label, icon
    Given the SKY practice data is loaded
    Then every Savasana audio option should have "id, label, icon"

  Scenario: Disclaimer text is non-empty
    Given the SKY practice data is loaded
    Then the SKY_DISCLAIMER should not be empty
