import './App.css';
import Home from "./pages/Home"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Posts from "./pages/Posts"

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component = {Home} />
          <Route path="/form" component = {Form} />
          <Route path="/blog" component = {Posts} />
          <Route path="/login" component = {Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
