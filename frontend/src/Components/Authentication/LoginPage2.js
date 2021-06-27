import React, { Component } from 'react'
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
        return (
            <Grid container >
                <Grid item sm />
                <Grid item sm>
                    <Typography variant="h2" >
                        Login
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField 
                            id="email" 
                            name="email" 
                            type="email" 
                            label="Email" 
                            helperText={errors.email} 
                            error={errors.email ? true : false}
                            value={this.state.email} 
                            onChange={this.handleChange}                         
                            fullWidth 
                        />
                        <TextField 
                            id="password" 
                            name="password" 
                            type="password" 
                            label="Password" 
                            helperText={errors.password} 
                            error={errors.password ? true : false}
                            value={this.state.password} 
                            onChange={this.handleChange}
                            fullWidth 
                        />
                        {errors.general && (
                            <Typography variant="body2" >
                                {errors.general}
                            </Typography>
                        )}           
                        
                        <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={loading}
                        >
                            Log in
                            {loading && (
                                <CircularProgress size={30} />
                            )}
                        </Button>
                        <br />
                        <br />
                        <small>Dont have an account? Sign up <Link to="/signup">here</Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
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
