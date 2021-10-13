import React from 'react'
import './InformationCard.css'


function InformationCard({ infoText, tags }) {
  return (
    <div className="information_card">
      <div className="header_wrapper">
        <h1>Information</h1>
        <div>
          <span className="dot" />
          <span>{tags[0]}</span>
        </div>
      </div>
      <div className="info_text">
        <span>{infoText}</span>
      </div>
    </div>
  );
}

export default InformationCard
