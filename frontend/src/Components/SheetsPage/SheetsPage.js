import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import SheetBox from './SheetBox'

import { connect } from 'react-redux'
import { getSheetPage, incrementPage, setPage, decrementPage } from '../../Redux/Actions/dataActions'

import './SheetsPage.css'

function SheetsPage({ getSheetPage, sheetPages, incrementPage, decrementPage, page, setPage, totalPages} ) {
	useEffect(() => {
		getData()		
	}, [])
	
	const getData = () => {
		console.log("loggin");
		const data = {
			page: page,
			sortBy: "updated_at desc"
		}
		
		getSheetPage(data)
	}

	const svgDec = (e) => {
		e.preventDefault()
		if (page != 1) {
			decrementPage() 
			getData()
		} 	
	}

	const svgInc = (e) => {
		e.preventDefault()
		if (page != totalPages) {
			incrementPage()  
			getData()
		}
		
	}


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
						{sheetPages[page] == undefined ?
							setPage(1) :
							sheetPages[page].map(sheet => {
								return (
									<SheetBox sheet={sheet}/>
								) 
						})}
					</ul>
					<div className="page-info-wrapper">
						<svg xmlns="http://www.w3.org/2000/svg" width="8" height="11.5" viewBox="0 0 7.41 12" onClick={svgDec}
						 className={page != 1? "" : "disabled"}>
  							<path id="ic_chevron_right_24px" d="M14.59,6,16,7.41,11.42,12,16,16.59,14.59,18l-6-6Z" transform="translate(-8.59 -6)" fill="#464646"/>
						</svg>

						<span>Page <b>{page}</b> of <b>{totalPages}</b></span>
						<svg xmlns="http://www.w3.org/2000/svg" width="8" height="11.5" viewBox="0 0 7.41 12" onClick={svgInc} className={page != totalPages ? "svg-2" : "svg-2 disabled"}>
  							<path id="ic_chevron_right_24px" d="M10,6,8.59,7.41,13.17,12,8.59,16.59,10,18l6-6Z" transform="translate(-8.59 -6)" fill="#464646"/>
						</svg>	

					</div>
				</div>
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	sheetPages: state.data.sheetPages,
	page: state.data.page,
	totalPages: state.data.totalPages
})

const mapActionsToProps = {
    getSheetPage,
	incrementPage,
	decrementPage,
	setPage
}

export default connect(mapStateToProps, mapActionsToProps)(SheetsPage)



/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/