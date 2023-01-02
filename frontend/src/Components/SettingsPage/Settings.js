import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import SettingsSvg from "../../Images/Settings.svg";
import { createUser } from "../../Redux/Actions/userActions";
import SideBar from "../Sidebar/SideBar";
import "./Settings.css";
import UserManagement from "./Table/UserManagement";

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
            {!admin && (
              <div className="no-settings">
                {" "}
                Currently no settings available for non admins
              </div>
            )}
          </span>
        </div>

        {admin ? (
          <div className="admin-wrapper">
            <UserManagement createUser={createUser} />
          </div>
        ) : (
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
