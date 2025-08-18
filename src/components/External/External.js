import PropTypes from "prop-types";
import { Component } from "react";
import ReactDOM from "react-dom";

const modalRoot = document.getElementById("external-root");

export default class External extends Component {
  el = document.createElement("div");

  componentDidMount() {
    modalRoot?.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot?.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

External.propTypes = {
  children: PropTypes.node.isRequired,
};
