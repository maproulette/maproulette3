# Getting Started

maproulette3 is a new front-end for MapRoulette built with
[React](https://reactjs.org/).

A back-end server from the
[maproulette2](https://github.com/maproulette/maproulette2) project is still
required. You can either install and configure it locally, or -- if looking to
do front-end development only -- can connect to a pre-existing server if you
have access to one (you will need your API key for that server). **Please do
not use the production server for development purposes.**

## Developing Locally

### Basic Dependencies:

* [Node 10 LTS](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)
* [jq](https://stedolan.github.io/jq/)
* [curl](https://curl.haxx.se/)

### Initial Setup

1. Create a `.env.development.local` file and then look through `.env` at the
   available configuration options and override any desired settings in your
   new `.env.development.local`

2. `yarn` to fetch and install NPM modules

3. `yarn run start` to fire up the front-end development server

As mentioned above, a back-end server from the
[maproulette2](https://github.com/maproulette/maproulette2) project is also
required. You can either install and configure it locally or, if you have access
to a pre-existing server, connect directly to it by using your API key for that
server.

#### Developing with a local back-end server

1. Install the back-end server using the instructions from the maproulette2
   project, if you haven't already

2. Visit your [OpenStreetMap account](https://www.openstreetmap.org) and go
   to My Settings -> oauth settings -> Register your application and setup a
   new application for development. For the `Main Application URL` and
   `Callback URL` settings, put in `http://127.0.0.1:9000` (assuming your
   back-end server is running on the default port 9000). The only app
   permission needed is to "read their user preferences". Take note of your new
   app's consumer key and secret key, as you'll need them in the next step

3. In your back-end server project, setup a .conf file that overrides properties
   as needed from `conf/application.conf` (unless you'd prefer to set explicit
   system properties on the command line when starting up the server). Refer
   to the `conf/application.conf` file, `conf/dev.conf` file and maproulette2
   docs for explanations of the various server configuration settings. At the
   very least, you'll want to make sure your JDBC url is correct and your OAuth
   consumer key and secret are set properly.

4. Fire up your back-end server, specifying the path to your .conf file with
   `-Dconfig.resource` or explicitly specifying the various system properties
   on the command line. See the maproulette2 docs for details on starting up
   the server

5. Edit your `.env.development.local` file in your front-end project and set:
   ```
   REACT_APP_SERVER_OAUTH_URL='http://127.0.0.1:9000/auth/authenticate?redirect=http://127.0.0.1:3000'
   ```
   (assuming your back-end server is on port 9000 and front-end is on port 3000).
   Restart or startup your front-end server, and then navigate to the front-end
   at http://127.0.0.1:3000

#### Developing with a pre-existing back-end server

These instructions are for connecting to an existing back-end server, rather than
a local one you have installed. *Please do not use the production MapRoulette
server for development use*

1. Open MapRoulette on that server normally in your browser, visit your user
   profile, and take note of your API key at the bottom of the page.
   Alternatively, you can use the server's `super.key` if it has been setup
   with one and you have access to it

2. Edit your `.env.development.local` file and override the following config
   variables:
  ```
  REACT_APP_MAP_ROULETTE_SERVER_URL='https://yourserver.com'
  REACT_APP_SERVER_API_KEY='your-api-key-for-that-server'
  ```

3. Restart your front-end dev server if it's already running (ctrl-c then `yarn
   run start` again)

4. Point your browser directly at the front-end server, http://127.0.0.1:3000
   by default. Once the page finishes loading, you should show up as signed-in
   if all is working correctly


### Updating to the Latest Code

> Note that the [maproulette2](https://github.com/maproulette/maproulette2)
> back-end server must be updated separately.

1. Stop your front-end server (ctrl-c) if it's running.
2. Pull the latest code
3. `yarn` to install new or updated NPM packages
4. `yarn run start` to restart the front-end server.

## Staging/Production build:

1. Setup a `.env.production` file with the desired production setting overrides.
 * set `REACT_APP_URL='https://myserver.com'`
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

## Adding Additional and Custom Map Layers

Default map layers are determined by pulling in data from the [OSM Editor Layer
Index](https://github.com/osmlab/editor-layer-index) at build time and
extracting layers marked as default layers with global coverage. These are
stored in the `src/defaultLayers.json` file. Modifying this file is not
recommended as it will be overwritten automatically by the build process.

Layer ids of additional desired layers from the Layer Index can be specified in
the `REACT_APP_ADDITIONAL_INDEX_LAYERS` .env config variable (see the .env file
for documentation), and these will also be included in the `defaultLayers.json`
file. The default .env file includes the OpenCycleMap layer this way.

Custom and 3rd-party layers that aren't included in the Layer Index can be
manually added to `src/customLayers.json` following the same structure as the
default layers. The build process does not modify this file other than creating
a stub if it doesn't exist.

### Setting API Keys for Map Layers

API keys for any layers -- default or custom -- can be set through the
`REACT_APP_MAP_LAYER_API_KEYS` .env file configuration variable (see the .env
file for documentation). For custom layers, an API key can also simply be
included in the specified layer url in `src/customLayers.json` if that is
simpler.

### Enabling the Mapillary Map Layer

MapRoulette has built-in support for a Mapillary map layer during task
completion, allowing the mapper to make of use of available street-level
imagery. To enable the layer, simply set the `REACT_APP_MAPILLARY_API_KEY` .env
key to your Mapillary client id and restart your dev server (or rebuild your
dev front-end for staging/production). If you don't have a client id, you can
set one up through the
[Mapillary Developer Tools](https://www.mapillary.com/developer)


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

> Note: End-to-End tests are temporarily disabled as the Chimp framework is not
> compatible with Node 10 LTS.

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

We are currently in transition between the old styling that used the
[Bulma](https://bulma.io) framework with SASS and new styling using [Tailwind
CSS](https://tailwindcss.com) with PostCSS. New CSS classes are prefixed with
`mr-` to distinguish them from any existing Bulma classes, but during this
transition there are still situations where a mix of both Tailwind and Bulma
are in play.

Tailwind configuration is controlled with the `src/tailwind.js` file. New CSS
classes can be found in `src/styles/`

## Internationalization and Localization

Internationalization and localization is performed via
[react-intl](https://github.com/yahoo/react-intl/wiki). Most components feature
co-located Messages.js files that contain messages intended for display,
along with default (U.S. English) versions of each message. Translation files
that contain translated versions of these messages for supported locales are
stored in the `src/lang/` directory. A fresh en-US.json file can be built from
the latest messages using `yarn run build-intl`, which is also run
automatically as part of the `yarn build` script used for creating production
builds. Translation files for other locales must be updated manually.

By default, the en-US locale will be used for users who have not set a locale in
their MapRoulette user settings. This default locale can be changed with the
`REACT_APP_DEFAULT_LOCALE` .env setting. Users who have set a locale will
always have their locale honored regardless of the default locale.

> Note that MapRoulette makes use of its own locale setting and does not use
> the setting from the user's OpenStreetMap account at this time.
