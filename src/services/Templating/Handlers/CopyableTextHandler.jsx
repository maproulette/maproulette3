import { Fragment } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import _isEmpty from 'lodash/isEmpty'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'

/**
 * Expands copyable shortcode to inject CopyToClipboard component to make text
 * easily copyable to clipboard by user, e.g. `[copyable "some useful text"]`
 */
const CopyableTextHandler = {
  copyableRegex: "copyable[/ ]?\"([^\"]*)\"",

  handlesShortCode(shortCode) {
    return new RegExp(this.copyableRegex).test(shortCode)
  },

  expandShortCode(shortCode) {
    const match = new RegExp(this.copyableRegex).exec(shortCode)
    if (!match) {
      return shortCode
    }

    // Don't offer clipboard control for empty string
    if (_isEmpty(match[1])) {
      return null
    }

    return (
      <Fragment>
        {match[1]}
        <CopyToClipboard text={match[1]}>
          <button
            type="button"
            className="mr-text-green-lighter hover:mr-text-white mr-ml-1"
          >
            <SvgSymbol
              sym="clipboard-icon"
              viewBox='0 0 20 20'
              className="mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
        </CopyToClipboard>
      </Fragment>
    );
  },
}

export default CopyableTextHandler
