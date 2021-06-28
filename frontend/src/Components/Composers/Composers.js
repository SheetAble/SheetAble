import React from 'react'

import './Composers.css'

function Composers(props) {
	const { composers } = props
	console.log(composers);
	const composerItems = composers.map((composer) => {
		return (
			<li key={composer.name}>
				<div className="box-container-comp ripple">
					<img className="thumbnail-image-comp" src={composer.portrait_url} alt="image" />
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
