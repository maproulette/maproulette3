import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import { createBrowserHistory } from "history";
import _isEmpty from "lodash/isEmpty";
import PiwikReactRouter from "piwik-react-router";
import ReactDOM from "react-dom";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import App from "./App";
import { initializeStore } from "./PersistedStore";
import WithUserLocale from "./components/HOCs/WithUserLocale/WithUserLocale";
import { fetchPreferredChallenges, performChallengeSearch } from "./services/Challenge/Challenge";
import { setCompleteSearch } from "./services/Search/Search";
import { popFetchChallenges, pushFetchChallenges } from "./services/Status/Status";
import { clearCheckingLoginStatus, setCheckingLoginStatus } from "./services/Status/Status";
import {
  ensureUserLoggedIn,
  fetchSavedChallenges,
  fetchUserNotifications,
  subscribeToUserUpdates,
} from "./services/User/User";
import "./theme.scss";
import "./styles/index.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Setup Apollo graphql client
const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: window.env.REACT_APP_MAP_ROULETTE_SERVER_GRAPHQL_URL,
    credentials: "include",
  }),
});

// Setup the router history object separately so that it can be integrated
// with 3rd-party libraries. If the user has configured Matomo/PIWIK for
// analytics, we'll hook it up here.
let routerHistory = createBrowserHistory({
  basename: !_isEmpty(window.env.REACT_APP_BASE_PATH) ? window.env.REACT_APP_BASE_PATH : undefined,
});

if (!_isEmpty(window.env.REACT_APP_MATOMO_URL) && !_isEmpty(window.env.REACT_APP_MATOMO_SITE_ID)) {
  const piwik = PiwikReactRouter({
    url: window.env.REACT_APP_MATOMO_URL,
    siteId: window.env.REACT_APP_MATOMO_SITE_ID,
  });

  routerHistory = piwik.connectToHistory(routerHistory);
}

// Attach user's current locale to react-intl IntlProvider
const ConnectedIntl = WithUserLocale((props) => (
  <IntlProvider
    key={props.locale}
    locale={props.locale}
    messages={props.messages}
    textComponent="span"
  >
    {props.children}
  </IntlProvider>
));

// Setup the redux store
const store = initializeStore();

const queryClient = new QueryClient();

// Start with a default challenge search so users can easily 'load more'
// results if desired
const defaultSearch = {};
store.dispatch(setCompleteSearch("challenges", defaultSearch));

// Check if the user is already logged in
store.dispatch(setCheckingLoginStatus());
store
  .dispatch(ensureUserLoggedIn(true))
  .then((userId) => {
    store.dispatch(fetchSavedChallenges(userId));
    store.dispatch(fetchUserNotifications(userId));
    subscribeToUserUpdates(store.dispatch, userId);
  })
  .catch((error) => console.log(error))
  .then(() => store.dispatch(clearCheckingLoginStatus()));

// Seed our store with some challenges
store.dispatch(pushFetchChallenges(-1));
store
  .dispatch(
    fetchPreferredChallenges(5), // 5 each of new, popular, and featured
  )
  .then(() => {
    store.dispatch(performChallengeSearch(defaultSearch));
  })
  .catch((error) => console.log(error))
  .then(() => store.dispatch(popFetchChallenges(-1)));

// Render the app
ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ApolloProvider client={graphqlClient}>
        <ConnectedIntl>
          <Router history={routerHistory}>
            <App />
          </Router>
        </ConnectedIntl>
      </ApolloProvider>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
  document.getElementById("root"),
);

if (!_isEmpty(window.env.REACT_APP_TITLE)) {
  document.title = window.env.REACT_APP_TITLE;
}

if (window.env.REACT_APP_DEBUG === "enabled") {
  // eslint-disable-next-line
  store.subscribe(() => {
    console.log("");
    console.log("Store updated:");
    console.log(store.getState());
  });
}
