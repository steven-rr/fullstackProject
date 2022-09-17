import AppCSS from "./App.module.css"
import './App.css';
import Home from "./pages/Home"
import Form from "./pages/Form"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ForgotUsername from "./pages/ForgotUsername"

import NewPassword from "./pages/NewPassword"
import Posts from "./pages/Posts"
import Post from "./pages/Post"
import PostWithReplyThread from "./pages/PostWithReplyThread"
import UserPublicProfile from "./pages/UserPublicProfile"
import UserPublicProfileComments from "./pages/UserPublicProfileComments"
import UserSettingsPrivate from "./pages/UserSettingsPrivate"
import CreatePost from "./pages/CreatePost"
import Page404 from "./pages/Page404"
import Navbar from "./components/Navbar"
import React, {useState, useEffect, useRef, createContext} from 'react'
import axios from   "axios" 
import {BrowserRouter as Router, Switch, Route, useHistory} from 'react-router-dom'

export const AuthContext = createContext()

function App() {
  // reset any relevant state when clicking a link in nav bar.
  const [value, setValue]=  useState(0);
  const submitHandler = e =>
  {
    setValue(currentValue=> currentValue+1);
  }
  const loginRef = useRef();

  // keep track of auth state in the app.
  const [authState, setAuthState] = useState({username: "", UserId: "", authStatus: false, loginOn: false, signUp: false, forgotPass: false, forgotUser: false, flag1: true});
  const handleLoginClick = (e) => {
    if(e.target == loginRef.current)
    {
      setAuthState( currentAuthState=> {
        return { ...currentAuthState, loginOn: false}
      }) 
      document.documentElement.style.overflow = "visible";
    }

    
  }
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
          <div className="App">

              <Navbar onClick ={submitHandler}></Navbar>
              <Switch>
                <Route path="/" exact component = {Home} />
                <Route path="/form" exact component = {Form} />
                <Route path="/blog" exact component = {Posts} />
                <Route path="/blog/:id" exact component = {Post} />
                <Route path="/blog/:id/:edittingFlag" exact component = {Post} />
                <Route path="/blog/:id/:CommentId/:startPoint" exact component = {PostWithReplyThread} />
                <Route path="/user/:UserId" exact component = {UserPublicProfile} />
                <Route path="/user/:UserId/comments" exact component = {UserPublicProfileComments} />
                <Route path="/user/:UserId/settings" exact component = {UserSettingsPrivate} />
                <Route path="/createpost" component = {CreatePost} />
                <Route path="/reset" exact component={ForgotPassword}/>
                <Route path="/resetUsername" exact component={ForgotUsername}/>
                <Route path="/reset/:token" component={NewPassword}/>
                <Route path="/login" exact component = {Login} />
                <Route component={Page404} />
              </Switch>
              <div className={`${AppCSS.translucentLayer} ${authState.loginOn  ? '': AppCSS.loginDeactivate}`}></div>
              <div className={`${AppCSS.darkerTranslucentLayer} ${authState.signUp ? '': AppCSS.loginDeactivate}`}></div>
              <div className={`${AppCSS.loginOuterContainer} ${authState.loginOn ? '': AppCSS.loginDeactivate}`}  onClick={(e) => handleLoginClick(e)} ref={loginRef}>
                <div className={`${AppCSS.loginContainer} `}> <Login/> </div>
              </div>

              <div className={`${AppCSS.loginOuterContainer} ${authState.signUp ? '': AppCSS.loginDeactivate}`}>
                <div className={`${AppCSS.popOutContainer} `}> <Form/> </div>
              </div>

              <div className={`${AppCSS.loginOuterContainer} ${authState.forgotPass ? '': AppCSS.loginDeactivate}`}>
                <div className={`${AppCSS.popOutContainer} `}> <ForgotPassword/> </div>
              </div>

              <div className={`${AppCSS.loginOuterContainer} ${authState.forgotUser ? '': AppCSS.loginDeactivate}`}>
                <div className={`${AppCSS.popOutContainer} `}> <ForgotUsername/> </div>
              </div>
          </div>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
