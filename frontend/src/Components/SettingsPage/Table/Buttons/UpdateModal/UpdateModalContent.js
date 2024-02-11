import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import axios from "axios";

/*eslint-disable */
// eslint-disable-next-line
const re =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/*eslint-enable */

function ModalContent({ userId }) {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  return (
    <div className="update">
    opacity:0; // makes the modal completely opaque
    position:fixed; //includes any scrollable areas
    height:100%; 
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Email"
          className="form-field"
          name="email"
          type="email"
          value={emailValue}
          onChange={(val) => setEmailValue(val.target.value)}
          helperText={
            !re.test(emailValue) && emailValue && "Email address is not valid"
          }
        />
        <TextField
          id="standard-basic"
          label="Password"
          className="form-field comp pswd-field"
          name="password"
          type="password"
          value={passwordValue}
          onChange={(val) => setPasswordValue(val.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Confirm Password"
          className="form-field comp"
          name="confirm-password"
          type="password"
          value={confirmPasswordValue}
          onChange={(val) => setConfirmPasswordValue(val.target.value)}
        />
      </form>
      <Button
        variant="contained"
        color="primary"
        className="btn"
        disabled={
          passwordValue !== confirmPasswordValue ||
          emailValue === "" ||
          passwordValue === ""
        }
        onClick={() => sendReq(userId, emailValue, passwordValue)}
      >
        Update User
      </Button>
    </div>
  );
}

const sendReq = (userId, email, password) => {
  console.log(email, password);
  axios
    .put(`/users/${userId}`, { email: email, password: password })
    .then((res) => {
      window.location.reload();
    })
    .catch((err) => {
      console.error(err);
    });
};

export default ModalContent;
