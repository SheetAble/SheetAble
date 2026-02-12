import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import DeleteIcon from "@material-ui/icons/Delete";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { connect } from "react-redux";
import {
  deleteSheet,
  resetData,
  updateSheet,
} from "../../../Redux/Actions/dataActions";

// Import React FilePond
import { FilePond } from "react-filepond";

// Import the plugin code

// Import FilePond styles
import "filepond/dist/filepond.min.css";

function ModalContent(props) {
  const history = useHistory();
  const [disabled, setDisabled] = useState(true);

  const [requestData, setRequestData] = useState({
    composer: props.sheet.composer,
    sheetName: props.sheet.sheet_name,
    releaseDate: "1999-12-31",
  });

  const [pdfChange, setPdfChange] = useState(false);

  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const hasMetadataChanged = 
      requestData.composer !== props.sheet.composer ||
      requestData.sheetName !== props.sheet.sheet_name;
    
    const isMetadataValid = requestData.composer !== "" && requestData.sheetName !== "";

    if ((hasMetadataChanged || pdfChange) && isMetadataValid) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [requestData, pdfChange]);

  useEffect(() => {
    if (uploadFile) {
      setPdfChange(true);
    }
  }, [uploadFile]);

  const handleChange = (event) => {
    setRequestData({
      ...requestData,
      [event.target.name]: event.target.value,
    });
  };



  const sendRequest = () => {
    const newData = {
      ...requestData,
      uploadFile: uploadFile,
    };

    props.updateSheet(newData, props.sheet.safe_sheet_name, () => {
      props.resetData();
      history.push("/sheets");
      props.onClose();
    });
  };

  const sendDeleteRequest = () => {
    props.deleteSheet(props.sheet.safe_sheet_name, () => {
      props.resetData();
      history.push("/sheets");
      props.onClose();
    });
  };

  const uploadFinish = (files) => {
    if (files[0] !== undefined) {
      setUploadFile(files[0].file);
    }
  };

  return (
    <div className="upload">
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Sheet Name"
          className="form-field"
          name="sheetName"
          onChange={handleChange}
          value={requestData.sheetName}
        />
        <TextField
          id="standard-basic"
          label="Composer"
          className="form-field comp"
          name="composer"
          onChange={handleChange}
          value={requestData.composer}
        />
      </form>
      <div className="upload-container">
        <FilePond
          files={uploadFile ? [uploadFile] : []}
          onupdatefiles={(files) => {
            uploadFinish(files);
          }}
          allowMultiple={false}
          server={{
            process: (
              fieldName,
              file,
              metadata,
              load,
              error,
              progress,
              abort,
              transfer,
              options
            ) => {
              load();
            },
          }}
          maxFiles={1}
          name="files"
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          credits={false}
          allowFileTypeValidation={true}
          acceptedFileTypes={["application/pdf"]}
        />
      </div>
      <div className="delete-wrapper">
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          onClick={sendRequest}
        >
          Save Changes
        </Button>
        <IconButton
          aria-label="delete"
          size="large"
          className="icon-button"
          onClick={sendDeleteRequest}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
}

const mapActionsToProps = {
  updateSheet,
  resetData,
  deleteSheet,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(ModalContent);
