import { logoutUser } from "../Redux/Actions/userActions";
import { store } from "../Redux/store";

export const checkAuthErr = (err, dispatch)  => {
	if (err.response && err.response.status === 401) {
        store.dispatch(logoutUser());
        window.location.href = "/login";
      }
      console.log(err);
}
