import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import SheetBox from './SheetBox'

import { connect } from 'react-redux'
import { getSheetPage, incrementPage, setPage } from '../../Redux/Actions/dataActions'

import './SheetsPage.css'

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
				<div className="sheets-wrapper">
					<div className="doc_header">
						<span className="doc_sheet">Sheets in your library</span>
						<br />
						<span className="doc_composer">Recent Uploads</span>
					</div>
					<ul className="all-sheets-container full-height">					
						{sheetPages[page].map(sheet => {
							return (
								<SheetBox sheet={sheet}/>
							)
						})}
					</ul>
				</div>
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