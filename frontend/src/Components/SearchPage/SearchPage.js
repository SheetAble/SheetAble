import React, { Fragment } from 'react'
import SideBar from '../Sidebar/SideBar'
import './SearchPage.css'

function SearchPage() {
	return (
		<div>
			<Fragment>
			<SideBar />
			<div className="home_content">
				<div className="search_wrapper">
					<div className="search_input_box">
						<input type="text" name="text" placeholder="Search for sheets or composers"/>
						<i class='bx bx-search-alt-2'></i>
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
