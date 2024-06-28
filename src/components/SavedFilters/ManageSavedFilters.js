import React, { Component } from 'react'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { FormattedMessage } from 'react-intl'
import QuickTextBox from '../QuickTextBox/QuickTextBox'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

/**
 * ManageSavedFilters shows a modal to manage the saved filters
 * when the prop 'managingFilters' is true and a modal to save
 * a new filters when the prop 'savingFilters' is true
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ManageSavedFilters extends Component {
  state = {
    savedFiltersName: null,
    renaming: null
  }

  render() {
    const searchFilters = this.props.searchFilters
    const savedFilters = this.props.savedFilters

    return (
      <React.Fragment>
        <External>
          <Modal isActive={this.props.savingFilters || false}>
            <QuickTextBox
              text={this.state.savedFiltersName || ""}
              setText={savedFiltersName => this.setState({savedFiltersName})}
              done={() => {
                this.props.saveCurrentSearchFilters(
                  this.state.savedFiltersName,
                  searchFilters)
                this.setState({savedFiltersName: null})
                this.props.cancelSavingFilters()
              }}
              cancel={() => {
                this.props.cancelSavingFilters()
                this.setState({savedFiltersName: null})
              }}
              placeholder={this.props.intl.formatMessage(messages.namePlaceholder)}
            />
          </Modal>
        </External>
        <External data-react-clickout="exclude">
          <Modal isActive={this.props.managingFilters || false}
            onClose={this.props.cancelManagingFilters}>
            <div>
              <h3 className="mr-text-yellow mr-mb-4">Manage Saved Filters</h3>
              <ul className="mr-max-h-screen75 mr-overflow-y-auto">
                {_map(_keys(savedFilters), (saved, index) => {
                  return (
                    <li className="mr-flex mr-justify-between" key={saved + "/" + index}>
                      {this.state.renaming === saved &&
                        <QuickTextBox
                          text={this.state.savedFiltersName || saved}
                          setText={savedFiltersName => this.setState({savedFiltersName})}
                          done={() => {
                            this.props.renameSavedFilters(
                              saved,
                              this.state.savedFiltersName,
                              savedFilters[saved])
                            this.setState({renaming: null, savedFiltersName: null})
                          }}
                          cancel={() => {
                            this.setState({renaming: null, savedFiltersName: null})
                          }}
                          placeholder={this.props.intl.formatMessage(messages.namePlaceholder)}
                        />
                      }
                      {this.state.renaming !== saved &&
                        <React.Fragment>
                          <div className="mr-w-76 mr-mr-4 mr-mb-4 mr-text-mango">{saved}</div>
                          <div className="mr-text-left mr-mr-4 mr-w-full mr-mb-4">
                            {this.props.getBriefFilters(savedFilters[saved]).join(', ')}
                          </div>
                          <div className="mr-w-40 mr-mb-4">
                            <button className="mr-text-green-lighter mr-mr-2"
                              onClick={() => this.setState({renaming: saved})}>
                              <FormattedMessage {...messages.editLabel} />
                            </button>
                            <button className="mr-text-green-lighter"
                              onClick={() => this.props.removeSavedFilters(saved)}>
                              <FormattedMessage {...messages.deleteLabel} />
                            </button>
                          </div>
                        </React.Fragment>
                      }
                    </li>
                  )
                })}
                {_keys(savedFilters).length === 0 &&
                  <li>
                    <FormattedMessage {...messages.noSavedFilters} />
                  </li>
                }
              </ul>
              <div className="mr-mt-8">
                <button
                  className="mr-button mr-col-span-2"
                  onClick={this.props.cancelManagingFilters}
                >
                  <FormattedMessage {...messages.doneLabel} />
                </button>
              </div>
            </div>
          </Modal>
        </External>
      </React.Fragment>
    )
  }
}
