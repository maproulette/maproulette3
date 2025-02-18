import _omit from "lodash/omit";
import { Component } from "react";

/**
 * WithOptionalManagement allows a component's active status to be easily
 * managed or unmanaged.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithOptionalManagement = function (WrappedComponent) {
  return class extends Component {
    state = {
      isActive: false,
    };

    isSelfManaged = () => this.props.isActive === undefined;

    isActive = () => (this.isSelfManaged() ? this.state.isActive : this.props.isActive);

    toggleActive = () => {
      if (this.isSelfManaged()) {
        this.setState({ isActive: !this.state.isActive });
      } else {
        this.props.toggleActive();
      }
    };

    setActive = (activeState) => {
      this.setState({ isActive: activeState });
    };

    render() {
      return (
        <WrappedComponent
          isActive={this.isActive}
          toggleActive={this.toggleActive}
          setActive={this.setActive}
          {..._omit(this.props, ["isActive", "toggleActive", "setActive"])}
        />
      );
    }
  };
};

export default WithOptionalManagement;
