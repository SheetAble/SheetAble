import React, { useState } from 'react'
import './InformationCard.css'
import { dominantColors } from '../../../Utils/colors';
import { IconButton } from '@material-ui/core';
import EditIcon from "@material-ui/icons/Edit";
import Modal from '../../Sidebar/Modal/Modal';
import ModalContent from './ModalContentTag.js'

function InformationCard({ infoText, tags, sheetName }) {

  const [modal, setModal] = useState(false)

  return (
    <div className="information_card">
      <div className="header_wrapper">
        <h1>Information</h1>
        {tags.map((tag) => (
          <div>
            <a
              href={`/tag/${encodeURIComponent(tag)}`}
              style={{ textDecoration: "none", color: "black" }}
            >
              <span
                className="dot"
                style={{
                  backgroundColor:
                    dominantColors[
                      Math.floor(Math.random() * dominantColors.length)
                    ],
                }}
              />

              <span>{tag}</span>
            </a>
          </div>
        ))}
        <span>&nbsp;&nbsp;</span>
        <div className="add" onClick={() => setModal(true)}>
          <IconButton>
            <EditIcon />
          </IconButton>
        </div>
        <Modal title="Edit Tag" onClose={() => setModal(false)} show={modal}>
          <ModalContent onClose={() => setModal(false)} sheetName={sheetName} tags={tags} />
        </Modal>
      </div>
      <div className="info_text">
        <span>{infoText}</span>
        
      </div>
    </div>
  );
}

export default InformationCard
