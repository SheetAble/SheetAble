import React, { Fragment, useState, useEffect} from 'react'
import { useParams } from 'react-router';
import { findComposerByPages, findComposerByComposers } from '../../Utils/utils';

import { connect } from 'react-redux';
import { getSheetPage, setComposerPage, getComposerPage } from '../../Redux/Actions/dataActions'


import './Composer.css'

import SideBar from '../Sidebar/SideBar'
import SheetBox from '../SheetsPage/Components/SheetBox';

function Composer({ composerPages, getSheetPage, composers, composerPage, setComposerPage, getComposerPage, totalComposerPages }) {
	const { composerName } = useParams();

	const [composer, setComposer] = useState(findComposerByPages(composerName, composerPages))

	const [inRequest, setInRequest] = useState(false)


	const [loading, setLoading] = useState(true)

	const getComposerPagesData = (_callback) => {
		if (composerPage == undefined || composerPage < 0 || composerPage > totalComposerPages ) {
			setComposerPage(1)
		}
			
		const data = {
			page: composerPage,
			sortBy: "updated_at desc"
		}		
		
		getComposerPage(data, () =>  _callback())
	}

	const getData = () => {
		if (composer == undefined) {
			getComposerPagesData(() => {
				setComposer(findComposerByPages(composerName, composerPages))
			})
		} else if (composer.sheets == undefined && !inRequest)  {
			setInRequest(true)
			const data = {
				page: 1,
				sortBy: "updated_at desc",
				composer: composerName
			}

			getSheetPage(data, () => {
				setLoading(false)
				window.location.reload()
			})
		}
		else {
			setLoading(false)
		}
	}

	useEffect(() => {
		getData()
	});
	


	return (
		<Fragment>
			<SideBar />
			<div className="home_content">
				{!loading? (
					<div className="composer-page">
					<img src={composer.portrait_url} className="portrait-page" />
					<h5>{composer.name}</h5>
					<h6>{composer.epoch}</h6>
					<ul className="all-sheets-container full-height">					
						{composer.sheets == undefined?
							getData() :
							composer.sheets.map(sheet => {
								return (
									<SheetBox sheet={sheet}/>
								) 
						})}
					</ul>
				</div>
				)
				:
				(
					<p>loading</p>
				)
			
			}
				
			</div>
		</Fragment>
	)
}

const mapStateToProps = (state) => ({
	composerPages: state.data.composerPages,
	composers: state.data.composers,
	composerPage: state.data.composerPage,
	totalComposerPages: state.data.totalComposerPages
})

const mapActionsToProps = {
    getSheetPage,
	getComposerPage,
	setComposerPage
}

export default connect(mapStateToProps, mapActionsToProps)(Composer)
