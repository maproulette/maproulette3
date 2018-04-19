import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import fr from 'react-intl/locale-data/fr'
import es from 'react-intl/locale-data/es'
import de from 'react-intl/locale-data/de'
import af from 'react-intl/locale-data/af'
import { Router } from 'react-router-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import PiwikReactRouter from 'piwik-react-router'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _isFinite from 'lodash/isFinite'
import _isEmpty from 'lodash/isEmpty'
import App from './App';
import BusySpinner from './components/BusySpinner/BusySpinner'
import { initializePersistedStore } from './PersistedStore'
import { fetchProjects } from './services/Project/Project'
import { fetchFeaturedChallenges,
         fetchChallengesWithKeywords,
         fetchEnabledChallenges,
         fetchChallengeActions } from './services/Challenge/Challenge'
import { ChallengeCategoryKeywords }
       from './services/Challenge/ChallengeKeywords/ChallengeKeywords'
import { loadCompleteUser, GUEST_USER_ID } from './services/User/User'
import { setCheckingLoginStatus,
         clearCheckingLoginStatus } from './services/Status/Status'
import WithUserLocale from './components/HOCs/WithUserLocale/WithUserLocale'
import './theme.css'
import './index.css'
import '../node_modules/leaflet.markercluster/dist/MarkerCluster.css'
import '../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css'

addLocaleData([...en, ...fr, ...es, ...de, ...af])

/** Attach user's current locale to react-intl IntlProvider */
const ConnectedIntl = WithUserLocale(props => (
  <IntlProvider key={props.locale} locale={props.locale} messages={props.messages}>
    {props.children}
  </IntlProvider>
))

const configFromServer = window.mr3Config
const {store} = initializePersistedStore((store) => {
  store.dispatch(setCheckingLoginStatus())

  // Fetch initial data to initialize app
  const categoryKeywords = _keys(ChallengeCategoryKeywords).join(',')

  // Load current user. Look first for config from server, but if that's not
  // found then ensure user id from last session (if any) is still logged in.
  let currentUserId = parseInt(_get(configFromServer, 'userId'), 10)
  if (!_isFinite(currentUserId) || currentUserId === GUEST_USER_ID) {
    // If there's a current user from the last session, let's refresh their
    // user data and preferences (which will also ensure they're still logged
    // in with the server).
    currentUserId = _get(store.getState(), 'currentUser.userId')
  }

  if (_isFinite(currentUserId) && currentUserId !== GUEST_USER_ID) {
    store.dispatch(
      loadCompleteUser(currentUserId)
    ).then(() => store.dispatch(clearCheckingLoginStatus()))
  }
  else {
    store.dispatch(clearCheckingLoginStatus())
  }

  // Fetch all challenge actions, which will include a count of available
  // tasks so we can tell which challenges are already complete.
  store.dispatch(fetchChallengeActions())

  // Seed our store with some challenges.
  store.dispatch(fetchFeaturedChallenges())
  store.dispatch(fetchChallengesWithKeywords(categoryKeywords))
  store.dispatch(fetchEnabledChallenges(100))

  // Seed our store with projects
  store.dispatch(fetchProjects())

  // Setup the router history object separately so that it can be integrated
  // with 3rd-party libraries. If the user has configured Matomo/PIWIK for
  // analytics, we'll hook it up here.
  let routerHistory = createBrowserHistory({
    basename: !_isEmpty(process.env.REACT_APP_BASE_PATH) ?
              process.env.REACT_APP_BASE_PATH :
              undefined,
  })

  if (!_isEmpty(process.env.REACT_APP_MATOMO_URL) &&
      !_isEmpty(process.env.REACT_APP_MATOMO_SITE_ID)) {
    const piwik = PiwikReactRouter({
      url: process.env.REACT_APP_MATOMO_URL,
      siteId: process.env.REACT_APP_MATOMO_SITE_ID
    })

    routerHistory = piwik.connectToHistory(routerHistory)
  }

  // Render the app
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedIntl {...this.props}>
        <Router history={routerHistory}>
          <App initialUserId={currentUserId} />
        </Router>
      </ConnectedIntl>
    </Provider>,
    document.getElementById('root')
  )
})

if (!_isEmpty(process.env.REACT_APP_TITLE)) {
  document.title = process.env.REACT_APP_TITLE
}

// render a loading pane.
ReactDOM.render(
  <div className='loading'>
    <div className='loading__content'>
      <h1 className='title has-text-centered'>Loading <BusySpinner /></h1>
    </div>
  </div>,
  document.getElementById('root')
)

if (process.env.REACT_APP_DEBUG === 'enabled') {
  // eslint-disable-next-line
  store.subscribe(() => {
    console.log('')
    console.log('Store updated:')
    console.log(store.getState())
  })
}
