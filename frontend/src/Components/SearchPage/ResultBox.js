import React, { useEffect } from 'react'

function ResultBox({ searchResponse }) {

	useEffect(() => {
		console.log(searchResponse);
	}, [searchResponse])

	return (
		<div className="result_wrapper">
		<div className="span_wrapper">
			<span>No results found yet...</span>
		</div>
		</div>
	);
}

export default ResultBox
