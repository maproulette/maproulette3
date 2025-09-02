import { Component } from "react";
import { TaskStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import BusySpinner from "../../BusySpinner/BusySpinner";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import WithNearbyReviewTasks from "../../HOCs/WithNearbyReviewTasks/WithNearbyReviewTasks";
import TaskNearbyMap from "./TaskNearbyMap";

export class TaskReviewNearbyList extends Component {
  render() {
    if (!this.props.task || !this.props.nearbyTasks) {
      return null;
    }

    if (this.props.nearbyTasks.loading) {
      return <BusySpinner />;
    }

    return (
      <MapPane {...this.props}>
        <TaskNearbyMap
          {...this.props}
          allowedStatuses={[
            TaskStatus.fixed,
            TaskStatus.alreadyFixed,
            TaskStatus.falsePositive,
            TaskStatus.tooHard,
          ]}
        />
      </MapPane>
    );
  }
}

export default WithNearbyReviewTasks(TaskReviewNearbyList);
