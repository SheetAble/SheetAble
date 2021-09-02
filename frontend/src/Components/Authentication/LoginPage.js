import React, { Component } from 'react'

import './LoginPage.css'

import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'
import { loginUser } from '../../Redux/Actions/userActions'

class LoginPage extends Component {

	constructor(){
        super()
        this.state = {
            email: '',
            password: '',
			errors: {}
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.UI.errors){
            this.setState({ errors: nextProps.UI.errors})
        }
    }

	handleSubmit = (event) => {
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
		const { UI: {loading} } = this.props
        const  {errors} = this.state

		return(
			
			<div className="all-container-pos">
			<div class="wrapper">
				<div class="title">
					Login
				</div>
				{ !errors.error?
					<form >
						<div class="field">
							<input name="email" type="name" required onChange={this.handleChange}/>
							<label>Email Address</label>
						</div>
						<div class="field">
							<input name="password" type="password" required onChange={this.handleChange}/>
						<label>Password</label>
						</div>
						{/*
						<div class="content">
							<div class="checkbox">
								<input type="checkbox" id="remember-me" />
								<label for="remember-me">Remember me</label>
							</div>
							
							
							<div class="pass-link">
								<a href="/forgot-password">Forgot password?</a>
							</div>
							*
						</div>
						*/}
						<div class="field">
							<input type="submit" value="Login" onClick={this.handleSubmit} /> 
						</div>
						<div class="signup-link">
							Accounts can be created by the admin.
						</div>
					</form>
					: 			
					<form >
						<div class={errors.error == "Invalid Email"? "field field-wrong shake" : "field"}>
							<input name="email" type="name" required onChange={this.handleChange}/>
							<label>Email Adresse</label>
						</div>
						<div class={errors.error == "Incorrect Password"? "field field-wrong shake" : "field"}>
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
				}
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

