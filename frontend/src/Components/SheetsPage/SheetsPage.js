import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import SheetBox from './SheetBox'

import { connect } from 'react-redux'
import { getSheetPage, incrementPage, setPage } from '../../Redux/Actions/dataActions'


function SheetsPage({ getSheetPage, sheetPages, incrementPage, page, setPage} ) {
	useEffect(() => {
		const data = {
			page: page,
			sortBy: "updated_at desc"
		}
		setPage(1)
		getSheetPage(data)
	}, [])
	
	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<ul>
					<li>
						{sheetPages[page].map(sheet => {
							return (
								<SheetBox sheet={sheet}/>
							)
						})}
						
					</li>
				</ul>
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	sheetPages: state.data.sheetPages,
	page: state.data.page
})

const mapActionsToProps = {
    getSheetPage,
	incrementPage,
	setPage
}

export default connect(mapStateToProps, mapActionsToProps)(SheetsPage)



/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/