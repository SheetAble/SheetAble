import React, { useEffect, useState } from 'react'
import { Fragment } from 'react';

import { useParams } from "react-router-dom";

import { Document, pdfjs } from 'react-pdf'

import SideBar from '../Navbar/SideBar'

import axios from 'axios'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function Sheet() {
	let { sheetName } = useParams();

	const [pdf, setpdf] = useState(undefined)

	useEffect(() => {
		if (pdf == undefined) {
			axios.get("http://localhost:8080/sheet/pdf/Ludwig van Beethoven/fasdfsdsd")
			.then(res => {
				console.log(res.data);
				setpdf(res.data)
			})
		}
		
  	});


	return (
		 <Fragment>
			<SideBar />
			<div className="home_content">
				
				<Document file={"test"}/>
			</div>
		</Fragment>            
	)
}

export default Sheet
