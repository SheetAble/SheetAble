import React, { Fragment, useState } from 'react'
import { useParams } from 'react-router';
import { findComposer } from '../../Utils/utils';

import { connect } from 'react-redux';

import './Composer.css'

import SideBar from '../Sidebar/SideBar'

function Composer({ composerPages }) {
	const { composerName } = useParams();

	const [composer, setComposer] = useState(findComposer(composerName, composerPages))

	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<div className="composer-page">
					<img src={composer.portrait_url}/>
					<h5>{composer.name}</h5>
					<h6>{composer.epoch}</h6>
				</div>
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	composerPages: state.data.composerPages,
})

const mapActionsToProps = {
    
}

export default connect(mapStateToProps, mapActionsToProps)(Composer)
