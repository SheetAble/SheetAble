import { LOADING_COMPOSERS, LOADING_DATA, SET_SHEETS, SET_COMPOSERS, RESET_DATA, SET_PAGE_SHEETS, INCREMENT_SHEET_PAGE, DECREMENT_SHEET_PAGE, SET_SHEET_PAGE, SET_TOTAL_SHEET_PAGES, SET_TOTAL_COMPOSER_PAGES, INCREMENT_COMPOSER_PAGE, DECREMENT_COMPOSER_PAGE, SET_COMPOSER_PAGE, SET_PAGE_COMPOSERS } from '../types'

const initialState = {
    sheets: [],
    composers: [],

    sheetPages: {},
    composerPages: {},
    
    sheetPage: 1,
    composerPage: 1,
    
    totalSheetPages: 1,
    totalComposerPages: 1,

    loading: false,
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
            
        case SET_TOTAL_COMPOSER_PAGES: 
            return {
                ...state, 
                totalComposerPages: action.payload
            }

        case INCREMENT_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: state.sheetPage + 1
            }
            
        case INCREMENT_COMPOSER_PAGE: 
            return {
                ...state,
                composerPage: state.composerPage + 1
            }


        case DECREMENT_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: state.sheetPage - 1
            }
        
        case DECREMENT_COMPOSER_PAGE: 
            return {
                ...state,
                composerPage: state.composerPage - 1
            }

        case SET_SHEET_PAGE: 
            return {
                ...state,
                sheetPage: action.payload
            }

        case SET_COMPOSER_PAGE: 
            return {
                ...state,
                composerPage: action.payload
            }


        case SET_PAGE_SHEETS: 
            return {
                ...state,
                loading: false,
                sheetPages: {...state.sheetPages, [action.page]: action.payload},
                
            }

        case SET_PAGE_COMPOSERS:
            return {
                ...state,
                loading: false,
                composerPages: {...state.sheetPages, [action.page]: action.payload},
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