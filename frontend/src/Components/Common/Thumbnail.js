import React, { useState } from "react";
import axios from "axios";

import "./Thumbnail.css";

const Thumbnail = ({ sheet, width = 150 }) => {
  const [error, setError] = useState(false);

  const thumbnailUrl = `${axios.defaults.baseURL}/sheet/thumbnail/${sheet.safe_sheet_name}`;

  if (error) {
    return (
      <div className="thumbnail-no-preview" style={{ width: `${width}px` }}>
        <img className="thumbnail-image-no-preview" src="/musical-note.png" style={{ width: '32px', opacity: 0.3, marginBottom: '4px' }} alt="" />
        <span style={{ fontSize: '11px', fontWeight: '500' }}>No Preview</span>
      </div>
    );
  }

  return (
    <img
      className="thumbnail-image"
      src={thumbnailUrl}
      alt={sheet.sheet_name}
      onError={() => setError(true)}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
};

export default Thumbnail;
