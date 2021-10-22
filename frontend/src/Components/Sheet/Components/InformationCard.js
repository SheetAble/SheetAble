import React from 'react'
import './InformationCard.css'
import { useHistory } from 'react-router'

function InformationCard({ infoText, tags }) {

  const colors = [
    "#FF6A6A",
    "#0DAB76",
    "#00E5E8",
    "#5C5D8D",
    "#99B2DD",
    "#9381FF",
    "#B8B8FF",
  ]; // list of dominant colors for the tags

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
                  colors[Math.floor(Math.random() * colors.length)],
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
