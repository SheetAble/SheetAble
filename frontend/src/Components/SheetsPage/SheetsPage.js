import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import SheetBox from './SheetBox'

import { connect } from 'react-redux'
import { getSheetPage } from '../../Redux/Actions/dataActions'


function SheetsPage({ getSheetPage, sheetPages} ) {
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
				{ /*<SheetBox sheet={sheet}/> */}
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	sheetPages: state.data.sheetPages
})

const mapActionsToProps = {
    getSheetPage
}

export default connect(mapStateToProps, mapActionsToProps)(SheetsPage)



/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/