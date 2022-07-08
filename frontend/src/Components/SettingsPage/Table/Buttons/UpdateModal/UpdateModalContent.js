import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { connect } from "react-redux";
import { uploadSheet, resetData } from "../../../../../Redux/Actions/dataActions"

function ModalContent(props) {
  return (
    <div className="update">
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Email"
          className="form-field"
          name="email"
          type="email"
        />
        <TextField
          id="standard-basic"
          label="Password"
          className="form-field comp pswd-field"
          name="password"
          type="password"
        />
        <TextField
          id="standard-basic"
          label="Confirm Password"
          className="form-field comp"
          name="confirm-password"
          type="password"
        />
      </form>
      <Button
        variant="contained"
        color="primary"
        className="btn"
      >
        Update User
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
