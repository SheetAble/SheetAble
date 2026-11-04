import React, { Fragment, useState } from "react";
import SideBar from "../Sidebar/SideBar";
import { connect } from "react-redux";
import { uploadSheet } from "../../Redux/Actions/dataActions";

import "./Upload.css";

import DragNDrop from "./DragNDrop";

function UploadPage({ uploadSheet }) {
  return (
    <Fragment>
      <SideBar />
      <div className="home_content">
        <InteractiveForm uploadSheet={uploadSheet} />
      </div>
    </Fragment>
  );
}

const InteractiveForm = ({ uploadSheet }) => {
  const [firstButtonText, setfirstButtonText] = useState("Next Step");

  const [secondButtonText, setSecondButtonText] = useState("Next Step");

  const [containerClasses, setcontainerClasses] = useState(
    "container slider-one-active"
  );

  const [requestData, setrequestData] = useState({
    composer: "",
    sheetName: "",
    releaseDate: "1999-12-31",
    instruments: "",
    uploadFile: undefined,
  });
  const [uploadError, setUploadError] = useState("");

  const firstButtonOnClick = (e) => {
    e.preventDefault();
    setfirstButtonText("Saving...");
    setcontainerClasses("container center slider-two-active");
  };

  const secondButtonOnClick = (e) => {
    e.preventDefault();
    setSecondButtonText("Saving...");
    setUploadError("");
    uploadSheet(
      requestData,
      () => {
        setSecondButtonText("Next Step");
        setcontainerClasses("container full slider-three-active");
      },
      (error) => {
        setSecondButtonText("Next Step");
        const responseData =
          error.response && error.response.data;
        setUploadError(
          (typeof responseData === "string" && responseData) ||
            error.message ||
            "Unable to upload the sheet."
        );
      }
    );
  };

  const giveModalData = (file) => {
    setrequestData({
      ...requestData,
      uploadFile: file,
    });
  };

  const handleChange = (event) => {
    setrequestData({
      ...requestData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Fragment>
      <div class={containerClasses}>
        <div class="steps">
          <div class="step step-one">
            {/*<div class="liner"></div>*/}
            <span>Information</span>
          </div>
          <div class="step step-two">
            {/*<div class="liner"></div>*/}
            <span>Upload</span>
          </div>
          <div class="step step-three">
            {/*<div class="liner"></div>*/}
            <span>Conclusion</span>
          </div>
        </div>
        <div class="line">
          <div class="dot-move"></div>
          <div class="dot zero"></div>
          <div class="dot center"></div>
          <div class="dot full"></div>
        </div>
        <div class="slider-ctr">
          <div class="slider">
            <form class="slider-form slider-one">
              <h2>Type in the data of the sheet</h2>
              <label class="input">
                <input
                  type="text"
                  class="name"
                  name="sheetName"
                  placeholder="Sheet Name"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  class="name"
                  name="composer"
                  placeholder="Composer"
                  onChange={handleChange}
                />
                <input
                  type="text"
                  class="name"
                  name="instruments"
                  placeholder="Instruments (optional, e.g. Piano, Violin)"
                  onChange={handleChange}
                />
              </label>
              <button
                disabled={
                  requestData.sheetName === "" || requestData.composer === ""
                }
                class="first next interactive-form-button"
                onClick={firstButtonOnClick}
              >
                {firstButtonText}
              </button>
            </form>
            <form class="slider-form slider-two">
              <h2>Upload the PDF</h2>
              <DragNDrop giveModalData={giveModalData} />
              {uploadError && <p role="alert">{uploadError}</p>}
              <button
                type="button"
                disabled={requestData.uploadFile === undefined}
                class="next interactive-form-button"
                onClick={secondButtonOnClick}
              >
                {secondButtonText}
              </button>
            </form>
            <div class="slider-form slider-three three">
              <h2>
                The Sheet, <span class="yourname">{requestData.sheetName}</span>
              </h2>
              <h3 className="minus-marg">has been succesfully uploaded</h3>
              <a class="reset" href="/">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

const mapActionsToProps = {
  uploadSheet,
};

export default connect(null, mapActionsToProps)(UploadPage);
