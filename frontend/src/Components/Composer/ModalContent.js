import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { connect } from "react-redux";
import { editComposer, resetData } from "../../Redux/Actions/dataActions";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import the plugin code
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginFileValidateType);

function ModalContent(props) {
  const [name, setName] = useState(props.composer.name);
  const [epoch, setEpoch] = useState(props.composer.epoch);
  const [disabled, setDisabled] = useState(true);

  const handleChange = (event) => {
    if (event.target.name === "name") {
      setName(event.target.value);
    } else {
      setEpoch(event.target.value);
    }
  };

  useEffect(() => {
    if (name !== props.composer.name || epoch !== props.composer.epoch) {
      setDisabled(false);
    }
  }, [name, epoch]);

  const sendRequest = () => {
    props.editComposer(
      props.composer.safe_name,
      name,
      epoch,
      uploadFile,
      () => {
        props.resetData();
        window.location.replace("/");
      }
    );
  };

  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(undefined);

  useEffect(async () => {
    if (files[0] !== undefined) {
      const resizedImage = new File(
        [dataURItoBlob(await readPhoto(files[0].file))],
        "name.png"
      );
      setUploadFile(resizedImage);
      setDisabled(false);
    }
  }, [files]);

  const readPhoto = async (photo) => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");

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
    canvas.width = 200;
    canvas.height = 200;
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    let image = canvas.toDataURL("image/png");
    return image;
  };

  function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div className="upload edit-wrapper">
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Name"
          className="form-field"
          name="name"
          value={name}
          onChange={handleChange}
        />
        <TextField
          id="standard-basic"
          label="Epoch"
          className="form-field comp"
          name="epoch"
          value={epoch}
          onChange={handleChange}
        />
      </form>

      <FilePond
        files={files}
        onupdatefiles={(f) => {
          setFiles(f);
        }}
        allowMultiple={false}
        server={{
          process: (
            fieldName,
            file,
            metadata,
            load,
            error,
            progress,
            abort,
            transfer,
            options
          ) => {
            load();
          },
        }}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your 200x200 image or <span class="filepond--label-action">Browse</span>'
        credits={false}
        allowFileTypeValidation={true}
        acceptedFileTypes={["image/png"]}
      />

      <Button
        variant="contained"
        color="primary"
        disabled={disabled}
        onClick={sendRequest}
      >
        Edit Composer
      </Button>
    </div>
  );
}

const mapActionsToProps = {
  editComposer,
  resetData,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(ModalContent);
