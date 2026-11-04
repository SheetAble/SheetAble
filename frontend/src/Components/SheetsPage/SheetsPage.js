import React, { Fragment, useEffect, useState } from "react";

import SideBar from "../Sidebar/SideBar";
import SheetBox from "./Components/SheetBox";

import { connect } from "react-redux";
import {
  getSheetPage,
  incrementSheetPage,
  setSheetPage,
  decrementSheetPage,
} from "../../Redux/Actions/dataActions";

import "./SheetsPage.css";
import RandomPieceSelection from "./Components/RandomPieceSelection";
import NoSheets from "../NotFound/NoSheets";
import InstrumentFilter from "./InstrumentFilter";

function SheetsPage({
  getSheetPage,
  sheetPages,
  incrementSheetPage,
  setSheetPage,
  decrementSheetPage,
  sheetPage,
  totalSheetPages,
}) {
  const [loading, setLoading] = useState(true);
  const [instrument, setInstrument] = useState("");

  useEffect(() => {
    getData();
    // Change Page Title
    document.title = `SheetAble - Your Library`;
  }, []);

  const getData = (selectedInstrument = instrument, page = sheetPage) => {
    let requestedPage = page;
    if (
      requestedPage === undefined ||
      requestedPage < 1 ||
      (totalSheetPages > 0 && requestedPage > totalSheetPages)
    ) {
      setSheetPage(1);
      requestedPage = 1;
    }

    const data = {
      page: requestedPage,
      sortBy: "updated_at desc",
      instrument: selectedInstrument,
    };

    setLoading(true);
    getSheetPage(data, () => setLoading(false));
  };

  const handleInstrumentChange = (selectedInstrument) => {
    setInstrument(selectedInstrument);
    setSheetPage(1);
    setLoading(true);
    getSheetPage(
      {
        page: 1,
        sortBy: "updated_at desc",
        instrument: selectedInstrument,
      },
      () => setLoading(false)
    );
  };

  const svgDec = (e) => {
    e.preventDefault();
    if (sheetPage !== 1) {
      decrementSheetPage();
      getData(instrument, sheetPage - 1);
    }
  };

  const svgInc = (e) => {
    e.preventDefault();
    if (sheetPage !== totalSheetPages) {
      incrementSheetPage();
      getData(instrument, sheetPage + 1);
    }
  };

  return (
    <Fragment>
      <SideBar />
      <div
        id={
          sheetPages !== undefined &&
          sheetPages[sheetPage] !== undefined &&
          sheetPages[sheetPage].length !== 0
            ? ""
            : "notfound"
        }
        className="home_content"
      >
        <InstrumentFilter
          value={instrument}
          onChange={handleInstrumentChange}
        />
        {!loading ? (
          sheetPages !== undefined &&
          sheetPages[sheetPage] !== undefined &&
          sheetPages[sheetPage].length !== 0 ? (
            <div className="sheets-wrapper">
              <div className="doc_header auto-margin">
                <span className="doc_sheet ">Sheets in your library</span>
                <br />
                <span className="doc_composer">Recent Uploads</span>
              </div>
              <div className="middle-part-container">
                <ul className="all-sheets-container full-height">
                  {sheetPages[sheetPage] === undefined
                    ? getData()
                    : sheetPages[sheetPage].map((sheet) => {
                        return (
                          <SheetBox sheet={sheet} key={sheet.sheet_name} />
                        );
                      })}
                </ul>
                <RandomPieceSelection
                  sheetPages={sheetPages}
                  page={sheetPage}
                />
              </div>

              <div className="page-info-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="11.5"
                  viewBox="0 0 7.41 12"
                  onClick={svgDec}
                  className={sheetPage !== 1 ? "" : "disabled"}
                >
                  <path
                    id="ic_chevron_right_24px"
                    d="M14.59,6,16,7.41,11.42,12,16,16.59,14.59,18l-6-6Z"
                    transform="translate(-8.59 -6)"
                    fill="#464646"
                  />
                </svg>

                <span>
                  Page <b>{sheetPage}</b> of <b>{totalSheetPages}</b>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="11.5"
                  viewBox="0 0 7.41 12"
                  onClick={svgInc}
                  className={
                    sheetPage !== totalSheetPages ? "svg-2" : "svg-2 disabled"
                  }
                >
                  <path
                    id="ic_chevron_right_24px"
                    d="M10,6,8.59,7.41,13.17,12,8.59,16.59,10,18l6-6Z"
                    transform="translate(-8.59 -6)"
                    fill="#464646"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <NoSheets />
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({
  sheetPages: state.data.sheetPages,
  sheetPage: state.data.sheetPage,
  totalSheetPages: state.data.totalSheetPages,
});

const mapActionsToProps = {
  getSheetPage,
  incrementSheetPage,
  setSheetPage,
  decrementSheetPage,
};

export default connect(mapStateToProps, mapActionsToProps)(SheetsPage);

/*
	data:
		sheets: [...]
		sheetPages: {1: [...], 2: [...]}
		currentPage: 1
*/
