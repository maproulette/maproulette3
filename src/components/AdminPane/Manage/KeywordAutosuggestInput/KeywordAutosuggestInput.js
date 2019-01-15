import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import _isFinite from 'lodash/isFinite'
import { TagsInputField }
       from '../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import AutosuggestTextBox from '../../../AutosuggestTextBox/AutosuggestTextBox'
import WithKeywordSearch from '../../HOCs/WithKeywordSearch/WithKeywordSearch'
import messages from './Messages'
import './KeywordAutosuggestInput.scss'

/**
 * KeywordAutosuggestInput combines the AutosuggestTextBox component with the
 * TagsInputField component to provide tag-style text input with auto-suggestion.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class KeywordAutosuggestInput extends Component {
  state = {
    value: '',
  }

  keywordClassName = keyword => {
    return _isFinite(keyword.id) ? "existing-keyword" : "new-keyword"
  }

  /**
   * Custom input for TagsInputField. We use the AutosuggestTextBox here,
   * having it invoke the addTag prop (provided by TagsInputField) when a user
   * selects a keyword from the suggestions dropdown (onChange event).
   *
   * @private
   */
  autosuggestInput = props => (
    <AutosuggestTextBox {...this.props}
                        inputValue={this.state.value}
                        onInputValueChange={value => this.setState({value})}
                        onChange={keyword => {
                          props.addTag(keyword.name)
                          this.setState({value: ''})
                        }}
                        resultClassName={this.keywordClassName}
                        showNoResults={this.props.existingKeywordCount === 0}
                        placeholder={this.props.intl.formatMessage(messages.addKeywordPlaceholder)}
    />
  )

  render() {
    return <TagsInputField {...this.props}
                           renderInput={this.autosuggestInput}
                           className="keyword-autosuggest-input" />
  }
}

export default WithKeywordSearch(injectIntl(KeywordAutosuggestInput))
