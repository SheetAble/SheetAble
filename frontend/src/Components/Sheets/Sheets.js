import React, { useState } from 'react'

import './Sheet.css'



function Sheets(props) {
	const { sheets } = props
	
	const sheetItems = sheets.map((sheet) => {
		return (
			<div className="box-container ripple">
				<img className="thumbnail-image" src={`http://localhost:8080/sheet/thumbnail/${sheet.sheet_name}`} alt="image" />
				<div className="sheet-name-container">
					<span className="sheet-name">{sheet.sheet_name}</span>
				</div>
				<div className="sheet-composer-container">
					<span className="sheet-composer">{sheet.composer}</span>
				</div>
			</div>
		)
	}
 	
	);

	return (
		<ul className="all-sheets-container">
			{sheetItems}
		</ul>
	)
}

export default Sheets
