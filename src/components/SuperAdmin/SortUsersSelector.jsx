import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { SORT_DEFAULT, USER_SORT_OPTIONS, sortLabels } from "../../services/Search/Search";
import ButtonFilter from "../ChallengePane/ChallengeFilterSubnav/ButtonFilter";
import Dropdown from "../Dropdown/Dropdown";
import messages from "./Messages";
/**
 * SortUsersSelector renders an unmanaged dropdown button that can be used
 * to modify the sort order of user results.
 */
export class SortUsersSelector extends Component {
  makeSelection = (option, closeDropdownMenu) => {
    this.props.setSearchSort({ sortBy: option });
    closeDropdownMenu();
  };

  render() {
    const localizedLabels = sortLabels(this.props.intl);
    const currentSortCriteria = this.props.searchSort?.sortBy;
    const activeLabel = currentSortCriteria
      ? localizedLabels[currentSortCriteria]
      : localizedLabels[SORT_DEFAULT];
    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        dropdownButton={(dropdown) => (
          <ButtonFilter
            type={<FormattedMessage {...messages.sortByLabel} />}
            selection={activeLabel}
            onClick={dropdown.toggleDropdownVisible}
          />
        )}
        dropdownContent={(dropdown) => (
          <ListSortItems
            sortLabels={localizedLabels}
            makeSelection={this.makeSelection}
            closeDropdown={dropdown.closeDropdown}
          />
        )}
      />
    );
  }
}

const ListSortItems = function (props) {
  const menuItems = _map(USER_SORT_OPTIONS, (sortByOption) => (
    <li key={sortByOption}>
      <a onClick={() => props.makeSelection(sortByOption, props.closeDropdown)}>
        {props.sortLabels[sortByOption]}
      </a>
    </li>
  ));

  return <ol className="mr-list-dropdown mr-list-dropdown--ruled">{menuItems}</ol>;
};

SortUsersSelector.propTypes = {
  /** Invoked to sort the challenges when a value is selected */
  setSearchSort: PropTypes.func.isRequired,
};

export default injectIntl(SortUsersSelector);
