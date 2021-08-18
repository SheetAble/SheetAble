import React from 'react'

function SheetBox({ sheet }) {
	return (
		<div className="box-container remove_shadow" >
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

export default SheetBox
