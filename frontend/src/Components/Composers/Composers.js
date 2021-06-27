import React from 'react'

import './Composers.css'

function Composers(props) {
	const { composers } = props

	const composerItems = composers.map((composer) => {
		return (
			<li key={composer.name}>
				<div className="box-container-comp ripple">
					<img className="thumbnail-image-comp" src="https://assets.openopus.org/portraits/72753742-1568084874.jpg" alt="image" />
					<div className="comp-name-container">
						<span className="comp-name">{composer.name}</span>
					</div>
					<div className="life-container">
						<span className="life-text">1810.01.01 - 1849.01.01</span>
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
