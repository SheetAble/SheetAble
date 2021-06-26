import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'
import { getSheets } from '../../Redux/Actions/dataActions'

// Sidebar
import SideBar from '../Navbar/SideBar'

// CSS
import './HomePage.css'

// Components
import Sheets from '../Sheets/Sheets'

class HomePage extends Component {
    
    componentDidMount = () => {
        this.props.getSheets()
    }

            
    render() {
        return (
            <Fragment>
                <SideBar history={this.props.history}/>
                <div className="home_content">
			        <div> 
                        <br />
                        <span className="text">Recently Added Sheets</span>
                        <hr className="seperator"></hr>
                        <Sheets sheets={this.props.sheets} />
                    </div>
                    
		        </div>
            </Fragment>
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
