import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {
  addNewTag,
  deleteTag,
  editInfoText,
} from "../../../Redux/Actions/dataActions";
import { connect } from "react-redux";

function ModalContent(props) {
  const [tagName, setTagName] = useState("");
  const [infoText, setInfoText] = useState(
    "Write a short information text about your sheet."
  );
  const [value, setValue] = useState(props.tags[0]);
  const [showInfoEdit, setShowInfoEdit] = useState(false);

  const infoEdit = (
    <div className="add_tag">
      <form noValidate autoComplete="off">
        <TextField
          id="outlined-multiline-flexible"
          label="Info Text"
          placeholder="What is this sheet about?"
          className="form-field"
          name="tagName"
          multiline
          rows={6}
          value={infoText}
          onChange={(e) => setInfoText(e.target.value)}
        />
      </form>
      <div className="buttons">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowInfoEdit(false)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={
            infoText == "Write a short information text about your sheet."
          }
          onClick={() => props.editInfoText(infoText, props.sheetName)}
        >
          Edit Info Box
        </Button>
      </div>
    </div>
  );

  if (!showInfoEdit) {
    return (
      <div className="add_tag delete_tag">
        <div>
          <form noValidate autoComplete="off">
            <TextField
              id="standard-basic"
              label="Tag Name"
              className="form-field"
              name="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </form>
          <div className="buttons">
            <Button
              variant="contained"
              color="primary"
              disabled={tagName == ""}
              onClick={() => props.addNewTag(tagName, props.sheetName)}
            >
              Add Tag
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowInfoEdit(true)}
            >
              Edit Info Box
            </Button>
          </div>
        </div>
        <div>
          <form noValidate autoComplete="off">
            <select onChange={(e) => setValue(e.target.value)} value={value}>
              {props.tags.map((tag) => (
                <option value={tag}>{tag}</option>
              ))}
            </select>
          </form>
          <Button
            variant="contained"
            color="primary"
            onClick={() => props.deleteTag(value, props.sheetName)}
          >
            Delete Tag
          </Button>
        </div>
      </div>
    );
  }
  return infoEdit;
}

const mapActionsToProps = {
  addNewTag,
  deleteTag,
  editInfoText,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(ModalContent);
