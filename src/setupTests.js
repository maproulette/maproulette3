import "@testing-library/jest-dom"
import React from 'react';
import Enzyme, { shallow, render, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { render as rtlRender } from "@testing-library/react";
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { initializeStore } from './PersistedStore'

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() })

// Make Enzyme functions available in all test files without importing
global.shallow = shallow
global.render = render
global.mount = mount

// React testing library methods
const reduxStore = initializeStore()

global.withProvider = (
    ui,
    {
      initialState,
      store = reduxStore,
      ...renderOptions
    } = {}
  ) => {
    function Wrapper({ children }) {
      return (
        <Provider store={store}>
          <IntlProvider locale="en">{children}</IntlProvider>
        </Provider>
      )
    }
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
  } 
