import React from 'react'
import './InformationCard.css'


function InformationCard() {
	return (
    <div className="information_card">
      <div className="header_wrapper">
        <h1>Information</h1>
        <div>
          <span className="dot" />
          <span>depressed</span>
        </div>
      </div>
      <div className="info_text">
        <span>Lorem sadsa</span>
      </div>
    </div>
  );
}

export default InformationCard
