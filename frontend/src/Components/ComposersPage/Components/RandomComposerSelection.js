import React, { useEffect, useState } from 'react'

import LoadingAnimation from '../../../Images/Animations/Loading.svg'
import { useHistory } from 'react-router';

function RandomComposerSelection({ composerPages, page }) {
	
	const [loading, setLoading] = useState(true)	
	
	const [composer, setComposer] = useState(undefined)

	const [bubblyButton, setBubblyButton] = useState("bubbly-button")

	const pickComposer = () => {
		setLoading(true)
		return composerPages[page][Math.floor(Math.random()*composerPages[page].length)];
	}



	useEffect(() => {
		setComposer(pickComposer())
		setLoading(false)
	}, [])


	var animateButton = function(e) {

		e.preventDefault;
		//reset animation
		
		setBubblyButton("bubbly-button")
		
		setBubblyButton("bubbly-button animate")


		setComposer(pickComposer())
		setLoading(false)

		setTimeout(function(){
			setBubblyButton("bubbly-button")
		},700);
	};

	let history = useHistory()

	return (	
		<div className="box rand-piece">

			{loading? <img className="loading-animation-rand" src={LoadingAnimation}/> :
			(
				<div>
					<div className="cursor">
						<img className="rand-img" src={composer.portrait_url} alt="image" />
						<div className="sheet-name-container">
							<span className="sheet-name">{composer.name}</span>
						</div>
						<div className="sheet-composer-container">
							<span className="sheet-composer">{composer.epoch}</span>
						</div>
					</div>
					<button onClick={animateButton} className={bubblyButton}>
						Shuffle
					</button>
				</div>
			)
			}
			
		</div>
	)
}

export default RandomComposerSelection
