import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ForgotPassword.css";

export default function ResetPasswordPage() {
  const [passwordValue, setPasswordVaule] = useState("");
  const [confirmPasswordValue, setConfirmPasswordVaule] = useState("");
  const [error, setError] = useState(0); // 0: nothing, 1: success; 2: err
  const { resetPasswordId } = useParams();

  const handleSubmit = () => {
    axios
      .post("/reset_password", {
        password: passwordValue,
        passwordResetId: resetPasswordId,
      })
      .then((res) => {
        setError(1);
        window.location.href = "/login";
      })
      .catch((err) => {
        setError(2);
        console.log(err);
      });
  };

  return (
    <div className="forgot-password-container reset-pass">
      <div className="card">
        <h1>Update your password</h1>
        <h2>You can update your password in here.</h2>
        <TextField
          id="standard-basic"
          label="Password"
          variant="standard"
          className="email-input"
          type="password"
          value={passwordValue}
          onChange={(event) =>
            setPasswordVaule(event.target.value) & setError(0)
          }
          error={error === 2}
        />
        <TextField
          id="standard-basic"
          label="Confirm Password"
          variant="standard"
          className="email-input"
          type="password"
          value={confirmPasswordValue}
          onChange={(event) =>
            setConfirmPasswordVaule(event.target.value) & setError(0)
          }
          error={error === 2}
          helperText={
            error === 2
              ? "This url is invalid."
              : error === 1 && "Password was updated successfully."
          }
        />
        <div className="btn-container">
          <Button
            variant="contained"
            className="btn"
            disabled={
              passwordValue === "" || confirmPasswordValue !== passwordValue
            }
            onClick={() => handleSubmit()}
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}
