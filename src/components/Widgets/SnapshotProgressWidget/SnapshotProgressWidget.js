import React, { Component } from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import ChallengeSnapshotProgress from '../../ChallengeProgress/ChallengeSnapshotProgress'
import WithChallengeSnapshots from '../../AdminPane/HOCs/WithChallengeSnapshots/WithChallengeSnapshots'
import ManageChallengeSnapshots from '../../AdminPane/Manage/ManageChallengeSnapshots/ManageChallengeSnapshots'
import QuickWidget from '../../QuickWidget/QuickWidget'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'SnapshotProgressWidget',
  label: messages.label,
  targets: [
    WidgetDataTarget.challenge
  ],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 7,
  defaultConfiguration: {
    showByPriority: false,
  },
}

export default class SnapshotProgressWidget extends Component {
  state = {
    chosenSnapshot: null,
    showManageSnapshots: false
  }

  setShowByPriority = showByPriority => {
    this.props.updateWidgetConfiguration({showByPriority: !!showByPriority})
  }

  snapshotButton = (dropdown, props) => {
    return (
      <button
        className="mr-dropdown__button"
        onClick={dropdown.toggleDropdownVisible}
      >
        <span className="mr-flex">
          <span className="mr-mr-2">
            {!this.state.chosenSnapshot ?
              <FormattedMessage {...messages.current} /> :
              this.formatDate(this.state.chosenSnapshot.created)
            }
          </span>
          <SvgSymbol
            sym="icon-cheveron-down"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-5 mr-h-5"
          />
        </span>
      </button>
    )
  }

  viewSnapshot = (props, snapshot) => {
    props.setSelectedSnapshot(snapshot.id)
    this.setState({chosenSnapshot: snapshot, showManageSnapshots: false})
  }

  snapshotMenuItems = (dropdown, props) => {
    const menuItems = _map(props.snapshotList, snapshot => (
      <li key={snapshot.id}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={() => {
          dropdown.closeDropdown()
          this.viewSnapshot(props, snapshot)
        }}>
          {this.formatDate(snapshot.created)}
        </a>
      </li>
    )).concat(
      <li key="current">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={() => {
          props.setSelectedSnapshot(null)
          dropdown.closeDropdown()
          this.setState({chosenSnapshot: null})
        }}>
          <FormattedMessage {...messages.current} />
        </a>
      </li>
    )

    return (
      <ol className="mr-list-dropdown">
        {menuItems}
      </ol>
    )
  }

  formatDate(date) {
    return (
      <FormattedDate
          value={date}
          day="2-digit"
          month="2-digit"
          year="numeric"
      />
    )
  }

  render() {
    const challenge = this.props.challenge

    return (
      <QuickWidget
        {...this.props}
        className="completion-progress-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={
          <div className="mr-flex mr-items-right mr-justify-start mr-items-center mr-my-2">
            {!this.state.showManageSnapshots &&
              <React.Fragment>
                <Dropdown
                  className="mr-button mr-button--green-lighter mr-button--small mr-mr-4"
                  dropdownButton={dropdown => this.snapshotButton(dropdown, this.props)}
                  dropdownContent={dropdown => this.snapshotMenuItems(dropdown, this.props)}
                />

                <Dropdown
                  className="mr-dropdown--right mr-pt-3"
                  dropdownButton={dropdown => (
                    <button
                      onClick={dropdown.toggleDropdownVisible}
                      className="mr-flex mr-items-center mr-text-green-lighter"
                    >
                      <SvgSymbol
                        sym="cog-icon"
                        viewBox="0 0 20 20"
                        className="mr-fill-current mr-w-4 mr-h-4"
                      />
                    </button>
                  )}
                  dropdownContent={(dropdown) =>
                    <React.Fragment>
                      <ul className="mr-list-dropdown">
                        <li>
                          <button
                            className="mr-text-current"
                            onClick={() => {
                              this.props.recordSnapshot()
                              dropdown.toggleDropdownVisible()
                            }}
                          >
                            <FormattedMessage {...messages.recordSnapshot} />
                          </button>
                        </li>
                        <li>
                          <button
                            className="mr-text-current"
                            onClick={() => {
                              this.setState({showManageSnapshots: true})
                              dropdown.toggleDropdownVisible()
                            }}
                          >
                            <FormattedMessage {...messages.manageSnapshots} />
                          </button>
                        </li>
                        <li onClick={dropdown.toggleDropdownVisible}>
                          <a target="_blank"
                              rel="noopener noreferrer"
                              href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/snapshot/challenge/${_get(this.props, 'challenge.id')}/export`}
                              className="mr-flex mr-items-center"
                          >
                              <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                              <FormattedMessage {...messages.exportCSVLabel} />
                          </a>
                        </li>
                      </ul>
                    </React.Fragment>
                  }
                />
              </React.Fragment>
            }
            {this.state.showManageSnapshots &&
              <div className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer"
                onClick={() => this.setState({showManageSnapshots: false})}>
                <FormattedMessage {...messages.done} />
              </div>
            }
          </div>
        }
      >
      {this.state.showManageSnapshots &&
        <ManageChallengeSnapshots
          viewSnapshot={this.viewSnapshot}
          {...this.props} />
      }
      {!this.state.showManageSnapshots &&
         <ChallengeSnapshotProgress
           {...this.props}
           className=""
           challenge={challenge}
           showByPriority={this.props.widgetConfiguration.showByPriority}
           setShowByPriority={this.setShowByPriority}
         />
       }
      </QuickWidget>
    )
  }
}


registerWidgetType(WithChallengeSnapshots(SnapshotProgressWidget), descriptor)
