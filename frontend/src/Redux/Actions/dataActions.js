import { LOADING_DATA, SET_SHEETS} from '../types'
import axios from 'axios'

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
            console.log(err)
            dispatch({
                type: SET_SHEETS,
                payload: []
            })
        })
}
