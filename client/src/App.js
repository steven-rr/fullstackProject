import './App.css';
import Home from "./pages/Home"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Posts from "./pages/Posts"
import Post from "./pages/Post"
import UserPublicProfile from "./pages/UserPublicProfile"
import CreatePost from "./pages/CreatePost"
import Page404 from "./pages/Page404"
import Navbar from "./components/Navbar"
import React, {useState, useEffect, createContext} from 'react'
import axios from   "axios" 
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

export const AuthContext = createContext()

function App() {
  // reset any relevant state when clicking a link in nav bar.
  const [value, setValue]=  useState(0);
  const submitHandler = e =>
  {
    setValue(currentValue=> currentValue+1);
  }

  // keep track of auth state in the app.
  const [authState, setAuthState] = useState({username: "", UserId: "", authStatus: false });

  // check if the token is valid, if so, true. else. false.
  useEffect( async () => {
      await axios
              .get("/api/users/validate")
              .then( (response) =>{
                  console.log("user is logged in.  authenticated");
                  setAuthState( currentAuthState =>{ 
                    return {...currentAuthState, username: response.data.username, UserId: response.data.id, authStatus: true}
                  });
                  console.log(response);
              })
              .catch( (err) => {
                console.log("user is not authenticated.")
                setAuthState( currentAuthState =>{ 
                  return {...currentAuthState, username: "", UserId: "", authStatus: false}
                });
              })
      console.log("AUTHSTATE:" ,authState);
  }, [])
  return (
    <div>
      <AuthContext.Provider value={{authState, setAuthState}}>
        <Router>
          <div className="App">
            <Navbar onClick ={submitHandler}></Navbar>
            <Switch>
              <Route path="/" exact component = {Home} />
              <Route path="/form" exact component = {Form} />
              <Route path="/blog" exact component = {Posts} />
              <Route path="/blog/:id" component = {Post} />
              <Route path="/user/:UserId" component = {UserPublicProfile} />
              <Route path="/createpost" component = {CreatePost} />
              <Route path="/login" exact component = {Login} />
              <Route component={Page404} />
            </Switch>
          </div>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
