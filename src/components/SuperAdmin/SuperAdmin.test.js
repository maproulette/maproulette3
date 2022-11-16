import '@testing-library/jest-dom'
import * as React from 'react'
import { SuperAdminPane } from './SuperAdmin'
import DashboardFilterToggle from '../AdminPane/Manage/DashboardFilterToggle/DashboardFilterToggle'

describe("SuperAdminPane", () => {
  it("redirects to Sign In if no user data", () => {
    const { getByText } = global.withProvider(
      <SuperAdminPane location={{}}  dashboardEntityFilters = {{visible: null, archived: null}}/>
    );
    const text = getByText("Sign in");
    expect(text).toBeInTheDocument();
  });

  it("grants super user access to Metrics page", () => {
    const VisibleFilterToggle = DashboardFilterToggle("challenge", "visible");
    const archivedFilterToggle = DashboardFilterToggle("challenge", "archived");
    const { getByText } = global.withProvider(
      <SuperAdminPane 
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
        location={{}}
        filterName={{visible: null, archived: null}}
        showingFilter={() => null}
        setSearch={() => null}
        clearSearch={() => null}
        setSearchSort={() => null}
        setKeywordFilter={() => null}
        removeSearchFilters={() => null}
        setSearchFilters={() => null}
        allUsers={{}}
        dashboardEntityFilters = {{visible: null}}
        toggleEntityFilter={() => null} 
        filterToggleLabel={null}
      />
    );

    const text = getByText("Metrics");
    expect(text).toBeInTheDocument();
  });
});
