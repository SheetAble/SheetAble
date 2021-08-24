import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED, LOADING_USER, MARK_NOTIFICATIONS_READ, SET_AUTHENTICATED, SET_USER_DATA} from '../types'
import axios from 'axios'
import { getSheets } from './dataActions'

export const loginUser = (userData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI})
    axios.post('/login', userData)
        .then(res => {
			setAuthorizationHeader(res.data)            
            dispatch({ type: SET_AUTHENTICATED })
            dispatch({ type: CLEAR_ERRORS })
            history.push('/')
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        })
        .then(() => {
            axios.get("/users/0")
            .then(res => {
                delete res.data.password
                dispatch({type: SET_USER_DATA, payload: res.data})
            })
            .catch(err => {
                dispatch({
                    type: SET_ERRORS,
                    payload: err.response.data
                })
            })
        })
        
}

export const logoutUser = (history) => (dispatch) => {
    localStorage.removeItem('FBIdToken')
    delete axios.defaults.headers.common['Authorization']
    dispatch({ type: SET_UNAUTHENTICATED})
    history.push("/login")
}

export const signupUser = (newUserData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI})
    axios.post('/signup', newUserData)
        .then(res => {
            setAuthorizationHeader(res.data.token)
            dispatch({ type: CLEAR_ERRORS })
            history.push('/')
            
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        })
}

const setAuthorizationHeader = (token) => {
    const FBIdToken = `Bearer ${token}`
    localStorage.setItem('FBIdToken', FBIdToken)
    axios.defaults.headers.common['Authorization'] = FBIdToken
}