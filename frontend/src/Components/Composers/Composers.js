import React from 'react'
import { useHistory } from 'react-router';
import { getCompImgUrl } from '../../Utils/utils';

import './Composers.css'

function Composers(props) {
	const { composers } = props

	const history = useHistory()

	const composerItems = composers.map((composer) => {

		const imgUrl = getCompImgUrl(composer.portrait_url)

		return (
			<li key={composer.name} onClick={() => history.push(`/composer/${composer.safe_name}`)}>
				<div className="box-container-comp remove_shadow">
					<img className="thumbnail-image-comp" src={imgUrl} alt="Portrait" />
					<div className="comp-name-container">
						<span className="comp-name">{composer.name}</span>
					</div>
					<div className="life-container">
						<span className="life-text">{composer.epoch}</span>
					</div>
				</div>
			</li>
		)
	}
 	
	);

	return (
		<ul className="all-comp-container">
			{composerItems}
		</ul>
	)
}



export default Composers
