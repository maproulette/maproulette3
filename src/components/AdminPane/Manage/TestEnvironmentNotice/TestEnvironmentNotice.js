import React from "react";
import { FormattedMessage, injectIntl } from 'react-intl'
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";
import messages from "./Messages";
import MarkdownContent from "../../../MarkdownContent/MarkdownContent";

const TestEnvironmentNotice = (props) => {
      return (
        <ul className="mr-bg-gradient-b-blue-darker-blue-dark mr-text-white mr-w-full">
        <li className="mr-flex mr-justify-between mr-items-center mr-w-full mr-py-2 mr-px-16">
          <div className="mr-flex mr-space-x-4 mr-items-center">
            <div className="mr-text-yellow mr-text-md mr-whitespace-nowrap">
              <FormattedMessage {...messages.title} />
            </div>
            <MarkdownContent
              markdown={props.intl.formatMessage(messages.description)}
              className="mr-text-white mr-text-sm"
            />
          </div>
        </li>
      </ul>
      );
};

export default WithCurrentUser(injectIntl(TestEnvironmentNotice));
