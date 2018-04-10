# Getting Started

This is a new front-end for MapRoulette built on React. The back-end (scala)
server from the [maproulette2](https://github.com/maproulette/maproulette2)
project is still required.

> Note: because of the oauth authentication workflow, your dev machine must be
> publicly accessible to the OpenStreetMap (OSM) servers in order to login to
> the app. You may wish to setup an open-source tunneling server like
> [go-http-tunnel](https://github.com/mmatczuk/go-http-tunnel) or use a
> commercial service like ngrok.

1. Create a `.env.development.local` file and:
 * set `REACT_APP_BASE_PATH='/mr3'`
 * set `REACT_APP_URL='https://maproulette.mydevserver.com/mr3'` (substituting your dev domain, of course)
 * set `REACT_APP_MAP_ROULETTE_SERVER_URL='https://maproulette.mydevserver.com'`
 * if you wish to use Mapbox maps, set the `REACT_APP_MAPBOX_ACCESS_TOKEN` to
   your API token.
 * if you wish to use [Matomo/PIWIK](https://github.com/matomo-org/matomo) for
   analytics, set `REACT_APP_MATOMO_URL` and `REACT_APP_MATOMO_SITE_ID` to your
   tracking url and site id, respectively.
 * if you want some debug output, set `REACT_APP_DEBUG='enabled'`.
 * override any other settings from the `.env` file as needed or desired.

2. `yarn` to fetch and install NPM modules.

3. `yarn run start` to fire up the front-end server.

4. Visit your [OpenStreetMap account](https://www.openstreetmap.org) and go
   to My Settings -> oauth settings -> Register your application and setup a
   new application for development. For the `Main Application URL` and
   `Callback URL` settings, put in your dev server URL (e.g.
   `https://maproulette.mydevserver.com`). Take note of your new app's consumer
   key and secret key, as you'll need them in the next step.

5. Fire up your backend scala server (installed separately from the maproulette2 project),
   setting the `MR_OAUTH_CONSUMER_KEY` and `MR_OAUTH_CONSUMER_SECRET` environment variables
   to your OSM app's consumer key and secret key, respectively. The back-end
   server assumes your front-end dev server is running on port 3000, which is
   the default; if you've changed the port, you'll also need to set
   `MR3_JS_ASSET_URI=https://localhost:<port>/static/js/bundle.js` (replacing
   <port> with the proper port) and
   `MR3_CSS_ASSET_URI=https://localhost:<port>/static/css/bundle.css`.

6. Point your browser at /mr3 on your server (e.g.
   `https://maproulette.mydevserver.com/mr3`) to bring up the front-end.

### Updating to the Latest Code

> Note that the [maproulette2](https://github.com/maproulette/maproulette2)
> backend (scala) server must be updated separately, if desired.

1. Stop your front-end server (ctrl-c) if it's running.
2. Pull the latest code
3. `yarn` to install new or updated NPM packages
4. `yarn run start` to restart the front-end server.

### Staging/Production build:

* Setup a `.env.production` file with the desired production setting overrides.
* `yarn run build` to create a minified front-end tarball.

> Note that the minified front-end JS and CSS bundles are given new hashed
> names with each build, and that the back-end server needs to know these names
> so it can serve up the files. You'll always need to set the
> `MR3_JS_ASSET_URI` and `MR3_CSS_ASSET_URI` environment variables in a staging
> or production environment to point to the correct filenames. For
> scripting/automation purposes, the filenames can always be found in the
> `asset-manifest.json` file and can be easily extracted with
> [jq](https://stedolan.github.io/jq)
> (e.g. `jq -r '."main.js"' MR3React/asset-manifest.json` and
> `jq -r '."main.css"' MR3React/asset-manifest.json`)


# Development Notes

The project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

Branch management follows
[GitFlow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) with
active development of the next release occurring on the `develop` branch. Pull
requests should target the `develop` branch. The master branch always contains
the latest release.

Release versions follow [Semantic Versioning](https://semver.org/).

## Unit Tests

Unit tests are built with [Jest](https://facebook.github.io/jest/) +
[Enzyme](https://github.com/airbnb/enzyme).

`yarn test` to run them in watch mode.

## End-to-End Tests

End-to-end tests are built with [Chimp](https://chimp.readme.io/), which
combines [Webdriver.io](http://webdriver.io/guide.html) for Selenium +
[Cucumber](https://cucumber.io/docs/reference) and
[Jasmine](https://jasmine.github.io/api/3.0/global) for tests.

Prior to running tests locally, you'll need to tell Chimp the URL to your
MR3 app. Copy `chimp.example.js` to `chimp.js`, edit the file and modify the
`mr3URL` setting. You only need to do this once.

Then:
`yarn e2e` to run the tests, or `yarn e2e --watch` to enter watch mode and only
run tests with a `@watch` tag (useful when working on new tests).

## CSS Styling and Naming

The app uses [Sass/scss](http://sass-lang.com/) in combination with the
[Bulma](https://bulma.io) CSS framework. The [BEM](http://getbem.com/introduction/)
methodology has been loosely used as a guide for CSS class naming within
components.

The [node-sass-chokidar](https://www.npmjs.com/package/node-sass-chokidar)
package is used for compiling the .scss files into .css, which are then imported
into the components (the .css files are not added to source control). It's
run automatically as part of the yarn start and build scripts, so there's no need
to run it separately.

The `src/variables.scss` includes global sass variables (such as colors), some
Bulma variable overrides, etc.. Reusable mixins are kept in `src/mixins.scss`.
Everything is pulled together (including Bulma's own Sass) into the
`src/theme.scss` file.

## Internationalization and Localization

Internationalization and localization is performed via
[react-intl](https://github.com/yahoo/react-intl/wiki). Most components feature
co-located Messages.js files that contain messages intended for display,
along with default (U.S. English) versions of each message. Translation files
that contain translated versions of these messages for supported locales are
stored in the src/lang/ directory. A fresh en-US.json file can be built from
the latest messages using `yarn run build-intl`, which is also run
automatically as part of the `yarn build` script used for creating production
builds. Translation files for other locales must be updated manually.

By default, the en-US locale will be used for users who have not set a locale in
their MapRoulette user settings. This default locale can be changed with the
`REACT_APP_DEFAULT_LOCALE` .env setting. Users who have set a locale will
always have their locale honored regardless of the default locale.

> Note that MapRoulette makes use of its own locale setting and does not use
> the setting from the user's OpenStreetMap account at this time.
