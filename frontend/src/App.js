// React Router Import
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Pages
import LoginPage from "./Components/Authentication/LoginPage";
import SignupPage from "./Components/Authentication/SignupPage";
import HomePage from "./Components/Home/HomePage";

// Redux
import { Provider } from 'react-redux'
import store from './Redux/store';

// Axios
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:8080"


function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/signup" component={SignupPage} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
