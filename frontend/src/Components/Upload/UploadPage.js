import React, {Fragment, useState} from 'react'
import SideBar from '../Navbar/SideBar'

import "./Upload.css"

function UploadPage() {
	return (
		<Fragment>
			<SideBar/>
			 <div className="home_content">
				<InteractiveForm />
            </div>
		</Fragment>
	)
}

const InteractiveForm = () => {

	const [firstButtonText, setfirstButtonText] = useState("Next Step")

	const [secondButtonText, setSecondButtonText] = useState("Next Step")

	const [containerClasses, setcontainerClasses] = useState("container slider-one-active")

	const firstButtonOnClick = (e) => {
		console.log("firstButton Clik");
		    e.preventDefault();

		setfirstButtonText("Saving...")
		
		setcontainerClasses("container center slider-two-active")
		
		
	};

	const secondButtonOnClick = (e) => {
		e.preventDefault();
		setSecondButtonText("Saving...")
		setcontainerClasses("container full slider-three-active")
	}

	return (
		<div class={containerClasses}>
			<div class="steps">
				<div class="step step-one">
				<div class="liner"></div>
				<span>Hello!</span>
				</div>
				<div class="step step-two">
				<div class="liner"></div>
				<span>Rating</span>
				</div>
				<div class="step step-three">
				<div class="liner"></div>
				<span>Conclusion</span>
				</div>
			</div>
			<div class="line">
				<div class="dot-move"></div>
				<div class="dot zero"></div>
				<div class="dot center"></div>
				<div class="dot full"></div>
			</div>
			<div class="slider-ctr">
				<div class="slider">
				<form class="slider-form slider-one">
					<h2>Step Form Design Experience</h2>
					<label class="input">
					<input type="text" class="name" placeholder="What's your name?" />
					</label>
					<button class="first next" onClick={firstButtonOnClick}>{firstButtonText}</button>
				</form>
				<form class="slider-form slider-two">
					<h2>Are you happy with our service?</h2>
					<div class="label-ctr">
					<label class="radio">
						<input type="radio" value="happy" name="condition" />
						<div class="emot happy">
						<div class="mouth sad"></div>
						</div>
					</label>
					<label class="radio">
						<input type="radio" value="happy" name="condition" />
						<div class="emot happy">
						<div class="mouth smile"></div>
						</div>
					</label>
					</div>
					<button onClick={secondButtonOnClick} class="second next">{secondButtonText}</button>
				</form>
				<div class="slider-form slider-three">
					<h2>Hello, <span class="yourname"></span></h2>
					<h3>Thank you for your input!
								</h3>
					<a class="reset" href="https://codepen.io/balapa/pen/XbXVRg" target="_blank">Reset</a>
				</div>
				</div>
			</div>
		</div>
	)
}

export default UploadPage
