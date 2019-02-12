import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import fr from 'react-intl/locale-data/fr'
import es from 'react-intl/locale-data/es'
import de from 'react-intl/locale-data/de'
import af from 'react-intl/locale-data/af'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import { Router } from 'react-router-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import PiwikReactRouter from 'piwik-react-router'
import _isEmpty from 'lodash/isEmpty'
import App from './App';
import BusySpinner from './components/BusySpinner/BusySpinner'
import { initializePersistedStore } from './PersistedStore'
import { extendedFind, fetchPreferredChallenges } from './services/Challenge/Challenge'
import { ChallengeStatus } from './services/Challenge/ChallengeStatus/ChallengeStatus'
import { SortOptions, RESULTS_PER_PAGE } from './services/Search/Search'
import { ensureUserLoggedIn, fetchSavedChallenges }
       from './services/User/User'
import { setCheckingLoginStatus,
         clearCheckingLoginStatus } from './services/Status/Status'
import WithUserLocale from './components/HOCs/WithUserLocale/WithUserLocale'
import './theme.scss'
import './index.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

addLocaleData([...en, ...fr, ...es, ...de, ...af, ...ja, ...ko])

/** Attach user's current locale to react-intl IntlProvider */
const ConnectedIntl = WithUserLocale(props => (
  <IntlProvider key={props.locale} locale={props.locale} messages={props.messages}>
    {props.children}
  </IntlProvider>
))

const {store} = initializePersistedStore(function(store) {
  store.dispatch(setCheckingLoginStatus())

  // Load current user if there is an active session
  store.dispatch(
    ensureUserLoggedIn(true)
  ).then(userId => {
    store.dispatch(fetchSavedChallenges(userId))
  }).then(() =>
    store.dispatch(clearCheckingLoginStatus())
  ).catch(() => store.dispatch(clearCheckingLoginStatus()))

  store.dispatch(fetchPreferredChallenges())
  
  // Seed our store with some currently popular challenges.
  store.dispatch(
    extendedFind({sortCriteria: {sortBy: SortOptions.popular},
                  challengeStatus: [ChallengeStatus.ready,
                    ChallengeStatus.partiallyLoaded,
                    ChallengeStatus.none,
                    ChallengeStatus.empty]}, RESULTS_PER_PAGE)
  )

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
      <ConnectedIntl>
        <Router history={routerHistory}>
          <App />
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
