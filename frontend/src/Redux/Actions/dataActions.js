import { LOADING_DATA, SET_SHEETS, LOADING_COMPOSERS, SET_COMPOSERS, RESET_DATA, SET_PAGE_SHEETS, INCREMENT_SHEET_PAGE, DECREMENT_SHEET_PAGE, SET_SHEET_PAGE, SET_TOTAL_SHEET_PAGES, SET_PAGE_COMPOSERS, SET_TOTAL_COMPOSER_PAGES, INCREMENT_COMPOSER_PAGE, DECREMENT_COMPOSER_PAGE, SET_COMPOSER_PAGE } from '../types'
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
            if (err.request.status === 401) {
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


/* Page navigation */
export const incrementSheetPage = () => dispatch => {
    dispatch({type: INCREMENT_SHEET_PAGE})
}

export const incrementComposerPage = () => dispatch => {
    dispatch({type: INCREMENT_COMPOSER_PAGE})
}

export const decrementSheetPage = () => dispatch => {
    dispatch({type: DECREMENT_SHEET_PAGE})
}

export const decrementComposerPage = () => dispatch => {
    dispatch({type: DECREMENT_COMPOSER_PAGE})
}

export const setSheetPage = (page) => dispatch => {
    dispatch({type: SET_SHEET_PAGE, payload: page})
}

export const setComposerPage = (page) => dispatch => {
    dispatch({type: SET_COMPOSER_PAGE, payload: page})
}


/* Get specific sheet data from page
    data parameter:
        data: {
            page: 1,
            sortBy: updated_at desc
        }
*/
export const getSheetPage = (data = {}, _callback) => dispatch => {
    dispatch({ type: LOADING_DATA })
    
    let bodyFormData = new FormData()
    bodyFormData.append('page', data.page === undefined? 1: data.page)
    bodyFormData.append('limit', 50)
    bodyFormData.append('sort_by', data.sortBy === undefined ? "updated_at desc" : data.sortBy)

    if (data.composer !== undefined) {
        bodyFormData.append("composer", data.composer)
    }

    axios.post("/sheets", bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            dispatch({
                type: SET_PAGE_SHEETS,
                payload: res.data.rows,
                page: data.page,
                composer: data.composer
            })
            dispatch({
                type: SET_TOTAL_SHEET_PAGES,
                payload: res.data.total_pages
            })
            _callback()
        })
        .catch(err => {
            if (err.request && err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err);
        })
}


/* Get specific composer data from page
    data parameter:
        data: {
            page: 1,
            sortBy: updated_at desc
        }
*/
export const getComposerPage = (data = {}, _callback) => dispatch => {
    dispatch({ type: LOADING_DATA })
    

    let bodyFormData = new FormData()
    bodyFormData.append('page', data.page === undefined? 1: data.page)
    bodyFormData.append('limit', 50)
    bodyFormData.append('sort_by', data.sortBy === undefined ? "updated_at desc" : data.sortBy)

    axios.post("/composers", bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            dispatch({
                type: SET_PAGE_COMPOSERS,
                payload: res.data.rows,
                page: data.page
            })
            dispatch({
                type: SET_TOTAL_COMPOSER_PAGES,
                payload: res.data.total_pages
            })

            _callback()
        })
        .catch(err => {
            console.log(err);
            
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            
        })
}



// Get all composers sorted by newest
export const getComposers = () => dispatch => {
    dispatch({ type: LOADING_COMPOSERS })
    axios.get('/composers')
        .then(res => {			       
            dispatch({
                type: SET_COMPOSERS,
                payload: res.data.rows
            })
        })
        .catch(err => {
            if (err.request.status === 401) {
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
export const uploadSheet = (data, _callback) => dispatch => {
    let bodyFormData = new FormData()
    bodyFormData.append('uploadFile', data.uploadFile)
    bodyFormData.append('sheetName', data.sheetName)
    bodyFormData.append('composer', data.composer)
    bodyFormData.append("releaseDate", data.releaseDate)
    

    axios.post("/upload", bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            _callback()
        })
        .catch(err => {
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }

            
            console.log(err);
        })
}

// Update a sheet
export const updateSheet = (data, origSheetName, _callback) => dispatch => {
    let bodyFormData = new FormData()
    bodyFormData.append('uploadFile', data.uploadFile)
    bodyFormData.append('sheetName', data.sheetName)
    bodyFormData.append('composer', data.composer)
    bodyFormData.append("releaseDate", data.releaseDate)
    

    axios.put(`/sheet/${origSheetName}`, bodyFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }})
        .then(res => {
            _callback()
        })
        .catch(err => {
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }

            
            console.log(err);
        })
}

// Delete a sheet
export const deleteSheet = (origSheetName, _callback) => dispatch => {
    axios.delete(`/sheet/${origSheetName}`)
        .then(res => {
            _callback()
        })
        .catch(err => {
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err);
        })
}

export const editComposer = (origName, name, epoch, file, _callback) => {
    let bodyFormData = new FormData()
    bodyFormData.append('name', name)
    bodyFormData.append('epoch', epoch)
    if (file != undefined) {bodyFormData.append("portrait", file)}
    
    
    axios.put(`/composer/${origName}`, bodyFormData)
    .then(() => {
        _callback()
    })
    .catch(err => {
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err);
        })
}

export const deleteComposer = (name, _callback) => {
    axios.delete(`/composer/${name}`)
    .then(() => {
        _callback()
    })  
    .catch(err => {
            if (err.request.status === 401) {
                store.dispatch(logoutUser())
                window.location.href = '/login'
            }
            console.log(err);
        })
}


export const resetData = () => dispatch => {
    dispatch({ type: RESET_DATA})
}