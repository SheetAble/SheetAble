import React, {Fragment, useState} from 'react'
import './SideBar.css'


function SideBar(props) {

	const arrowHandle = (e) => {
   		let arrowParent = e.target.parentElement.parentElement;
  		arrowParent.classNameList.toggle("showMenu");
	}

	const [sidebar, setSidebar] = useState(false)
	
	const onClickBtn = () => {
		setSidebar(!sidebar)
	}

	return (
		<Fragment>
		 <div className={sidebar ? "sidebar" : "sidebar active"}>
			<div  className="logo_content">
			<div className="logo" >
				<i className='bx bxs-music'></i>
				<div onClick={() => props.history.push("/")} className="logo_name" >Tellius</div>
			</div>
			<i className={sidebar? 'bx bx-menu' : "bx bx-menu-alt-right"} id="btn" onClick={onClickBtn} ></i>
			</div>
			<ul className="nav_list">
			<li>
				<a href="#">
				<i className='bx bx-grid-alt' ></i>
				<span className="links_name">Home</span>
				</a>
				<span className="tooltip">Home</span>
			</li>
			<li>
				<a href="#">
				<i className='bx bx-user' ></i>
				<span className="links_name">Composer</span>
				</a>
				<span className="tooltip">Composer</span>
			</li>
			<li>
				<a href="#">
				<i className='bx bx-cloud-upload' ></i>
				<span className="links_name">Upload</span>
				</a>
				<span className="tooltip">Upload</span>
			</li>

			<li>
				<a href="#">
				<i className='bx bx-cog' ></i>
				<span className="links_name">Setting</span>
				</a>
				<span className="tooltip">Setting</span>
			</li>
			</ul>
			<div className="profile_content">
			<div className="profile">
				<div className="profile_details">

				<div className="name_job">
					<div className="name"><span className="name">Account Status:</span></div>
					<div className="job"><span>Logged In</span></div>
				</div>
				</div>
				<i className='bx bx-log-out' id="log_out" ></i>
			</div>
			</div>
		</div>
		
	</Fragment>
	)
}

export default SideBar
