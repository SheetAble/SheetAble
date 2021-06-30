import React, { useState } from 'react'
import ReactDOM from 'react-dom'

// Import React FilePond
import { FilePond, File, registerPlugin } from 'react-filepond'

// Import the plugin code
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';


// Import FilePond styles
import 'filepond/dist/filepond.min.css'

registerPlugin(FilePondPluginFileValidateType);


export default function DragNDrop() {
  const [files, setFiles] = useState([])
  

  return (
    <div className="upload-container">
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
		server={ {
        process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
         	load()
        }}}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
		credits={false}
		allowFileTypeValidation={true}
		acceptedFileTypes={['application/pdf']}
      />
    </div>
  )
}

