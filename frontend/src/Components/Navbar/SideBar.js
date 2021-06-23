import React, {Fragment, useState} from 'react'
import './SideBar.css'


function SideBar() {

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
		 <div class={sidebar ? "sidebar" : "sidebar active"}>
			<div class="logo_content">
			<div class="logo">
				<i class='bx bxl-c-plus-plus'></i>
				<div class="logo_name">Tellius</div>
			</div>
			<i class={sidebar? 'bx bx-menu' : "bx bx-menu-alt-right"} id="btn" onClick={onClickBtn} ></i>
			</div>
			<ul class="nav_list">
			<li>
				<a href="#">
				<i class='bx bx-grid-alt' ></i>
				<span class="links_name">Home</span>
				</a>
				<span class="tooltip">Home</span>
			</li>
			<li>
				<a href="#">
				<i class='bx bx-user' ></i>
				<span class="links_name">Composer</span>
				</a>
				<span class="tooltip">Composer</span>
			</li>
			<li>
				<a href="#">
				<i class='bx bx-cloud-upload' ></i>
				<span class="links_name">Upload</span>
				</a>
				<span class="tooltip">Upload</span>
			</li>

			<li>
				<a href="#">
				<i class='bx bx-cog' ></i>
				<span class="links_name">Setting</span>
				</a>
				<span class="tooltip">Setting</span>
			</li>
			</ul>
			<div class="profile_content">
			<div class="profile">
				<div class="profile_details">

				<div class="name_job">
					<div class="name"><span className="name">Account Status:</span></div>
					<div class="job"><span>Logged In</span></div>
				</div>
				</div>
				<i class='bx bx-log-out' id="log_out" ></i>
			</div>
			</div>
		</div>
		<div class="home_content">
			<div class="text">Home Content</div>
		</div>
	</Fragment>
	)
}

export default SideBar
