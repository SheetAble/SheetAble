import React, { useState, Fragment } from 'react'
import ReactDOM from 'react-dom'

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond'

// Import the plugin code
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Import FilePond styles
import 'filepond/dist/filepond.min.css'

// Redux Imports
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { uploadSheet } from '../../Redux/Actions/dataActions'


registerPlugin(FilePondPluginFileValidateType);


function DragNDrop({uploadSheet, requestData, secondButtonOnClick, secondButtonText}) {
  const [files, setFiles] = useState([])

  const [finishedRequest, setfinishedRequest] = useState(true)

  const uploadFinish = () => {
    requestData.uploadFile = files[0].file
    uploadSheet(requestData)
    setfinishedRequest(false)
  }
  
  return (
    <Fragment>
    <div className="upload-container">
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
		server={ {
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
          load()
          uploadFinish()
        }}}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        credits={false}
        allowFileTypeValidation={true}
        acceptedFileTypes={['application/pdf']}
      />
    </div>
    
    <button disabled={finishedRequest} onClick={secondButtonOnClick} class="second next interactive-form-button">{secondButtonText}</button>
    </Fragment>
  )
}




DragNDrop.propTypes = {
    uploadSheet: PropTypes.func.isRequired,
}


const mapActionsToProps = {
    uploadSheet
}

const mapStateToProps = (state) => ({
  
})




export default connect(mapStateToProps, mapActionsToProps)(DragNDrop)
