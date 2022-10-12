import React, { Component } from "react";
import PropTypes from "prop-types";
import { Switch, Route, withRouter } from "react-router-dom";
import MediaQuery from "react-responsive";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";

import BusySpinner from "../BusySpinner/BusySpinner";


/**
 * AdminPane is the top-level component for administration functions. It has a
 * Projects tab for management of projects, challenges, and tasks, and a
 * Metrics tab for display of various summary metrics. It's worth noting that
 * all logged-in users have access to the AdminPane.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class SuperAdminPane extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname !== prevProps.location.pathname &&
      this.props.location.search !== prevProps.location.search
    ) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    // The user needs to be logged in.
    const manager = AsManager(this.props.user);
    consoloe.log(manager.isSuperUser());
    if (!manager.isLoggedIn()) {
      return this.props.checkingLoginStatus ? (
        <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div>
      ) : (
        <SignIn {...this.props} />
      );
    }

    return (
        <div>m</div>
    )
  }
}

SuperAdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
};

export default WithStatus(WithCurrentUser(withRouter(SuperAdminPane)));
