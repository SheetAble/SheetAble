import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import SettingsSvg from "../../Images/Settings.svg";
import { createUser } from "../../Redux/Actions/userActions";
import SideBar from "../Sidebar/SideBar";
import "./Settings.css";
import UserManagement from "./Table/UserManagement";
import LibrarySettings from "./LibrarySettings";

function Settings(props) {
  const [admin] = useState(props.userData.id === 1);

  useEffect(() => {
    // Change Page Title
    document.title = `SheetAble - Settings`;
  }, []);

  return (
    <Fragment>
      <SideBar />
      <div className="home_content settings">
        <div className="doc_header">
          <span className="doc_sheet">Settings</span>
          <br />
          <span className="doc_composer ">
            Account Status: <b>{admin ? "Admin" : "Non Admin"}</b>
          </span>
        </div>

        {/* Library Settings - Available to all users */}
        <div className="settings-section">
          <LibrarySettings isAdmin={admin} />
        </div>

        {/* User Management - Admin only */}
        {admin && (
          <div className="admin-wrapper">
            <UserManagement createUser={createUser} />
          </div>
        )}

        {/* Placeholder for non-admins if no library path configured */}
        {!admin && (
          <div className="non-admin-wrapper">
            <img src={SettingsSvg} alt="" />
          </div>
        )}
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({
  userData: state.user.userData,
});

const mapActionsToProps = {
  createUser,
};

export default connect(mapStateToProps, mapActionsToProps)(Settings);
