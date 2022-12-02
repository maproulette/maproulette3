import React from "react";
import External from "../External/External";
import Modal from "../Modal/Modal";
import FlagCommentInput from "./FlagCommentInput";
import messages from "./Messages";
import { FormattedMessage } from "react-intl";
const FlagModel = (props) => {
  return (<External>
    <Modal
      contentClassName="mr-pb-6"
      // fullScreen={loadingNearby}
      // narrow={!loadingNearby}
      // medium={reviewConfirmation && !loadingNearby}
      isActive={true}
      allowOverflow
      onClose={props.onCancel}
    >
      <h2 className="mr-text-grey-light-more mr-text-4xl mr-mt-4">Flag this challenge</h2>
      <div className="mr-text-base mr-mt-4 mr-text-yellow">
        You are about to flag a Challenge. An issue will be created here and the Challenge creator will be notified by email. Any follow-up discussion should take place there. Flagging a Challenge does not disable it immediately. Please explain in detail what your issue is with this challenge, if possible linking to specific OSM changesets.
      </div>
      <FlagCommentInput />
    </Modal>

  </External>)
}

export default FlagModel