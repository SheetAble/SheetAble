import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { addNewTag } from "../../../Redux/Actions/dataActions";
import { connect } from "react-redux";

function ModalContent(props) {
	
	const [tagName, setTagName] = useState("")

	return (
    <div className="add_tag">
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
      <Button
        variant="contained"
        color="primary"
        disabled={tagName == ""}
        onClick={() => props.addNewTag(tagName, props.sheetName)}
      >
        Add Tag
      </Button>
    </div>
  );
}

const mapActionsToProps = {
	addNewTag
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(ModalContent);
