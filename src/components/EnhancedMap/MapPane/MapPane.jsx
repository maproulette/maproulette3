import { Children, Component, cloneElement } from "react";
import { FormattedMessage } from "react-intl";
import AppErrors from "../../../services/Error/AppErrors";
import WithErrors from "../../HOCs/WithErrors/WithErrors";
import "./MapPane.scss";

/**
 * MapPane is a thin wrapper around map components that primarily serves as a
 * convenient boundary for CSS styling.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class MapPane extends Component {
  state = { hasError: false };

  componentDidCatch(error) {
    this.setState({ hasError: true });
    this.props.addErrorWithDetails(AppErrors.map.renderFailure, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-pane">
          <div className="notification">
            <FormattedMessage {...AppErrors.map.renderFailure} values={{ details: "" }} />
          </div>
        </div>
      );
    }

    const childrenWithProps = Children.map(this.props.children, (child) =>
      cloneElement(child, { ...this.props }),
    );

    return <div className="map-pane">{childrenWithProps}</div>;
  }
}

export default WithErrors(MapPane);
