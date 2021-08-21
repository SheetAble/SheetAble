import React from 'react'

import LoadingAnimation from '../../../Images/Animations/Loading.svg'

function RandomPieceSelection() {
	return (	
		<div className="box rand-piece">
			<span>Random Piece Selection</span>
			<img src={LoadingAnimation}/>
		</div>
	)
}

export default RandomPieceSelection
