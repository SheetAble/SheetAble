import React from "react";

import { useHistory } from "react-router-dom";

import axios from "axios";

function SheetBox({ sheet }) {
  let history = useHistory();

  return (
    <li
      key={sheet.sheet_name}
      onClick={() =>
        history.push(`/sheet/${sheet.pdf_url.split("pdf/").pop()}`)
      }
      className="li-height"
    >
      <div className="box-container remove_shadow">
        <img
          className="thumbnail-image"
          src={`${axios.defaults.baseURL}/sheet/thumbnail/${sheet.safe_sheet_name}`}
          alt="Sheet Thumbnail"
        />
        <div className="sheet-name-container">
          <span className="sheet-name">{sheet.sheet_name}</span>
        </div>
        <div className="sheet-composer-container">
          <span className="sheet-composer">{sheet.composer}</span>
        </div>
      </div>
    </li>
  );
}

export default SheetBox;
