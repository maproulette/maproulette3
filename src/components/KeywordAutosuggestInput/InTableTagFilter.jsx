import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import KeywordAutosuggestInput from './KeywordAutosuggestInput'
import External from '../External/External'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
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

  clearFilter = () => {
    this.setState({currentValue: ''}, () => {
      this.props.onChange(this.state.currentValue)
    })
  }

  render() {
    return (
      <div>
        <div className="mr-space-x-1 mr-pr-1">
          <input readOnly type="text" value={this.props.value} className="mr-w-full"
            onFocus={() => {
              if (!this.state.showTagChooser) {
                this.setState({showTagChooser: true})
              }
            }}
          />
          {this.props.value && <button className="mr-text-white hover:mr-text-green-lighter mr-transition-colors" onClick={this.clearFilter}>
            <SvgSymbol sym="icon-close" viewBox="0 0 20 20" className="mr-fill-current mr-w-2.5 mr-h-2.5"/>
          </button>}
        </div>

        <External>
          <Modal isActive={this.state.showTagChooser}
                 onClose={this.performSearch} >
            <div>
              <h3 className="mr-text-yellow mr-mb-6">
                <FormattedMessage {...messages.chooseTags}/>
              </h3>
              <KeywordAutosuggestInput
                {...this.props}
                tagType={["tasks", "review"]}
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
