import React, { Component } from 'react'

import './LoginPage.css'

import withStyles from '@material-ui/core/styles/withStyles'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// MUI Stuff
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress';

// Redux stuff
import { connect } from 'react-redux'
import { loginUser } from '../../Redux/Actions/userActions'

class LoginPage extends Component {

	constructor(){
        super()
        this.state = {
            email: '',
            password: '',
        }
    }

	handleSubmit = (event) => {
		console.log(this.state);
        event.preventDefault()
        const userData = {
            email: this.state.email,
            password: this.state.password
        }
        this.props.loginUser(userData, this.props.history)
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

	render() {
		
		return(
			<div className="all-container">
			<div class="wrapper">
				<div class="title">
					Login
				</div>
				<form >
					<div class="field">
						<input name="email" type="email" required onChange={this.handleChange}/>
						<label>Email Address</label>
					</div>
					<div class="field">
						<input name="password" type="password" required onChange={this.handleChange}/>
					<label>Password</label>
					</div>
					<div class="content">
						<div class="checkbox">
							<input type="checkbox" id="remember-me" />
							<label for="remember-me">Remember me</label>
						</div>
						<div class="pass-link">
							<a href="/forgot-password">Forgot password?</a>
						</div>
					</div>
					<div class="field">
						<input type="submit" value="Login" onClick={this.handleSubmit} /> 
					</div>
					<div class="signup-link">
						No account? <a href="/signup">Signup now</a>
					</div>
				</form>
      		</div>
		  </div>
		)
	}
}

LoginPage.propTypes = {
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
})

const mapActionsToProps = {
    loginUser
}

export default connect(mapStateToProps, mapActionsToProps)(LoginPage)

