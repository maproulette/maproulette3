import { useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import AppErrors from "../../../services/Error/AppErrors";
import AutosuggestTextBox from "../../AutosuggestTextBox/AutosuggestTextBox";
import BusySpinner from "../../BusySpinner/BusySpinner";
import WithOSMUserSearch from "../../HOCs/WithOSMUserSearch/WithOSMUserSearch";
import { USER, followUser as follow } from "../FollowingQueries";
import messages from "./Messages";

const ChooseOSMUser = WithOSMUserSearch(AutosuggestTextBox);

/**
 * Control for following a user by username
 */
const StartFollowing = (props) => {
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();
  const { mutateAsync: followUser, isLoading: isSaving } = useMutation(follow, {
    onSuccess: () => queryClient.invalidateQueries(USER),
  });

  const followSelectedUser = () => {
    followUser({ userId: selectedUser.id }).catch((error) => {
      props.addErrorWithDetails(AppErrors.user.followFailure, error.message);
    });
    setSelectedUser(null);
    setUsername("");
  };

  if (isSaving) {
    return <BusySpinner />;
  }

  return (
    <div>
      <h4 className="mr-mt-8 mr-mb-2 mr-text-mango mr-text-base">
        <FormattedMessage {...messages.header} />
      </h4>

      <div className="mr-flex mr-justify-between">
        <div className="mr-mr-4 mr-flex-grow">
          <ChooseOSMUser
            inputValue={username}
            inputClassName="mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner"
            selectedItem={selectedUser}
            onInputValueChange={(username) => setUsername(username)}
            onChange={(osmUser) => setSelectedUser(osmUser)}
            placeholder={props.intl.formatMessage(messages.osmUsername)}
            fixedMenu
          />
        </div>
        {selectedUser && (
          <button className="mr-button mr-button--small" onClick={followSelectedUser}>
            <FormattedMessage {...messages.followLabel} />
          </button>
        )}
      </div>
    </div>
  );
};

export default injectIntl(StartFollowing);
