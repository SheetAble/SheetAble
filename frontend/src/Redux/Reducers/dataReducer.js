import { LOADING_DATA, SET_SHEETS } from '../types'

const initialState = {
    sheets: [],
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
                sheets: action.payload
            }

        default:
            return state   
    }
}