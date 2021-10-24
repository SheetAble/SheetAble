import React from 'react'
import './InformationCard.css'
import { dominantColors } from '../../../Utils/colors';
import { IconButton } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";

function InformationCard({ infoText, tags }) {

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
        <div className="add">
          <IconButton>
            <AddIcon />
          </IconButton>
        </div>
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
