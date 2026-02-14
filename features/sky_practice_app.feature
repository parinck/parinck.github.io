Feature: SKY Practice App Logic
  As a practitioner
  I want the SKY practice app to manage phases, timers, and preferences correctly
  So that my Sudarshan Kriya session flows smoothly

  # ─── Initialization ─────────────────────────────────────────────────────────

  Scenario: App initializes with default state
    Given a SKY Practice app is initialized
    Then the SKY app should not be paused
    And the SKY phase index should be 0
    And SKY voice should be enabled

  Scenario: Disclaimer is shown on first launch
    Given a SKY Practice app is initialized
    Then the disclaimer modal should be active

  Scenario: Accepting disclaimer persists to localStorage
    Given a SKY Practice app is initialized
    When I accept the SKY disclaimer
    Then localStorage should have "sky_disclaimer_accepted" as "true"
    And the disclaimer modal should not be active

  # ─── Pause Toggle ───────────────────────────────────────────────────────────

  Scenario: Toggling pause flips the SKY state
    Given a SKY Practice app is initialized
    Then the SKY app should not be paused
    When I toggle SKY pause
    Then the SKY app should be paused
    When I toggle SKY pause
    Then the SKY app should not be paused

  # ─── Guided Session ─────────────────────────────────────────────────────────

  Scenario: Starting guided session loads all 5 phases
    Given a SKY Practice app is initialized
    When I start a guided SKY session
    Then the SKY app should have 5 active phases
    And SKY guided mode should be true

  Scenario: Progress dots match phase count
    Given a SKY Practice app is initialized
    When I start a guided SKY session
    Then there should be 5 progress dots

  # ─── Quick Practice ─────────────────────────────────────────────────────────

  Scenario: Section picker renders all 5 phases
    Given a SKY Practice app is initialized
    When I toggle the section picker
    Then the section picker should be visible
    And the section cards should have 5 children

  Scenario: Toggling section picker again hides it
    Given a SKY Practice app is initialized
    When I toggle the section picker
    And I toggle the section picker
    Then the section picker should not be visible

  # ─── Timer Ring ─────────────────────────────────────────────────────────────

  Scenario: Timer shows M:SS when 60 seconds or more
    Given a SKY Practice app is initialized
    When the SKY timer ring is updated with 75 remaining of 600
    Then the SKY timer text should show "1:15"

  Scenario: Timer shows seconds only when below 60
    Given a SKY Practice app is initialized
    When the SKY timer ring is updated with 45 remaining of 600
    Then the SKY timer text should show "45"

  Scenario: Timer shows zero-padded seconds
    Given a SKY Practice app is initialized
    When the SKY timer ring is updated with 63 remaining of 600
    Then the SKY timer text should show "1:03"

  Scenario: Timer color changes in last 10 seconds
    Given a SKY Practice app is initialized
    When the SKY timer ring is updated with 8 remaining of 600
    Then the SKY timer progress color should be "#e11d48"

  Scenario: Timer color is normal above 10 seconds
    Given a SKY Practice app is initialized
    When the SKY timer ring is updated with 15 remaining of 600
    Then the SKY timer progress color should be "#3b82f6"

  # ─── Preferences ────────────────────────────────────────────────────────────

  Scenario: Save preferences persists voice setting
    Given a SKY Practice app is initialized
    When SKY voice is set to false
    And I save SKY preferences
    Then localStorage should have "sky_voice_enabled" as "false"

  Scenario: Save preferences persists savasana audio
    Given a SKY Practice app is initialized
    When SKY savasana audio is set to "flute"
    And I save SKY preferences
    Then localStorage should have "sky_savasana_audio" as "flute"

  # ─── Progress Tracking ──────────────────────────────────────────────────────

  Scenario: Logging practice stores today's date
    Given a SKY Practice app is initialized
    When I log a SKY practice
    Then the SKY practice log should contain today

  Scenario: Logging same day twice does not duplicate
    Given a SKY Practice app is initialized
    When I log a SKY practice
    And I log a SKY practice
    Then the SKY practice log should have 1 entry

  Scenario: Calendar renders 28 days
    Given a SKY Practice app is initialized
    Then the calendar should have 28 day cells

  Scenario: Streak is 0 with no practice history
    Given a SKY Practice app is initialized
    Then the SKY streak should be 0

  # ─── Completion ─────────────────────────────────────────────────────────────

  Scenario: Completion shows correct phase count
    Given a SKY Practice app is initialized
    When I start a guided SKY session
    And the SKY practice is completed
    Then the SKY stat phases should be "5"
