import { LOADING_COMPOSERS, LOADING_DATA, SET_SHEETS, SET_COMPOSERS, RESET_DATA, SET_PAGE_SHEETS, INCREMENT_SHEET_PAGE, DECREMENT_SHEET_PAGE, SET_SHEET_PAGE, SET_TOTAL_SHEET_PAGES } from '../types'

const initialState = {
    sheets: [],
    sheetPages: {},
    composers: [],
    sheetPage: 1,
    loading: false,
    totalSheetPages: 1
}

export default function(state = initialState, action){
    switch(action.type){
        case LOADING_DATA: 
            return {
                ...state,
                loading: true
            }

        case SET_TOTAL_SHEET_PAGES: 
            return {
                ...state, 
                totalSheetPages: action.payload
            }
        
        case INCREMENT_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: state.sheetPage + 1
            }

        case DECREMENT_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: state.sheetPage - 1
            }

        case SET_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: action.payload
            }

        case SET_PAGE_SHEETS: 
            return {
                ...state,
                loading: false,
                sheetPages: {...state.sheetPages, [action.page]: action.payload},
                
            }

        case SET_SHEETS:
            return {
                ...state,
                sheets: action.payload,
                loading: false
            }

        case LOADING_COMPOSERS:
            return {
                ...state,
                loading: true
            }   
            
        case SET_COMPOSERS:
            return {
                ...state,
                composers: action.payload,
                loading: false
            }
        
        case RESET_DATA: 
            return {
                ...state,
                composers: [],
                sheets: []
            }
            

        default:
            return state   
    }
}