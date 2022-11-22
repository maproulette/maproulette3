import '@testing-library/jest-dom'
import * as React from 'react'
import { SuperAdminPane } from './SuperAdmin'
import { fireEvent } from "@testing-library/react";

const props = {
  user: {
    id: 1, grants: [{
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
    }]
  },
  location: {search: '?tab=challenges&searchType=challenges'},
  history: { push: () => null, location: { search: null } },
  match: {},
  clearSearchFilters: () => null,
  clearSearch: () => null,
  filterName: { visible: null, archived: null },
  showingFilter: () => null,
  setSearch: () => null,
  clearSearch: () => null,
  setSearchSort: () => null,
  setKeywordFilter: () => null,
  removeSearchFilters: () => null,
  setSearchFilters: () => null,
  allUsers: {},
  dashboardEntityFilters: { visible: null },
  toggleFilter: () => null,
  filterToggleLabel: null,
  projects: [],
  challenges: [{id: 1, name: 'challenge1', isArchived: true}, {id: 2, name: 'challenge2', isArchived: true}, {id: 3, name: 'challenge3', isArchived: false}]
}
describe("SuperAdminPane", () => {
  it("redirects to Sign In if no user data", () => {
    const { getByText } = global.withProvider(
      <SuperAdminPane location={props.location} match={props.match} clearSearchFilters={props.clearSearch} clearSearch={props.clearSearch} dashboardEntityFilters={props.dashboardEntityFilters} />
    );
    const text = getByText("Sign in");
    expect(text).toBeInTheDocument();
  });

  it("grants super user access to Metrics page", () => {
    const { getByText } = global.withProvider(
      <SuperAdminPane
        user={props.user}
        location={props.location}
        match={props.match}
        clearSearchFilters={props.clearSearchFilters}
        clearSearch={props.clearSearch}
        filterName={props.filterName}
        showingFilter={props.showingFilter}
        setSearch={props.setSearch}
        clearSearch={props.clearSearch}
        setSearchSort={props.setSearchSort}
        setKeywordFilter={props.setKeywordFilter}
        removeSearchFilters={props.removeSearchFilters}
        setSearchFilters={props.setSearchFilters}
        allUsers={props.allUsers}
        dashboardEntityFilters={props.dashboardEntityFilters}
        toggleFilter={props.toggleFilter}
        filterToggleLabel={props.filterToggleLabel}
      />
    );

    const text = getByText("Metrics");
    expect(text).toBeInTheDocument();
  });

  it("can switch tab", () => {
    const clearSearch = jest.fn()
    const { container } = global.withProvider(
      <SuperAdminPane
        user={props.user}
        location={props.location}
        match={props.match}
        clearSearchFilters={props.clearSearchFilters}
        clearSearch={props.clearSearch}
        filterName={props.filterName}
        showingFilter={props.showingFilter}
        setSearch={props.setSearch}
        clearSearch={() => clearSearch()}
        setSearchSort={props.setSearchSort}
        history={props.history}
        setKeywordFilter={props.setKeywordFilter}
        removeSearchFilters={props.removeSearchFilters}
        setSearchFilters={props.setSearchFilters}
        allUsers={props.allUsers}
        dashboardEntityFilters={props.dashboardEntityFilters}
        toggleFilter={props.toggleFilter}
        filterToggleLabel={props.filterToggleLabel}
      />
    );

    const element = Array.from(container.querySelectorAll('button'))
      .find(e => e.textContent === 'Projects');
    fireEvent.click(element);
    expect(clearSearch).toHaveBeenCalledTimes(1);
  });

  it("can toggle for challenge table", () => {
    const toggleFilter = jest.fn()
    const { container } = global.withProvider(
      <SuperAdminPane
        user={props.user}
        location={props.location}
        match={props.match}
        clearSearchFilters={props.clearSearchFilters}
        clearSearch={props.clearSearch}
        filterName={props.filterName}
        showingFilter={props.showingFilter}
        setSearch={props.setSearch}
        clearSearch={props.clearSearch}
        setSearchSort={props.setSearchSort}
        history={props.history}
        setKeywordFilter={props.setKeywordFilter}
        removeSearchFilters={props.removeSearchFilters}
        setSearchFilters={props.setSearchFilters}
        allUsers={props.allUsers}
        entityFilters = {{visible: true, archived: true, virtual: true}}
        toggleFilter={() => toggleFilter()}
        filterToggleLabel={props.filterToggleLabel}
        challenges={props.challenges}
      />
    );
    
    const element = container.querySelectorAll('input[type=checkbox]')[1]
    fireEvent.click(element);
    expect(toggleFilter).toHaveBeenCalledTimes(1)
  });
});
