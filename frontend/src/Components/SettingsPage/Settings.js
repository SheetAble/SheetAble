import React, { Fragment, useState, useEffect } from "react";
import SideBar from "../Sidebar/SideBar";

import { connect } from "react-redux";
import "./Settings.css";
import Modal from "../Sidebar/Modal/Modal";

import { createUser } from "../../Redux/Actions/userActions";

import CreateAccountContent from "./CreateAccountContent";
import { Button } from "@material-ui/core";
import SettingsSvg from "../../Images/Settings.svg";
import UserManagement from "./Table/UserManagement";

function Settings(props) {
  const [admin] = useState(props.userData.id === 1);

  const [modal, setModal] = useState(false);

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
            <UserManagement />
            {/*
            <Button
              variant="contained"
              color="primary"
              onClick={() => setModal(!modal)}
              size="large"
            >
              Create New Account
            </Button>
        */}
            <Modal
              title="Create New Account"
              onClose={() => setModal(false)}
              show={modal}
            >
              <CreateAccountContent
                createUser={props.createUser}
                onClose={() => setModal(false)}
              />
            </Modal>
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
