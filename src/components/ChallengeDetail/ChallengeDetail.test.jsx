import "@testing-library/jest-dom";
import { IntlProvider } from "react-intl";
import { render } from "@testing-library/react";
import { ChallengeDetail } from "./ChallengeDetail.js";
import { format } from "date-fns";

describe("ChallengeDetail", () => {
  it("doesn't break if only required props are provided", () => {
    const { getByText } = render(
      <IntlProvider locale="en">
        <ChallengeDetail match={{ url: "", params: {} }} />
        <div>Test Passes</div>
      </IntlProvider>
    );
    const text = getByText("Test Passes");
    expect(text).toBeInTheDocument();
  });

  it('renders public challenge page when user is not logged in', () => {
    const { queryByText } = global.withProvider(
      <ChallengeDetail
        match={{ url: '', params: {} }}
        history={{ location: { pathname: '', search: '' } }}
        location={{ search: '' }}
        browsedChallenge={{
          id: 1,
          parent: { id: 2 },
          lastTaskRefresh: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          dataOriginDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx").slice(0, 10),
        }}
        owner={{ id: 2, osmProfile: { displayName: "Somebody" } }}
        intl={{
          formatMessage: () => '',
          formatDate: () => '',
        }}
      />
    )
    const text = queryByText('Sign in to participate')
    expect(text).toBeInTheDocument()
    const cloneText = queryByText('Clone Challenge')
    expect(cloneText).not.toBeInTheDocument()
  })

  it('renders clone challenge button for discoverable challenge', () => {
    const { getByText } = global.withProvider(
      <ChallengeDetail
        checkingLoginStatus={false}
        user={{
          isLoggedIn: true,
          id: 1,
        }}
        match={{ url: '', params: {} }}
        history={{ location: { pathname: '', search: '' } }}
        location={{ search: '' }}
        browsedChallenge={{
          id: 1,
          parent: { id: 2 },
          lastTaskRefresh: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          dataOriginDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx").slice(0, 10),
          enabled: true,
        }}
        owner={{ id: 2, osmProfile: { displayName: "Somebody" } }}
        intl={{
          formatMessage: () => '',
          formatDate: () => '',
        }}
      />
    )
    const cloneText = getByText('Clone Challenge')
    expect(cloneText).toBeInTheDocument()
  })
});
