import { FormattedMessage } from "react-intl";
import External from "../External/External";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import Modal from "../Modal/Modal";
import FlagCommentInput from "./FlagCommentInput";
import messages from "./Messages";

const FlagModel = (props) => {
  return (
    <External>
      <Modal contentClassName="mr-pb-6" isActive allowOverflow onClose={props.onCancel}>
        <h2 className="mr-text-grey-light-more mr-text-4xl mr-mt-4">
          <FormattedMessage {...messages.email} />
        </h2>
        <div className="mr-text-base mr-mt-4 mr-text-yellow">
          <MarkdownContent markdown={props.intl.formatMessage(messages.modalSubtitle)} />
        </div>
        <FlagCommentInput challenge={props.challenge} {...props} />
      </Modal>
    </External>
  );
};

export default FlagModel;
