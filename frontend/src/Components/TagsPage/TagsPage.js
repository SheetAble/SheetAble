import React, { Fragment } from 'react'
import { useParams } from 'react-router';
import SideBar from '../Sidebar/SideBar'

function TagsPage() {
	
	const { tagName } = useParams();	
	const decoded = decodeURIComponent(tagName)
	console.log(decoded);


	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<h1>{decoded}</h1>
			</div>
    	</Fragment>
  );
}

export default TagsPage
