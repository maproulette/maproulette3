Feature: About Modal

  An introductory About modal is automatically presented to new (signed-out)
  users when they visit the site, and is also accessible from the top nav.

  Background:
    Given user visits the site

  Scenario: New user is automatically presented with About modal
    Then user should see the About modal

  Scenario: The About modal can be dismissed
    Given user clicks Get Started on the About modal
    Then user should not see the About modal

  Scenario: The About modal can be opened on demand
    Given user ensures the About modal is dismissed
    And user clicks the About nav link
    Then user should see the About modal
