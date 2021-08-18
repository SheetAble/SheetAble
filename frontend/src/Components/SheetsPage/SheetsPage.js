import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import SheetBox from './SheetBox'

import { connect } from 'react-redux'
import { getSheetPage, incrementPage } from '../../Redux/Actions/dataActions'


function SheetsPage({ getSheetPage, sheetPages, incrementPage, page} ) {
	useEffect(() => {
		const data = {
			page: 1,
			sortBy: "updated_at desc"
		}
		getSheetPage(data)
	}, [])
	
	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<button onClick={incrementPage}>
					{page} I
				</button>
				{ /*<SheetBox sheet={sheet}/> */}
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
	incrementPage
}

export default connect(mapStateToProps, mapActionsToProps)(SheetsPage)



/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/