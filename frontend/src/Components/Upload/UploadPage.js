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

	const [requestData, setrequestData] = useState({
		uploadFile: undefined,
		composer: "",
		sheetName: "",
		releaseDate: ""
	})

	const firstButtonOnClick = (e) => {
		e.preventDefault();
		setfirstButtonText("Saving...")
		setcontainerClasses("container center slider-two-active")
	};

	const secondButtonOnClick = (e) => {
		e.preventDefault();
		setSecondButtonText("Saving...")
		setcontainerClasses("container full slider-three-active")
	}

	const handleChange = (event) => {
        setrequestData({
			...requestData,
			[event.target.name]: event.target.value
		})    
    }

	return (
		<div class={containerClasses}>
			<div class="steps">
				<div class="step step-one">
				<div class="liner"></div>
				<span>Information</span>
				</div>
				<div class="step step-two">
				<div class="liner"></div>
				<span>Composer Name</span>
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
					<h2>Type in the data of the sheet</h2>
					<label class="input">
						<input type="text" class="name" name="sheetName" placeholder="What's the name of the sheet?" onChange={handleChange}/>
						<input type="text" class="name" name="composer" placeholder="What is the name of the composer?" onChange={handleChange}/>
					</label>					
					<button class="first next interactive-form-button" onClick={firstButtonOnClick}>{firstButtonText}</button>
				</form>
				<form class="slider-form slider-two">
					<h2>From whom</h2>
					<label class="input">
					<input type="text" class="name" name="sheetName" placeholder="What is the name of the composer?" onChange={handleChange}/>
					</label>
					<button onClick={secondButtonOnClick} class="second next interactive-form-button">{secondButtonText}</button>
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
