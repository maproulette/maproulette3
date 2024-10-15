import { vi } from "vitest";
import "@testing-library/jest-dom";
import { Fragment } from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { render as rtlRender } from "@testing-library/react";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { initializeStore } from "./PersistedStore";

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// Make Enzyme functions available in all test files without importing
global.shallow = shallow;
global.render = render;
global.mount = mount;
global.scrollTo = vi.fn();

// React testing library methods
const reduxStore = initializeStore();
const routerHistory = createBrowserHistory();

global.withProvider = (
  ui,
  { store = reduxStore, ...renderOptions } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Fragment>
        <Provider store={store}>
          <IntlProvider locale="en">
            <Router history={routerHistory}>{children}</Router>
          </IntlProvider>
        </Provider>
        <div id="external-root"></div>
      </Fragment>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

vi.mock('@rjsf/core/lib/components/widgets/SelectWidget', () => ({
  __esModule: true,
}));

vi.mock('@rjsf/core/lib/components/widgets/SelectWidget', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('@rjsf/core/lib/components/widgets/TextWidget', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('@rjsf/core/lib/components/widgets/CheckboxWidget', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/json', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/hljs/agate', () => ({
  __esModule: true,
  default: {
    hljs: {
      background: ""
    }
  }
}));

vi.mock('react-syntax-highlighter', () => ({
  Light: {
    registerLanguage: () => null
  }
}))

vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/xml', () => ({
  __esModule: true,
  default: {
    xmlLang: ""
  }
}));

vi.mock('@nivo/bar', () => ({
  __esModule: true,
  ResponsiveBar: () => null
}));
