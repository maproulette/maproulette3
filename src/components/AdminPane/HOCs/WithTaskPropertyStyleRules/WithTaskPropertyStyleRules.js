import { Component } from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import _pullAt from 'lodash/pullAt'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _each from 'lodash/each'
import _isEmpty from 'lodash/isEmpty'
import _fill from 'lodash/fill'
import _filter from 'lodash/filter'
import { PROPERTY_RULE_ERRORS } from '../../../TaskPropertyQueryBuilder/TaskPropertyRules'

export const EMPTY_STYLE_RULE = {styles:[{}]}

/**
 * WithTaskPropertyStyleRules keeps track of taskPropertyStyleRules with methods
 * to manipulate the object.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithTaskPropertyStyleRules = function(WrappedComponent) {
  return class extends Component {
    state = {
      styleRules: [_cloneDeep(EMPTY_STYLE_RULE)],   //Setup with one initial style rule
      validationErrors:[[]], // And one empty errors.
    }

    removeStyleRule = (index) => {
      const newRules = _cloneDeep(this.state.styleRules)
      const newErrors = _cloneDeep(this.state.validationErrors)
      _pullAt(newRules, index)
      _pullAt(newErrors, index)
      if (newRules.length < 1) {
        newRules.push(_cloneDeep(EMPTY_STYLE_RULE))
        newErrors.push([])
      }
      this.setState({styleRules: newRules, validationErrors: newErrors})
    }

    setStyleName = (name, index, position) => {
      const newRules = _cloneDeep(this.state.styleRules)
      const newErrors = _cloneDeep(this.state.validationErrors)
      newRules[index].styles[position].styleName = name
      newErrors[index] =
        _filter(newErrors[index],
          (e) => e !== PROPERTY_RULE_ERRORS.missingStyleValue)

      this.setState({styleRules: newRules, validationErrors: newErrors})
    }

    setStyleValue = (value, index, position) => {
      const newRules = _cloneDeep(this.state.styleRules)
      const newErrors = _cloneDeep(this.state.validationErrors)
      newRules[index].styles[position].styleValue = value
      newErrors[index] =
        _filter(newErrors[index],
          (e) => e !== PROPERTY_RULE_ERRORS.missingStyleValue)

      this.setState({styleRules: newRules, validationErrors: newErrors})
    }

    updateStyleRule = (data, index, errors) => {
      const newRules = _cloneDeep(this.state.styleRules)
      const newErrors = _cloneDeep(this.state.validationErrors)

      newRules[index].propertySearch = data
      newErrors[index] = errors || []
      this.setState({styleRules: newRules, validationErrors: newErrors})
    }

    addNewStyleRule = () => {
      const newRules = _cloneDeep(this.state.styleRules)
      const newErrors = _cloneDeep(this.state.validationErrors)
      newRules.push(_cloneDeep(EMPTY_STYLE_RULE))
      newErrors.push([])
      this.setState({styleRules: newRules, validationErrors: newErrors})
    }

    addNewStyle = (index) => {
      const newRules = _cloneDeep(this.state.styleRules)
      newRules[index].styles.push({})
      this.setState({styleRules: newRules})
    }

    removeStyle = (index, position) => {
      const newRules = _cloneDeep(this.state.styleRules)
      _pullAt(newRules[index].styles, position)
      if (newRules[index].styles.length < 1) {
        newRules[index].styles.push({})
      }
      this.setState({styleRules: newRules})
    }

    clearStyleRules = () => {
      this.setState({
        styleRules: [_cloneDeep(EMPTY_STYLE_RULE)],
        validationErrors:[[]]
      })
    }

    componentDidMount() {
      if (_get(this.props.challenge, 'taskStyles')) {
        let taskStyles = _cloneDeep(this.props.challenge.taskStyles)
        if (_isEmpty(taskStyles)) {
          taskStyles.push(_cloneDeep(EMPTY_STYLE_RULE))
        }

        this.setState({styleRules: taskStyles,
                       validationErrors: _fill(Array(taskStyles.length), [])})
      }
    }

    componentDidUpdate(prevProps) {
      if (!_isEqual(_get(this.props.challenge, 'taskStyles'),
                    _get(prevProps.challenge, 'taskStyles'))) {
        let taskStyles = _cloneDeep(this.props.challenge.taskStyles)
        if (_isEmpty(taskStyles)) {
          taskStyles.push(_cloneDeep(EMPTY_STYLE_RULE))
        }
        this.setState({styleRules: taskStyles,
                       validationErrors: _fill(Array(taskStyles.length), [])})
      }
    }

    render() {
      const errors = this.state.validationErrors
      _each(this.state.styleRules, (rule, index) => {
        _each(rule.styles, style => {
          if (style.styleName && !style.styleValue) {
            // Missing style value
            errors[index].push(PROPERTY_RULE_ERRORS.missingStyleValue)
          }
          else if (style.styleValue && !style.styleName) {
            // Missing syle name
            errors[index].push(PROPERTY_RULE_ERRORS.missingStyleName)
          }
        })
      })

      let hasAnyStyleErrors = false
      _each(errors, (e) => {
        if (!_isEmpty(e)) {
          hasAnyStyleErrors = true
        }
      })

      return <WrappedComponent
              {...this.props}
              taskPropertyStyleRules={this.state.styleRules}
              styleRuleErrors={errors}
              hasAnyStyleRuleErrors = {hasAnyStyleErrors}
              clearStyleRules={this.clearStyleRules}
              removeStyleRule={this.removeStyleRule}
              updateStyleRule={this.updateStyleRule}
              addNewStyleRule={this.addNewStyleRule}
              setStyleName={this.setStyleName}
              setStyleValue={this.setStyleValue}
              addNewStyle={this.addNewStyle}
              removeStyle={this.removeStyle}
             />
    }
  }
}

export default WrappedComponent => WithTaskPropertyStyleRules(WrappedComponent)
