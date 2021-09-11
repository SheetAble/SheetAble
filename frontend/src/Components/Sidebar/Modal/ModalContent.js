import React, {useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField';
import DragNDrop from '../../Upload/DragNDrop';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux'
import { uploadSheet, resetData } from '../../../Redux/Actions/dataActions'



function ModalContent(props) {
	const [disabled, setDisabled] = useState(true)
	
	const [requestData, setRequestData] = useState({
		composer: "",
		sheetName: "",
		releaseDate: "1999-12-31",
	})

	const [uploadFile, setUploadFile] = useState(undefined)

	const giveModalData = (file) => {
		setUploadFile(file)
	}

	useEffect(() => {
		if (requestData.composer !== "" && requestData.sheetName !== "" && uploadFile !== undefined) {
			setDisabled(false)
		} else if (uploadFile === undefined) {
			setDisabled(true)
		}
		
	}, [requestData, uploadFile])

	const handleChange = (event) => {
        setRequestData({
			...requestData,
			[event.target.name]: event.target.value
		})    
    }

	const sendRequest = () => {

		const newData = {
			...requestData,
			uploadFile: uploadFile
		}

		const makeCalls = (_callback) => {
			props.uploadSheet(newData, () => {
				props.resetData()
				props.onClose()
				_callback()
			})
		}
		
		makeCalls(() => window.location.reload())
	}

	return (
		<div className="upload">
			<form noValidate autoComplete="off">
  				<TextField id="standard-basic" label="Sheet Name" className="form-field" name="sheetName" onChange={handleChange}/>
				<TextField id="standard-basic" label="Composer" className="form-field comp" name="composer" onChange={handleChange}/>
				
			</form>
			<DragNDrop giveModalData={giveModalData} />
			<Button variant="contained" color="primary" disabled={disabled} onClick={sendRequest}>
				Upload
			</Button>
		</div>
	)
}


const mapActionsToProps = {
    uploadSheet,
	resetData
}

const mapStateToProps = (state) => ({
	
})

export default connect(mapStateToProps, mapActionsToProps)(ModalContent)
