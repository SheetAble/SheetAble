import React from 'react'

import { useParams } from "react-router-dom";


function Sheet() {
	let { sheetName } = useParams();

	return (
		<div>
			{sheetName}	
		</div>
	)
}

export default Sheet
