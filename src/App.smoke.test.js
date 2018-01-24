import React from 'react'
import ReactDOM from 'react-dom'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { IntlProvider } from 'react-intl'
import App from './App'

const mockStore = configureStore()

// Basic smoke test of the app
it('renders without crashing', () => {
  const store = mockStore({})
  const div = document.createElement('div')
  ReactDOM.render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    </IntlProvider>,
    div
  )
})
