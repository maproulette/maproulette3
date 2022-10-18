import React from "react"
import { FormattedMessage } from "react-intl"
import SearchBox from "../SearchBox/SearchBox"
import WithCommandInterpreter from "../HOCs/WithCommandInterpreter/WithCommandInterpreter"
import messages from './Messages'

const MetricsHeader = (props) => {
const CommandSearchBox = WithCommandInterpreter(SearchBox)
  return (
    <header className="mr-bg-black-10 mr-shadow mr-py-4 lg:mr-py-0 mr-px-6 mr-hidden lg:mr-flex mr-items-center mr-justify-between">
      <div className="mr-flex-grow mr-flex mr-items-center mr-justify-between lg:mr-justify-start">
        <h1 className="mr-hidden xl:mr-flex mr-text-3xl mr-leading-tight mr-font-normal mr-mr-6">
          <FormattedMessage {...messages.header} />
        </h1>

        <div className="mr-flex mr-items-center">
          <button>Challenge</button>
          <button>Project</button>
          <button>User</button>
          <CommandSearchBox
            {...props}
            className="mr-h-12"
            placeholder='placeholder'
            setSearch={props.setSearch}
          />
        </div>
      </div>
    </header>
  )
}

export default MetricsHeader