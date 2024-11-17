import { Fragment, useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl }
       from 'react-intl'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _flatten from 'lodash/flatten'
import AsMappableTask
       from '../../interactions/Task/AsMappableTask'
import AsIdentifiableFeature
       from '../../interactions/TaskFeature/AsIdentifiableFeature'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'
import './OSMElementData.scss'

const OSM_SERVER = window.env.REACT_APP_OSM_SERVER

const OSMElementData = props => {
  const [selectedFeatureId, setSelectedFeatureId] = useState(null)
  const [element, setElement] = useState(null)
  const [fetchingElement, setFetchingElement] = useState(null)
  const [fetchedElement, setFetchedElement] = useState(null)
  const [failedElement, setFailedElement] = useState(null)
  const [fetchErr, setFetchErr] = useState(null)

  const { fetchOSMElement, taskBundle, task: primaryTask } = props

  const featureIds = useMemo(() => {
  const allTasks = taskBundle ? taskBundle.tasks : [primaryTask]
    return _flatten(_compact(_map(allTasks, task => {
      const geometries = AsMappableTask(task).normalizedGeometries()
      return geometries ? _compact(_map(
        geometries.features,
        f => AsIdentifiableFeature(f).normalizedTypeAndId(true, '/')
      )) : null
    })))
  }, [primaryTask, taskBundle])

  // If there is no selected feature or it is no longer available (e.g. because a task bundle
  // was unbundled), then update the selection
  useEffect(() => {
    if (!selectedFeatureId || featureIds.indexOf(selectedFeatureId) === -1) {
      setSelectedFeatureId(featureIds[0] ?? null)
    }
  }, [featureIds, selectedFeatureId])

  // Fetch and process the OSM Data
  useEffect(() => {
    if (selectedFeatureId === null) {
      // No features to fetch, cleanup existing to ensure consistency
      setElement(null)
      setFetchedElement(null)
      return
    }

    // If we're already fetching data for the active feature, or if the fetch failed, or if we already have its data,
    // there's nothing to do
    if (fetchingElement === selectedFeatureId || failedElement === selectedFeatureId || fetchedElement === selectedFeatureId) {
      return
    }

    setFetchingElement(selectedFeatureId)
    setFailedElement(null)
    setFetchErr(null)
    fetchOSMElement(selectedFeatureId).then(element => {
      // If for some reason we don't get any element entries, record a failure
      // to prevent further attempts to refetch
      if (!element) { // TODO Can this happen ?
        setFailedElement(selectedFeatureId)
        setFetchingElement(null)
        return
      }

      setFetchedElement(selectedFeatureId)
      setElement(element)
      setFetchingElement(null)
    }).catch(err => {
      setFailedElement(selectedFeatureId)
      setFetchErr(err)
      setFetchingElement(null)
    })
  }, [selectedFeatureId, fetchingElement, failedElement, fetchedElement, fetchOSMElement])

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

  if (!element) {
    return (
      <FormattedMessage {...messages.noOSMElements} />
    )
  }

  const tagsValues = _map(element.tag, tag => <Fragment key={tag.k}><dt>{tag.k}</dt><dd>{tag.v}</dd></Fragment>)

  return (
    <div className="mr-mr-4">
      <div className="mr-flex mr-justify-between mr-links-green-lighter mr-mb-4">
        <FeatureSelectionDropdown
          featureIds={featureIds}
          selectedFeatureId={activeFeatureId}
          selectFeatureId={setSelectedFeatureId}
        />
        <a
          className="mr-button mr-button--xsmall"
          href={`${OSM_SERVER}/${activeFeatureId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage {...messages.viewOSMLabel} />
        </a>
      </div>
      <dl className='tag-list'>
        {tagsValues}
      </dl>
    </div>
  )
}

OSMElementData.propTypes = {
  task: PropTypes.object,
  taskBundle: PropTypes.object,
  fetchOSMElement: PropTypes.func.isRequired,
}

const FeatureSelectionDropdown = props => {
  if (props.featureIds.length === 0) {
    return null
  }

  const menuItems =
    _map(props.featureIds, featureId => (
      <li key={featureId}>
        <a onClick={() => props.selectFeatureId(featureId)}>
          {featureId}
        </a>
      </li>
    ))

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

export default injectIntl(OSMElementData)
