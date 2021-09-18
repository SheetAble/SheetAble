// React Router Import
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Pages and Components
import LoginPage from "./Components/Authentication/LoginPage";
import HomePageProvider from "./Components/Home/HomePageProvider";
import UploadPage from './Components/Upload/UploadPage';
import Sheet from './Components/Sheet/Sheet';
import SheetsPage from './Components/SheetsPage/SheetsPage';
import ComposersPage from './Components/ComposersPage/ComposersPage';
import Composer from './Components/Composer/Composer';
import Settings from './Components/Settings/Settings';
import Ping from './Components/Ping/Ping';
import PageNotFound from './Components/NotFound/PageNotFound';
import Redirect from './Components/Redirect/Redirect'

// Redux
import { Provider } from 'react-redux'
import { store, persistor } from './Redux/store';
import { logoutUser } from './Redux/Actions/userActions'
import { SET_AUTHENTICATED } from './Redux/types'
import { PersistGate } from 'redux-persist/integration/react'


// Axios
import axios from 'axios';

// JWT
import jwtDecode from 'jwt-decode'

// CSS
import './App.css'

// eslint-disable-next-line
import Logo from './Images/logo.png'


// Check if started in development mode, so you can modify baseURL accordingly
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = "http://localhost:8080/api"
} else {
    axios.defaults.baseURL = "/api"
}



// Load token from localstorage and check it
const token = localStorage.FBIdToken
if(token){
  let decodedToken = undefined
  try {
    decodedToken = jwtDecode(token)
  }
  catch {
    decodedToken = undefined
  }
  
  if (decodedToken !== undefined) {
    const ts = Date.now()
    const currentTime = Math.floor(ts/1000) - 7200
    if(decodedToken.exp < currentTime){
      store.dispatch(logoutUser())
      window.location.href = '/login'
    } else {
      store.dispatch({ type: SET_AUTHENTICATED })
      axios.defaults.headers.common['Authorization'] = token
    }
  } else {
    store.dispatch(logoutUser())
    window.location.href = '/login'
  }
  
  
} 

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          {store.getState().user.authenticated? 
            <Switch>
            
              <Route exact path="/" component={HomePageProvider} />
              <Route exact path="/upload" component={UploadPage} />
              <Route exact path="/sheet/:safeComposerName/:safeSheetName" component={Sheet} />
              <Route exact path="/composer/:safeComposerName" component={Composer} />
              <Route exact path="/sheets" component={SheetsPage} />
              <Route exact path="/composers" component={ComposersPage} />
              <Route exact path="/settings" component={Settings} />
              <Route exact path="/ping" component={Ping} />
              <Route component={PageNotFound} />
            </Switch> 
            :
            <Switch>
               <Route exact path="/login" component={LoginPage} />
               <Route component={Redirect} /> 
            </Switch>
          }
          
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
