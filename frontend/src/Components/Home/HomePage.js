import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'
import { getSheets, getComposers } from '../../Redux/Actions/dataActions'

// Sidebar
import SideBar from '../Navbar/SideBar'

// CSS
import './HomePage.css'

// Components
import Sheets from '../Sheets/Sheets'

// Images
import lostImage from '../../Images/lost.svg'

class HomePage extends Component {
    
    componentDidMount = () => {
        this.props.getSheets()
        this.props.getComposers()
    }
            
    render() {
        const sheetsTrue = (
            <div className="home_content">
                <div> 
                    <br />
                    <span className="text">Recently Added Sheets</span>
                    <hr className="seperator"></hr>
                    <Sheets sheets={this.props.sheets} />
                    
                    <span className="text">New Composers</span>
                    <hr className="seperator"></hr>
                </div>
            </div>
        )
        
        const sheetsFalse = (
            <div className="home_content">
                <div className="lost-image-container">
                    <span className="lost-text-header">Whooops!</span>
                    <span className="lost-text">Seems like you haven't uploaded any sheets yet.</span> 
                    <img src={lostImage} className="lost-image" />
                </div>
            </div>
        )
        return (
            <Fragment>
                <SideBar history={this.props.history}/>
                {this.props.sheets.length > 0 ? sheetsTrue : sheetsFalse}
                
            </Fragment>
        )
    }	

}

HomePage.propTypes = {
    getSheets: PropTypes.func.isRequired,
    getComposers: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    sheets: state.data.sheets,
    composers: state.data.sheets 
})

const mapActionsToProps = {
    getSheets,
    getComposers
}

export default connect(mapStateToProps, mapActionsToProps)(HomePage)
