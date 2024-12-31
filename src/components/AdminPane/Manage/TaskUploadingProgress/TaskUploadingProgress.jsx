import ProgressStatus from "../ProgressStatus/ProgressStatus";
import messages from "./Messages";

/**
 * TaskUploadingProgress displays a full-page busy spinner and shows
 * the current upload progress (if provided)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function (props) {
  return (
    <ProgressStatus
      progressItem={props.progress?.creatingTasks}
      progressHeader={messages.creatingTasks}
      progressDescription={messages.tasksCreated}
    />
  );
}
