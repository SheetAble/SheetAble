import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import DeleteIcon from "@material-ui/icons/Delete";
import React, { useEffect, useState } from "react";

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
  const [disabled, setDisabled] = useState(true);

  const [requestData, setRequestData] = useState({
    composer: props.sheet.composer,
    sheetName: props.sheet.sheet_name,
    releaseDate: "1999-12-31",
  });

  const [pdfChange, setPdfChange] = useState(false);

  const [uploadFile, setUploadFile] = useState(
    dataURLtoFile(
      arrayBufferToBase64(props.uploadFile.data, "pdf"),
      `${props.sheet.safe_sheet_name}.pdf`
    )
  );

  useEffect(() => {
    if (
      requestData.composer !== props.sheet.composer ||
      requestData.sheetName !== props.sheet.sheet_name ||
      pdfChange
    ) {
      if (
        requestData.composer !== "" &&
        requestData.sheetName !== "" &&
        uploadFile !== undefined
      ) {
        setDisabled(false);
      } else if (uploadFile === undefined) {
        setDisabled(true);
      }
    } else {
      setDisabled(true);
    }
  }, [requestData, uploadFile]);

  useEffect(() => {
    setPdfChange(true);
  }, [uploadFile]);

  const handleChange = (event) => {
    setRequestData({
      ...requestData,
      [event.target.name]: event.target.value,
    });
  };

  function arrayBufferToBase64(Arraybuffer, Filetype) {
    let binary = "";
    const bytes = new Uint8Array(Arraybuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const file = window.btoa(binary);
    const mimType =
      Filetype === "pdf"
        ? "application/pdf"
        : Filetype === "xlsx"
        ? "application/xlsx"
        : Filetype === "pptx"
        ? "application/pptx"
        : Filetype === "csv"
        ? "application/csv"
        : Filetype === "docx"
        ? "application/docx"
        : Filetype === "jpg"
        ? "application/jpg"
        : Filetype === "png"
        ? "application/png"
        : "";

    const url = `data:${mimType};base64,` + file;
    return url;
  }

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const sendRequest = () => {
    const newData = {
      ...requestData,
      uploadFile: uploadFile,
    };

    props.updateSheet(newData, props.sheet.safe_sheet_name, () => {
      props.resetData();
      props.onClose();
    });
  };

  const sendDeleteRequest = () => {
    props.deleteSheet(props.sheet.safe_sheet_name, () => {
      props.resetData();
      props.onClose();
    });
  };

  const uploadFinish = async (files) => {
    if (files[0] !== undefined) {
      const formData = new FormData();
      formData.append("file", files[0].file);

      try {
        const response = await fetch("http://localhost:8080/api", {
          // http://your-backend-server/upload
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("File uploaded successfully");
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error during file upload:", error);
      }
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
          files={[uploadFile]}
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
          Upload
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
