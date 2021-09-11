import React, { Fragment, useState } from 'react'
import SideBar from '../Sidebar/SideBar'

import { connect } from 'react-redux'
import './Settings.css'
import Modal from '../Sidebar/Modal/Modal'

import { createUser } from '../../Redux/Actions/userActions'

import CreateAccountContent from './CreateAccountContent';
import { Button } from '@material-ui/core'
import SettingsSvg from '../../Images/Settings.svg'

function Settings(props) {

	const [admin] = useState(props.userData.id === 1)

	const [modal, setModal] = useState(false)

	return (
		<Fragment>
			<SideBar />
			<div className="home_content settings">

				<div className="doc_header">
					<span className="doc_sheet">Settings</span>
					<br />
					<span className="doc_composer ">Account Status: <b>{admin? "Admin" : "Non Admin"}</b>{!admin && (<div className="no-settings"> Currently no settings available for non admins</div>)}</span>
				</div>

				{
					admin?
					(
						<div className="admin-wrapper">
							<Button variant="contained" color="primary" onClick={() => setModal(!modal)} size="large">
							  	Create New Account
							</Button>
							<Modal title="Create New Account" onClose={() => setModal(false)} show={modal}>
								<CreateAccountContent createUser={props.createUser} onClose={() => setModal(false)}/>
							</Modal>
						</div>
						)
						 :
						 <div className="non-admin-wrapper">
							<img src={SettingsSvg} alt="" />
						</div>
				}

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
	createUser
}

export default connect(mapStateToProps, mapActionsToProps)(Settings)
