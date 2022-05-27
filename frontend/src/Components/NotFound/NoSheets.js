import React, { useState } from "react";

import Modal from "../Sidebar/Modal/Modal";
import ModalContent from "../Sidebar/Modal/ModalContent";

function NoSheets() {
  const [uploadModal, setUploadModal] = useState(false);

  return (
    <div className="notfound">
      <div className="notfound-404">
        <h1>Oops!</h1>
        <h2>Upload Sheets to begin</h2>
      </div>
      <p onClick={() => setUploadModal(true)} className="cursor">
        Upload Sheet
      </p>
      <Modal
        title="Upload"
        onClose={() => setUploadModal(false)}
        show={uploadModal}
      >
        <ModalContent onClose={() => setUploadModal(false)} />
      </Modal>
    </div>
  );
}

export default NoSheets;
