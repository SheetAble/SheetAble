import React, { useEffect } from 'react'
import SheetBox from '../SheetsPage/Components/SheetBox';

function ResultBox({ searchResponse }) {

	useEffect(() => {
		console.log(searchResponse);
	}, [searchResponse])

	return (
		<div className="result_wrapper">
			{searchResponse.length == 0 ? 
				<NoResults />
				:
				<Results searchResponse={searchResponse}/>
			}
		
		</div>
	);
}

function NoResults() {
	return (
		<div className="span_wrapper">
			<span>No results found yet...</span>
		</div>
  	);
}

function Results({ searchResponse }) {
	return (
		<div className="span_wrapper">
			<SheetBox sheet={searchResponse[0]}/>
		</div>
	)
}

export default ResultBox
