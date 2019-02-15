import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _isString from 'lodash/isString'
import _isDate from 'lodash/isDate'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import _get from 'lodash/get'
import parse from 'date-fns/parse'
import { TaskStatus, statusLabels }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import AsManager from '../../../../interactions/User/AsManager'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import DropdownButton from '../../../Bulma/DropdownButton'
import ChallengeProgress from '../../../ChallengeProgress/ChallengeProgress'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import VisibilitySwitch from '../VisibilitySwitch/VisibilitySwitch'
import messages from './Messages'
import '~react-table/react-table.scss'
import './ChallengeAnalysisTable.scss'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * ChallengeAnalysisTable renders a table of challenge stats using react-table.
 *
 * @see See [react-table](https://react-table.js.org)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeAnalysisTable extends Component {
  state = {
    showStatusColumns: false,
  }

  toggleStatusColumns = () => {
    const showExtraColumns = !this.state.showStatusColumns

    this.setState({showStatusColumns: showExtraColumns})
    this.props.setWideScreen(showExtraColumns)
  }

  takeAction = (action, challenge) => {
    switch (action.key) {
      case 'start':
        this.props.history.push(`/challenge/${challenge.id}`)
        break
      case 'manage':
        this.props.history.push(
          `/admin/project/${this.props.project.id}/challenge/${challenge.id}`
        )
        break
      case 'edit':
        this.props.history.push(
          `/admin/project/${this.props.project.id}/challenge/${challenge.id}/edit`
        )
        break
      case 'clone':
        this.props.history.push({
          pathname: `/admin/project/${this.props.project.id}/challenge/${challenge.id}/clone`,
          state: {cloneChallenge: true}
        })
        break
      default:
        throw new Error("Unrecognized action: " + action.key)
    }
  }

  formattedDate = date => {
    if (!_isDate(date)) {
      return ''
    }

    return this.props.intl.formatDate(date, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  intlHeader = intlMessage => {
    const localized = _isString(intlMessage) ?
                      intlMessage :
                      this.props.intl.formatMessage(intlMessage)
    return <span title={localized}>{localized}</span>
  }

  render() {
    if (_get(process.env, 'REACT_APP_FEATURE_CHALLENGE_ANALYSIS_TABLE') !== 'enabled') {
      return null
    }

    if (_isEmpty(this.props.challenges) || !_isObject(this.props.project)) {
      return null
    }

    const manager = AsManager(this.props.user)

    const challengeActions = [{
      key: 'start',
      text: this.props.intl.formatMessage(messages.startChallengeLabel),
    }, {
      key: 'manage',
      text: this.props.intl.formatMessage(messages.manageChallengeLabel),
    }]

    if (manager.canWriteProject(this.props.project)) {
      challengeActions.push({
        key: 'edit',
        text: this.props.intl.formatMessage(messages.editChallengeLabel),
      })

      challengeActions.push({
        key: 'clone',
        text: this.props.intl.formatMessage(messages.cloneChallengeLabel),
      })
    }

    const localizedStatusLabels = statusLabels(this.props.intl)

    // Setup challenges table. See react-table docs for details.
    const data = this.props.challenges
    const primaryColumns = [{
      id: 'enabled',
      Header: this.intlHeader(messages.enabledLabel),
      accessor: c => c.enabled,
      exportable: c => c.enabled,
      maxWidth: 90,
      Cell: ({original}) => <VisibilitySwitch challenge={original}
                                              disabled={!manager.canWriteProject(this.props.project)}
                                              {...this.props} />,
    }, {
      id: 'name',
      Header: this.intlHeader(messages.nameLabel),
      accessor: c => c.name,
      exportable: c => c.name,
      Cell: ({original}) => (
        <Link to={`/admin/project/${this.props.project.id}/challenge/${original.id}`}>
          {original.name}
        </Link>
      ),
      minWidth: 250,
    }, {
      id: 'progress',
      accessor: c => AsManageableChallenge(c).completionPercentage(),
      exportable: c => AsManageableChallenge(c).completionPercentage(),
      Header: this.intlHeader(messages.progressLabel),
      Cell: ({original}) => <ChallengeProgress challenge={original} />,
      minWidth: 250,
    }, {
      id: 'lastActivity',
      Header: this.intlHeader(messages.lastActivityLabel),
      accessor: c => {
        const isoDate = _get(c, 'latestActivity.date')
        // Convert to timestamp to support column sorting
        return _isString(isoDate) ? parse(isoDate).getTime() : null
      },
      exportable: c => _get(c, 'latestActivity.date'),
      Cell: ({value}) => _isFinite(value) ? <FormattedDate value={parse(value)} /> : null,
      minWidth: 125,
    }]

    const statusColumns = _map(_keys(TaskStatus), statusName => ({
      id: statusName,
      accessor: c => AsManageableChallenge(c).actionPercentage(statusName),
      exportable: c => AsManageableChallenge(c).actionPercentage(statusName),
      Header: this.intlHeader(localizedStatusLabels[statusName]),
      Cell: row => <span>{row.value}%</span>,
    }))

    const trailingColumns = [{
      id: 'controls',
      className: "challenge-actions-column",
      Header: null,
      sortable: false,
      Cell: ({original}) => (
        <DeactivatableDropdownButton isRight
                                      options={challengeActions}
                                      onSelect={this.takeAction}
                                      context={original}>
          <div className="challenge-actions-column__action-label">
            <FormattedMessage {...messages.actionsColumnHeader}/>
            <div className="basic-dropdown-indicator" />
          </div>
        </DeactivatableDropdownButton>
      ),
      minWidth: 105,
      maxWidth: 125,
    }]

    let columnsToDisplay = primaryColumns
    if (this.state.showStatusColumns) {
      columnsToDisplay = columnsToDisplay.concat(statusColumns)
    }
    columnsToDisplay = columnsToDisplay.concat(trailingColumns)

    return (
      <div className="challenge-analysis-table">
        <div className="challenge-analysis-table__column-controls">
          <div>
            <input type="checkbox"
                   checked={this.state.showStatusColumns}
                   onChange={this.toggleStatusColumns} /> <FormattedMessage {...messages.showStatusColumnsLabel} />
          </div>
        </div>
        <ReactTable data={data} columns={columnsToDisplay} minRows={0} />
      </div>
    )
  }
}

ChallengeAnalysisTable.propTypes = {
  /** The challenges to display */
  challenges: PropTypes.array,
  /** Project the challenges belong to */
  project: PropTypes.object,
}

export default injectIntl(ChallengeAnalysisTable)
