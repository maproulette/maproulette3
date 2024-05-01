import React, {useEffect} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import External from '../../External/External'
import Modal from '../../Modal/Modal'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import messages from './Messages'

/**
 * SharedFiltersModal provides a modal overlay and UI to enable use of task and other filter settings
 * across workspace contexts. It consumes props from the WithSavedFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string. URL filter strings are 
 * currently consumed by the challenge "Create and Manage" view as well as the Task Review tables.
 * Filter sharing enabled via this modal will function in both of those workspace contexts.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */



function SharedFiltersModal({managingSharedFilterSettings, cancelManagingSharedFilterSettings, ...props}) {
  const history = useHistory()
  const currentSearchString = history.location.search
  const pathname = history.location.pathname

  const listSearches = _map(_keys(props.challengeAdminFilters), (search, index) => {
    const adminSearchURL = props.challengeAdminFilters[search]
    const adminParams = new URLSearchParams(adminSearchURL)

    if(adminParams.has("filters.taskPropertySearch")) return (
      <li key={search + "-" + index}>
        <a onClick={() => {
            let currentSearchParams = new URLSearchParams(currentSearchString)
            if(currentSearchParams.has("filters.taskPropertySearch")) currentSearchParams.delete("filters.taskPropertySearch")
            const taskPropertySearchValue = adminParams.get("filters.taskPropertySearch")
            currentSearchParams.append("filters.taskPropertySearch", taskPropertySearchValue)
            const newSearchString = currentSearchParams.toString()
            history.push({
              pathname,
              search: newSearchString,
              state: {refresh: true}
            })
            cancelManagingSharedFilterSettings()
          }
        } title={adminSearchURL}>
          {search}
        </a>
      </li>
    )
  })
  
  return (
    <React.Fragment>
      <External>
        <Modal isActive={managingSharedFilterSettings} onClose={cancelManagingSharedFilterSettings} narrow allowOverflow>
          <div className='mr-space-y-6'>
            <div className='mr-max-w-sm'>  
              <h3 className="mr-text-yellow mr-mb-4">
                <FormattedMessage {...messages.sharedFiltersModalTitle} />
              </h3>
              <div className='mr-space-y-3'>
                <p className='mr-text-base'>
                  <FormattedMessage {...messages.sharedFiltersModalDescription} />
                </p>
                <p className='mr-text-sm'>
                  <FormattedMessage {...messages.sharedFiltersModalSubDescription} />
                </p>


                </div>
            </div>
            <div className='mr-space-y-1 mr-p-4'>
              <ul>
                {listSearches}
              </ul>
            </div>
          </div>
          <button
            className="mr-button mr-col-span-2 mr-mt-8"
            onClick={cancelManagingSharedFilterSettings}
          >
            <FormattedMessage {...messages.doneLabel} />
          </button>
        </Modal>
      </External>
    </React.Fragment>
  )
}

export default SharedFiltersModal