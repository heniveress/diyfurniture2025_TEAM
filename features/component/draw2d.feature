Feature: Draw2dComponent behaviours

  Background:
    Given a fresh Draw2dComponent with mocked services

  Scenario: Changing draw action updates action type
    When I change the draw action to "move"
    Then the component figureType should be "move"
    And the event handler actionType should be "move"

  Scenario: Deleting a selected element calls model manager and clears selection
    Given a selected element exists
    When I delete the selected element
    Then modelManager.removeElement should have been called once
    And the selection should be cleared
    And draw support should redraw

  Scenario: Clearing all elements calls model manager and clears selection
    Given a selected element exists
    And a selected body exists
    When I clear all elements in the component
    Then modelManager.clearAllElements should have been called once
    And the selection should be cleared
    And draw support should redraw

  Scenario: Selecting a front type updates element type and refreshes model
    Given a selected element exists
    When I select front type "door"
    Then the selected element origin type should be DOOR
    And the selected element furnitureType should be DOOR
    And modelManager.refresh should have been called once

  Scenario: Resizing selected element width triggers width resize without overlap
    Given a selected element exists with width 30 and height 50
    And the origin element actual width will be adjusted to 60 by the model
    When I change selected element size to width 60 and height 50
    Then modelManager.resizeElementWidthNoOverlap should have been called with width 60
    And the selected width should sync to the origin width 60

  Scenario: Resizing selected element height preserves percent of body height
    Given a selected element exists with width 30 and height 20
    And the origin element actual height will be adjusted to 40 by the model
    When I change selected element size to width 30 and height 40
    Then modelManager.resizeElementHeightPreservingPercent should have been called with height 40
    And the selected height should sync to the origin height 40
