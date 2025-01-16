import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";

class Button extends Component {
  render() {
    return (
      <button {...this.props} className={classNames("mr-button", this.props.className)}>
        {this.props.children}
      </button>
    );
  }
}

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
