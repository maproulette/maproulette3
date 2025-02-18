import PropTypes from "prop-types";
import { Component } from "react";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";

export default function (WrappedComponent) {
  class WithTaskCenterPoint extends Component {
    render() {
      const mappableTask = AsMappableTask(this.props.task);
      return <WrappedComponent centerPoint={mappableTask.calculateCenterPoint()} {...this.props} />;
    }
  }

  WithTaskCenterPoint.propTypes = {
    task: PropTypes.object.isRequired,
  };

  return WithTaskCenterPoint;
}
