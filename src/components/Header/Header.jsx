import PropTypes from "prop-types";
import { Component } from "react";

class Header extends Component {
  render() {
    return (
      <header className={this.props.className}>
        <div className="md:mr-flex md:mr-items-baseline md:mr-justify-between">
          <div className="mr-mb-4 md:mr-mb-0">
            {this.props.eyebrow}
            {this.props.title}
            {this.props.info}
          </div>
          <div className="md:mr-ml-4 md:mr-text-right">{this.props.actions}</div>
        </div>
        {this.props.subheader}
      </header>
    );
  }
}

Header.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  info: PropTypes.node,
  actions: PropTypes.node,
};

export default Header;
