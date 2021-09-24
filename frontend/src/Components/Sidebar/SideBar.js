import React, {Fragment, useState} from 'react'
import './SideBar.css'

import { setSidebar } from '../../Redux/Actions/uiActions';
import { getSheets, getComposers, getComposerPage, getSheetPage, resetData } from '../../Redux/Actions/dataActions';
import { logoutUser } from '../../Redux/Actions/userActions';
import { connect } from 'react-redux'
import Modal from './Modal/Modal';
import ModalContent from './Modal/ModalContent';


function SideBar(props) {


	const [uploadModal, setUploadModal] = useState(false)

	const { sidebar } = props
	
	const onClickBtn = () => {
		props.setSidebar()
	}

	return (
		<Fragment>
		 <div className={sidebar ? "sidebar" : "sidebar active"}>
			<div  className="logo_content">
			<div className="logo" >
				<div className="logo_name" >SheetAble</div>
			</div>
			<i className={sidebar? 'bx bx-menu' : "bx bx-menu-alt-right"} id="btn" onClick={onClickBtn} ></i>
			</div>
			<ul className="nav_list">
			<li>
				<a href="/">
				<i className='bx bx-grid-alt' ></i>
				<span className="links_name">Home</span>
				</a>
				<span className="tooltip">Home</span>
			</li>

			<li>
				<a href="/sheets">
				<i className='bx bx-bookmarks'></i>
				<span className="links_name">Sheets</span>
				</a>
				<span className="tooltip">Sheets</span>
			</li>

			<li>
				<a href="/composers">
				<i className='bx bx-user' ></i>
				<span className="links_name">Composer</span>
				</a>
				<span className="tooltip">Composer</span>
			</li>

			<li>
				<a href="/search">
					<i className='bx bx-search-alt-2'></i>
					<span className="links_name">Search</span>
				</a>
				<span className="tooltip">Search</span>
			</li>
			<li>
				<p onClick={() => setUploadModal(true)} className="cursor">
				<Modal title="Upload" onClose={() => setUploadModal(false)} show={uploadModal}>
        			<ModalContent onClose={() => setUploadModal(false)}/>
      			</Modal>
				<i className='bx bx-cloud-upload' ></i>
				<span className="links_name">Upload</span>
				</p>
				<span className="tooltip">Upload</span>
			</li>
			<li>
				<p onClick={() => {
					props.resetData()
					window.location.reload()
				}} 
				className="cursor">
				<i className='bx bx-sync'></i>
				<span className="links_name">Synchronize</span>
				</p>
				<span className="tooltip">Synchronize</span>
			</li>
			
			<li>
				<a href="/settings">
				<i className='bx bx-cog' ></i>
				<span className="links_name">Settings</span>
				</a>
				<span className="tooltip">Settings</span>
			</li>
			</ul>
			<div className="profile_content">
			<div className="profile">
				<div className="profile_details">

				<div className="name_job">
					<div className="name"><span className="name">Account Email:</span></div>
					<div className="job"><span>{props.userData.email}</span></div>
				</div>
				</div>
				<a href="/login">
					<i className='bx bx-log-out' id="log_out" onClick={() =>  {props.logoutUser()}}></i>
				</a>
			</div>
			</div>
		</div>
		
	</Fragment>
	)
}

const mapStateToProps = (state) => ({
	sidebar: state.UI.sidebar,
	userData: state.user.userData
})

const mapActionsToProps = {
    setSidebar,
	getSheets,
	getComposers,
	logoutUser,
	getComposerPage, 
	getSheetPage,
	resetData
}

export default connect(mapStateToProps, mapActionsToProps)(SideBar)
