import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _head from 'lodash/head'
import _isEmpty from 'lodash/isEmpty'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import TaskPropertyQueryBuilder
       from '../../../TaskPropertyQueryBuilder/TaskPropertyQueryBuilder'
import { supportedSimplestyles } from
  '../../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import errorMessages from '../../../TaskPropertyQueryBuilder/Messages'
import messages from './Messages'

/**
 * TaskPropertyStyleRules provides a form for setting up task property styles.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPropertyStyleRules extends Component {
  render() {
    const styleNameOptions = [
        <option key="" value="">
        </option>
      ].concat(_map(supportedSimplestyles, (style) =>
        <option key={style} value={style}>
          {style}
        </option>
      ))

    const buildStyleNameAndValues = (rule, index) => {
      return _map(rule.styles, (style, position) =>
        <div className="mr-flex mr-mt-2" key={`${index}-${position}`}>
          <div className="mr-mr-4">
            <div className="form-select">
              <select
                key={`name-${index}-${position}`}
                className="form-select form-control mr-w-40"
                onChange={e => this.props.setStyleName(e.target.value, index, position)}
                value={style.styleName}
              >
                {styleNameOptions}
              </select>
              <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2 mr-text-grey">
                <SvgSymbol
                  sym="icon-cheveron-down"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-4 mr-h-4"
                />
              </div>
            </div>
          </div>
          <div className="mr-font-medium mr-text-grey mr-mt-2 mr-mr-4"> = </div>
          <div>
            <input
              key={`value-${index}-${position}`}
              type="text"
              className={"mr-input"}
              placeholder={this.props.intl.formatMessage(messages.styleValuePlaceholder)}
              maxLength="100"
              value={style.styleValue || ""}
              onChange={(e) => this.props.setStyleValue(e.target.value, index, position)}
            />
          </div>
          { rule.styles.length > 1 &&
            <div className="mr-pt-2 mr-pl-4">
              <button
                className="mr-ml-2 mr-text-red"
                key={`delete-${index}-${position}`}
                onClick={() => this.props.removeStyle(index, position)}
                title={this.props.intl.formatMessage(messages.removeStyleTooltip)}
              >
                <SvgSymbol
                  sym="trash-icon"
                  viewBox="0 0 20 20"
                  className="mr-transition mr-fill-current mr-w-4 mr-h-4"
                />
              </button>
            </div>
          }
        </div>
      )
    }

    const styleForms = _map(this.props.taskPropertyStyleRules, (rule, index) => {
      const formSearch =
        <TaskPropertyQueryBuilder
          {...this.props}
          updateAsChange
          taskPropertyKeys={null}
          taskPropertyQuery={rule.propertySearch || {}}
          clearTaskPropertyQuery={() => this.props.removeStyleRule(index)}
          updateTaskPropertyQuery={(data, errors) => this.props.updateStyleRule(data, index, errors)}
        />

      return (
        <div className="style-rule mr-mb-10" key={`style-rule-${index}`}>
          <div className="mr-float-right">
            <button className="mr-button mr-button--green mr-mr-1 mr-mt-6"
                    onClick={() => this.props.removeStyleRule(index)}>
              <FormattedMessage {...messages.deleteRule} />
            </button>
          </div>
          <div className="mr-flex mr-mt-4 mr-mb-1">
            <div className="mr-mr-20 mr-pr-2">
              <div className="mr-font-medium mr-text-grey mr-mb-2 mr-mr-8">
                <FormattedMessage {...messages.styleName} />
              </div>
            </div>
            <div>
              <div className="mr-font-medium mr-text-grey mr-mb-2">
                <FormattedMessage {...messages.styleValue} />
              </div>
            </div>
          </div>

          {buildStyleNameAndValues(rule, index)}
          <button onClick={() => this.props.addNewStyle(index)}
                  className="mr-button mr-button--small mr-button--green mr-mt-4 mr-mb-2"
                  title={this.props.intl.formatMessage(messages.addNewStyleTooltip)}>
            <FormattedMessage {...messages.addNewStyle} />
          </button>
          {formSearch}
          {!_isEmpty(this.props.styleRuleErrors[index]) &&
            <div className="mr-ml-4 mr-mb-4 mr-text-red">
              {this.props.intl.formatMessage(errorMessages[_head(this.props.styleRuleErrors[index])])}
            </div>
          }
        </div>
      )
    })

    return (
      <div className="">
        <div className="mr-font-medium mr-text-matisse-blue mr-uppercase mr-mb-8 mr-text-xl">
          <FormattedMessage {...messages.stylesHeader} />
        </div>
        <div className="mr-my-4">
          {styleForms}
          <div className="mr-my-4 mr-pb-8">
            <button className="mr-button mr-button--green" onClick={this.props.addNewStyleRule}>
              <FormattedMessage {...messages.addRule} />
            </button>
          </div>
        </div>
        {this.props.children}
      </div>
    )
  }
}
