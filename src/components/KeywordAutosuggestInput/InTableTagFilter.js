import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import KeywordAutosuggestInput from './KeywordAutosuggestInput'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

/**
 * Builds an input field with the KeywordAutosuggestInput onFocus
 * that works as in table column header filter.
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class InTableTagFilter extends Component {
  state = {
    showTagChooser: false,
    currentValue: null
  }

  performSearch = () => {
    if (this.state.currentValue !== null) {
      this.props.onChange(this.state.currentValue)
    }
    this.setState({showTagChooser: false, currentValue: null})
  }

  render() {
    return (
      <div>
        <input readOnly type="text" value={this.props.value} className="mr-w-full"
          onFocus={() => {
            if (!this.state.showTagChooser) {
              this.setState({showTagChooser: true})
            }
          }}
        />

        <External>
          <Modal isActive={this.state.showTagChooser}
                 onClose={this.performSearch} >
            <div>
              <h3 className="mr-text-yellow mr-mb-6">
                <FormattedMessage {...messages.chooseTags}/>
              </h3>
              <KeywordAutosuggestInput
                {...this.props}
                tagType={"tasks"}
                fixedMenu
                openOnFocus={this.state.showTagChooser}
                preferredResults={this.props.preferredTags}
                placeholder={this.props.intl.formatMessage(messages.filterTags)}
                handleChangeTags={(tags) => {
                  this.setState({currentValue: tags})
                }}
                formData={this.state.currentValue === null ?
                            this.props.value : this.state.currentValue}
              />
              <button className="mr-button mr-block mr-mt-8 mr-mb-4"
                      onClick={this.performSearch}>
                <FormattedMessage {...messages.search}/>
              </button>
            </div>
          </Modal>
        </External>
      </div>
    )
  }
}
