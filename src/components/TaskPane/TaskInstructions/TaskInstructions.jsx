import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import useMRProperties from "../../../hooks/UseMRProperties/UseMRProperties";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import Button from "../../Button/Button";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import messages from "../Messages";

/**
 * TaskInstructions displays, as Markdown, the instructions for the given task
 * or, if task instructions are not available, the instructions for the parent
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TaskInstructions = (props) => {
  const [responsesChanged, setResponsesChanged] = useState(false);
  const [allFeatureProperties, setAllFeatureProperties] = useState({});
  const [instructions, setInstructions] = useState(null);
  const [substitutionProperties, setSubstitutionProperties] = useState({});
  const mrProperties = useMRProperties(props.workspaceContext);

  const { task } = props;
  const challenge = props.task?.parent ?? {};

  useEffect(() => {
    setInstructions(!_isEmpty(task.instruction) ? task.instruction : challenge.instruction);
  }, [task, challenge]);

  useEffect(() => {
    setAllFeatureProperties(AsMappableTask(task).allFeatureProperties());
  }, [task]);

  useEffect(() => {
    setSubstitutionProperties(Object.assign({}, mrProperties, allFeatureProperties));
  }, [mrProperties, allFeatureProperties]);

  if (_isEmpty(instructions)) {
    return null;
  }

  return (
    <div>
      <MarkdownContent
        {...props}
        className=""
        markdown={instructions}
        properties={substitutionProperties}
        setCompletionResponse={(name, value) => {
          props.setCompletionResponse(name, value);
          setResponsesChanged(true);
        }}
        allowPropertyReplacement
        allowShortCodes
        allowFormFields
      />
      {props.templateRevision && responsesChanged && (
        <Button
          className="mr-button--blue-fill mr-button--small"
          onClick={() => {
            props.saveCompletionResponses(task, props.completionResponses);
            setResponsesChanged(false);
          }}
        >
          <FormattedMessage {...messages.saveChangesLabel} />
        </Button>
      )}
    </div>
  );
};

TaskInstructions.propTypes = {
  task: PropTypes.object.isRequired,
};

export default TaskInstructions;
