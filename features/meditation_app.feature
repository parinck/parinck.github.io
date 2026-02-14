Feature: Anxiety Meditation App Logic
  As a practitioner
  I want the meditation app to manage multipliers, timer display, and programs correctly
  So that my meditation flows smoothly

  Scenario: Default multiplier is 1.0
    Given a Meditation app is initialized
    Then the multiplier should be 1.0

  Scenario: Multiplier increases within bounds
    Given a Meditation app is initialized
    When I adjust the multiplier by 0.5
    Then the multiplier should be 1.5

  Scenario: Multiplier does not exceed 3.0
    Given a Meditation app is initialized
    When I adjust the multiplier by 10.0
    Then the multiplier should be 3.0

  Scenario: Multiplier does not go below 0.25
    Given a Meditation app is initialized
    When I adjust the multiplier by -10.0
    Then the multiplier should be 0.25


  Scenario: Timer shows minutes:seconds when 60 or more
    Given a Meditation app is initialized
    When the step duration is 120 and time remaining is 75
    And the meditation timer display is updated
    Then the timer should show "1:15"

  Scenario: Timer shows seconds only when below 60
    Given a Meditation app is initialized
    When the step duration is 60 and time remaining is 45
    And the meditation timer display is updated
    Then the timer should show "45"

  Scenario: Timer shows zero-padded seconds in M:SS format
    Given a Meditation app is initialized
    When the step duration is 120 and time remaining is 63
    And the meditation timer display is updated
    Then the timer should show "1:03"

  Scenario: Timer color changes in last 10 seconds
    Given a Meditation app is initialized
    When the step duration is 60 and time remaining is 8
    And the meditation timer display is updated
    Then the meditation timer progress color should be "#FF6B9D"

  Scenario: Timer color is normal above 10 seconds
    Given a Meditation app is initialized
    When the step duration is 60 and time remaining is 15
    And the meditation timer display is updated
    Then the meditation timer progress color should be "#7B68EE"

  Scenario: Selecting the Sleep Stretches program
    Given a Meditation app is initialized
    When I select the "sleep-stretches" program
    Then the current program name should be "Sleep Stretches"
    And there should be 7 current steps

  Scenario: Selecting the Anxiety Protocol program
    Given a Meditation app is initialized
    When I select the "anxiety-protocol" program
    Then the current program name should be "Anxiety Busting Protocol"
    And there should be 5 current steps

  Scenario: Selecting the Home Kriya program
    Given a Meditation app is initialized
    When I select the "home-kriya" program
    Then the current program name should be "Home Sudarshan Kriya"
    And there should be 4 current steps

  Scenario: Toggling pause flips the meditation state
    Given a Meditation app is initialized
    Then the meditation app should not be paused
    When I toggle meditation pause
    Then the meditation app should be paused
    When I toggle meditation pause
    Then the meditation app should not be paused

  Scenario: Completion stats with multiplier 1.0 for Sleep Stretches
    Given a Meditation app is initialized
    When I select the "sleep-stretches" program
    And the meditation practice is completed
    Then the steps stat should be "7"
    And the meditation time stat should be "8"
    And the meditation time label should be "Minutes"

  Scenario: Completion stats with multiplier 2.0 for Anxiety Protocol
    Given a Meditation app is initialized
    And the multiplier is set to 2.0
    When I select the "anxiety-protocol" program
    And the meditation practice is completed
    Then the steps stat should be "5"

  Scenario: Saving preferences persists multiplier
    Given a Meditation app is initialized
    And the multiplier is set to 1.5
    When I save meditation preferences
    Then localStorage should have "anxietyMeditation_multiplier" as "1.5"
