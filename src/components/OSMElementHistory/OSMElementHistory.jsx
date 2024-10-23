import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedTime, FormattedDate, injectIntl }
       from 'react-intl'
import { isAfter, parseISO } from 'date-fns'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _sortBy from 'lodash/sortBy'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _flatten from 'lodash/flatten'
import AsMappableTask
       from '../../interactions/Task/AsMappableTask'
import AsIdentifiableFeature
       from '../../interactions/TaskFeature/AsIdentifiableFeature'
import AsColoredHashable from '../../interactions/Hashable/AsColoredHashable'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

const OSM_SERVER = window.env.REACT_APP_OSM_SERVER

const OSMElementHistory = props => {
  const [selectedFeatureId, setSelectedFeatureId] = useState(null)
  const [history, setHistory] = useState(null)
  const [fetchingElement, setFetchingElement] = useState(null)
  const [failedElement, setFailedElement] = useState(null)
  const [fetchErr, setFetchErr] = useState(null)

  const { fetchOSMElementHistory, taskBundle } = props
  const primaryTask = props.task
  const allTasks = taskBundle ? taskBundle.tasks : [primaryTask]

  const featureIds = _flatten(_compact(_map(allTasks, task => {
    const geometries = AsMappableTask(task).normalizedGeometries()
    return geometries ? _compact(_map(
      geometries.features,
      f => AsIdentifiableFeature(f).normalizedTypeAndId(true, '/')
    )) : null
  })))

  // If the selected feature is no longer available (e.g. because a task bundle
  // was unbundled), then clear the selection
  useEffect(() => {
    if (selectedFeatureId && featureIds.indexOf(selectedFeatureId) === -1) {
      setSelectedFeatureId(null)
    }
  }, [featureIds, selectedFeatureId])

  // Fetch and process the OSM history
  useEffect(() => {
    const activeFeatureId = selectedFeatureId ? selectedFeatureId : featureIds[0]

    // If we're already fetching data for the active feature, or if the fetch failed,
    // there's nothing to do
    if (fetchingElement === activeFeatureId || failedElement === activeFeatureId) {
      return
    }

    if (!_isEmpty(history)) {
      if (_isEmpty(featureIds)) {
        // Clear history since no feature ids for this task
        setHistory(null)
        return
      }
      else if (`${history[0].type}/${history[0].id}` === activeFeatureId) {
        // We already have history for this feature, so nothing to do
        return
      }
    }
    else if (_isEmpty(featureIds)) {
      // No features to fetch, so nothing to do
      return
    }

    setFetchingElement(activeFeatureId)
    setFailedElement(null)
    setFetchErr(null)
    fetchOSMElementHistory(activeFeatureId, true).then(historyEntries => {
      // If for some reason we don't get any history entries, record a failure
      // to prevent further attempts to refetch
      if (!historyEntries || historyEntries.length === 0) {
        setFailedElement(activeFeatureId)
        setFetchingElement(null)
        return
      }

      // Sort history entries by version, reversing to get descending order
      setHistory(_sortBy(historyEntries, 'version').reverse())
      setFetchingElement(null)
    }).catch(err => {
      setFailedElement(activeFeatureId)
      setFetchErr(err)
      setFetchingElement(null)
    })
  }, [selectedFeatureId, featureIds, history, fetchingElement, failedElement, fetchOSMElementHistory])

  if (fetchingElement) {
    return (
      <div className="mr-flex mr-justify-center mr-items-center mr-w-full mr-h-full">
        <BusySpinner />
      </div>
    )
  }

  const activeFeatureId = selectedFeatureId ? selectedFeatureId : featureIds[0]
  if (failedElement === activeFeatureId) {
    return (
      <div className="mr-flex mr-flex-col mr-text-red-light">
        <FormattedMessage {...messages.elementFetchFailed} values={{element: activeFeatureId}} />
        {fetchErr && fetchErr.defaultMessage && <FormattedMessage {...fetchErr} />}
      </div>
    )
  }

  if (!history) {
    return (
      <FormattedMessage {...messages.noOSMElements} />
    )
  }
  const featureProperties = _find(allTasks, task => {
    const properties = AsMappableTask(task).propertiesForOSMFeature(activeFeatureId)
    return _isEmpty(properties) ? null : properties
  }) || {}
  const featureChangeset =
    featureProperties.osmVersion || featureProperties.last_edit_changeset
  const sourceDate = _get(primaryTask, 'parent.dataOriginDate') // all tasks from same challenge

  const entries = _map(history, entry =>
    <HistoryEntry
      key={`${entry.type}/${entry.id}-${entry.version}`}
      {...entry}
      featureChangeset={featureChangeset}
      sourceDate={sourceDate}
      intl={props.intl}
    />
  )

  return (
    <div className="mr-mr-4">
      {!featureChangeset && !sourceDate &&
       <div className="mr-text-red-light mr-mb-4">
         <FormattedMessage {...messages.undeterminedVersion} />
       </div>
      }

      <div className="mr-flex mr-justify-between mr-links-green-lighter mr-mb-4">
        <FeatureSelectionDropdown
          featureIds={featureIds}
          selectedFeatureId={activeFeatureId}
          selectFeatureId={setSelectedFeatureId}
        />
        <a
          className="mr-button mr-button--xsmall"
          href={`${OSM_SERVER}/${activeFeatureId}/history`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage {...messages.viewOSMLabel} />
        </a>
      </div>

      <ol>
        {entries}
      </ol>
    </div>
  )
}

OSMElementHistory.propTypes = {
  task: PropTypes.object,
  taskBundle: PropTypes.object,
  fetchOSMElementHistory: PropTypes.func.isRequired,
}

const HistoryEntry = props => {
  const timestamp = parseISO(props.timestamp)
  const sourceDate = props.sourceDate ? parseISO(props.sourceDate) : new Date()
  const changesetComment = _find(
    _get(props, 'changeset.tag', []),
    tag => tag.k === "comment"
  )

  const isRecent =
    (props.featureChangeset && props.featureChangeset < props.version) ||
    isAfter(timestamp, sourceDate)

  return (
    <li className="mr-mb-4 mr-text-white mr-text-sm">
      <div className="mr-flex mr-justify-between mr-text-xs mr-font-bold mr-mb-1">
        <div>
          <FormattedTime
            value={timestamp}
            hour='2-digit'
            minute='2-digit'
          />, <FormattedDate
            value={timestamp}
            year='numeric'
            month='long'
            day='2-digit'
          />
        </div>
        <div className="mr-text-pink">
          <FormattedMessage {...messages.versionLabel} values={{version: props.version}} />
        </div>
      </div>

      <div className="mr-rounded-sm mr-p-2 mr-bg-black-15 mr-relative">
        {isRecent &&
          <SvgSymbol
            sym="recent-change-icon"
            viewBox="0 0 26 26"
            className="mr-fill-gold mr-w-6 mr-h-6 mr-absolute mr-top-0 mr-right-0 mr-mt-1 mr-mr-1"
            title={props.intl.formatMessage(messages.recentChangeTooltip)}
          />
        }
        <div
          className="mr-mb-2"
          style={{color: AsColoredHashable(props.user).hashColor}}
        >
          {props.user}
        </div>
        <div className="mr-flex">
          <SvgSymbol
            sym="comments-icon"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-flex-shrink-0 mr-w-4 mr-h-4 mr-mt-1 mr-mr-2"
          />
          <div>
            {changesetComment ?
             changesetComment.v :
             <span className="mr-text-grey-light">
               <FormattedMessage {...messages.noComment} />
             </span>
            }
          </div>
        </div>
      </div>
    </li>
  )
}

const FeatureSelectionDropdown = props => {
  const menuItems =
    _map(props.featureIds, featureId => (
      <li key={featureId}>
        <a onClick={() => props.selectFeatureId(featureId)}>
          {featureId}
        </a>
      </li>
    ))

  if (menuItems.length === 0) {
    return null
  }

  return (
    <Dropdown
      {...props}
      className="mr-dropdown"
      dropdownButton={dropdown => (
        <Fragment>
          <a className="mr-flex" onClick={dropdown.toggleDropdownVisible}>
            <div className="mr-mr-2">
              {props.selectedFeatureId}
            </div>
            <SvgSymbol
              sym="icon-cheveron-down"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5"
            />
          </a>
        </Fragment>
      )}
      dropdownContent={() =>
        <ol className="mr-list-dropdown">
          {menuItems}
        </ol>
      }
    />
  );
}

export default injectIntl(OSMElementHistory)
