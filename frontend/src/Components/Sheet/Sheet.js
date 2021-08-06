
import React, { useEffect, useState, Fragment } from 'react'
import { useParams } from "react-router-dom";

import { Document, pdfjs, Page } from 'react-pdf'

import SideBar from '../Navbar/SideBar'
import './Sheet.css'

import axios from 'axios'

/* Activate global worker for displaying the pdf properly */
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function Sheet() {
	let { sheetName, composerName } = useParams();
	const [pdf, setpdf] = useState(undefined)

	useEffect(() => {
		if (pdf == undefined) {
			axios.get(`http://localhost:8080/sheet/pdf/${composerName}/${sheetName}`, {responseType: "arraybuffer"})
			.then(res => {
				setpdf(res)
			})
		}	
		
  	});

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


	return (
		 <Fragment>
			<SideBar />
			<div className="home_content">
				<div className="document_container">
					<div>
						<div className="doc_header">
							<span className="doc_sheet">{sheetName}</span>
							<br />
							<span className="doc_composer">{composerName}</span>
						</div>

						<div className="noselect document">
							<Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}> 
								<Page pageNumber={pageNumber} width={430}/>
								<div className="page_controls">
									<button type="button" disabled={pageNumber == 1} onClick={previousPage}>&lt;</button>
									<span>
										{pageNumber} of {numPages}
									</span>
									<button type="button" disabled={pageNumber == numPages} onClick={nextPage}>
										&gt;
									</button>
								</div>
							</Document>
						</div>	
					</div>	

					<div className="right_side_doc">
						<div className="doc_box sheet_info">
							<span>Nocturné 1 - Rosenblatt</span>
							<div>
								<span>Release Date:</span> 
								<span> 1999-12-31</span>
							</div>
							<div>
								<span>Upload By:</span> 
								<span> vallezw</span>
							</div>
							<div>
								<span>Uploaded At:</span> 
								<span> 1999-12-31</span>
							</div>

							<button>
								Share
							</button>	
						</div>		

						<div className="doc_box composer_info">
							Composer
						</div>				
					</div>											
				</div>
			</div>
		</Fragment>            
	)
}

export default Sheet