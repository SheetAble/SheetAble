import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import userReducer from './Reducers/userReducer'
import dataReducer from './Reducers/dataReducer'
import uiReducer from './Reducers/uiReducer'

const initialState ={}

const middleware = [thunk]

const reducers = combineReducers({
    user: userReducer,
    data: dataReducer,
    UI: uiReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, initialState, composeEnhancers(applyMiddleware(...middleware)))

export default store
