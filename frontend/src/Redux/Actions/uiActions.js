import { SET_SIDEBAR, SET_VERSION, SET_SYNC_LOADING, SET_SYNC_STATS } from "../types";
import axios from "axios";
import { logoutUser } from "./userActions";

// Set Sidebar
export const setSidebar = () => (dispatch) => {
  dispatch({ type: SET_SIDEBAR });
};

export const getVersion = () => (dispatch) => {
  axios
    .get("/version")
    .then((res) => {
      dispatch({
        type: SET_VERSION,
        payload: res.data.data,
      });
    })
    .catch((err) => {
      if (err.request.status === 401) {
        dispatch(logoutUser());
        window.location.href = "/login";
      }
      console.log(err);
    });
};

export const setSyncLoading = (isLoading) => (dispatch) => {
  dispatch({
    type: SET_SYNC_LOADING,
    payload: isLoading,
  });
};

export const startLibrarySync = () => (dispatch) => {
  dispatch(setSyncLoading(true));

  axios.post("/library/scan")
    .catch((err) => {
      console.error("Error triggering library sync:", err);
      dispatch(setSyncLoading(false));
    });
};

export const checkSyncStatus = () => (dispatch) => {
  axios
    .get("/library/status")
    .then((res) => {
      dispatch(setSyncLoading(res.data.IsScanning));
      
      // If done scanning, dispatch stats
      if (!res.data.IsScanning && (res.data.FilesImported > 0 || res.data.FilesMissing > 0 || res.data.FilesUpdated > 0)) {
        dispatch({
          type: SET_SYNC_STATS,
          payload: {
            imported: res.data.FilesImported || 0,
            missing: res.data.FilesMissing || 0,
            updated: res.data.FilesUpdated || 0,
          },
        });
      }
    })
    .catch((err) => {
      console.debug("Could not fetch sync status:", err);
    });
};

export const clearSyncStats = () => (dispatch) => {
  dispatch({
    type: SET_SYNC_STATS,
    payload: null,
  });
};
