import classNames from "classnames";
import _isObject from "lodash/isObject";
import _isString from "lodash/isString";
import { Component } from "react";

export default class PlaceDescription extends Component {
  render() {
    const addr = this.props.address;
    const scaleDescriptions = [];

    if (_isObject(addr)) {
      if (_isString(addr.city)) {
        scaleDescriptions.push(addr.city);
      } else if (_isString(addr.town)) {
        scaleDescriptions.push(addr.town);
      } else if (_isString(addr.hamlet)) {
        scaleDescriptions.push(addr.hamlet);
      } else if (_isString(addr.village)) {
        scaleDescriptions.push(addr.village);
      }

      if (_isString(addr.county)) {
        scaleDescriptions.push(addr.county);
      }

      if (_isString(addr.state)) {
        scaleDescriptions.push(addr.state);
      }

      if (_isString(addr.country)) {
        scaleDescriptions.push(addr.country);
      } else if (_isString(addr.continent)) {
        scaleDescriptions.push(addr.continent);
      }
    }

    return (
      <div
        data-testid="place-description"
        className={classNames("place-description", this.props.className)}
      >
        {scaleDescriptions.length === 0 ? null : scaleDescriptions.join(", ")}
      </div>
    );
  }
}
