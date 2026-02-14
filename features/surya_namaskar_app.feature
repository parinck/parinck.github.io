Feature: Surya Namaskar App Logic
  As a practitioner
  I want the Surya Namaskar app to manage durations, sets, and navigation correctly
  So that my practice flows smoothly

  Scenario: Default duration is 15 seconds
    Given a Surya Namaskar app is initialized
    Then the pose duration should be 15

  Scenario: Duration increases within bounds
    Given a Surya Namaskar app is initialized
    When I adjust the time by 10
    Then the pose duration should be 25

  Scenario: Duration does not exceed 120 seconds
    Given a Surya Namaskar app is initialized
    When I adjust the time by 200
    Then the pose duration should be 120

  Scenario: Duration does not go below 5 seconds
    Given a Surya Namaskar app is initialized
    When I adjust the time by -200
    Then the pose duration should be 5

  Scenario: Set duration to a specific value
    Given a Surya Namaskar app is initialized
    When I set the duration to 45
    Then the pose duration should be 45

  Scenario: Default total sets is 1
    Given a Surya Namaskar app is initialized
    Then the total sets should be 1

  Scenario: Sets increase within bounds
    Given a Surya Namaskar app is initialized
    When I adjust the sets by 2
    Then the total sets should be 3

  Scenario: Sets do not exceed 10
    Given a Surya Namaskar app is initialized
    When I adjust the sets by 50
    Then the total sets should be 10

  Scenario: Sets do not go below 1
    Given a Surya Namaskar app is initialized
    When I adjust the sets by -50
    Then the total sets should be 1

  Scenario: Timer color changes in last 5 seconds
    Given a Surya Namaskar app is initialized
    When the time remaining is 5
    And the timer display is updated
    Then the timer progress color should be "#FF6B6B"

  Scenario: Timer color is normal above 5 seconds
    Given a Surya Namaskar app is initialized
    When the time remaining is 10
    And the timer display is updated
    Then the timer progress color should be "#FF8C00"

  Scenario: Toggling pause flips the state
    Given a Surya Namaskar app is initialized
    Then the app should not be paused
    When I toggle pause
    Then the app should be paused
    When I toggle pause
    Then the app should not be paused

  Scenario: Next pose advances the current pose
    Given a Surya Namaskar app is initialized
    Then the current pose index should be 0
    When I advance to the next pose
    Then the current pose index should be 1

  Scenario: Completion stats show correct totals for 1 set
    Given a Surya Namaskar app is initialized
    When I set the duration to 30
    And I set total sets to 1
    And the practice is completed
    Then the total poses stat should be "12"
    And the total time stat should be "6"
    And the time label should be "Minutes"

  Scenario: Completion stats show correct totals for 3 sets
    Given a Surya Namaskar app is initialized
    When I set the duration to 15
    And I set total sets to 3
    And the practice is completed
    Then the total poses stat should be "34"
    And the total time stat should be "8.5"
    And the time label should be "Minutes"

  Scenario: Saving and loading preferences persists duration and sets
    Given a Surya Namaskar app is initialized
    When I set the duration to 45
    And I set total sets to 5
    And I save preferences
    Then localStorage should have "suryaNamaskar_poseDuration" as "45"
    And localStorage should have "suryaNamaskar_totalSets" as "5"
