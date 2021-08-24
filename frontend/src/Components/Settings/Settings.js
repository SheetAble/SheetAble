import React, { Fragment } from 'react'

import SideBar from '../Sidebar/SideBar'

import { connect } from 'react-redux'

function Settings(props) {
	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				{props.userData.id == 1? 
				<p>yes admin</p>
				
				:
				
				<p>No admin</p>
				}
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
    userData: state.user.userData,
})

const mapActionsToProps = {
    
}

export default connect(mapStateToProps, mapActionsToProps)(Settings)
