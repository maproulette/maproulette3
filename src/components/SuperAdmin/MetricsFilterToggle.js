import React from "react";
import { FormattedMessage } from "react-intl";
import messages from "./Messages";
const MetricsFilterToggle = (props) => {
  const filter = props.filterName
  return(
     <div className='mr-flex mr-leading-none'>
            <input
              type='checkbox'
              className='mr-checkbox-toggle mr-ml-4 mr-mr-1'
              checked={props.showingFilter}
              onChange={() => {
                props.setSearchFilters({ [filter]: !props.showingFilter })
              }}
            />
            <div className="mr-text-sm mr-mx-1"><FormattedMessage {...messages.archived} /></div>
          </div>
  )
}

export default MetricsFilterToggle