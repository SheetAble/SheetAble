import React from 'react'
import './InformationCard.css'
import { useHistory } from 'react-router'
import { dominantColors } from '../../../Utils/colors';

function InformationCard({ infoText, tags }) {
  const history = useHistory()

  return (
    <div className="information_card">
      <div className="header_wrapper">
        <h1>Information</h1>
        {tags.map((tag) => (
          <div className="tag_tooltip" onClick={() => history.push(`/tag/${encodeURIComponent(tag)}`)}>
            <span
              className="dot"
              style={{
                backgroundColor:
                  dominantColors[Math.floor(Math.random() * dominantColors.length)],
              }}
            />

            <span>{tag}</span>
            <span className="tag_tooltiptext">test</span>
          </div>
        ))}
        <span>&nbsp;&nbsp;</span>
      </div>
      <div className="info_text">
        <span>{infoText}</span>
              <br />
        <div className="tag_tooltip">
          <span>test</span>
          
          <span className="tag_tooltiptext">test</span>
        </div>
      </div>
    </div>
  );
}

export default InformationCard
