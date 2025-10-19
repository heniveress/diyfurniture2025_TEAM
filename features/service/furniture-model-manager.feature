Feature: FurnitureModelManagerService core behaviours

  Background:
    Given a FurnitureModelManagerService with no existing data

  Scenario: Detect a vertical split by cursor proximity
    Given a body of width 100 and height 100 at position 10,20
    And the body has a vertical split at x = 40 with left element width 40 and right element width 60
    When I search for a split near x = 40 and y = 50
    Then I should detect a vertical split for that body

  Scenario: Resize element width within a vertical split without overlap
    Given a body of width 100 and height 100 at position 0,0
    And the body has a vertical split at x = 30 with left element width 30 and right element width 70
    When I resize the left element to new width 60
    Then the split x should be 60
    And the left element width should be 60
    And the right element width should be 40

  Scenario: Clear all elements empties the model and notifies change
    Given a body of width 100 and height 100 at position 0,0
    When I clear all elements
    Then there should be 0 furniture bodies
    And model change should have been notified
