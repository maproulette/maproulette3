import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import WithTargetUser from "../../components/HOCs/WithTargetUser/WithTargetUser";
import SignIn from "../../pages/SignIn/SignIn";
import ApiKey from "./ApiKey";
import messages from "./Messages";
import UserSettings from "./UserSettings/UserSettings";

class Profile extends Component {
  componentDidMount() {
    // Make sure our user is logged in
    if (this.props.user?.isLoggedIn) {
      this.props.fetchUser(this.props.user.id);
    }
  }

  render() {
    if (!this.props.user) {
      return this.props.checkingLoginStatus ? (
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div>
      ) : (
        <SignIn {...this.props} />
      );
    }

    let user = this.props.user;

    if (this.props.showingUserId) {
      user = this.props.targetUser;

      // If no user then we are still loading
      if (!user) {
        if (this.props.loading) {
          return (
            <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
              <BusySpinner />
            </div>
          );
        } else {
          // User supplied was not found so we will user our current user
          return (
            <div className="">
              <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
                <h2>
                  <FormattedMessage {...messages.userNotFound} />
                </h2>
              </div>
            </div>
          );
        }
      }
    }

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 lg:mr-py-20">
        <header className="mr-max-w-2xl mr-mx-auto mr-bg-blue-darker mr-rounded-t mr-pt-6 mr-pb-2 mr-pl-12">
          <h1 className="mr-h2 mr-text-white mr-py-12 mr-w-full md:mr-w-1/2 mr-bg-settings mr-bg-top-left mr-bg-no-repeat mr-text-center">
            <FormattedMessage {...messages.pageTitle} />
          </h1>
        </header>
        <div className="mr-max-w-2xl mr-mx-auto mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded mr-rounded-t-none">
          <UserSettings {...this.props} user={user} editor={this.props.user} />
          <div className="mr-border-t-2 mr-border-white-15 mr-my-12" />
          <ApiKey {...this.props} user={user} />
        </div>
      </div>
    );
  }
}

export default WithTargetUser(injectIntl(Profile));
