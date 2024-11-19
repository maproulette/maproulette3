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
import { useQuery } from 'react-query'

const OSM_SERVER = window.env.REACT_APP_OSM_SERVER

const OSMElementData = props => {
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

  const [selectedFeatureId, setSelectedFeatureId] = useState(featureIds[0] ?? null)

  if (!selectedFeatureId) {
    return (
      <FormattedMessage {...messages.noOSMElements} />
    )
  }

  const { isLoading, isError, error: fetchErr, data: element } = useQuery({
    queryKey: ['OSMElement', selectedFeatureId],
    queryFn: () => fetchOSMElement(selectedFeatureId)
  })

  if (isLoading) {
    return (
      <div className="mr-flex mr-justify-center mr-items-center mr-w-full mr-h-full">
        <BusySpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mr-flex mr-flex-col mr-text-red-light">
        <FormattedMessage {...messages.elementFetchFailed} values={{element: selectedFeatureId}} />
        {fetchErr && fetchErr.defaultMessage && <FormattedMessage {...fetchErr} />}
      </div>
    )
  }

  const tagsValues = _map(
    element.tag,
    ({k, v}) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>
  )

  return (
    <div className="mr-mr-4">
      <div className="mr-flex mr-justify-between mr-links-green-lighter mr-mb-4">
        <FeatureSelectionDropdown
          featureIds={featureIds}
          selectedFeatureId={selectedFeatureId}
          selectFeatureId={setSelectedFeatureId}
        />
        <a
          className="mr-button mr-button--xsmall"
          href={`${OSM_SERVER}/${selectedFeatureId}`}
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
