import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { deleteTag } from "../../../Redux/Actions/dataActions";
import { connect } from "react-redux";

function DeleteModalContent(props) {
  	const [tagName, setTagName] = useState("");
	const [value, setValue] = useState("");

	return (
    <div className="delete_tag">
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
        disabled={value == ""}
        onClick={() => props.deleteTag(value, props.sheetName)}
      >
        Delete Tag
      </Button>
    </div>
  );
}

const mapActionsToProps = {
  deleteTag,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(DeleteModalContent);
