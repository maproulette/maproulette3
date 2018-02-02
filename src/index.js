import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import { BrowserRouter as Router } from 'react-router-dom'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _isNumber from 'lodash/isNumber'
import _isEmpty from 'lodash/isEmpty'
import messages from './lang/en.json'
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
import { clearErrors } from './services/Error/Error'
import { clearKeyboardShortcuts }
       from './services/KeyboardShortcuts/KeyboardShortcuts'
import { setCheckingLoginStatus,
         clearCheckingLoginStatus,
         clearFetchingChallenges } from './services/Status/Status'
import './theme.css'
import './index.css'
import '../node_modules/leaflet.markercluster/dist/MarkerCluster.css'
import '../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css'

addLocaleData([...en])

const configFromServer = window.mr3Config
const {store} = initializePersistedStore((store) => {
  store.dispatch(clearErrors())
  store.dispatch(clearKeyboardShortcuts())
  store.dispatch(setCheckingLoginStatus())
  store.dispatch(clearFetchingChallenges())

  // Fetch initial data to initialize app
  const categoryKeywords = _keys(ChallengeCategoryKeywords).join(',')

  // Load current user. Look first for config from server, but if that's not
  // found then ensure user id from last session (if any) is still logged in.
  let currentUserId = parseInt(_get(configFromServer, 'userId'), 10)
  if (!_isNumber(currentUserId) || isNaN(currentUserId) ||
      currentUserId === GUEST_USER_ID) {
    // If there's a current user from the last session, let's refresh their
    // user data and preferences (which will also ensure they're still logged
    // in with the server).
    currentUserId = _get(store.getState(), 'currentUser.userId')
  }

  if (_isNumber(currentUserId) && currentUserId !== GUEST_USER_ID) {
    store.dispatch(
      loadCompleteUser(currentUserId)
    ).then(() =>
      store.dispatch(clearCheckingLoginStatus())
    )

    // Perform requests requiring an authenticated user.
    store.dispatch(fetchChallengeActions())
  }
  else {
    store.dispatch(clearCheckingLoginStatus())
  }

  // Seed our store with some challenges.
  store.dispatch(fetchFeaturedChallenges())
  store.dispatch(fetchChallengesWithKeywords(categoryKeywords))
  store.dispatch(fetchEnabledChallenges(100))

  // Seed our store with projects
  store.dispatch(fetchProjects())

  // Render the app
  ReactDOM.render(
    <IntlProvider locale="en" messages={messages}>
      <Provider store={store}>
        <Router basename={!_isEmpty(process.env.REACT_APP_BASE_PATH) ?
                          process.env.REACT_APP_BASE_PATH :
                          undefined}>
          <App initialUserId={currentUserId} />
        </Router>
      </Provider>
    </IntlProvider>,
    document.getElementById('root')
  )
})

if (!_isEmpty(process.env.REACT_APP_TITLE)) {
  document.title = process.env.REACT_APP_TITLE
}

// render a loading pane.
ReactDOM.render(
  <h1 className='title has-text-centered'>Loading <BusySpinner /></h1>,
  document.getElementById('root')
)

if (!_isEmpty(process.env.REACT_APP_DEBUG) &&
    process.env.REACT_APP_DEBUG !== 'disabled') {
  // eslint-disable-next-line
  store.subscribe(() => {
    console.log('')
    console.log('Store updated:')
    console.log(store.getState())
  })
}
