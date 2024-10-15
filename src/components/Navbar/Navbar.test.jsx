import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { ProfileMenu } from "./Navbar";

describe("Profile Menu", () => {
  it("hides Metrics link if not super user", () => {
    const { getByText } = global.withProvider(
      <ProfileMenu
        user={{ id: 1, grants: [] }}
      />
    );
    const inboxText = getByText("Inbox");
    expect(inboxText).toBeInTheDocument();
    const text = screen.queryByText('Super Admin Metrics')
    expect(text).not.toBeInTheDocument()
  });

  it("renders Metrics link if super user", () => {
    const { getByText } = global.withProvider(
      <ProfileMenu
        user={{ id: 1, grants: [{
          "id": 13,
          "name": "Super User Override",
          "grantee": {
            "granteeType": 5,
            "granteeId": 1
          },
          "role": -1,
          "target": {
            "objectType": 0,
            "objectId": 0
          }
        }] }}
      />
    );
    const text = getByText("Super Admin Settings");
    expect(text).toBeInTheDocument();
  });
});
