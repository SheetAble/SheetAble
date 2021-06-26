import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'

// Pages
import HomePageNotLoggedIn from './HomePageNotLoggedIn'
import HomePage from './HomePage'


class HomePageProvider extends Component {
    render() {
        const loggedIn = this.props.authenticated
        if (loggedIn) {            
            return (
                <HomePage history={this.props.history}/>
            )
        }

        return(
            <HomePageNotLoggedIn />
        )
    }	

}

HomePageProvider.propTypes = {
    authenticated: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated
})

export default connect(mapStateToProps)(HomePageProvider)
