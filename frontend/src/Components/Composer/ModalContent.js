import React, {useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux'
import { editComposer, resetData } from '../../Redux/Actions/dataActions'



function ModalContent(props) {
	
	const [name, setName] = useState(props.composer.name)
	const [epoch, setEpoch] = useState(props.composer.epoch)
	const [disabled, setDisabled] = useState(true)


	const handleChange = (event) => {
		if (event.target.name === "name") {
			setName(event.target.value)
		} else {setEpoch(event.target.value)}
	}

	useEffect(() => {
		if (name !== props.composer.name || epoch !== props.composer.epoch) {
			setDisabled(false)
		}
	}, [name, epoch])

	const sendRequest = () => {
		props.editComposer(props.composer.name, name, epoch, () => {
			props.resetData()
			window.location.replace("/")
		})
	}


	return (
		<div className="upload edit-wrapper">
			<form noValidate autoComplete="off">
  				<TextField id="standard-basic" label="Name" className="form-field" name="name" value={name} onChange={handleChange}/>
				<TextField id="standard-basic" label="Epoch" className="form-field comp" name="epoch" value={epoch} onChange={handleChange} />
				
			</form>
			<Button variant="contained" color="primary" disabled={disabled} onClick={sendRequest}>
				Edit Composer
			</Button>
		</div>
	)
}


const mapActionsToProps = {
    editComposer,
	resetData
}

const mapStateToProps = (state) => ({
	
})

export default connect(mapStateToProps, mapActionsToProps)(ModalContent)
