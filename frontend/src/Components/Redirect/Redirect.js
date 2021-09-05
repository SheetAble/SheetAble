import React from 'react'
import { Redirect } from 'react-router'

function LoginRedirect() {
	return (
		<Redirect to="/login" />
	)
}

export default LoginRedirect
