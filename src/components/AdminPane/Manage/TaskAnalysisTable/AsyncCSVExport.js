import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import fileDownload from 'js-file-download'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * AsyncCSVExport presents a control that, when clicked, invokes the given
 * loadAsyncData function to initiate load of async CSV (array) data that, once
 * resolved, is converted to a CSV string and downloaded to the user using the
 * js-file-download package.
 *
 * @see See [js-file-download](https://github.com/kennethjiang/js-file-download)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AsyncCSVExport extends Component {
  state = {
    loading: false,
  }

  /**
   * Convert two-dimensional array of row arrays to CSV string.
   */
  arraysToCSV = data =>
    data.map(row =>
      row.map(value =>
        `"${value || value === 0 ? value : ''}"`
      ).join(',')
    ).join('\n')

  /**
   * Invoked when user clicks download button
   */
  loadCSV = () => {
    this.setState({loading: true})
    this.props.loadAsyncData().then(csvData => {
      fileDownload(this.arraysToCSV(csvData), this.props.filename)
      this.setState({loading: false})
    })
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
      </span>
    )
  }
}

AsyncCSVExport.propTypes = {
  /** Filename to set for downloaded file */
  filename: PropTypes.string.isRequired,
  /**
   * Invoked when async CSV data should be loaded/generated. Must return a
   * promise.
   */
  loadAsyncData: PropTypes.func.isRequired,
}
