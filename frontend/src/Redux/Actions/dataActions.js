import { LOADING_DATA, SET_SHEETS, LOADING_COMPOSERS, SET_COMPOSERS, RESET_DATA, LOADING_UI, SET_ERRORS, SET_PAGE_SHEETS, INCREMENT_PAGE, DECREMENT_PAGE, SET_PAGE, SET_TOTAL_PAGES } from '../types'
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

export const incrementPage = () => dispatch => {
    dispatch({type: INCREMENT_PAGE})
}

export const decrementPage = () => dispatch => {
    dispatch({type: DECREMENT_PAGE})
}

export const setPage = (page) => dispatch => {
    dispatch({type: SET_PAGE, payload: page})
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
                type: SET_TOTAL_PAGES,
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