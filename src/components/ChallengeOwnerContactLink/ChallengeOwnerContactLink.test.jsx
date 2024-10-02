import "@testing-library/jest-dom";
import { IntlProvider } from "react-intl";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ChallengeOwnerContactLinkInternal as ContactLink } from "./ChallengeOwnerContactLink";

const generateMockTask = (id, challengeOwnerId) => {
  return {
    parent: {
      owner: id,
      parent: {
        owner: challengeOwnerId,
      },
    },
  };
};

const fetchOSMUserSuccess = () =>
  new Promise((resolve) => {
    resolve({
      displayName: "John",
      username: "jdoe",
    });
  });

describe("ChallengeOwnerContactLinkInternal", () => {
  it("doesn't break if only required props are provided", () => {
    const { getByText } = render(
      <IntlProvider locale="en">
        <ContactLink fetchOSMUser={() => null} />
      </IntlProvider>
    );
    const text = getByText("Contact Challenge Owner");
    expect(text).toBeInTheDocument();
  });

  it("renders a link to OSM if a contactUrl is generated, and resets if the task data changes", async () => {
    const { rerender } = render(
      <IntlProvider locale="en">
        <ContactLink
          task={generateMockTask(1)}
          fetchOSMUser={fetchOSMUserSuccess}
        />
      </IntlProvider>
    );

    fireEvent.click(screen.getByText("Contact Challenge Owner"));

    await waitFor(() => {
      expect(screen.getByText("Message John through OSM")).toBeInTheDocument();
    });

    rerender(
      <IntlProvider locale="en">
        <ContactLink
          task={generateMockTask(2)}
          fetchOSMUser={fetchOSMUserSuccess}
        />
      </IntlProvider>
    );

    expect(screen.getByText("Contact Challenge Owner")).toBeInTheDocument();
  });

  it("calls addError if task owner not found", () => {
    const addError = jest.fn();

    render(
      <IntlProvider locale="en">
        <ContactLink
          fetchOSMUser={() => null}
          task={generateMockTask(0)}
          addError={addError}
        />
      </IntlProvider>
    );

    fireEvent.click(screen.getByText("Contact Challenge Owner"));

    expect(addError).toHaveBeenCalledTimes(1);
  });

  it("resets component if fetchOSMUser rejects", async () => {
    const fetchOSMUserFail = () =>
      new Promise((resolve, reject) => {
        reject({
          message: "error",
        });
      });

    render(
      <IntlProvider locale="en">
        <ContactLink
          fetchOSMUser={fetchOSMUserFail}
          task={generateMockTask(1)}
        />
      </IntlProvider>
    );

    fireEvent.click(screen.getByText("Contact Challenge Owner"));

    await waitFor(() => {
      expect(screen.getByText("Contact Challenge Owner")).toBeInTheDocument();
    });
  });

  it("renders a link to OSM if challenge owner id is missing, but project owner id is found", async () => {
    render(
      <IntlProvider locale="en">
        <ContactLink
          task={generateMockTask(undefined, 1)}
          fetchOSMUser={fetchOSMUserSuccess}
        />
      </IntlProvider>
    );

    fireEvent.click(screen.getByText("Contact Challenge Owner"));

    await waitFor(() => {
      expect(screen.getByText("Message John through OSM")).toBeInTheDocument();
    });
  });
});
