import React, {useState, useEffect, useMemo} from 'react'
import { FormattedMessage } from 'react-intl'
import External from '../External/External'
import Modal from '../Modal/Modal'
import { buildSearchURL,
  buildSearchCriteriafromURL }
from '../../services/SearchCriteria/SearchCriteria'
import { getInitialTaskStatusFiltersByContext } from '../../pages/Review/taskStatusFiltersByReviewType'
import messages from './Messages'

const formatFilterDisplayName = (name) =>  {
  return name.split(/(?=[A-Z])/).map(piece => {
    if(!/[A-Z]/.test(piece.charAt(0))) {
    return piece.charAt(0).toUpperCase() + piece.slice(1)
    }
    return piece
  }).join(' ')
}

function SharedFiltersModal({managingSharedFilterSettings, cancelManagingSharedFilterSettings, ...props}) {
  const [isSliderToggled, setIsSliderToggled] = useState(false)

  // useEffect(() => {
  //   console.log('props in SharedFiltersModal', props)
  // }, [props])

  const contextualTaskFilters = useMemo(() => getInitialTaskStatusFiltersByContext(props.reviewTasksType), [props.reviewTasksType])
  useEffect(() => {
    console.log('review task type', props.reviewTasksType)
  }, [props.reviewTasksType])

  useEffect(() => {
    console.log('contextualTaskFilters', contextualTaskFilters)
  }, [contextualTaskFilters])

  const handleToggleSlider = (e) => {
    e.preventDefault()
    e.stopPropagation()
   setIsSliderToggled(toggled => !toggled)
  }

  const briefFilters = useMemo(() => props.getBriefFilters(props.location.search), [props.location.search])

  // useEffect(() => {
  //   console.log('briefFilters in modal', briefFilters)
  // }, [briefFilters])
  
  const formattedFilters = briefFilters.map(filterSet => {
    if(filterSet.includes('=')) return filterSet.split('=')
    return filterSet
  })

  useEffect(() => {
    console.log('formattedFilters', formattedFilters)
  }, [formattedFilters])

  const searchCriteria = buildSearchCriteriafromURL(props.location.search)
  // const {priorities} = searchCriteria?.filters

  // const displayedPriorityFilters = (
  //   <li>
  //     {priorities.length === 1 ? }
  //   </li>
  // )

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
              <h3 className="mr-text-yellow mr-mb-4">Shared Filter Settings</h3>
              <div className='mr-space-y-3'>
                <div className='mr-flex mr-space-x-2 mr-items-center'>
                  <p className='mr-text-green-lighter mr-text-base'>Toggle filter settings across workspace contexts: </p>
                  <label className="switch-container mr-mt-1" onClick={(e) => {
                    handleToggleSlider(e)
                  }}>
                    <input type="checkbox" checked={isSliderToggled} onChange={() => null}/>
                    <span className="slider round"></span>
                  </label>
                  {isSliderToggled && <span className='mr-text-green-lighter'>On</span>}
                </div>
                <p className='mr-text-base'>
                  When this setting is toggled the current filters will also be applied in other contexts
                  (currently the <span className='mr-text-mango'>Challenge Management</span> and <span className='mr-text-mango'>Task Review</span> workspaces)*.
                </p>
                <p className='mr-text-sm'>
                  *Context-specific filters (currently task properties, certain table column sorting filters and specific task statuses) will only be
                  applied to their relevant context. Changing this setting to &quot;off&quot; or applying a saved filter profile from the list 
                  will return filtering to its default behavior.
                </p>


                </div>
            </div>
            <div className='mr-space-y-1 mr-bg-blue-firefly mr-p-4 mr-rounded'>
              <h4 className='mr-text-md mr-text-green-lighter'>Current Filter Settings for this Workspace <span className='mr-text-sm'>(Task Status and Priority filters listed are inclusive)</span>: </h4>
              
              <ul>
                {formattedFilters.map(filter => {
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
                })}
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

// const Slider = () => {
//   const [boolState, setBoolState] = useState(false)
//   const toggleBoolState = () => {
//     setBoolState(b => !b)
//   }
//   return (

//     <button className={`mr-text-lg ${boolState ? 'mr-text-green' : 'mr-text-blue'}`} onClick={toggleBoolState}>
//       Toggle
//     </button>
//   )
// }


export default SharedFiltersModal