import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

// Redux stuff
import { connect } from "react-redux";
import { getSheets, getComposers } from "../../Redux/Actions/dataActions";

// Sidebar
import SideBar from "../Sidebar/SideBar";

// CSS
import "./HomePage.css";

// Components
import Sheets from "../Sheets/Sheets";
import Composers from "../Composers/Composers";
import NoSheets from "../NotFound/NoSheets";
import InstrumentFilter from "../SheetsPage/InstrumentFilter";

class HomePage extends Component {
  state = {
    instrument: "",
  };

  componentDidMount = () => {
    // Change Page Title
    document.title = `SheetAble - Home`;

    if (this.props.sheets === undefined || this.props.sheets.length === 0) {
      this.props.getSheets();
    }

    if (
      this.props.composers === undefined ||
      this.props.composers.length === 0
    ) {
      this.props.getComposers();
    }
  };

  handleInstrumentChange = (instrument) => {
    this.setState({ instrument });
    this.props.getSheets(instrument);
  };

  render() {
    const sheetsTrue = (
      <div className="home_content">
        <div className="home-page-wrapper">
          <div className="space" />
          <div className="overflow-scroll">
            <span className="text">Recently Added Sheets</span>
            <InstrumentFilter
              value={this.state.instrument}
              onChange={this.handleInstrumentChange}
            />

            <hr className="seperator"></hr>

            <Sheets sheets={this.props.sheets} />
          </div>
          <div className="overflow-scroll">
            <span className="text">New Composers</span>
            <hr className="seperator"></hr>
            <Composers composers={this.props.composers} />
          </div>
        </div>
      </div>
    );

    const sheetsFalse = (
      <div id="notfound" className="home_content">
        <InstrumentFilter
          value={this.state.instrument}
          onChange={this.handleInstrumentChange}
        />
        <NoSheets />
      </div>
    );

    const loadingJSX = <h1>loading</h1>;

    return (
      <Fragment>
        <SideBar history={this.props.history} />
        {this.props.loading
          ? loadingJSX
          : this.props.sheets === undefined || this.props.sheets.length === 0
          ? sheetsFalse
          : sheetsTrue}
      </Fragment>
    );
  }
}

HomePage.propTypes = {
  getSheets: PropTypes.func.isRequired,
  getComposers: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  sheets: state.data.sheets,
  composers: state.data.composers,
  loading: state.data.loading,
});

const mapActionsToProps = {
  getSheets,
  getComposers,
};

export default connect(mapStateToProps, mapActionsToProps)(HomePage);
