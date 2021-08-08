import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import userReducer from './Reducers/userReducer'
import dataReducer from './Reducers/dataReducer'
import uiReducer from './Reducers/uiReducer'


/* Persisted Redux */
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web


const initialState ={}

const middleware = [thunk]

const reducers = combineReducers({
    user: userReducer,
    data: dataReducer,
    UI: uiReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/*
Create a persisted sotre to keep the store whlie refreshing the page 
*/


const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, reducers)



const store = createStore(persistedReducer, initialState, composeEnhancers(applyMiddleware(...middleware)))
let persistor = persistStore(store)
  
export { store, persistor }