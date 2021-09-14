import React, {useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux'
import { editComposer, resetData } from '../../Redux/Actions/dataActions'

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond'

// Import the plugin code
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Import FilePond styles
import 'filepond/dist/filepond.min.css'

import sharp from 'sharp'


registerPlugin(FilePondPluginFileValidateType);


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

	const [files, setFiles] = useState([])


	useEffect(() => {
		if (files[0] !== undefined){
			let outputFile = "output.png"
			/*
			sharp(files[0].file).resize({ height: 780 }).toFile(outputFile)
				.then(function(newFileInfo) {
					// newFileInfo holds the output file properties
					console.log("Success")
				})
				.catch(function(err) {
					console.log("Error occured");
				});
			*/
		}
		
	}, [files])

	const readPhoto = async (photo) => {
		const canvas = document.createElement('canvas');
		const img = document.createElement('img');

		// create img element from File object
		img.src = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.readAsDataURL(photo);
		});
		await new Promise((resolve) => {
			img.onload = resolve;
		});

		// draw image in canvas element
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

		return canvas;
	};


	return (
		<div className="upload edit-wrapper">
			<form noValidate autoComplete="off">
  				<TextField id="standard-basic" label="Name" className="form-field" name="name" value={name} onChange={handleChange}/>
				<TextField id="standard-basic" label="Epoch" className="form-field comp" name="epoch" value={epoch} onChange={handleChange} />
				
			</form>
			
			 <FilePond
				files={files}
				onupdatefiles={(f) => {
          			setFiles(f)  
        		}}
				allowMultiple={false}
				server={ {
          			process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            			load()
        		}}}
				maxFiles={1}
				name="files"
				labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
				credits={false}
				allowFileTypeValidation={true}
				acceptedFileTypes={['image/jpeg', 'image/png']}
      		/>


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
