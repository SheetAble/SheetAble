import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'
import { getSheets } from '../../Redux/Actions/dataActions'

class HomePage extends Component {
	handlePress = () => {
        this.props.getSheets()
        
	}
            
    render() {
        return (
            <button onClick={this.handlePress}>test</button>
        )
    }	

}

HomePage.propTypes = {
    getSheets: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
    sheets: state.data.sheets,
})

const mapActionsToProps = {
    getSheets
}

export default connect(mapStateToProps, mapActionsToProps)(HomePage)
