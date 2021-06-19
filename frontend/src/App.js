// React Router Import
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Pages
import LoginPage from "./Components/Authentication/LoginPage";
import SignupPage from "./Components/Authentication/SignupPage";
import HomePage from "./Components/Home/HomePage";


function App() {
  return (
    <Router>
      <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/signup" component={SignupPage} />
      </Switch>
    </Router>
  );
}

export default App;
