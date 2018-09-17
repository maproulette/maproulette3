# Getting Started

maproulette3 is a new front-end for MapRoulette built on React. The back-end
server from the [maproulette2](https://github.com/maproulette/maproulette2)
project is still required.

## Developing Locally

### Basic Dependencies:

* [Node 8 LTS](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)
* [jq](https://stedolan.github.io/jq/)
* [curl](https://curl.haxx.se/)

### Initial Setup

1. Create a `.env.development.local` file and:
 * if you want some debug output, set `REACT_APP_DEBUG='enabled'`.
 * set feature flags to `enabled` or `disabled` as desired.
   your API token.
 * override any other settings from the `.env` file as needed or desired.

2. `yarn` to fetch and install NPM modules.

3. `yarn run start` to fire up the front-end server.

4. Visit your [OpenStreetMap account](https://www.openstreetmap.org) and go
   to My Settings -> oauth settings -> Register your application and setup a
   new application for development. For the `Main Application URL` and
   `Callback URL` settings, put in `http://127.0.0.1:9000` (assuming your
   back-end server is running on the default port 9000). The only app
   permission needed is to "read their user preferences". Take note of your new
   app's consumer key and secret key, as you'll need them in the next step.

5. In your back-end server project, setup a .conf file that overrides properties
   as needed from `conf/application.conf` (unless you'd prefer to set explicit
   system properties on the command line when starting up the server). Refer
   to the `conf/application.conf` file, `conf/dev.conf` file and maproulette2
   docs for explanations of the various server configuration settings. At the
   very least, you'll want to make sure your JDBC url is correct and your OAuth
   consumer key and secret are set properly. You'll also need to set the
   `mr3.host` to the URL of your front-end dev server (`http://127.0.0.1:3000`
   by default) and set `mr3.devMode=true` if you're doing development.

6. Fire up your back-end server, specifying the path to your .conf file with
   `-Dconfig.resource` or explicitly specifying the various system properties
   on the command line (e.g. `-Dmr3.host="http://127.0.0.1:3000`). See the
   maproulette2 docs for details on starting up the server.

7. Point your browser at the back-end server, http://127.0.0.1:9000 by
   default.

> While you can also point your browser directly at the front-end server on
> port 3000, OAuth will not work correctly and you therefore won't be able to
> sign in. When you first fire up the front-end server, it will automatically
> to open a browser tab pointing port 3000 -- just close it.

### Updating to the Latest Code

> Note that the [maproulette2](https://github.com/maproulette/maproulette2)
> back-end server must be updated separately.

1. Stop your front-end server (ctrl-c) if it's running.
2. Pull the latest code
3. `yarn` to install new or updated NPM packages
4. `yarn run start` to restart the front-end server.

## Staging/Production build:

1. Setup a `.env.production` file with the desired production setting overrides.
 * set `REACT_APP_BASE_PATH='/mr3'`
 * set `REACT_APP_URL='https://myserver.com/mr3'`
   (substituting your domain, of course)
 * set `REACT_APP_MAP_ROULETTE_SERVER_URL='https://myserver.com'`
 * if you wish to use [Matomo/PIWIK](https://github.com/matomo-org/matomo) for
   analytics, set `REACT_APP_MATOMO_URL` and `REACT_APP_MATOMO_SITE_ID` to your
   tracking url and site id, respectively (see `.env` file for example).
 * set feature flags to `enabled` or `disabled` as desired.
 * override any other settings from the `.env` file as needed or desired.

2. `yarn` to install and update NPM packages.

3. `yarn run build` to create a minified front-end build in the `build/`
   directory.

## Adding Custom Map Layers

Default map layers are determined by pulling in data from the [OSM Editor Layer
Index](https://github.com/osmlab/editor-layer-index) at build time, and
extracting (non-overlay) layers marked as default layers with global coverage.
For backward compatibility, the OpenCycleMap layer is also included. These are
stored in the `src/defaultLayers.json` file. Modifying this file is not
recommended as it will be overwritten automatically by the build process.

Extra, custom layers can be added to `src/extraLayers.json` following the
same structure as the default layers.

### Setting API Keys for Map Layers

API keys for any layers -- default or extra -- can be set through the
`REACT_APP_MAP_LAYER_API_KEYS` .env file configuration variable (see the .env
file for documentation). For custom/extra layers, an API key can also simply be
included in the specified layer url if that is simpler.

# Development Notes

The project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

Branch management follows
[GitFlow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) with
active development occurring on the `develop` branch. Pull requests should
target the `develop` branch. The master branch always contains the latest
release, and the `prerelease` branch contains features and fixes promoted from
`develop` that are candidates for the next release to `master`.

It is okay for pull requests to the `develop` branch to rely on server features
or fixes that have only been merged into the server's `dev` branch, but they
will not be promoted to the `prelease` branch until the server-side code makes
it into the server's `master` branch.

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

[Sauce Labs](https://saucelabs.com) has also graciously provided us with free
access to their cross-browser testing platform.

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
