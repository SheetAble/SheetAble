import React, { useEffect, useState } from 'react'

import LoadingAnimation from '../../../Images/Animations/Loading.svg'
import { useHistory } from 'react-router';
import { getCompImgUrl } from '../../../Utils/utils';

function RandomComposerSelection({ composerPages, page }) {
	
	const [loading, setLoading] = useState(true)	
	
	const [composer, setComposer] = useState(undefined)
	const [imgUrl, setImgUrl] = useState(undefined)

	const [bubblyButton, setBubblyButton] = useState("bubbly-button")

	const pickComposer = () => {
		setLoading(true)
		const comp = composerPages[page][Math.floor(Math.random()*composerPages[page].length)];
		setImgUrl(getCompImgUrl(comp.portrait_url))
		return comp
	}



	useEffect(() => {
		
		setComposer(pickComposer())
		
		setLoading(false)
	}, [])


	var animateButton = function(e) {

		e.preventDefault();
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

			{loading? <img className="loading-animation-rand" src={LoadingAnimation} alt=""/> :
			(
				<div>
					<div >
						<img className="rand-img cursor" src={imgUrl} alt="Portrait" onClick={() => history.push(`/composer/${composer.name}`)}/>
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
