import { SET_SIDEBAR, SET_VERSION } from "../types";
import axios from "axios";
import { logoutUser } from "./userActions";

// Set Sidebar
export const setSidebar = () => (dispatch) => {
  dispatch({ type: SET_SIDEBAR });
};

export const getVersion = () => async (dispatch) => {
  try {
    const res = await axios.get("/version");
    dispatch({ type: SET_VERSION, payload: res.data.data });
  } catch (err) {
    if (err.request.status === 401) {
      dispatch(logoutUser());
      window.location.href = "/login";
    }
    console.log(err);
  }
};
