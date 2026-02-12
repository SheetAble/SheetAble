import React, { Fragment, useEffect, useState } from "react";
import "./SideBar.css";

import { setSidebar, getVersion, startLibrarySync, checkSyncStatus } from "../../Redux/Actions/uiActions";
import {
  getSheets,
  getComposers,
  getComposerPage,
  getSheetPage,
  resetData,
} from "../../Redux/Actions/dataActions";
import { logoutUser } from "../../Redux/Actions/userActions";
import { connect } from "react-redux";
import Modal from "./Modal/Modal";
import ModalContent from "./Modal/ModalContent";
import "./FalseVersion.css";
import axios from "axios";

function SideBar(props) {
  const [uploadModal, setUploadModal] = useState(false);
  const [falseVersion, setFalseVersion] = useState(false);

  const { sidebar, syncLoading } = props;

  const onClickBtn = () => {
    props.setSidebar();
  };

  const handleLibrarySync = () => {
    props.startLibrarySync();
  };

  useEffect(() => {
    props.getVersion();

    fetch("https://api.github.com/repos/SheetAble/SheetAble/releases/latest")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        axios.get("/version").then((versionRes) => {
          setFalseVersion(versionRes.data.data !== data.tag_name);
        });
      });

    // Check initial sync status
    props.checkSyncStatus();

    // Use a ref to track polling state
    let pollCount = 0;
    let statusInterval;

    const startPolling = () => {
      if (statusInterval) clearInterval(statusInterval);
      
      statusInterval = setInterval(() => {
        // We just dispatch the check, the reducer updates the state
        props.checkSyncStatus();

        if (syncLoading) {
            // Reset poll count when scanning
            pollCount = 0;
        } else {
            // Increment poll count when not scanning
            pollCount++;
            
            // After 10 idle polls (30 seconds), stop polling to save resources
            // However, we need to respect if syncLoading becomes true from elsewhere
            if (pollCount >= 10 && !syncLoading) {
               clearInterval(statusInterval);
               statusInterval = null;
            }
        }
      }, 3000);
    };

    startPolling();

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [syncLoading, props.checkSyncStatus]); // Added dependencies to restart polling if loading changes

  return (
    <Fragment>
      {falseVersion && (
        <div
          className={sidebar ? "false-version" : "false-version false-active"}
        >
          <div>
            There is a new version of SheetAble available!{" "}
            <a
              href="https://github.com/SheetAble/SheetAble/releases"
              target="_"
            >
              Pull it now
            </a>
          </div>
          <i className="bx bx-x" onClick={() => setFalseVersion(false)}></i>
        </div>
      )}

      <div className={sidebar ? "sidebar" : "sidebar active"}>
        <div className="logo_content">
          <div className="logo">
            <div className="logo_name">
              SheetAble <span>{props.version}</span>
            </div>
          </div>
          <i
            className={sidebar ? "bx bx-menu" : "bx bx-menu-alt-right"}
            id="btn"
            onClick={onClickBtn}
          ></i>
        </div>
        <ul className="nav_list">
          <li>
            <a href="/">
              <i className="bx bx-grid-alt"></i>
              <span className="links_name">Home</span>
            </a>
            <span className="tooltip">Home</span>
          </li>

          <li>
            <a href="/sheets">
              <i className="bx bx-bookmarks"></i>
              <span className="links_name">Sheets</span>
            </a>
            <span className="tooltip">Sheets</span>
          </li>

          <li>
            <a href="/composers">
              <i className="bx bx-user"></i>
              <span className="links_name">Composer</span>
            </a>
            <span className="tooltip">Composer</span>
          </li>

          <li>
            <a href="/search">
              <i className="bx bx-search-alt-2"></i>
              <span className="links_name">Search</span>
            </a>
            <span className="tooltip">Search</span>
          </li>
          <li>
            <p onClick={() => setUploadModal(true)} className="cursor">
              <Modal
                title="Upload"
                onClose={() => setUploadModal(false)}
                show={uploadModal}
              >
                <ModalContent onClose={() => setUploadModal(false)} />
              </Modal>
              <i className="bx bx-cloud-upload"></i>
              <span className="links_name">Upload</span>
            </p>
            <span className="tooltip">Upload</span>
          </li>
          <li>
            <p
              onClick={() => {
                if (!syncLoading) {
                  handleLibrarySync();
                }
              }}
              className={syncLoading ? "" : "cursor"}
            >
              <i className={`bx ${syncLoading ? "bx-loader-alt bx-spin" : "bx-sync"}`}></i>
              <span className="links_name">{syncLoading ? "Syncing..." : "Synchronize"}</span>
            </p>
            <span className="tooltip">{syncLoading ? "Syncing..." : "Synchronize"}</span>
          </li>

          <li>
            <a href="/settings">
              <i className="bx bx-cog"></i>
              <span className="links_name">Settings</span>
            </a>
            <span className="tooltip">Settings</span>
          </li>
        </ul>
        <div className="profile_content">
          <div className="profile">
            <div className="profile_details">
              <div className="name_job">
                <div className="name">
                  <span className="name">Account Email:</span>
                </div>
                <div className="job">
                  <span>{props.userData.email}</span>
                </div>
              </div>
            </div>
            <a href="/login">
              <i
                className="bx bx-log-out"
                id="log_out"
                onClick={() => {
                  props.logoutUser();
                }}
              ></i>
            </a>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({
  sidebar: state.UI.sidebar,
  userData: state.user.userData,
  version: state.UI.version,
  syncLoading: state.UI.syncLoading,
});

const mapActionsToProps = {
  setSidebar,
  getSheets,
  getComposers,
  logoutUser,
  getComposerPage,
  getSheetPage,
  resetData,
  getVersion,
  startLibrarySync,
  checkSyncStatus,
};

export default connect(mapStateToProps, mapActionsToProps)(SideBar);
