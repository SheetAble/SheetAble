import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router';
import SideBar from '../Sidebar/SideBar'
import { getTagSheets } from '../../Redux/Actions/dataActions';
import { connect } from 'react-redux';


function TagsPage({ getTagSheets }) {
	
	const { tagName } = useParams();	
	const decoded = decodeURIComponent(tagName)
	console.log(decoded);

	const [sheets, setSheets ] = useState([])

	useEffect(() => {
		getTagSheets(decoded, (data) => {
			setSheets(data)
		})
	}, [])

	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<h1>{decoded}</h1>
			</div>
    	</Fragment>
  );
}

const mapStateToProps = (state) => ({
  
});

const mapActionsToProps = {
	getTagSheets
};

export default connect(mapStateToProps, mapActionsToProps)(TagsPage);
