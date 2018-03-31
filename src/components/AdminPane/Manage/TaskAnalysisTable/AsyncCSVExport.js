import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { CSVDownload } from 'react-csv'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * AsyncCSVExport presents a control that, when clicked, invokes the given
 * loadAsyncData function to initiate load of async CSV data and then, once
 * resolved, renders a react-csv CSVDownload component to initiate download of
 * the data.
 *
 * @see See [react-csv](https://github.com/abdennour/react-csv)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AsyncCSVExport extends Component {
  state = {
    loading: false,
    csvData: null,
  }

  loadCSV = () => {
    this.setState({loading: true})
    this.props.loadAsyncData().then(csvData => {
      this.setState({loading: false, csvData})
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({csvData: null})
  }

  render() {
    return (
      <span className="async-csv-export">
        <button className={classNames(
                            "button is-outlined has-svg-icon csv-export",
                            {"is-loading": this.state.isLoading})}
                onClick={this.loadCSV}>
          <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
          <FormattedMessage {...messages.exportCSVLabel} />
        </button>
        {this.state.csvData &&
         <CSVDownload data={this.state.csvData}
                      filename="tasks.csv"
                      target="_blank" />
        }
      </span>
    )
  }
}

AsyncCSVExport.propTypes = {
  /**
   * Invoked when async CSV data should be loaded/generated. Must
   * return a promise.
   */
  loadAsyncData: PropTypes.func.isRequired,
}
