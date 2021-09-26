import React, { Fragment, useState } from 'react'
import SideBar from '../Sidebar/SideBar'
import './SearchPage.css'

function SearchPage() {
	
	const [searchValue, setSearchValue] = useState("")

	const handleSubmit = () => {
		console.log(searchValue);
	}
	
	/* Checks if Enter is pressed while in input */
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
      		handleSubmit()
    	}
	}
	
	return (
		<div>
			<Fragment>
			<SideBar />
			<div className="home_content">
				<div className="search_wrapper">
					<div className="search_input_box">
						<input 
							type="text" 
							name="text" 
							placeholder="Search for sheets or composers" 
							value={searchValue} 
							onChange={(e) => setSearchValue(e.target.value)}
							onKeyDown={handleKeyDown}	
						/>
						<i className='bx bx-search-alt-2 cursor' onClick={handleSubmit}></i>
					</div>

					<div className="result_wrapper">
						<div className="span_wrapper">
							<span>No results found yet...</span>
						</div>
					</div>

				</div>
			</div>
		</Fragment>
		</div>
	)
}

export default SearchPage
