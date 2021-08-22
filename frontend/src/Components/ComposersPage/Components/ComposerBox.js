import React from 'react'

import { useHistory } from "react-router-dom";

function ComposerBox({ composer }) {
	let history = useHistory();

	return (
		<li key={composer.name} className="li-height">
			<div className="box-container remove_shadow" >
					<img className="thumbnail-image" src={composer.portrait_url} alt="image" />
					<div className="sheet-name-container">
						<span className="sheet-name">{composer.name}</span>
					</div>
					<div className="sheet-composer-container">
						<span className="sheet-composer">{composer.epoch}</span>
				</div>
			</div>
		</li>
	)
}

export default ComposerBox
