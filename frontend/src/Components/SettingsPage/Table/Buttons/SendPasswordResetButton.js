import React from 'react'
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useState } from 'react';

export default function SendPasswordResetButton(params) {

  const initColor = {
    color: "#5865f2"
  }
  const [colorStyle, setColorStyle] = useState(initColor)
  const [disabled, setDisabled] = useState(false)

  return (
    <IconButton
      variant="contained"
      size="small"
      style={colorStyle}
      disabled={disabled}
      onClick={() => {
          setColorStyle({color: "grey"})
          setDisabled(true)
          setTimeout(function () {
            setColorStyle(initColor)
            setDisabled(false)
        }, 2000);
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
		//window.location.reload()
	})
	.catch(err => {
		console.error(err)
	})
}