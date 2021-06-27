import { LOADING_COMPOSERS, LOADING_DATA, SET_SHEETS, SET_COMPOSERS } from '../types'

const initialState = {
    sheets: [],
    composers: [],
    loading: false
}

export default function(state = initialState, action){
    let index
    switch(action.type){
        case LOADING_DATA: 
            return {
                ...state,
                loading: true
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

            

        default:
            return state   
    }
}