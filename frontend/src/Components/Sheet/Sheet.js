import React, { useEffect, useState } from 'react'
import { Fragment } from 'react';

import { useParams } from "react-router-dom";

import { Document, pdfjs, Page } from 'react-pdf'

import SideBar from '../Navbar/SideBar'

import Sample from './Sample.js';

import axios from 'axios'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;




function Sheet() {
	let { sheetName } = useParams();

	const [pdf, setpdf] = useState(undefined)

	useEffect(() => {
		if (pdf == undefined) {
			axios.get("http://localhost:8080/sheet/pdf/Ludwig van Beethoven/fasdfsdsd", {responseType: "arraybuffer"})
			.then(res => {
				var uint8View = new Uint8Array(res.data)
				let obj = {data: uint8View}
				setpdf(res)
				console.log(res);
			})
		}	
		
  	});

	  
	return (
		 <Fragment>
			<SideBar />
			
			<div className="home_content">

			<Document file={pdf}> 
				<Page pageNumber={1} />
			</Document>
				
			</div>
		</Fragment>            
	)

}

export default Sheet

