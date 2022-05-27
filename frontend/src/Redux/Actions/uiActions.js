import { SET_SIDEBAR, SET_VERSION } from "../types";
import axios from "axios";
import { store } from "../store";
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
