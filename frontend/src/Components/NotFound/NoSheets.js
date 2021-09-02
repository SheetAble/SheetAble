import React from 'react'

import lostImage from '../../Images/lost.svg'

import './NoSheets.css'

function NoSheets() {
	return (
		
		<div className="lost-image-container">
			<span className="lost-text-header">Whooops!</span>
			<span className="lost-text">Seems like you haven't uploaded any sheets yet.</span> 
			<img src={lostImage} className="lost-image" />
		</div>
		
	)
}

export default NoSheets
