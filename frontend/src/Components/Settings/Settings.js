import React, { Fragment, useState } from 'react'
import SideBar from '../Sidebar/SideBar'
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux'
import './Settings.css'
import Modal from '../Sidebar/Modal/Modal'
import { Button } from '@material-ui/core';
import CreateAccountContent from './CreateAccountContent';



function Settings(props) {

	const [admin, setAdmin] = useState(props.userData.id == 1)

	const [modal, setModal] = useState(false)

	return (
		<Fragment>
			<SideBar />
			<div className="home_content settings">

				<div className="doc_header">
					<span className="doc_sheet">Settings</span>
					<br />
					<span className="doc_composer ">Account Status: <b>{admin? "Admin" : "Non Admin"}</b></span>
				</div>
				<button onClick={() => setModal(!modal)}>Open Modal</button>

				<Modal title="Create New Account" onClose={() => setModal(false)} show={modal}>
					<CreateAccountContent />
      			</Modal>
			</div>
		</Fragment>
	)
}

/*
	<form noValidate autoComplete="off">
						<TextField id="standard-basic" label="E-mail" name="E-Mail" />
						<br />
						<TextField
							id="standard-password-input"
							label="Password"
							type="password"
							autoComplete="new-password"
						/>
						<br />
						<TextField
							id="standard-password-input"
							label="Confirm Password"
							type="password"
							autoComplete="new-password"
						/>
					</form>
*/

const mapStateToProps = (state) => ({
    userData: state.user.userData,
})

const mapActionsToProps = {
    
}

export default connect(mapStateToProps, mapActionsToProps)(Settings)
