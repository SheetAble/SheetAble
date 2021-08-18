import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

// Redux stuff
import { connect } from 'react-redux'
import { getSheets, getComposers } from '../../Redux/Actions/dataActions'

// Sidebar
import SideBar from '../Sidebar/SideBar'

// CSS
import './HomePage.css'

// Components
import Sheets from '../Sheets/Sheets'
import Composers from '../Composers/Composers'

// Images
import lostImage from '../../Images/lost.svg'

class HomePage extends Component {
    
    componentDidMount = () => {
        if (this.props.sheets.length == 0) {
            this.props.getSheets()
        }
        
        if (this.props.composers.length == 0) {
            this.props.getComposers()
        }        
    }
            
    render() {
        const sheetsTrue = (
            <div className="home_content">
                <div className="home-page-wrapper"> 
                    <div className="space"/>
                    <div className="overflow-scroll">
                    <span className="text">Recently Added Sheets</span>
                    
                    <hr className="seperator"></hr>
                    
                        <Sheets sheets={this.props.sheets} />
                    </div>
                    <span className="text">New Composers</span>
                    <hr className="seperator"></hr>
                    <Composers composers={this.props.composers} />
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

        const loadingJSX = (
            <h1>loading</h1>
        )

        return (
            <Fragment>
                <SideBar history={this.props.history}/>
                {
                    this.props.loading? loadingJSX : this.props.sheets.length > 0 ? sheetsTrue : sheetsFalse
                }                
            </Fragment>
        )
    }	

}

HomePage.propTypes = {
    getSheets: PropTypes.func.isRequired,
    getComposers: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    sheets: state.data.sheets,
    composers: state.data.composers,
    loading: state.data.loading
})

const mapActionsToProps = {
    getSheets,
    getComposers
}

export default connect(mapStateToProps, mapActionsToProps)(HomePage)
