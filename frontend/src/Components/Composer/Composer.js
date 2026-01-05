import React, { Fragment, useState, useEffect } from "react";
import { useParams } from "react-router";
import { findComposerByPages, getCompImgUrl } from "../../Utils/utils";
import { connect } from "react-redux";
import {
  getSheetPage,
  setComposerPage,
  getComposerPage,
  deleteComposer,
  resetData,
} from "../../Redux/Actions/dataActions";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import "./Composer.css";

import SideBar from "../Sidebar/SideBar";
import SheetBox from "../SheetsPage/Components/SheetBox";
import { IconButton } from "@material-ui/core";
import Modal from "../Sidebar/Modal/Modal";
import SheetMusicEditor from "../SheetMusicEditor/SheetMusicEditor";

function Composer({
  composerPages,
  getSheetPage,
  composers,
  composerPage,
  setComposerPage,
  getComposerPage,
  totalComposerPages,
  deleteComposer,
  resetData,
}) {
  const { safeComposerName } = useParams();

  const [composer, setComposer] = useState(
    findComposerByPages(safeComposerName, composerPages)
  );
  const [inRequest, setInRequest] = useState(false);
  const [imgUrl, setImgUrl] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);

  // Fetch composer sheets
  const getData = () => {
    if ((composer === undefined || composer.sheets === undefined) && !inRequest) {
      setInRequest(true);
      getComposerPagesData(() => {
        getSheetsForComposer();
      });
    } else if (composer !== undefined && composer.sheets !== undefined) {
      setInRequest(false);
      setLoading(false);
    }
  };

  const getSheetsForComposer = () => {
    const data = {
      page: 1,
      sortBy: "updated_at desc",
      composer: safeComposerName,
    };
    getSheetPage(data, () => {
      setComposer(findComposerByPages(safeComposerName, composerPages));
    });
  };

  const getComposerPagesData = (_callback) => {
    if (
      composerPage === undefined ||
      composerPage < 0 ||
      composerPage > totalComposerPages
    ) {
      setComposerPage(1);
    }

    const data = {
      page: composerPage,
      sortBy: "updated_at desc",
    };

    getComposerPage(data, () => _callback());
  };

  // Update composer when composerPages change
  useEffect(() => {
    setComposer(findComposerByPages(safeComposerName, composerPages));
    if (composer !== undefined && composer.sheets !== undefined) {
      setInRequest(false);
      setLoading(false);
    }
  }, [composerPages]);

  // Update image URL and page title
  useEffect(() => {
    if (!loading && composer) {
      setImgUrl(getCompImgUrl(composer.portrait_url));
    }
    document.title = `SheetAble - ${composer ? composer.name : "Composer"}`;
  }, [loading, composer]);

  useEffect(() => {
    getData();
  });

  // Handle sheet save from SheetMusicEditor
  const handleSaveSheet = (sheetData) => {
    console.log("Saved sheet:", sheetData);
    // TODO: call Redux action to save sheet to backend if needed
    setModal(false);
    setEditingSheet(null);
    getSheetsForComposer(); // refresh sheets
  };

  return (
    <Fragment>
      <SideBar />
      <div className="home_content">
        {!loading && composer ? (
          <div className="composer-page">
            <img src={imgUrl} className="portrait-page" alt="Portrait" />
            <h5>{composer.name}</h5>
            <h6>{composer.epoch}</h6>

            {/* Edit Composer */}
            <IconButton
              onClick={() => setModal(true)}
              className="edit"
              disabled={composer.name === "Unknown"}
            >
              <EditIcon />
            </IconButton>

            {/* Delete Composer */}
            <IconButton
              className="delete"
              disabled={composer.name === "Unknown"}
              onClick={() =>
                deleteComposer(composer.safe_name, () => {
                  resetData();
                  window.location.replace("/");
                })
              }
            >
              <DeleteIcon />
            </IconButton>

            {/* Add New Sheet Button */}
            <button
              className="btn-add-sheet"
              onClick={() => {
                setEditingSheet(null); // new sheet
                setModal(true);
              }}
            >
              + Add New Sheet
            </button>

            {/* Modal for editing/creating sheet */}
            <Modal title={editingSheet ? "Edit Sheet" : "New Sheet"} onClose={() => setModal(false)} show={modal}>
              <SheetMusicEditor
                initialData={editingSheet || { title: "", composer: composer.name }}
                composerName={composer.name}
                onSave={handleSaveSheet}
                onClose={() => setModal(false)}
              />
            </Modal>

            {/* Sheets list */}
            <ul className="all-sheets-container full-height">
              {composer.sheets && composer.sheets.length > 0 ? (
                composer.sheets.map((sheet) => (
                  <SheetBox
                    key={sheet.id}
                    sheet={sheet}
                    onEdit={() => {
                      setEditingSheet(sheet);
                      setModal(true);
                    }}
                  />
                ))
              ) : (
                <p>No sheets found</p>
              )}
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => ({
  composerPages: state.data.composerPages,
  composers: state.data.composers,
  composerPage: state.data.composerPage,
  totalComposerPages: state.data.totalComposerPages,
});

const mapActionsToProps = {
  getSheetPage,
  getComposerPage,
  setComposerPage,
  deleteComposer,
  resetData,
};

export default connect(mapStateToProps, mapActionsToProps)(Composer);
