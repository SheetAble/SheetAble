import React from 'react'
import './ForgotPassword.css'
import TextField from "@material-ui/core/TextField";
import { Button } from '@material-ui/core';

export default function ForgotPassword() {
  return (
	<div className='forgot-password-container'>
    <div className='card'>
      <h1>Forgot your password?</h1>
      <h2>No problem, request a reset to your email here:</h2>
      <TextField id="standard-basic" label="Email" variant="standard" className='email-input'/>
      <div className='btn-container'>
        <Button variant='contained' className='btn'>
          Send Email
        </Button>  
      </div>
    </div>
  </div>
  )
}
