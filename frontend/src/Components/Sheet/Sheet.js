
import React, { useEffect, useState, Fragment } from 'react'
import { useParams } from "react-router-dom";

import { Document, pdfjs, Page } from 'react-pdf'

import SideBar from '../Sidebar/SideBar'
import './Sheet.css'

import axios from 'axios'

/* Utils */
import { displayTimeAsString, findSheetByPages, findComposerByPages, findSheetBySheets, findComposerByComposers } from '../../Utils/utils'

/* Redux stuff */
import { connect } from 'react-redux'
import { store } from '../../Redux/store';
import { logoutUser } from '../../Redux/Actions/userActions'

import { useHistory } from 'react-router-dom'

import Modal from '../Sidebar/Modal/Modal'
import ModalContent from './ModalContent'

/* Activate global worker for displaying the pdf properly */
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function Sheet({ sheetPages, composerPages, sheets, composers }) {


	/* PDF Page width rendering */

	const windowHeight = 840

	const [isDesktop, setDesktop] = useState(window.innerHeight > windowHeight);

	const updateMedia = () => {
		const nextDesktop = window.innerHeight > windowHeight 
		setDesktop(nextDesktop);
	};

	useEffect(() => {
		window.addEventListener("resize", updateMedia);

		return () => window.removeEventListener("resize", updateMedia);
	});


	let { sheetName, composerName } = useParams();
	const [pdf, setpdf] = useState(undefined)


	const bySheetPages = findSheetByPages(sheetName, sheetPages)

	const [sheet, setSheet] = useState( bySheetPages == undefined ? findSheetBySheets(sheetName, sheets) : bySheetPages)
	
	const byComposerPages = findComposerByPages(composerName, composerPages)

	const [composer, setComposer] = useState(byComposerPages == undefined ? findComposerByComposers(composerName, composers) : byComposerPages)


	const pdfRequest = () => {
		axios.get(`/sheet/pdf/${composerName}/${sheetName}`, {responseType: "arraybuffer"})
			.then(res => {
				setpdf(res)
			})
			.catch(err => {
				if (err.request.status == 401) {
					store.dispatch(logoutUser())
					window.location.href = '/login'
				}
			})	
		return pdf
	}

	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
		setPageNumber(1);
	}

	function changePage(offset) {
		setPageNumber(prevPageNumber => prevPageNumber + offset);
	}

	function previousPage(e) {
		e.target.blur()
		changePage(-1);
	}

	function nextPage(e) {
		e.target.blur()
		changePage(1);
	} 

	let history = useHistory()

	const [pdfDownloadData, setPdfDownloadData] = useState({link: "", name: ""})

	function saveByteArray(reportName, byte) {
		var blob = new Blob([byte], {type: "application/pdf"});
		setPdfDownloadData({
			...pdfDownloadData, 
			link: window.URL.createObjectURL(blob),
			name: reportName
		} )
	};


	const [copyText, setCopyText] = useState("Click to Copy")

	const handleClick = () => {
		setCopyText(copyText == "Click to Copy" ? "Copied ✓" : "Click to Copy")
		navigator.clipboard.writeText(window.location.href)
	}


	const [editModal, setEditModal] = useState(false)

	return (
		 <Fragment>
			<SideBar />
			<div className="home_content">
				<div className="document_container">
					<div className="doc_wrapper">
						<div className="doc_header">
							<span className="doc_sheet">{sheetName}</span>
							<br />
							<span className="doc_composer">{composerName}</span>
						</div>

						<div className="noselect document">
							<Document file={pdf == undefined ? pdfRequest() : pdf} onLoadSuccess={onDocumentLoadSuccess}> 
								<Page pageNumber={pageNumber} width={isDesktop? 540 : 430} />
								
							</Document>
						</div>	

						<div className="page_controls">
							<button type="button" disabled={pageNumber == 1} onClick={previousPage}>&lt;</button>
							<span>
								{pageNumber} of {numPages}
							</span>
							<button type="button" disabled={pageNumber == numPages} onClick={nextPage}>
								&gt;
							</button>
						</div>
					</div>	
					

					<div className="right_side_doc">
						<div className="doc_box sheet_info">
							<span className="sheet_info_header">{sheet.sheet_name}</span>
							<div>
								<span className="bold sheet_info_info">Release Date:</span> 
								<span className="sheet_info_info"> {displayTimeAsString(sheet.ReleaseDate)}</span>
							</div>
							<div>
								<span className="bold sheet_info_info">Uploaded At:</span> 
								<span className="sheet_info_info"> {displayTimeAsString(sheet.created_at)}</span>
							</div>
							<div>
								<span className="bold sheet_info_info">Uploaded By:</span> 
								<span className="sheet_info_info"> {sheet.uploader_id}</span>
							</div>
							


								<div class="tooltip">	
										<button className="sheet_info_button" onClick={handleClick}>
											Share
										</button>	
									<span class="tooltiptext">{copyText}</span>
								</div>
							

						
							<div className="under_box">
								<a href={pdfDownloadData.link} download={pdfDownloadData.name} target='_blank'>
								<button className="remove_shadow" onClick={() => saveByteArray(sheet.sheet_name, pdf.data)}>
									Download
								</button>
								</a>


								<button className="remove_shadow last-button" onClick={setEditModal}>								
									Edit
								</button>
								<Modal title="Edit" onClose={() => setEditModal(false)} show={editModal}>
									<ModalContent onClose={() => setEditModal(false)} uploadFile={pdf} sheet={sheet}/>
								</Modal>	


							</div>
						</div>	


						<div className="doc_box composer_info remove_shadow" onClick={() => history.push(`/composer/${composer.name}`)}>
							<img className="composer_img" src={composer.portrait_url} alt="image" />
							<div className="composer_info_text_wrapper">
								<span>{composerName}</span>								
								<span>{composer.epoch}</span>
							</div>
						</div>
						{isDesktop && 
							<hr className="sep_video"/>	
						}	
						

						<div className="video_player">
							<span className="coming_soon">Media Player Coming Soon</span>
							<div>
								<span><a href="/newsletter" target="_blank">Sign up</a> for the newsletter, so you don't miss any updates</span>
							</div>
						</div>				
					</div>											
				</div>
			</div>
		</Fragment>            
	)
}

const mapStateToProps = (state) => ({
	sheetPages: state.data.sheetPages,
	composerPages: state.data.composerPages,
	sheets: state.data.sheets,
	composers: state.data.composers
})

const mapActionsToProps = {
    
}

export default connect(mapStateToProps, mapActionsToProps)(Sheet)
