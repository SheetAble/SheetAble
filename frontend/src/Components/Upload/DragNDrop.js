import React from 'react'

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


function DragNDrop({ giveModalData }) {
  //const [files, setFiles] = useState(undefined)
  
  const uploadFinish = (files) => {
    giveModalData(files[0].file)
  }
  
  const removeFile = () => {
    giveModalData(undefined)
  }

  return (
    <div className="upload-container">
      <FilePond
        onupdatefiles={(files) => {
          uploadFinish(files)  
        }}
        onremovefile={removeFile}
        allowMultiple={false}
        server={ {
          process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
            load()
        }}}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        credits={false}
        allowFileTypeValidation={true}
        acceptedFileTypes={['application/pdf']}
      />
    </div> 
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
