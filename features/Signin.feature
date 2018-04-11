Feature: Sign-in Feature

  Users sign in via OAuth by using their OpenStreetMap account and granting
  access to the MapRoulette app.

  Scenario: User signs in using OpenStreetMap account
    Given mr3testing/mr3testing logs in to OpenStreetMap
    And mr3testing is browsing MapRoulette
    And mr3testing is signed out from MapRoulette
    And mr3testing clicks the Sign In nav link
    And mr3testing authorizes the MapRoulette app on OpenStreetMap
    Then mr3testing should be signed in to MapRoulette

  Scenario: User signs out through the Account nav menu
    Given mr3testing is browsing MapRoulette
    And mr3testing/mr3testing is signed in to MapRoulette
    And mr3testing clicks Sign Out on the Account nav menu
    Then mr3testing should be signed out from MapRoulette
