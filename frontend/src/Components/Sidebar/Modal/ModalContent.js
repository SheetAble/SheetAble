import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField';
import DragNDrop from '../../Upload/DragNDrop';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux'
import { uploadSheet, getComposers, getComposerPage, getSheets, getSheetPage } from '../../../Redux/Actions/dataActions'



function ModalContent(props) {
	const [disabled, setDisabled] = useState(true)
	
	const [requestData, setRequestData] = useState({
		uploadFile: undefined,
		composer: "",
		sheetName: "",
		releaseDate: "1999-12-31",
	})

	const giveModalData = (file) => {
		setRequestData({...requestData, uploadFile: file})
		if (requestData.composer != "" && requestData.sheetName != "" && file != undefined) {
			setDisabled(false)
		}

		if (file == undefined) {
			setDisabled(true)
		}
	}

	const handleChange = (event) => {
        setRequestData({
			...requestData,
			[event.target.name]: event.target.value
		})    
		if (requestData.sheetName != "" && requestData.composer != "" && requestData.uploadFile != undefined) {
			setDisabled(false)
		}
    }

	const sendRequest = () => {
		props.uploadSheet(requestData)
		props.onClose()
		props.getSheets()
		props.getComposers()
		props.getSheetPage()
		props.getComposerPage() 
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
	getComposers,
	getComposerPage, 
	getSheets, 
	getSheetPage	
}

const mapStateToProps = (state) => ({
	
})

export default connect(mapStateToProps, mapActionsToProps)(ModalContent)
