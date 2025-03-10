import { Component } from "react";
import BusySpinner from "../../BusySpinner/BusySpinner";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import WithNearbyTasks from "../../HOCs/WithNearbyTasks/WithNearbyTasks";
import TaskNearbyMap from "./TaskNearbyMap";

export class TaskNearbyList extends Component {
  render() {
    if (!this.props.task || !this.props.nearbyTasks) {
      return null;
    }

    if (this.props.nearbyTasks.loading) {
      return <BusySpinner />;
    }

    return (
      <MapPane {...this.props}>
        <TaskNearbyMap {...this.props} />
      </MapPane>
    );
  }
}

export default WithNearbyTasks(TaskNearbyList);
