import React, { Component } from "react";
import PropTypes from "prop-types";

// Redux stuff
import { connect } from "react-redux";

// Pages
import HomePage from "./HomePage";

import { Redirect } from "react-router-dom";

class HomePageProvider extends Component {
  render() {
    const loggedIn = this.props.authenticated;
    if (loggedIn) {
      return <HomePage history={this.props.history} />;
    }

    return <Redirect to="/login" />;
  }
}

HomePageProvider.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  authenticated: state.user.authenticated,
});

export default connect(mapStateToProps)(HomePageProvider);
