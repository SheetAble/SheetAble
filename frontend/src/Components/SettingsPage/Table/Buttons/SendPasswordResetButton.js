import React from 'react'
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

export default function SendPasswordResetButton(params) {
  return (
    <IconButton
      variant="contained"
      color="primary"
      size="small"
      
      onClick={() => {
          sendReq(params.row.email)
      }}
    >
      <SendIcon />
    </IconButton>
  )
}

const sendReq = (email) => {
	console.log(email);
  	axios.post(`/request_password_reset`, {email:email})
	.then(res => {
		window.location.reload()
	})
	.catch(err => {
		console.error(err)
	})
}