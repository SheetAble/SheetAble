import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router';
import SideBar from '../Sidebar/SideBar'
import { getTagSheets } from '../../Redux/Actions/dataActions';
import { connect } from 'react-redux';
import { dominantColors } from '../../Utils/colors';
import './TagsPage.css'


function TagsPage({ getTagSheets }) {
	
	const { tagName } = useParams();	
	const decoded = decodeURIComponent(tagName)

	const [sheets, setSheets ] = useState([])

	useEffect(() => {
		getTagSheets(decoded, (data) => {
			setSheets(data)
		})
	}, [])

	return (
    <Fragment>
      <SideBar />
      <div className="home_content tags_page">
        <div className="header">
			<span
			className="dot"
			style={{
				backgroundColor:
				dominantColors[Math.floor(Math.random() * dominantColors.length)],
			}}
			/>
			<h1>{decoded}</h1>
		</div>
        {sheets.length != 0 ? (
          <div>
            <span>{sheets[0].safe_sheet_name}</span>
          </div>
        ) : (
          <p>loading</p>
        )}
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
