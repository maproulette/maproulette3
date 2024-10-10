import { Link } from "react-router-dom";
import { injectIntl } from 'react-intl'
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";
import MarkdownContent from "../../../MarkdownContent/MarkdownContent";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import messages from "../Messages";

const EmailRequirementNotice = (props) => {
  if (import.meta.env.REACT_APP_EMAIL_ENFORCEMENT === "required") {
    if (!props.user?.settings?.email) {
      return (
        <ul className="mr-bg-gradient-b-blue-darker-blue-dark mr-text-white mr-w-full">
          <li className="mr-flex mr-justify-between mr-items-center mr-w-full mr-py-4 mr-px-4">
            <span className="mr-flex mr-items-center">
              <SvgSymbol
                sym="info-icon"
                viewBox="0 0 40 40"
                className="mr-fill-red-light mr-w-10 mr-w-10 mr-cursor-pointer mr-mx-4"
              />
              <MarkdownContent
                markdown={props.intl.formatMessage(messages.emailNoticeBanner)}
                className="mr-markdown--base"
              />{" "}
              <Link className="mr-px-2" to="/user/profile">
                {props.intl.formatMessage(messages.emailNoticeSettings)}
              </Link>
            </span>
          </li>
        </ul>
      );
    }
  }

  return null;
};

export default WithCurrentUser(injectIntl(EmailRequirementNotice));
