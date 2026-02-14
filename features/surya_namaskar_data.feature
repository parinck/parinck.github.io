Feature: Surya Namaskar Pose Data Integrity
  As a developer
  I want the Surya Namaskar poses data to be complete and valid
  So that the app displays correct information for all 12 poses

  Scenario: Exactly 12 poses are defined
    Given the Surya Namaskar poses are loaded
    Then there should be 12 poses

  Scenario: Each pose has all required fields
    Given the Surya Namaskar poses are loaded
    Then every pose should have an "id" field
    And every pose should have a "name" field
    And every pose should have a "subtitle" field
    And every pose should have a "breathing" field
    And every pose should have a "description" field
    And every pose should have an "image" field

  Scenario: Pose IDs are sequential starting from 1
    Given the Surya Namaskar poses are loaded
    Then the pose IDs should be sequential from 1 to 12

  Scenario: All breathing values are valid
    Given the Surya Namaskar poses are loaded
    Then every breathing value should be one of "START, INHALE, EXHALE, HOLD"

  Scenario: All image paths follow the naming convention
    Given the Surya Namaskar poses are loaded
    Then every image path should start with "images/pose_"
    And every image path should end with ".png"
