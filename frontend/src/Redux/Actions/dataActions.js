import { LOADING_DATA, SET_SHEETS, LOADING_COMPOSERS, SET_COMPOSERS, RESET_DATA, LOADING_UI, SET_ERRORS, SET_PAGE_SHEETS, INCREMENT_PAGE, DECREMENT_PAGE, SET_PAGE, SET_TOTAL_PAGES, INCREMENT_SHEET_PAGE, DECREMENT_SHEET_PAGE, SET_SHEET_PAGE, SET_TOTAL_SHEET_PAGES } from '../types'
import axios from 'axios'

import { store } from '../store';
import { logoutUser } from './userActions'

// Get all Sheets
export const getSheets = () => dispatch => {
    dispatch({ type: LOADING_DATA })
    axios.get('/sheets')
        .then(res => {            
            dispatch({
                type: SET_SHEETS,
                payload: res.data.rows
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

export const incrementSheetPage = () => dispatch => {
    dispatch({type: INCREMENT_SHEET_PAGE})
}

export const decrementSheetPage = () => dispatch => {
    dispatch({type: DECREMENT_SHEET_PAGE})
}

export const setSheetPage = (page) => dispatch => {
    dispatch({type: SET_SHEET_PAGE, payload: page})
}

/* Get specific sheet data from page
    data parameter:
        data: {
            page: 1,
            sortBy: updated_at desc
        }
*/
export const getSheetPage = (data) => dispatch => {
    dispatch({ type: LOADING_DATA })

    let bodyFormData = new FormData()
    bodyFormData.append('page', data.page)
    bodyFormData.append('limit', 50)
    bodyFormData.append('sort_by', data.sortBy)

    axios.post("/sheets", bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            dispatch({
                type: SET_PAGE_SHEETS,
                payload: res.data.rows,
                page: data.page
            })
            dispatch({
                type: SET_TOTAL_SHEET_PAGES,
                payload: res.data.total_pages
            })
        })
        .catch(err => {
            if (err.request.status == 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err);
        })
}


// Get all composers sorted by newest
export const getComposers = () => dispatch => {
    dispatch({ type: LOADING_COMPOSERS })
    axios.get('/composers')
        .then(res => {			       
            console.log("composers " + res.data.rows);  
            dispatch({
                type: SET_COMPOSERS,
                payload: res.data.rows
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

// Upload a sheet
export const uploadSheet = (data) => dispatch => {
    let bodyFormData = new FormData()
    bodyFormData.append('uploadFile', data.uploadFile)
    bodyFormData.append('sheetName', data.sheetName)
    bodyFormData.append('composer', data.composer)
    bodyFormData.append("releaseDate", data.releaseDate)
    
    dispatch({ type: RESET_DATA })

    axios.post("/upload", bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
}