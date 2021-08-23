import React, { Fragment, useEffect } from 'react'

import SideBar from '../Sidebar/SideBar'
import ComposerBox from './Components/ComposerBox'

import { connect } from 'react-redux'
import { getComposerPage, incrementComposerPage, setComposerPage, decrementComposerPage } from '../../Redux/Actions/dataActions'

import './ComposersPage.css'
import RandomComposerSelection from './Components/RandomComposerSelection'


function ComposersPage({ getComposerPage, composerPages, incrementComposerPage, setComposerPage, decrementComposerPage, composerPage, totalComposerPages	} ) {	
	useEffect(() => {
		getData()
	}, [])
	

	const getData = () => {
		if (composerPage == undefined || composerPage < 0 || composerPage > totalComposerPages ) {
			setComposerPage(1)
		}

		const data = {
			page: composerPage,
			sortBy: "updated_at desc"
		}
		
		if (composerPages == undefined || composerPages[composerPage] == undefined) {
			getComposerPage(data)
		}
	}

	const svgDec = (e) => {
		e.preventDefault()
		if (composerPage != 1) {
			decrementComposerPage() 
			getData()
		} 	
	}

	const svgInc = (e) => {
		e.preventDefault()
		if (composerPage != totalComposerPages) {
			incrementComposerPage()  
			getData()
		}
		
	}


	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				<div className="sheets-wrapper composer-wrapper">
					<div className="doc_header auto-margin">
						<span className="doc_sheet ">Composers in your library</span>
						<br />
						<span className="doc_composer">Recently Added</span>
					</div>
					<div className="middle-part-container">
						<ul className="all-sheets-container full-height">					
							{getData()}
							{
								composerPages[composerPage].map(composer => {
									return (
										<ComposerBox composer={composer}/>
									) 
							})}
						</ul>
						<RandomComposerSelection composerPages={composerPages} page={composerPage}/>
					</div>
					
					<div className="page-info-wrapper">
						<svg xmlns="http://www.w3.org/2000/svg" width="8" height="11.5" viewBox="0 0 7.41 12" onClick={svgDec}
						 className={composerPage != 1? "" : "disabled"}>
  							<path id="ic_chevron_right_24px" d="M14.59,6,16,7.41,11.42,12,16,16.59,14.59,18l-6-6Z" transform="translate(-8.59 -6)" fill="#464646"/>
						</svg>

						<span>Page <b>{composerPage}</b> of <b>{totalComposerPages}</b></span>
						<svg xmlns="http://www.w3.org/2000/svg" width="8" height="11.5" viewBox="0 0 7.41 12" onClick={svgInc} className={composerPage != totalComposerPages ? "svg-2" : "svg-2 disabled"}>
  							<path id="ic_chevron_right_24px" d="M10,6,8.59,7.41,13.17,12,8.59,16.59,10,18l6-6Z" transform="translate(-8.59 -6)" fill="#464646"/>
						</svg>	

					</div>
				</div>
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	composerPages: state.data.composerPages,
	composerPage: state.data.composerPage,
	totalComposerPages: state.data.totalComposerPages
})

const mapActionsToProps = {
    getComposerPage,
 	incrementComposerPage, 
	setComposerPage,
	decrementComposerPage
}

export default connect(mapStateToProps, mapActionsToProps)(ComposersPage)



/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/