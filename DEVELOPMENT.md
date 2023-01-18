# MapRoulette Development

This is the repository that holds the front-end code. The back-end and API are developed in parallel in a separate repo: [maproulette-backend](https://github.com/maproulette/maproulette-backend). Both need to be deployed together for a working setup. We advise you use Docker for production deployments. [This repo](https://github.com/maproulette/maproulette2-docker) will help you set that up easily.

### Basic Dependencies:

* [Node 14 LTS](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)
* [jq](https://stedolan.github.io/jq/)
* [curl](https://curl.haxx.se/)

### Initial Setup

1. Create a `.env.development.local` file and then look through `.env` at the
   available configuration options and override any desired settings in your
   new `.env.development.local`

2. `yarn` to fetch and install NPM modules

3. `yarn run start` to fire up the front-end development server

A back-end server from the [maproulette-backend](https://github.com/maproulette/maproulette-backend) project is also required. You can either install and configure it locally or, if you have access to a pre-existing server, connect directly to it by using your API key for that
server.

#### Run the UI from Docker

To avoid platform specific issues, the UI can be built and run within a docker container.
Note that this will create the development build and not the 'production' build.

1. First make the required `.env.development.local` file. A few overrides are required, like these:

   ```
   REACT_APP_URL='http://127.0.0.1:3000'
   REACT_APP_SERVER_OAUTH_URL='http://127.0.0.1:9000/auth/authenticate?redirect=http://127.0.0.1:3000'
   REACT_APP_FEATURE_CHALLENGE_ANALYSIS_TABLE='enabled'
   REACT_APP_FEATURE_MOBILE_DEVICES='enabled'
   ```

1. Build the image using `docker build --pull -t maproulette-ui .`
1. Start a container from the image using `docker run -itd -p 127.0.0.1:3000:3000 --name maproulette-ui maproulette-ui`

#### Developing with a local back-end server

1. Install the back-end server using the instructions from the maproulette-backend
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
   to the `conf/application.conf` file, `conf/dev.conf` file and maproulette-backend
   docs for explanations of the various server configuration settings. At the
   very least, you'll want to make sure your JDBC url is correct and your OAuth
   consumer key and secret are set properly.

4. Fire up your back-end server, specifying the path to your .conf file with
   `-Dconfig.resource` or explicitly specifying the various system properties
   on the command line. See the maproulette-backend docs for details on starting up
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
a local one you have installed. **Please do not use the production API for development purposes.**

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

> Note that the [maproulette-backend](https://github.com/maproulette/maproulette-backend)
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
imagery. To enable the layer, simply set the `REACT_APP_MAPILLARY_CLIENT_TOKEN` .env
key to your Mapillary client id and restart your dev server (or rebuild your
dev front-end for staging/production). If you don't have a client token, you can
set one up through the
[Mapillary Developer Tools](https://www.mapillary.com/developer)


# Development Notes

The project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

Branch management follows
[GitFlow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) with
active development occurring on the `develop` branch. Pull requests should
target the `develop` branch. The main branch always contains the latest
release, and the `prerelease` branch contains features and fixes promoted from
`develop` that are candidates for the next release to `main`.

Release versions follow [Semantic Versioning](https://semver.org/).

## Unit Tests

Unit tests are built with [Jest](https://facebook.github.io/jest/) +
[Enzyme](https://github.com/airbnb/enzyme).

`yarn test` to run them in watch mode.

## CSS Styling and Naming

We are using SASS and [Tailwind
CSS](https://tailwindcss.com) with PostCSS.

Tailwind configuration is controlled with the `src/tailwind.config.js` file.
New CSS classes can be found in `src/styles/`

## Internationalization, Localization, and Translation

Internationalization and localization is performed via
[react-intl](https://github.com/yahoo/react-intl/wiki). Most components feature
co-located Messages.js files that contain messages intended for display,
along with default (U.S. English) versions of each message.

A fresh en-US.json file can be built from the latest messages using `yarn run
build-intl`, which is also run automatically as part of the `yarn build` script
used for creating production builds.

Translations for other locales are managed through
[transifex](https://www.transifex.com/maproulette/maproulette3), who kindly provides
us with free service through their Open Source program. Translation files are
pulled into the code repository from time to time and stored in the `src/lang/`
directory.

Adding support for additional locales is quick and straight-forward: edit
`src/services/User/Locale/Locale.js` and follow the directions at the top of
the file.

By default, the en-US locale will be used for users who have not set a locale in
their MapRoulette user settings. This default locale can be changed with the
`REACT_APP_DEFAULT_LOCALE` .env setting. Users who have set a locale will
always have their locale honored regardless of the default locale.

> Note that MapRoulette makes use of its own locale setting and does not use
> the setting from the user's OpenStreetMap account at this time.
