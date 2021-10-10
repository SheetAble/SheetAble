import React from 'react'

function InformationCard() {
	return (
    <div className="video_player">
      <span className="coming_soon">Media Player Coming Soon</span>
      <div>
        <span>
          <a href="/newsletter" target="_blank">
            Sign up
          </a>{" "}
          for the newsletter, so you don't miss any updates
        </span>
      </div>
    </div>
  );
}

export default InformationCard
