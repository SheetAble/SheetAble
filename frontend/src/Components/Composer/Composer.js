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
import ModalContent from "./ModalContent";

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

  const getData = () => {
    if (
      (composer === undefined || composer.sheets === undefined) &&
      !inRequest
    ) {
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

  useEffect(() => {
    setComposer(findComposerByPages(safeComposerName, composerPages));
    if (composer !== undefined && composer.sheets !== undefined) {
      setInRequest(false);
      setLoading(false);
    }
  }, [composerPages]);

  useEffect(() => {
    if (!loading) {
      setImgUrl(getCompImgUrl(composer.portrait_url));
    }

    // Change Page Title
    document.title = `SheetAble - ${
      composer === undefined ? "Composer" : composer.name
    }`;
  }, [loading]);

  useEffect(() => {
    getData();
  });

  const [modal, setModal] = useState(false);

  return (
    <Fragment>
      <SideBar />
      <div className="home_content">
        {!loading ? (
          <div className="composer-page">
            <img src={imgUrl} className="portrait-page" alt="Portrait" />
            <h5>{composer.name}</h5>
            <h6>{composer.epoch}</h6>
            <IconButton
              onClick={() => setModal(true)}
              className="edit"
              disabled={composer.name === "Unknown"}
            >
              <EditIcon />
            </IconButton>
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
            <Modal title="Edit" onClose={() => setModal(false)} show={modal}>
              <ModalContent
                onClose={() => setModal(false)}
                composer={composer}
              />
            </Modal>
            <ul className="all-sheets-container full-height">
              {composer.sheets === undefined
                ? getData()
                : composer.sheets.map((sheet) => {
                    return <SheetBox sheet={sheet} />;
                  })}
            </ul>
          </div>
        ) : (
          <p>loading</p>
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
