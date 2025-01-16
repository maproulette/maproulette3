import _isFinite from "lodash/isFinite";
import PropTypes from "prop-types";
import { Component } from "react";
import { injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import ShareLink from "../ShareLink/ShareLink";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

/**
 * VirtualChallengeNameLink displays a linked name of the given virtual
 * challenge, along with a share link.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class VirtualChallengeNameLink extends Component {
  render() {
    if (!_isFinite(this.props.virtualChallengeId)) {
      return null;
    }

    const virtualChallengeBrowseRoute = `/browse/virtual/${this.props.virtualChallengeId}`;

    return (
      <div className="mr-flex mr-flex-start">
        <Link
          to={virtualChallengeBrowseRoute}
          className="mr-leading-normal mr-text-yellow mr-flex mr-items-center hover:mr-text-white"
        >
          <SvgSymbol
            sym="shuffle-icon"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-4 mr-h-4"
          />
          <span className="mr-mx-2">{this.props.virtualChallenge?.name}</span>
        </Link>
        <ShareLink {...this.props} link={virtualChallengeBrowseRoute} />
      </div>
    );
  }
}

VirtualChallengeNameLink.propTypes = {
  virtualChallengeId: PropTypes.number,
  virtualChallenge: PropTypes.object,
};

export default injectIntl(VirtualChallengeNameLink);
