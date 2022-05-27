import {
  SET_AUTHENTICATED,
  SET_UNAUTHENTICATED,
  SET_USER_DATA,
} from "../types";

const initialState = {
  authenticated: false,
  loading: false,
  userData: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true,
      };

    case SET_UNAUTHENTICATED:
      return initialState;

    case SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
      };

    default:
      return state;
  }
}
