import './App.css';
import Home from "./pages/Home"
import Form from "./pages/Form"

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component = {Home} />
          <Route path="/form" component = {Form} />

        </Switch>
      </div>
    </Router>
  );
}

export default App;
