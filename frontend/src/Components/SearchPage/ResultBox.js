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
    <div>
      {		searchResponse.map((sheet) => {
            return <SheetBox sheet={sheet} key={sheet.sheet_name} />;
          })}
    </div>
  );
}

export default ResultBox
