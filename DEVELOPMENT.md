# MapRoulette Development

This is the repository that holds the front-end code. The back-end and API
are developed in parallel in a separate repo: [maproulette-backend](https://github.com/maproulette/maproulette-backend).
Both need to be deployed together for a working setup. We advise you use Docker
for production deployments. [This repo](https://github.com/maproulette/maproulette2-docker)
will help you set that up easily.

### Basic Dependencies:

* [Node 20 or 22](https://nodejs.org/)
* [jq](https://jqlang.org/)
* [curl](https://curl.haxx.se/)

### Initial Setup

1. Create a `.env.local` file and then look through `.env` at the
   available configuration options and override any desired settings in your
   new `.env.local`

2. `npm install` to fetch and install NPM modules

3. `npm run start` to fire up the front-end development server

A back-end server from the [maproulette-backend](https://github.com/maproulette/maproulette-backend)
project is also required. You can either install and configure it locally or, if
you have access to a pre-existing server, connect directly to it by using your API
key for that server.

#### Run the UI from Docker

To avoid platform specific issues, the UI can be built and run within a docker container.
Note that this will create the development build and not the 'production' build.

1. First make the required `.env.local` file. A few overrides are required, like these:

   ```
   REACT_APP_URL='http://127.0.0.1:3000'
   REACT_APP_SERVER_OAUTH_URL='http://127.0.0.1:9000/auth/authenticate?redirect=http://127.0.0.1:3000'
   ```

2. Build the image using `docker build --pull -t maproulette-ui .`
3. Start a container from the image using `docker run -d -p 127.0.0.1:3000:80 maproulette-ui`

Note that if you make changes to the code, you'll need to rebuild the image and restart
the container to see them reflected in the application.

#### Developing with a local back-end server

1. Install the back-end server using the instructions from the maproulette-backend
   project, if you haven't already

2. Create an account on [master.apis.dev.openstreetmap.org](https://master.apis.dev.openstreetmap.org),
   or sign in if you already have one. This server runs a full copy of the OpenStreetMap
   website stack and is intended for development purposes. It has its own database, so
   your regular openstreetmap.org credentials won't work here.

3. Open your account settings (click profile name in upper right then "My Settings").
   Then go to the "OAuth 2 applications" tab and choose "Register new application" to
   create a new application for development. Choose a name for the application that will
   help you remember what it's for, e.g. "My MapRoulette local dev environment". Set the
   `Redirect URL` to `http://127.0.0.1:9000` (assuming your back-end server is running
   on the default port 9000).

   The required app permissions are:
   - "Read user preferences" (`read_prefs`)
   - "Modify user preferences" (`write_prefs`)
   - "Modify the map" (`write_api`)

   Copy your new app's Client ID and Client Secret. They will only be shown once!

4. In your back-end server project, setup a .conf file that overrides properties
   as needed from `conf/application.conf` (unless you'd prefer to set explicit
   system properties on the command line when starting up the server). Refer
   to the `conf/application.conf` file, `conf/dev.conf` file and maproulette-backend
   docs for explanations of the various server configuration settings. At the
   very least, you'll want to make sure your JDBC url is correct and set
   `osm.consumerKey` to the Client ID and `osm.consumerSecret` to the Client Secret
   from the previous step.

5. Fire up your back-end server, specifying the path to your .conf file with
   `-Dconfig.resource` or explicitly specifying the various system properties
   on the command line. See the maproulette-backend docs for details on starting up
   the server

6. Edit your `.env.local` file in your front-end project and set:
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

2. Edit your `.env.local` file and override the following config
   variables:
  ```
  REACT_APP_MAP_ROULETTE_SERVER_URL='https://yourserver.com'
  REACT_APP_MAP_ROULETTE_SERVER_WEBSOCKET_URL='wss://yourserver.com/ws'
  REACT_APP_MAP_ROULETTE_SERVER_GRAPHQL_URL='https://yourserver.com/graphql'
  REACT_APP_SERVER_API_KEY='your-api-key-for-that-server'
  ```

3. Restart your front-end dev server if it's already running (ctrl-c then `npm
   run start` again)

4. Point your browser directly at the front-end server, http://127.0.0.1:3000
   by default. Once the page finishes loading, you should show up as signed-in
   if all is working correctly

### Updating to the Latest Code

> Note that the [maproulette-backend](https://github.com/maproulette/maproulette-backend)
> back-end server must be updated separately.

1. Stop your front-end server (ctrl-c) if it's running.
2. Pull the latest code
3. `npm install` to install new or updated NPM packages
4. `npm run start` to restart the front-end server.

## Staging/Production build:

1. Setup a `.env.production` file with the desired production setting overrides.
 * set `REACT_APP_URL='https://example.com'`
   (substituting your domain, of course)
 * set `REACT_APP_MAP_ROULETTE_SERVER_URL='https://example.com'`
 * if you wish to use [Matomo/PIWIK](https://github.com/matomo-org/matomo) for
   analytics, set `REACT_APP_MATOMO_URL` and `REACT_APP_MATOMO_SITE_ID` to your
   tracking url and site id, respectively (see `.env` file for example).
 * set feature flags to `enabled` or `disabled` as desired.
 * override any other settings from the `.env` file as needed or desired.

2. `npm install` to install and update NPM packages.

3. `npm run build` to create a minified front-end build in the `build/`
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
set one up through the [Mapillary Developer Tools](https://www.mapillary.com/developer)


# Development Notes

The project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

Release versions follow [Semantic Versioning](https://semver.org/).

## Unit Tests

Unit tests are built with [Vitest](https://vitest.dev/),
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro),
and [Enzyme](https://github.com/airbnb/enzyme).

Use `npm run test` to run them in watch mode.

## Linting and formatting

Run `npm run format` to format your code. Run `npm run lint` to check for lint
errors (`npm run lint -- --fix` will fix any lint errors that can be corrected
automatically).

Pull requests are run through a CI (Continuous Integration) process that checks
to make sure that code is formatted correctly and that there are no linting
errors. You can run `npm run check` to apply these same checks locally. This
will check to make sure your code is formatted correctly and passes the linter,
but won't make any changes in the event that it isn't (it will just report an
error).

If you want, you can enable a pre-commit hook to check for linting and formatting
issues automatically when you run `git commit`. To enable the check, run this
command in the root of the repository:

```
git config core.hooksPath hooks
```

This configures Git to use the hook scripts in the `hooks/` directory. The
`pre-commit` script there is run when Git prepares a commit. That script runs
`npm run check` to ensure there are no linting or formatting errors.

If you want to skip the check for a particular commit (for work-in-progress commits
for example), run `git commit --no-verify`.

## CSS Styling and Naming

We are using SASS and [Tailwind CSS](https://tailwindcss.com) with PostCSS.

Tailwind configuration is controlled with the `src/tailwind.config.js` file.
New CSS classes can be found in `src/styles/`

## Internationalization, Localization, and Translation

Internationalization and localization is performed via
[react-intl](https://github.com/yahoo/react-intl/wiki). Most components feature
co-located Messages.js files that contain messages intended for display,
along with default (U.S. English) versions of each message.

A fresh en-US.json file can be built from the latest messages using `npm run
build-intl`, which is also run automatically as part of the `npm run build` script
used for creating production builds.

Translations for other locales are managed through
[transifex](https://www.transifex.com/maproulette/maproulette3), who kindly provides
us with free service through their Open Source program. Translation files are
pulled into the code repository from time to time and stored in the `lang/`
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
