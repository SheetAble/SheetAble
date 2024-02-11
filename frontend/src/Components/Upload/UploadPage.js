import React, { Fragment, useState } from "react";
import SideBar from "../Sidebar/SideBar";
import "./Upload.css";
import DragNDrop from "./DragNDrop";

function UploadPage() {
  return (
    <Fragment>
      <SideBar />
      <div className="home_content">
        <InteractiveForm />
      </div>
    </Fragment>
  );
}

const InteractiveForm = () => {
  const [firstButtonText, setfirstButtonText] = useState("Next Step");
  const [secondButtonText, setSecondButtonText] = useState("Next Step");
  const [containerClasses, setcontainerClasses] = useState("container slider-one-active");
  const [requestData, setrequestData] = useState({
    uploadFile: undefined,
    composer: "",
    sheetName: "",
    releaseDate: "1999-12-31",
  });
  const [composerError, setComposerError] = useState("");
  const [sheetNameError, setSheetNameError] = useState("");

  const firstButtonOnClick = (e) => {
    e.preventDefault();
    setfirstButtonText("Saving...");
    setcontainerClasses("container center slider-two-active");
  };

  const secondButtonOnClick = (e) => {
    e.preventDefault();
    setSecondButtonText("Saving...");
    setcontainerClasses("container full slider-three-active");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
  
    // Always update the requestData
    setrequestData({
      ...requestData,
      [name]: value,
    });
  
    // Validate input and set error messages
    if (name === "composer") {
      if (value.length > 50) {
        setComposerError("Composer must be 50 characters or less.");
      } else {
        setComposerError("");
      }
    } else if (name === "sheetName") {
      if (value.length > 50) {
        setSheetNameError("Sheet Name must be 50 characters or less.");
      } else {
        setSheetNameError("");
      }
    }
  };
  

  return (
    <Fragment>
      <div className={containerClasses}>
        <div className="steps">
          <div className="step step-one">
            <span>Information</span>
          </div>
          <div className="step step-two">
            <span>Upload</span>
          </div>
          <div className="step step-three">
            <span>Conclusion</span>
          </div>
        </div>
        <div className="line">
          <div className="dot-move"></div>
          <div className="dot zero"></div>
          <div className="dot center"></div>
          <div className="dot full"></div>
        </div>
        <div className="slider-ctr">
          <div className="slider">
            <form className="slider-form slider-one">
              <h2>Type in the data of the sheet</h2>
              <div className="input-container">
                <label className="input">
                  Sheet Name:
                  <input
                    type="text"
                    className="name"
                    name="sheetName"
                    placeholder="Sheet Name"
                    onChange={handleChange}
                  />
                  {sheetNameError && <p className="error horizontal-error">{sheetNameError}</p>}
                </label>
              </div>
              <div className="input-container">
                <label className="input">
                  Composer:
                  <input
                    type="text"
                    className="name"
                    name="composer"
                    placeholder="Composer"
                    onChange={handleChange}
                  />
                  {composerError && <p className="error horizontal-error">{composerError}</p>}
                </label>
              </div>
              <button
                disabled={
                  requestData.sheetName === "" ||
                  requestData.composer === "" ||
                  composerError ||
                  sheetNameError ||
                  requestData.sheetName.length > 50 ||
                  requestData.composer.length > 50
                }
                className="first next interactive-form-button"
                onClick={firstButtonOnClick}
              >
                {firstButtonText}
              </button>
            </form>
            <form className="slider-form slider-two">
              <h2>Upload the PDF</h2>
              <DragNDrop
                requestData={requestData}
                secondButtonOnClick={secondButtonOnClick}
                secondButtonText={secondButtonText}
              />
            </form>
            <div className="slider-form slider-three three">
              <h2>
                The Sheet, <span className="yourname">{requestData.sheetName}</span>
              </h2>
              <h3 className="minus-marg">has been successfully uploaded</h3>
              <a className="reset" href="/">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UploadPage;
