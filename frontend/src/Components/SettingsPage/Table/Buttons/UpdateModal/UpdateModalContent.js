import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { connect } from "react-redux";
import { uploadSheet, resetData } from "../../../../../Redux/Actions/dataActions"

function ModalContent(props) {
  return (
    <div className="upload">
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Sheet Name"
          className="form-field"
          name="sheetName"
        
        />
        <TextField
          id="standard-basic"
          label="Composer"
          className="form-field comp"
          name="composer"
        
        />
      </form>
      <Button
        variant="contained"
        color="primary"
        
      >
        Upload
      </Button>
    </div>
  );
}

const mapActionsToProps = {
  uploadSheet,
  resetData,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(ModalContent);
