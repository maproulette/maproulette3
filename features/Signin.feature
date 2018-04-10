@watch
Feature: Sign-in Feature

  Users sign in via OAuth by using their OpenStreetMap account and granting
  access to the MapRoulette app.

  Background:
    Given mr3testing/mr3testing logs in to OpenStreetMap
    And mr3testing visits the site
    And mr3testing ensures the About modal is dismissed

  Scenario: User signs using OpenStreetMap account
    Given mr3testing clicks the Sign In nav link
    And mr3testing authorizes the Maproulette app on OpenStreetMap
    Then mr3testing should be logged in to Maproulette
