# Getting Started

This is a new front-end for MapRoulette built on React. The back-end (scala)
server from the [maproulette2](https://github.com/maproulette/maproulette2)
project is still required.

> Note: because of the oauth authentication workflow, your dev machine must be
> publicly accessible to the Open Street Map (OSM) servers in order to login to
> the app. You may wish to setup an open-source tunneling server like
> [go-http-tunnel](https://github.com/mmatczuk/go-http-tunnel) or use a
> commercial service like ngrok.

1. Create a `.env.development.local` file and set `REACT_APP_BASE_PATH='/mr3'`
   and `REACT_APP_URL='https://maproulette.mydevserver.com/mr3'` (substituting
   your dev domain, of course) and
   `REACT_APP_MAP_ROULETTE_SERVER_URL='https://maproulette.mydevserver.com'`.
   If you wish to use Mapbox maps, set the `REACT_APP_MAPBOX_ACCESS_TOKEN` to
   your API token. If you want some debug output, set `REACT_APP_DEBUG='enabled'`.
   Override any other settings from the `.env` file as needed or desired.

2. `yarn` to fetch and install NPM modules.

3. `yarn run start` to fire up the front-end server.

4. Visit your [Open Street Map account](https://www.openstreetmap.org) and go
   to My Settings -> oauth settings -> Register your application and setup a
   new application for development. For the `Main Application URL` and
   `Callback URL` settings, put in your dev server URL (e.g.
   `https://maproulette.mydevserver.com`). Take note of your new app's consumer
   key and secret key, as you'll need them in the next step.

5. Fire up your backend scala server (installed separately), setting the
   `MR_OAUTH_CONSUMER_KEY` and `MR_OAUTH_CONSUMER_SECRET` environment variables
   to your OSM app's consumer key and secret key, respectively. The back-end
   server assumes your front-end dev server is running on port 3000, which is
   the default; if you've changed the port, you'll also need to set
   `MR3_JS_ASSET_URI=https://localhost:<port>/static/js/bundle.js` (replacing
   <port> with the proper port) and
   `MR3_CSS_ASSET_URI=https://localhost:<port>/static/css/bundle.css`.

6. Point your browser at /mr3 on your server (e.g.
   `https://maproulette.mydevserver.com/mr3`) to bring up the front-end.


### Staging/Production build:

Setup a `.env.production` file with the desired production setting overrides.
`yarn run build` to create a minified front-end tarball.

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


# Development

> Note: this project was bootstrapped with
> [Create React App](https://github.com/facebookincubator/create-react-app).
> The create-react-app user guide contains a lot of info about general project
> setup and configuration.


## CSS Styling

The app uses [Sass/scss](http://sass-lang.com/) in combination with the
[Bulma](https://bulma.io) framework. The [BEM](http://getbem.com/introduction/)
methodology has been loosely used as a guide for CSS class naming.

The [node-sass-chokidar](https://www.npmjs.com/package/node-sass-chokidar)
package is used for compiling the .scss files into .css, which are then imported
into the components (the .css files are not added to source control). It's
run automatically as part of the yarn start and build scripts, so there's no need
to run it separately.

The `src/theme.scss` includes global sass variables (like colors), some Bulma
variable overrides, and a few class customizations. You'll note that it's
included in many of the .scss files to get access to the variables.

## Testing

Jest + Enzyme is being used for tests. `yarn test` to run them.
