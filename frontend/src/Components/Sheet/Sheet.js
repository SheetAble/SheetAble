import React from 'react'
import { Fragment } from 'react';

import { useParams } from "react-router-dom";

import SideBar from '../Navbar/SideBar'

function Sheet() {
	let { sheetName } = useParams();

	return (
		 <Fragment>
			<SideBar />
			<div className="home_content">
				{sheetName}	
			</div>
		</Fragment>            
	)
}

export default Sheet
