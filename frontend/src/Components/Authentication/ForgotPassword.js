import React from 'react'
import './ForgotPassword.css'
import TextField from "@material-ui/core/TextField";
import { Button } from '@material-ui/core';
import { useState } from 'react';

export default function ForgotPassword() {
  const [emailValue, setEmailValue] = useState("")
  // TODO: check if email is valid
  return (
	<div className='forgot-password-container'>
    <div className='card'>
      <h1>Forgot your password?</h1>
      <h2>No problem, request a reset to your email here:</h2>
      <TextField id="standard-basic" label="Email" variant="standard" className='email-input' type='email' value={emailValue} onChange={event => setEmailValue(event.target.value)}/>
      <div className='btn-container'>
        <Button variant='contained' className='btn' disabled={emailValue == ""} onClick={() => console.log('Submit')}>
          Send Email
        </Button>  
      </div>
    </div>
  </div>
  )
}
