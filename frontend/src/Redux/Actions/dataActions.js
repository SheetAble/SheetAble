import { LOADING_DATA, SET_SHEETS, LOADING_COMPOSERS, SET_COMPOSERS } from '../types'
import axios from 'axios'

import store from '../store';
import { logoutUser } from './userActions'

// Get all Sheets
export const getSheets = () => dispatch => {
    dispatch({ type: LOADING_DATA })
    axios.get('/sheets')
        .then(res => {
			
            console.log(res.data);
            
            dispatch({
                type: SET_SHEETS,
                payload: res.data
            })
        })
        .catch(err => {
            if (err.request.status == 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err)
            
            dispatch({
                type: SET_SHEETS,
                payload: []
            })
        })
}


// Get all composers sorted by newest
export const getComposers = () => dispatch => {
    dispatch({ type: LOADING_COMPOSERS })
    axios.get('/composers')
        .then(res => {			         
            dispatch({
                type: SET_COMPOSERS,
                payload: res.data
            })
        })
        .catch(err => {
            if (err.request.status == 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }

            console.log(err)
            dispatch({
                type: SET_COMPOSERS,
                payload: []
            })
        })
}

export const uploadSheet = (data) => dispatch => {
    console.log("test");
}