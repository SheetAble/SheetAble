import React from 'react'
import './Navbar.css'


function Navbar() {
	return (
		<div className="navContainer">
			<ul className="navULStyle">
				<li className="navLIStyle">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="22" viewBox="0 0 28.355 22.645">
  						<path id="ic_menu_24px" d="M3,28.645H31.355V24.871H3Zm0-9.435H31.355V15.435H3ZM3,6V9.774H31.355V6Z" transform="translate(-3 -6)" fill="#fff"/>
					</svg>
				</li>
				<li className="navLIStyle">
					<a href="/" className="telliusHeaderNav">Tellius</a>
				</li>
				<li className="navLIStyle">
					<div className="navSearchBarDiv">
 		 				<input className="navSearchBar" type="text" placeholder="Type something here..." />
					</div>
				</li>
			</ul>
		</div>
	)
}

export default Navbar
