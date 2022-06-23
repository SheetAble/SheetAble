import React from 'react'
import './ForgotPassword.css'
import TextField from "@material-ui/core/TextField";
import { Button } from '@material-ui/core';
import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [emailValue, setEmailValue] = useState("")
  const [error, setError] = useState(0) // 0: nothing, 1: success; 2: err
  // TODO: check if email is valid

  const handleSubmit = () => {
    axios
    .post("/request_password_reset", {
      email: emailValue
    })
    .then((res) => {
      setError(1)
      })
    .catch(err => {
      setError(2)
      console.log(err);
    })
  }

  return (
	<div className='forgot-password-container'>
    <div className='card'>
      <h1>Forgot your password?</h1>
      <h2>No problem, request a password reset to your email here.</h2>
      <TextField id="standard-basic" label="Email" variant="standard" className='email-input' type='email' value={emailValue}
        onChange={event => setEmailValue(event.target.value) & setError(0)} 
        error={error == 2} 
        helperText={error == 2 ? "No account was found with this email.": error == 1 && "Email was sent successfully."}
      />
      <div className='btn-container'>
        <Button variant='contained' className='btn' disabled={emailValue == ""} onClick={() => handleSubmit()}>
          Send Email
        </Button>  
      </div>
    </div>
  </div>
  )
}
