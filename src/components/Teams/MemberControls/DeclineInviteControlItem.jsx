import { useMutation } from "@apollo/client";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import AppErrors from "../../../services/Error/AppErrors";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { DECLINE_INVITE } from "../TeamQueries";
import messages from "./Messages";

const DeclineInviteControlItem = (props) => {
  const [declineInvite, { loading: isSaving }] = useMutation(DECLINE_INVITE);

  // The team member needs have an invitation and be the current user
  if (!props.teamMember.isInvited() || !props.teamMember.isUser(props.user)) {
    return null;
  }

  if (isSaving) {
    return <BusySpinner />;
  }

  return (
    <li className={props.className}>
      <a
        onClick={() => {
          declineInvite({
            variables: { teamId: props.teamMember.team.id },
            refetchQueries: props.refetchQueries,
          }).catch((error) => {
            props.addErrorWithDetails(AppErrors.team.failure, error.message);
          });
        }}
      >
        <FormattedMessage {...messages.declineInviteLabel} />
      </a>
    </li>
  );
};

DeclineInviteControlItem.propTypes = {
  user: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired,
  refetchQueries: PropTypes.array,
};

DeclineInviteControlItem.defaultProps = {
  refetchQueries: [],
};

export default DeclineInviteControlItem;
