import _omit from "lodash/omit";
import { Component } from "react";

/**
 * Checkbox that supports `indeterminate` prop, allowing checkbox to be
 * checked, unchecked, or indeterminate.
 */
export default class TriStateCheckbox extends Component {
  componentDidMount() {
    this.el.indeterminate = this.props.indeterminate;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.indeterminate !== this.props.indeterminate) {
      this.el.indeterminate = this.props.indeterminate;
    }
  }

  render() {
    return (
      <input
        {..._omit(this.props, "indeterminate")}
        type="checkbox"
        className="mr-checkbox-toggle"
        ref={(el) => (this.el = el)}
      />
    );
  }
}

TriStateCheckbox.defaultProps = {
  indeterminate: false,
};
