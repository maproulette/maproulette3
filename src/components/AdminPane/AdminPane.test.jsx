import "@testing-library/jest-dom";
import { AdminPane } from "./AdminPane";

describe("AdminPane", () => {
  it("renders Admin Pane with message to provide email for new user", () => {
    const { getByText } = global.withProvider(
      <AdminPane user={{ isLoggedIn: true, id: 1 }} location={{}} />
    );
    const text = getByText("Please provide your email so mappers can contact you with any feedback.");
    expect(text).toBeInTheDocument();
  });

  it("renders admin container with spinner", () => {
    const { container } = global.withProvider(
      <AdminPane user={{ isLoggedIn: false }} location={{}} checkingLoginStatus={true} />
    );

    expect(container.firstChild.classList["0"]).toBe("admin");
    expect(container.firstChild.firstChild.classList["0"]).toBe("busy-spinner");
  });
});