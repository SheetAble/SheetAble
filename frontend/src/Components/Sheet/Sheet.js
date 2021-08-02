
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

	function previousPage() {
		changePage(-1);
	}

	function nextPage() {
		changePage(1);
	}
	  


	return (
		 <Fragment>
			<SideBar />
			
			<div className="home_content">
				<div className="document_container">
					
					<div className="noselect document">
						<Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}> 
							

							<Page pageNumber={pageNumber} width={360}/>
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
			</div>
		</Fragment>            
	)

}

export default Sheet