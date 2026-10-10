import Form from "@rjsf/core";
import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import AppErrors from "../../../services/Error/AppErrors";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { MY_TEAMS, createTeam as createNewTeam, updateTeam as saveTeam } from "../TeamQueries";
import messages from "./Messages";
import { jsSchema, uiSchema } from "./TeamSchema";

/**
 * Displays a form for creating or editing team fields
 */
export const EditTeam = (props) => {
  const [teamFields, setTeamFields] = useState({});
  const queryClient = useQueryClient();
  const refetchTeams = { onSuccess: () => queryClient.invalidateQueries(MY_TEAMS) };
  const { mutateAsync: createTeam, isLoading: isCreating } = useMutation(
    createNewTeam,
    refetchTeams,
  );
  const { mutateAsync: updateTeam, isLoading: isUpdating } = useMutation(saveTeam, refetchTeams);
  const isSaving = isCreating || isUpdating;

  if (isSaving) {
    return <BusySpinner />;
  }

  return (
    <Form
      schema={jsSchema(props.intl)}
      uiSchema={uiSchema(props.intl)}
      className="form"
      liveValidate
      noHtml5Validate
      showErrorList={false}
      formData={Object.assign({}, props.team, teamFields)}
      onChange={({ formData }) => setTeamFields(formData)}
    >
      <div className="mr-flex mr-justify-between mr-items-center mr-mt-8">
        <button
          type="button"
          className="mr-button mr-button--white"
          onClick={() => props.finish(false)}
        >
          <FormattedMessage {...messages.cancelLabel} />
        </button>

        {isSaving ? (
          <BusySpinner inline />
        ) : (
          <button
            type="button"
            className="mr-button mr-button--green-lighter mr-ml-4"
            onClick={() => {
              if (!_isEmpty(teamFields)) {
                if (Number.isFinite(teamFields.id)) {
                  updateTeam({ ...props.team, ...teamFields }).catch((error) => {
                    props.addErrorWithDetails(AppErrors.team.failure, error.message);
                  });
                } else {
                  createTeam(teamFields).catch((error) => {
                    props.addErrorWithDetails(AppErrors.team.failure, error.message);
                  });
                }
              }
              props.finish(true);
            }}
          >
            <FormattedMessage {...messages.saveLabel} />
          </button>
        )}
      </div>
    </Form>
  );
};

EditTeam.propTypes = {
  finish: PropTypes.func.isRequired,
};

export default EditTeam;
