import React, {useEffect, useMemo} from 'react'
import { FormattedMessage } from 'react-intl'
import External from '../../External/External'
import Modal from '../../Modal/Modal'
import { buildSearchURL,
  buildSearchCriteriafromURL }
from '../../../services/SearchCriteria/SearchCriteria'
import { getInitialTaskStatusFiltersByContext } from '../../../pages/Review/TasksReview/utils/taskStatusFiltersByReviewType'
import messages from './Messages'

/**
 * SharedFiltersModal provides a modal overlay and UI to enable use of task and other filter settings
 * across workspace contexts. It consumes props from the WithSavedFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string. URL filter strings are 
 * currently consumed by the challenge "Create and Manage" view as well as the Task Review tables.
 * Filter sharing enabled via this modal will function in both of those workspace contexts.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */

const formatFilterDisplayName = (name) =>  {
  return name.split(/(?=[A-Z])/).map(piece => {
    if(!/[A-Z]/.test(piece.charAt(0))) {
    return piece.charAt(0).toUpperCase() + piece.slice(1)
    }
    return piece
  }).join(' ')
}

function SharedFiltersModal({managingSharedFilterSettings, cancelManagingSharedFilterSettings, ...props}) {
  const sharedFiltersettings = props.getUserAppSetting(props.user, "sharedWorkspaceFilters") || {}
  const toggleSetting = props.getSharedFilterUserAppSetting()?.useSharedWorkspaceFilters || false
  const contextualTaskFilters = useMemo(() => getInitialTaskStatusFiltersByContext(props.reviewTasksType), [props.reviewTasksType])

  const handleToggleSlider = (e) => {
    e.preventDefault()
    e.stopPropagation()
    props.setSharedFilterUserAppSetting(props.location.search)
  }

  const briefFilters = props.getBriefFilters(sharedFiltersettings.sharedWorkspaceFilterString) || []

  const formattedFilters = briefFilters.map(filterSet => {
    if(filterSet.includes('=')) return filterSet.split('=')
    return filterSet
  })

  // useEffect(() => {
  //   console.log('formattedFilters', formattedFilters)
  // }, [formattedFilters])

  // useEffect(() => {
  //   console.log('togglesetting', toggleSetting)
  // }, [toggleSetting])

  // const searchCriteria = buildSearchCriteriafromURL(props.location.search)
  // const {priorities} = searchCriteria?.filters

  // const {sortCriteria} = searchCriteria
  // const displayedSortCriteria = (
  //   <li className='mr-flex mr-space-x-2 mr-items-baseline mr-text-sm'>
  //     <span className='mr-text-base mr-text-mango'>Sort Criteria: </span>
  //     <p className='mr-text-mango-60'>Sort By: <span className='mr-text-white'>{formatFilterDisplayName(sortCriteria.sortBy) + ','}</span></p>
  //     <p className='mr-text-mango-60'>Direction: <span className='mr-text-white'>{sortCriteria.direction === "ASC" ? "Ascending" : "Descending"}</span></p>

  //   </li>
  // ) 
  
  return (
    <React.Fragment>
      <External>
        <Modal isActive={managingSharedFilterSettings} onClose={cancelManagingSharedFilterSettings}>
          <div className='mr-space-y-6'>
            <div className='mr-max-w-lg'>  
              <h3 className="mr-text-yellow mr-mb-4">
                <FormattedMessage {...messages.sharedFiltersModalTitle} />
              </h3>
              <div className='mr-space-y-3'>
                <div className='mr-flex mr-space-x-2 mr-items-center'>
                  <p className='mr-text-green-lighter mr-text-base'>
                    <FormattedMessage {...messages.toggleLabel} />
                  </p>
                  <label className="switch-container mr-mt-1" onClick={(e) => {
                    handleToggleSlider(e)
                  }}>
                    <input type="checkbox" checked={toggleSetting} onChange={() => null}/>
                    <span className="slider round"></span>
                  </label>
                  {toggleSetting && <span className='mr-text-green-lighter'>On</span>}
                </div>
                <p className='mr-text-base'>
                  <FormattedMessage {...messages.sharedFiltersModalDescription} />
                </p>
                <p className='mr-text-sm'>
                  <FormattedMessage {...messages.sharedFiltersModalSubDescription} />
                </p>


                </div>
            </div>
            <div className='mr-space-y-1 mr-bg-blue-firefly mr-p-4 mr-rounded'>
              <h4 className='mr-text-md mr-text-green-lighter'>
                <FormattedMessage {...messages.sharedFiltersModalFilterListLabel} /> 
                <span className='mr-text-sm'>
                  <FormattedMessage {...messages.sharedFiltersModalFilterListSubLabel} />
                </span>: 
              </h4>
              
              <ul>
                {formattedFilters && formattedFilters.length ? formattedFilters.map(filter => {
                  if(filter.length === 1) return (
                    <p key={filter}>{filter}</p>
                  )
                  let filterDisplayName = filter[0].charAt(0).toUpperCase(0) + filter[0].slice(1)
                  if(/[A-Z]/.test(filter[0])) {
                    const formattedDisplayName = formatFilterDisplayName(filter[0])
                    filterDisplayName = formattedDisplayName
                  }


                  const filterValueDisplayName = filter[1].includes(',') ? filter[1].split(',').join(', ') : filter[1]
                  if(filter[0] === "status" || filter[0] === "reviewStatus" || filter[0] === "metaReviewStatus" || filter[0] === "priorities") {
                    if(filterValueDisplayName.includes(',')) {
                      if(filterValueDisplayName.split(',').length === contextualTaskFilters[filter[0]].length) { 
                        return null
                      }
                    }
                  }

                  return (
                    <li key={filter} className='mr-flex mr-space-x-2 mr-items-baseline'>
                      <span className='mr-text-base mr-text-mango mr-whitespace-nowrap'>{filterDisplayName}: </span>
                      <span className='mr-text-sm'>{filterValueDisplayName}</span>
                    </li>
                  )
                }) : null}
                {/* {displayedSortCriteria} */}
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