import "@testing-library/jest-dom";
import { formatTitle, VITE_TITLE } from "./Head";

describe("formatTitle", () => {
  it("doesn't break if no path is provided", () => {
    const title = formatTitle();
    expect(title).toBe(undefined);
  });

  it("returns App title", () => {
    const title = formatTitle({ match: { path: "/" } });
    expect(title).toBe(VITE_TITLE);
  });

  it("replaces route ids appropriately", () => {
    const title = formatTitle({
      user: {
        osmProfile: {
          displayName: "User"
        }
      },
      challenge: {
        name: "Bar"
      },
      project: {
        displayName: "Project Name"
      },
      match: { 
        path: "/foo/:challengeId/:projectId/:countryCode/:userId/:taskId/:showType",
        params: {
          taskId: 2,
          countryCode: 3,
          showType: 5
        }
      } 
    });
    expect(title).toBe('5 - 2 - User - 3 - Project Name - Bar - Foo - ' + VITE_TITLE);
  });
});