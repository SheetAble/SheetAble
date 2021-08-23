import React, { Fragment } from 'react'
import { useParams } from 'react-router';

import SideBar from '../Sidebar/SideBar'

function Composer() {
	const { composerName } = useParams();
	
	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				{composerName}
			</div>
		</Fragment>
	)
}

export default Composer
