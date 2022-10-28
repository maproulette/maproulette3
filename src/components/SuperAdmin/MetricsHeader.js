import React from "react"
import { FormattedMessage, injectIntl } from "react-intl"
import SearchBox from "../SearchBox/SearchBox"
import WithCommandInterpreter from "../HOCs/WithCommandInterpreter/WithCommandInterpreter"
import messages from './Messages'
import WithChallengeSearch from "../HOCs/WithSearch/WithChallengeSearch"
import SortChallengesSelector from "../ChallengePane/ChallengeFilterSubnav/SortChallengesSelector"
import FilterByDifficulty from "../ChallengePane/ChallengeFilterSubnav/FilterByDifficulty"
import FilterByKeyword from "../ChallengePane/ChallengeFilterSubnav/FilterByKeyword"

const CommandSearchBox = WithCommandInterpreter(SearchBox)
const MetricsHeader = (props) => {

  const handleTabToggle = (e) => {
    console.log(e.target.innerHTML.toLowerCase())
    props.setCurrentTab(e.target.innerHTML.toLowerCase())
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
              onClick={handleTabToggle}
            >
              <FormattedMessage {...messages.challengeLabel} />
            </button>
            <button
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
              onClick={handleTabToggle}
            >
              <FormattedMessage {...messages.projectLabel} />
            </button>
            <button
              className="mr-button mr-button--dark mr-button--small mr-mr-4"
              onClick={handleTabToggle}
            >
              <FormattedMessage {...messages.userLabel} />
            </button>
          </div>
          {props.currentTab !== 'user' && <>
            <SortChallengesSelector {...props} />
            <FilterByKeyword {...props} />
            <FilterByDifficulty {...props} />
          </>}
          {/* <CommandSearchBox
            {...props}
            className="mr-h-12 mr-ml-auto"
            placeholder='placeholder' 
            showSearchTypeFilter
            setSearch={props.setSearch}
          /> */}
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