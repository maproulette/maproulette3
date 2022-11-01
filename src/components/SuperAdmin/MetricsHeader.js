import React from "react"
import { FormattedMessage, injectIntl } from "react-intl"
import SearchBox from "../SearchBox/SearchBox"
import messages from './Messages'
import SortChallengesSelector from "../ChallengePane/ChallengeFilterSubnav/SortChallengesSelector"
import FilterByDifficulty from "../ChallengePane/ChallengeFilterSubnav/FilterByDifficulty"
import FilterByKeyword from "../ChallengePane/ChallengeFilterSubnav/FilterByKeyword"

const MetricsHeader = (props) => {

  const handleTabToggle = (val) => {
    props.setCurrentTab(val)
  }

  return (
    <header className="mr-bg-black-10 mr-shadow mr-py-4 lg:mr-py-0 mr-px-6 mr-hidden lg:mr-flex mr-items-center mr-justify-between">
      <div className="mr-flex-grow mr-flex mr-items-center mr-justify-between lg:mr-justify-start">
        <h1 className="mr-hidden xl:mr-flex mr-text-3xl mr-leading-tight mr-font-normal mr-mr-6">
          <FormattedMessage {...messages.header} />
        </h1>
        <div className="mr-flex mr-items-center">
          <div className="admin__manage__controls mr-flex">
            <button
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
              onClick={() => handleTabToggle('challenge')}
            >
              <FormattedMessage {...messages.challengeLabel} />
            </button>
            <button
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
              onClick={() => handleTabToggle('project')}
            >
              <FormattedMessage {...messages.projectLabel} />
            </button>
            <button
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
              onClick={() => handleTabToggle('user')}
            >
              <FormattedMessage {...messages.userLabel} />
            </button>
          </div>
          {props.currentTab === 'challenge' && <>
            <SortChallengesSelector {...props} />
            <FilterByKeyword {...props} />
            <FilterByDifficulty {...props} />
          </>}
          <SearchBox 
            {...props}
            setSearch={props.setSearch}
          />
        </div>
      </div>
    </header>
  )
}

export default injectIntl(MetricsHeader)
