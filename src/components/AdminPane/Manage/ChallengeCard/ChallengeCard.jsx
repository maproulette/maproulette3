import classNames from "classnames";
import _isObject from "lodash/isObject";
import PropTypes from "prop-types";
import { Component, Fragment, createRef } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import AsManageableChallenge from "../../../../interactions/Challenge/AsManageableChallenge";
import Dropdown from "../../../Dropdown/Dropdown";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import WithChallengeManagement from "../../HOCs/WithChallengeManagement/WithChallengeManagement";
import ChallengeProgressBorder from "../ChallengeProgressBorder/ChallengeProgressBorder";
import ChallengeControls from "./ChallengeControls";
import messages from "./Messages";

/**
 * ChallengeCard renders a single challenge item. Right now only list view is
 * supported (making 'card' a bit of a misnomer), but future support for a card
 * view is planned.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeCard extends Component {
  nameRef = createRef();

  render() {
    if (this.props.challenge.deleted) {
      return null;
    }

    let parent = null;
    if (_isObject(this.props.challenge.parent)) {
      parent = this.props.challenge.parent;
    } else if (
      Number.isFinite(this.props.challenge.parent) &&
      this.props.challenge.parent === this.props.project?.id
    ) {
      parent = this.props.project;
    }

    const hasActions = Number.isFinite(this.props.challenge?.actions?.total);

    const ChallengeIcon = AsManageableChallenge(this.props.challenge).isComplete()
      ? CompleteIcon
      : VisibilityIcon;

    return (
      <div
        key={this.props.challenge.id}
        className="mr-flex mr-justify-between mr-items-center mr-mb-6"
      >
        <div className="mr-flex-grow mr-flex">
          <div className="mr-flex-grow-0 mr-pt-2-shy">
            <ChallengeIcon {...this.props} />
          </div>

          <div
            ref={this.nameRef}
            className="mr-flex mr-flex-grow mr-items-center mr-links-green-lighter mr-text-lg mr-mx-4"
          >
            <div
              className={classNames("mr-w-full mr-pl-0", {
                "mr-border-white-15 mr-border-b-2 mr-relative mr-pb-2": hasActions,
              })}
            >
              <Link to={this.props.link}>{this.props.challenge.name}</Link>
              {this.props.showProjectName && (
                <div className="mr-text-xs mr-text-grey-light">{parent?.displayName}</div>
              )}
              {hasActions && (
                <Fragment>
                  <ChallengeProgressBorder
                    {...this.props}
                    dimensions={
                      this.nameRef.current
                        ? this.nameRef.current.getBoundingClientRect()
                        : undefined
                    }
                  />

                  <div className="mr-absolute mr-bottom-0 mr-right-0 mr-z-50 mr-text-white mr-text-xxs">
                    {this.props.challenge.actions.total}{" "}
                    <FormattedMessage {...messages.totalTasks} />
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        </div>

        <div className="mr-flex-grow-0 mr-flex mr-items-center mr-pl-8">
          <div>
            <div onClick={() => this.props.toggleChallengePin(this.props.challenge.id)}>
              <SvgSymbol
                className={classNames(
                  "mr-w-4 mr-h-4 mr-rotate-10 mr-cursor-pointer",
                  this.props.isPinned ? "mr-fill-mango" : "mr-fill-mango-30",
                )}
                viewBox="0 0 20 20"
                sym="pin-icon"
              />
            </div>
          </div>

          {!this.props.hideTallyControl && (
            <div className="mr-ml-4">
              <div
                onClick={() =>
                  this.props.toggleChallengeTally(this.props.project.id, this.props.challenge.id)
                }
              >
                <SvgSymbol
                  className={classNames(
                    "mr-w-4 mr-h-4",
                    this.props.isTallied ? "mr-fill-mango" : "mr-fill-mango-30",
                  )}
                  viewBox="0 0 20 20"
                  sym="chart-icon"
                />
              </div>
            </div>
          )}

          {parent && (
            <Dropdown
              className="mr-ml-4 mr-dropdown--right mr-mt-1.5"
              dropdownButton={(dropdown) => (
                <button
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center mr-text-white"
                >
                  <SvgSymbol
                    sym="navigation-more-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5"
                  />
                </button>
              )}
              dropdownContent={(dropdown) => (
                <ChallengeControls
                  {...this.props}
                  className="mr-flex mr-flex-col mr-links-green-lighter"
                  controlClassName="mr-my-1"
                  onControlComplete={() => dropdown.closeDropdown()}
                />
              )}
            />
          )}
        </div>
      </div>
    );
  }
}

const CompleteIcon = function () {
  return (
    <SvgSymbol
      className="mr-fill-white mr-h-5 mr-align-middle mr-cursor-pointer"
      viewBox="0 0 20 20"
      sym="check-circled-icon"
    />
  );
};

const VisibilityIcon = injectIntl(function (props) {
  const isVisible = props.challenge.enabled;
  return (
    <span
      className={classNames(
        "mr-text-white mr-transition",
        isVisible ? "hover:mr-text-mango" : "hover:mr-text-mango-60",
      )}
    >
      <SvgSymbol
        className="mr-fill-current mr-h-5 mr-align-middle mr-cursor-pointer"
        viewBox="0 0 20 20"
        sym={isVisible ? "visible-icon" : "hidden-icon"}
        onClick={() => props.updateEnabled(props.challenge.id, !isVisible)}
        title={props.intl.formatMessage(messages.visibilityToogleTooltip)}
      />
    </span>
  );
});

ChallengeCard.propTypes = {
  challenge: PropTypes.object.isRequired,
  isPinned: PropTypes.bool,
};

export default WithChallengeManagement(ChallengeCard);
