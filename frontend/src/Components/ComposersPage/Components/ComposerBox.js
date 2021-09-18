import React from 'react'

import { useHistory } from "react-router-dom";
import { getCompImgUrl } from '../../../Utils/utils';

function ComposerBox({ composer }) {
	let history = useHistory();
	const imgUrl = getCompImgUrl(composer.portrait_url)
	
	return (
		<li key={composer.name} className="li-height" onClick={() => history.push(`/composer/${composer.safe_name}`)}>
			<div className="box-container remove_shadow" >
					<img className="thumbnail-image" src={imgUrl} alt="portrait" />
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
