import React, { Component } from 'react'
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl'
import _map from 'lodash/map'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import messages from './Messages'

/**
 * Presents a list of challenge snapshots and actions to perform on each
 * snapshot such as delete.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ManageChallengeSnapshots extends Component {
  render() {
    const snapshots = _map(this.props.snapshotList, snapshot => {
      return (
        <li key={snapshot.id} className="mr-flex mr-justify-between mr-pb-2 mr-cursor-pointer">
          <div>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => this.props.viewSnapshot(this.props, snapshot)}
              className="mr-text-white hover:mr-text-yellow">
              <FormattedDate
                  value={snapshot.created}
                  day="2-digit"
                  month="2-digit"
                  year="numeric"
              />
              <span className="mr-pr-4"></span>
              <FormattedTime
                value={snapshot.created}
                hour='2-digit'
                minute='2-digit'
              />
            </a>
          </div>
          <div>
            <ConfirmAction>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="mr-text-green-lighter hover:mr-text-white hover:mr-cursor"
                   onClick={() => this.props.deleteSnapshot(snapshot.id)}>
                <FormattedMessage {...messages.deleteSnapshot} />
              </a>
            </ConfirmAction>
          </div>
        </li>
      )
    })
    return (
      <div className="">
        <ul>{snapshots}</ul>
      </div>
    )
  }
}

export default ManageChallengeSnapshots
