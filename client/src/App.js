import './App.css';
import Home from "./pages/Home"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Posts from "./pages/Posts"
import Post from "./pages/Post"
import CreatePost from "./pages/CreatePost"
import Page404 from "./pages/Page404"
import Navbar from "./components/Navbar"
import React, {useState} from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

function App() {
  // reset any relevant state when clicking a link in nav bar.
  const [value, setValue]=  useState(0);
  const submitHandler = e =>
  {
    setValue(currentValue=> currentValue+1);
  }

  return (
    <Router>
      <div className="App">
        <Navbar onClick ={submitHandler}></Navbar>
        <Switch>
          <Route path="/" exact component = {Home} />
          <Route path="/form" exact component = {Form} />
          <Route path="/blog" exact component = {Posts} />
          <Route path="/blog/:id" component = {Post} />
          <Route path="/createpost" component = {CreatePost} />
          <Route path="/login" exact component = {Login} />
          <Route component={Page404} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
