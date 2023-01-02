import React, { useState } from "react";

import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

// eslint-disable-next-line
const re =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function CreateAccountContent(props) {
  const [requestData, setRequestData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastFocus: 0,
  });

  const handleChange = (event) => {
    setRequestData({
      ...requestData,
      [event.target.name]: event.target.value,
      lastFocus: [event.target.name],
    });
  };

  const sendRequest = () => {
    props.createUser(requestData);
    props.getUsersData();
    window.location.reload();
    props.onClose();
  };

  return (
    <div className="upload settings">
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          error={
            !re.test(requestData.email) &&
            requestData.email !== "" &&
            requestData.lastFocus !== "email"
          }
          type="email"
          label="E-Mail"
          className="form-field"
          name="email"
          onChange={handleChange}
          helperText={
            !re.test(requestData.email) &&
            requestData.email &&
            (requestData.lastFocus !== "email") !== ""
              ? "Email address is not valid"
              : ""
          }
        />
        <TextField
          id="standard-password-input"
          type="password"
          label="Password"
          className="form-field comp"
          name="password"
          autoComplete="new-password"
          onChange={handleChange}
        />
        <TextField
          id="standard-password-input"
          error={
            requestData.password !== requestData.confirmPassword &&
            requestData.confirmPassword !== ""
          }
          type="password"
          label="Confirm Password"
          className="form-field comp"
          name="confirmPassword"
          autoComplete="new-password"
          helperText={
            requestData.password !== requestData.confirmPassword &&
            requestData.confirmPassword !== ""
              ? "Passwords do not match."
              : ""
          }
          onChange={handleChange}
        />
      </form>
      <Button
        variant="contained"
        color="primary"
        disabled={
          requestData.email === "" ||
          requestData.password === "" ||
          requestData.confirmPassword !== requestData.password
        }
        onClick={sendRequest}
      >
        Create Account
      </Button>
    </div>
  );
}

export default CreateAccountContent;
